import "server-only";
import Big from "big.js";
import { FieldValue, Timestamp, type DocumentData, type Query } from "firebase-admin/firestore";
import { DEFAULT_APP_CONFIG, type AppConfig } from "@/lib/app-config";
import { ASSET_SYMBOLS, type AssetSymbol } from "@/lib/config/assets";
import { NETWORKS, NETWORK_IDS, type NetworkId } from "@/lib/config/networks";
import { db } from "./firebase-admin";

/*
 * Firestore data access. Only the server touches Firestore; security rules deny all client access.
 *
 * users/{uid}                       profile: email, fullName, role, status
 * users/{uid}/addresses/{network}   public receiving address
 * addressIndex/{network}__{address} uid (one wallet per account)
 * ledgers/{uid}                     demo balances as decimal strings
 * transactions/{uid}__{key}         demo sends and swaps (doc id gives idempotency)
 * config/app                        MOWI values and simulation toggles
 * buyProviders/{slug}               allowlisted provider destinations
 * supportConversations/{id}         + messages subcollection
 * auditLog/{auto}                   append-only
 */

export class LedgerError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

const iso = (v: unknown): string | null => (v instanceof Timestamp ? v.toDate().toISOString() : null);

export const STARTER_DEMO_BALANCES: Record<AssetSymbol, string> = { BTC: "0.05", ETH: "1", BNB: "2", SOL: "10", MOWI: "0" };

// ---------------------------------------------------------------------------
// Users

export type Profile = { id: string; email: string; fullName: string; role: "user" | "admin"; status: "active" | "suspended"; createdAt: string | null };

function toProfile(id: string, d: DocumentData): Profile {
  return {
    id,
    email: d.email ?? "",
    fullName: d.fullName ?? "",
    role: d.role === "admin" ? "admin" : "user",
    status: d.status === "suspended" ? "suspended" : "active",
    createdAt: iso(d.createdAt),
  };
}

/** Creates the profile and starter demo ledger on first sign-in. Safe to call repeatedly. */
export async function ensureUser(uid: string, email: string, fullName: string): Promise<void> {
  const userRef = db().doc(`users/${uid}`);
  await db().runTransaction(async (t) => {
    const snap = await t.get(userRef);
    if (snap.exists) {
      if (snap.get("email") !== email) t.update(userRef, { email, updatedAt: FieldValue.serverTimestamp() });
      return;
    }
    t.create(userRef, {
      email,
      fullName: fullName.slice(0, 100),
      role: "user",
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    t.set(db().doc(`ledgers/${uid}`), { balances: STARTER_DEMO_BALANCES, updatedAt: FieldValue.serverTimestamp() });
  });
}

export async function getProfile(uid: string): Promise<Profile | null> {
  const snap = await db().doc(`users/${uid}`).get();
  return snap.exists ? toProfile(uid, snap.data()!) : null;
}

export async function isAdmin(uid: string): Promise<boolean> {
  const p = await getProfile(uid);
  return p?.role === "admin" && p.status === "active";
}

export async function updateProfileName(uid: string, fullName: string) {
  await db().doc(`users/${uid}`).update({ fullName, updatedAt: FieldValue.serverTimestamp() });
}

export async function listUsers(): Promise<Profile[]> {
  const snap = await db().collection("users").orderBy("createdAt", "desc").limit(200).get();
  return snap.docs.map((d) => toProfile(d.id, d.data()));
}

export async function setUserStatus(actor: string, uid: string, status: "active" | "suspended") {
  if (actor === uid) throw new LedgerError("CANNOT_CHANGE_SELF");
  const ref = db().doc(`users/${uid}`);
  await db().runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) throw new LedgerError("NOT_FOUND");
    t.update(ref, { status, updatedAt: FieldValue.serverTimestamp() });
    t.create(db().collection("auditLog").doc(), auditEntry(actor, "set_status", "users", uid, { status }));
  });
}

// ---------------------------------------------------------------------------
// Addresses

export async function getAddresses(uid: string): Promise<Partial<Record<NetworkId, string>>> {
  const snap = await db().collection(`users/${uid}/addresses`).get();
  const out: Partial<Record<NetworkId, string>> = {};
  for (const d of snap.docs) if (d.id in NETWORKS) out[d.id as NetworkId] = d.get("address");
  return out;
}

export async function getAddress(uid: string, network: NetworkId): Promise<string | null> {
  const snap = await db().doc(`users/${uid}/addresses/${network}`).get();
  return snap.exists ? (snap.get("address") as string) : null;
}

const indexId = (network: NetworkId, address: string) => `${network}__${network === "bitcoin" || network === "solana" ? address : address.toLowerCase()}`;

/** Links public addresses atomically, keeping one wallet per account and one account per wallet. */
export async function linkAddresses(uid: string, addresses: Record<NetworkId, string>, replace: boolean) {
  await db().runTransaction(async (t) => {
    const currentRefs = NETWORK_IDS.map((n) => db().doc(`users/${uid}/addresses/${n}`));
    const newIndexRefs = NETWORK_IDS.map((n) => db().doc(`addressIndex/${indexId(n, addresses[n])}`));
    const [current, newIndex] = await Promise.all([t.getAll(...currentRefs), t.getAll(...newIndexRefs)]);

    const linked = current.filter((s) => s.exists);
    const differs = linked.some((s) => s.get("address") !== addresses[s.id as NetworkId]);
    if (linked.length > 0 && differs && !replace) throw new LedgerError("WALLET_MISMATCH");
    if (newIndex.some((s) => s.exists && s.get("uid") !== uid)) throw new LedgerError("WALLET_IN_USE");

    for (const s of linked) {
      const old = s.get("address") as string;
      if (old !== addresses[s.id as NetworkId]) t.delete(db().doc(`addressIndex/${indexId(s.id as NetworkId, old)}`));
    }
    NETWORK_IDS.forEach((n, i) => {
      t.set(currentRefs[i], { address: addresses[n], derivationPath: NETWORKS[n].derivationPath, updatedAt: FieldValue.serverTimestamp() });
      t.set(newIndexRefs[i], { uid, network: n });
    });
    if (linked.length > 0 && differs) {
      t.create(db().collection("auditLog").doc(), auditEntry(uid, "replace_wallet", "users", uid, {}));
    }
  });
}

// ---------------------------------------------------------------------------
// Demo ledger

export async function getDemoBalances(uid: string): Promise<Record<AssetSymbol, string>> {
  const snap = await db().doc(`ledgers/${uid}`).get();
  const balances = (snap.get("balances") ?? {}) as Record<string, string>;
  return Object.fromEntries(ASSET_SYMBOLS.map((s) => [s, balances[s] ?? "0"])) as Record<AssetSymbol, string>;
}

export type TxRecord = {
  id: string;
  user_id: string;
  kind: "send" | "swap" | "adjustment";
  mode: "simulated" | "onchain";
  status: "pending" | "successful" | "failed";
  network: string | null;
  asset: string;
  amount: string;
  to_asset: string | null;
  to_amount: string | null;
  rate: string | null;
  fee: string;
  fee_asset: string | null;
  recipient: string | null;
  tx_hash: string | null;
  note: string | null;
  created_at: string;
};

function toTx(id: string, d: DocumentData): TxRecord {
  return {
    id,
    user_id: d.userId,
    kind: d.kind,
    mode: d.mode,
    status: d.status,
    network: d.network ?? null,
    asset: d.asset,
    amount: d.amount,
    to_asset: d.toAsset ?? null,
    to_amount: d.toAmount ?? null,
    rate: d.rate ?? null,
    fee: d.fee ?? "0",
    fee_asset: d.feeAsset ?? null,
    recipient: d.recipient ?? null,
    tx_hash: d.txHash ?? null,
    note: d.note ?? null,
    created_at: iso(d.createdAt) ?? new Date().toISOString(),
  };
}

type LedgerOp =
  | { kind: "swap"; from: AssetSymbol; to: AssetSymbol; amount: string; fromPrice: string; toPrice: string; feePercent: string }
  | { kind: "send"; network: NetworkId; asset: AssetSymbol; amount: string; recipient: string };

/**
 * Runs one demo ledger operation inside a Firestore transaction: idempotency by document id,
 * active-account and rate-limit checks, balance check, and atomic debit and credit.
 */
async function runLedgerOp(uid: string, idempotencyKey: string, op: LedgerOp): Promise<TxRecord> {
  const txRef = db().doc(`transactions/${uid}__${idempotencyKey}`);
  const ledgerRef = db().doc(`ledgers/${uid}`);
  const userRef = db().doc(`users/${uid}`);
  const recentQuery = db()
    .collection("transactions")
    .where("userId", "==", uid)
    .where("createdAt", ">", Timestamp.fromMillis(Date.now() - 60_000));

  const result = await db().runTransaction(async (t) => {
    const existing = await t.get(txRef);
    if (existing.exists) return toTx(existing.id, existing.data()!);

    const [user, ledger, recent] = await Promise.all([t.get(userRef), t.get(ledgerRef), t.get(recentQuery)]);
    if (!user.exists || user.get("status") !== "active") throw new LedgerError("ACCOUNT_INACTIVE");
    if (recent.size >= 10) throw new LedgerError("RATE_LIMITED");

    const balances = { ...STARTER_DEMO_BALANCES, ...((ledger.get("balances") ?? {}) as Record<string, string>) };
    const amount = new Big(op.amount);
    if (amount.lte(0)) throw new LedgerError("INVALID_AMOUNT");

    if (op.kind === "swap") {
      if (op.from === op.to) throw new LedgerError("SAME_ASSET");
      const fromPrice = new Big(op.fromPrice);
      const toPrice = new Big(op.toPrice);
      if (fromPrice.lte(0) || toPrice.lte(0)) throw new LedgerError("PRICE_UNAVAILABLE");
      const fee = new Big(op.feePercent);
      if (fee.lt(0) || fee.gt(10)) throw new LedgerError("INVALID_FEE");
      const available = new Big(balances[op.from] ?? "0");
      if (available.lt(amount)) throw new LedgerError("INSUFFICIENT_BALANCE");

      const gross = amount.times(fromPrice).div(toPrice).round(18, Big.roundDown);
      const output = gross.times(new Big(100).minus(fee)).div(100).round(18, Big.roundDown);
      if (output.lte(0)) throw new LedgerError("AMOUNT_TOO_SMALL");

      balances[op.from] = available.minus(amount).toFixed();
      balances[op.to] = new Big(balances[op.to] ?? "0").plus(output).toFixed();
      const doc = {
        userId: uid,
        kind: "swap",
        mode: "simulated",
        status: "successful",
        asset: op.from,
        amount: amount.toFixed(),
        toAsset: op.to,
        toAmount: output.toFixed(),
        rate: fromPrice.div(toPrice).round(18, Big.roundDown).toFixed(),
        fee: gross.minus(output).toFixed(),
        feeAsset: op.to,
        assets: [op.from, op.to],
        idempotencyKey,
        note: "Simulated swap on the demo ledger. No blockchain exchange took place.",
        txHash: null,
        createdAt: Timestamp.now(),
      };
      t.set(ledgerRef, { balances, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      t.create(txRef, doc);
      return toTx(txRef.id, doc);
    }

    const available = new Big(balances[op.asset] ?? "0");
    if (available.lt(amount)) throw new LedgerError("INSUFFICIENT_BALANCE");
    // Simulated sends are recorded as pending, never settle, and never broadcast.
    const doc = {
      userId: uid,
      kind: "send",
      mode: "simulated",
      status: "pending",
      network: op.network,
      asset: op.asset,
      amount: amount.toFixed(),
      recipient: op.recipient,
      fee: "0",
      assets: [op.asset],
      idempotencyKey,
      note: "Simulated send. Nothing was broadcast and no real funds moved.",
      txHash: null,
      createdAt: Timestamp.now(),
    };
    t.create(txRef, doc);
    return toTx(txRef.id, doc);
  });
  return result;
}

export const demoSwap = (uid: string, key: string, op: Omit<Extract<LedgerOp, { kind: "swap" }>, "kind">) =>
  runLedgerOp(uid, key, { kind: "swap", ...op });

export const demoSend = (uid: string, key: string, op: Omit<Extract<LedgerOp, { kind: "send" }>, "kind">) =>
  runLedgerOp(uid, key, { kind: "send", ...op });

export async function listTransactions(opts: {
  uid?: string;
  kind?: "send" | "swap";
  asset?: AssetSymbol;
  before?: string;
  limit: number;
}): Promise<{ items: TxRecord[]; hasMore: boolean }> {
  let q: Query = db().collection("transactions");
  if (opts.uid) q = q.where("userId", "==", opts.uid);
  if (opts.kind) q = q.where("kind", "==", opts.kind);
  if (opts.asset) q = q.where("assets", "array-contains", opts.asset);
  q = q.orderBy("createdAt", "desc");
  if (opts.before) q = q.startAfter(Timestamp.fromDate(new Date(opts.before)));
  const snap = await q.limit(opts.limit + 1).get();
  const items = snap.docs.slice(0, opts.limit).map((d) => toTx(d.id, d.data()));
  return { items, hasMore: snap.size > opts.limit };
}

// ---------------------------------------------------------------------------
// Config

export async function getConfig(): Promise<AppConfig> {
  const snap = await db().doc("config/app").get();
  const d = snap.data() ?? {};
  const pick = <K extends keyof AppConfig>(k: K): AppConfig[K] =>
    typeof d[k] === typeof DEFAULT_APP_CONFIG[k] ? (d[k] as AppConfig[K]) : DEFAULT_APP_CONFIG[k];
  return {
    mowiPriceUsd: pick("mowiPriceUsd"),
    mowiDisplayRate: pick("mowiDisplayRate"),
    swapFeePercent: pick("swapFeePercent"),
    transactionSimulationMode: pick("transactionSimulationMode"),
    swapSimulationMode: pick("swapSimulationMode"),
  };
}

export async function updateConfig(actor: string, patch: Partial<AppConfig>) {
  const ref = db().doc("config/app");
  await db().runTransaction(async (t) => {
    const before = (await t.get(ref)).data() ?? {};
    t.set(ref, { ...patch, updatedBy: actor, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    const old = Object.fromEntries(Object.keys(patch).map((k) => [k, before[k] ?? DEFAULT_APP_CONFIG[k as keyof AppConfig]]));
    t.create(db().collection("auditLog").doc(), auditEntry(actor, "update", "config", "app", { old, new: patch }));
  });
}

// ---------------------------------------------------------------------------
// Buy providers

export type Provider = {
  slug: string;
  name: string;
  description: string;
  url: string;
  regions: string[];
  paymentMethods: string[];
  enabled: boolean;
  verifiedAt: string | null;
  sortOrder: number;
};

function toProvider(slug: string, d: DocumentData): Provider {
  return {
    slug,
    name: d.name,
    description: d.description ?? "",
    url: d.url,
    regions: d.regions ?? [],
    paymentMethods: d.paymentMethods ?? [],
    enabled: Boolean(d.enabled),
    verifiedAt: iso(d.verifiedAt),
    sortOrder: d.sortOrder ?? 100,
  };
}

export async function listProviders(onlyEnabled: boolean): Promise<Provider[]> {
  const snap = await db().collection("buyProviders").get();
  return snap.docs
    .map((d) => toProvider(d.id, d.data()))
    .filter((p) => !onlyEnabled || p.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function saveProvider(actor: string, slug: string, data: Partial<Omit<Provider, "slug" | "verifiedAt">> & { verified?: boolean }) {
  const ref = db().doc(`buyProviders/${slug}`);
  await db().runTransaction(async (t) => {
    const before = (await t.get(ref)).data() ?? null;
    const { verified, ...fields } = data;
    const next: DocumentData = { ...fields, updatedBy: actor, updatedAt: FieldValue.serverTimestamp() };
    if (verified === true) next.verifiedAt = FieldValue.serverTimestamp();
    if (verified === false) next.verifiedAt = null;
    t.set(ref, next, { merge: true });
    t.create(db().collection("auditLog").doc(), auditEntry(actor, before ? "update" : "create", "buyProviders", slug, { old: before, new: fields }));
  });
}

// ---------------------------------------------------------------------------
// Support

export type Conversation = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  subject: string;
  status: "open" | "closed";
  created_at: string;
  last_message_at: string;
};
export type Message = { id: string; sender_id: string; is_staff: boolean; body: string; created_at: string };

function toConversation(id: string, d: DocumentData): Conversation {
  return {
    id,
    user_id: d.userId,
    user_email: d.userEmail ?? "",
    user_name: d.userName ?? "",
    subject: d.subject,
    status: d.status === "closed" ? "closed" : "open",
    created_at: iso(d.createdAt) ?? "",
    last_message_at: iso(d.lastMessageAt) ?? "",
  };
}

export async function listConversations(uid?: string): Promise<Conversation[]> {
  let q: Query = db().collection("supportConversations");
  if (uid) q = q.where("userId", "==", uid);
  const snap = await q.orderBy("lastMessageAt", "desc").limit(100).get();
  return snap.docs.map((d) => toConversation(d.id, d.data()));
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const snap = await db().doc(`supportConversations/${id}`).get();
  return snap.exists ? toConversation(snap.id, snap.data()!) : null;
}

async function assertMessageRate(senderId: string) {
  const recent = await db()
    .collectionGroup("messages")
    .where("senderId", "==", senderId)
    .where("createdAt", ">", Timestamp.fromMillis(Date.now() - 10 * 60_000))
    .count()
    .get();
  if (recent.data().count >= 20) throw new LedgerError("RATE_LIMITED");
}

export async function createConversation(user: { id: string; email: string; name: string }, subject: string, body: string): Promise<string> {
  await assertMessageRate(user.id);
  const conv = db().collection("supportConversations").doc();
  const batch = db().batch();
  const now = Timestamp.now();
  batch.create(conv, { userId: user.id, userEmail: user.email, userName: user.name, subject, status: "open", createdAt: now, lastMessageAt: now });
  batch.create(conv.collection("messages").doc(), { senderId: user.id, ownerId: user.id, isStaff: false, body, createdAt: now });
  await batch.commit();
  return conv.id;
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const snap = await db().collection(`supportConversations/${conversationId}/messages`).orderBy("createdAt").limit(500).get();
  return snap.docs.map((d) => ({
    id: d.id,
    sender_id: d.get("senderId"),
    is_staff: Boolean(d.get("isStaff")),
    body: d.get("body"),
    created_at: iso(d.get("createdAt")) ?? "",
  }));
}

export async function addMessage(conv: Conversation, senderId: string, isStaff: boolean, body: string) {
  if (conv.status !== "open") throw new LedgerError("CONVERSATION_CLOSED");
  await assertMessageRate(senderId);
  const ref = db().doc(`supportConversations/${conv.id}`);
  const now = Timestamp.now();
  const batch = db().batch();
  batch.create(ref.collection("messages").doc(), { senderId, ownerId: conv.user_id, isStaff, body, createdAt: now });
  batch.update(ref, { lastMessageAt: now });
  await batch.commit();
}

export async function setConversationStatus(actor: string, id: string, status: "open" | "closed") {
  await db().doc(`supportConversations/${id}`).update({ status });
  await db().collection("auditLog").add(auditEntry(actor, "set_status", "supportConversations", id, { status }));
}

/** Latest staff replies addressed to this user, for the notification bell. */
export async function staffReplies(uid: string) {
  const snap = await db()
    .collectionGroup("messages")
    .where("ownerId", "==", uid)
    .where("isStaff", "==", true)
    .orderBy("createdAt", "desc")
    .limit(5)
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    conversation_id: d.ref.parent.parent!.id,
    body: d.get("body") as string,
    created_at: iso(d.get("createdAt")) ?? "",
  }));
}

// ---------------------------------------------------------------------------
// Audit and stats

function auditEntry(actor: string | null, action: string, entity: string, entityId: string | null, details: unknown) {
  return { actorId: actor, action, entity, entityId, details: JSON.parse(JSON.stringify(details ?? {})), createdAt: FieldValue.serverTimestamp() };
}

export async function listAudit() {
  const snap = await db().collection("auditLog").orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map((d) => ({
    id: d.id,
    actor_id: d.get("actorId") ?? null,
    action: d.get("action"),
    entity: d.get("entity"),
    entity_id: d.get("entityId") ?? null,
    details: d.get("details") ?? {},
    created_at: iso(d.get("createdAt")) ?? "",
  }));
}

export async function stats() {
  const [users, txs, open] = await Promise.all([
    db().collection("users").count().get(),
    db().collection("transactions").count().get(),
    db().collection("supportConversations").where("status", "==", "open").count().get(),
  ]);
  return { users: users.data().count, txs: txs.data().count, open: open.data().count };
}
