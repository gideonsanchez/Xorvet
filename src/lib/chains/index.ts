import "server-only";
import Big from "big.js";
import { createPublicClient, http, formatUnits } from "viem";
import { bsc, mainnet } from "viem/chains";
import { serverEnv } from "@/lib/config/server-env";
import type { NetworkId } from "@/lib/config/networks";

const TIMEOUT_MS = 10_000;

export class ChainError extends Error {
  constructor(
    message: string,
    public readonly code: "RATE_LIMITED" | "UNAVAILABLE" | "BAD_RESPONSE" | "NOT_CONFIGURED",
  ) {
    super(message);
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new ChainError("Network provider did not respond", "UNAVAILABLE");
  }
  if (res.status === 429) throw new ChainError("Network provider rate limit reached", "RATE_LIMITED");
  if (!res.ok) throw new ChainError(`Network provider returned ${res.status}`, "UNAVAILABLE");
  try {
    return (await res.json()) as T;
  } catch {
    throw new ChainError("Unexpected response from network provider", "BAD_RESPONSE");
  }
}

const evmClients = {
  ethereum: createPublicClient({ chain: mainnet, transport: http(serverEnv.ethereumRpcUrl, { timeout: TIMEOUT_MS, retryCount: 1 }) }),
  bsc: createPublicClient({ chain: bsc, transport: http(serverEnv.bscRpcUrl, { timeout: TIMEOUT_MS, retryCount: 1 }) }),
};

async function solanaRpc<T>(method: string, params: unknown[]): Promise<T> {
  const body = await fetchJson<{ result?: T; error?: { message: string; code: number } }>(serverEnv.solanaRpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (body.error) {
    throw new ChainError(body.error.message, body.error.code === 429 ? "RATE_LIMITED" : "BAD_RESPONSE");
  }
  if (body.result === undefined) throw new ChainError("Empty Solana response", "BAD_RESPONSE");
  return body.result;
}

export type ChainBalance = {
  /** Confirmed balance as a decimal string in whole units. */
  confirmed: string;
  /** Unconfirmed incoming or outgoing amount, where the network exposes it (Bitcoin). */
  unconfirmed?: string;
};

export async function getNativeBalance(network: NetworkId, address: string): Promise<ChainBalance> {
  switch (network) {
    case "ethereum":
    case "bsc": {
      try {
        const wei = await evmClients[network].getBalance({ address: address as `0x${string}` });
        return { confirmed: formatUnits(wei, 18) };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        throw new ChainError("Could not read balance from RPC", msg.includes("429") ? "RATE_LIMITED" : "UNAVAILABLE");
      }
    }
    case "solana": {
      const result = await solanaRpc<{ value: number }>("getBalance", [address, { commitment: "confirmed" }]);
      return { confirmed: new Big(result.value).div(1e9).toFixed() };
    }
    case "bitcoin": {
      type Stats = { funded_txo_sum: number; spent_txo_sum: number };
      const data = await fetchJson<{ chain_stats: Stats; mempool_stats: Stats }>(
        `${serverEnv.bitcoinApiUrl}/address/${encodeURIComponent(address)}`,
      );
      const sats = (s: Stats) => new Big(s.funded_txo_sum).minus(s.spent_txo_sum);
      return {
        confirmed: sats(data.chain_stats).div(1e8).toFixed(),
        unconfirmed: sats(data.mempool_stats).div(1e8).toFixed(),
      };
    }
  }
}

export type ChainTx = {
  hash: string;
  direction: "in" | "out" | "self" | "unknown";
  /** Decimal string in whole units, when the provider reports it. */
  amount: string | null;
  timestamp: string | null;
  status: "confirmed" | "pending" | "failed";
  confirmations: number | null;
};

export async function getRecentTransactions(network: NetworkId, address: string): Promise<ChainTx[]> {
  switch (network) {
    case "bitcoin": {
      type Vout = { scriptpubkey_address?: string; value: number };
      type Vin = { prevout?: { scriptpubkey_address?: string; value: number } };
      type Tx = { txid: string; vin: Vin[]; vout: Vout[]; status: { confirmed: boolean; block_height?: number; block_time?: number } };
      const [txs, tip] = await Promise.all([
        fetchJson<Tx[]>(`${serverEnv.bitcoinApiUrl}/address/${encodeURIComponent(address)}/txs`),
        fetch(`${serverEnv.bitcoinApiUrl}/blocks/tip/height`, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) })
          .then((r) => (r.ok ? r.text() : null))
          .then((t) => (t ? Number(t) : null))
          .catch(() => null),
      ]);
      return txs.slice(0, 15).map((tx) => {
        const received = tx.vout.filter((o) => o.scriptpubkey_address === address).reduce((a, o) => a + o.value, 0);
        const sent = tx.vin.filter((i) => i.prevout?.scriptpubkey_address === address).reduce((a, i) => a + (i.prevout?.value ?? 0), 0);
        const net = received - sent;
        return {
          hash: tx.txid,
          direction: net > 0 ? "in" : net < 0 ? "out" : "self",
          amount: new Big(Math.abs(net)).div(1e8).toFixed(),
          timestamp: tx.status.block_time ? new Date(tx.status.block_time * 1000).toISOString() : null,
          status: tx.status.confirmed ? "confirmed" : "pending",
          confirmations:
            tx.status.confirmed && tx.status.block_height && tip ? Math.max(1, tip - tx.status.block_height + 1) : tx.status.confirmed ? null : 0,
        } satisfies ChainTx;
      });
    }
    case "solana": {
      type Sig = { signature: string; blockTime: number | null; err: unknown; confirmationStatus?: string };
      const sigs = await solanaRpc<Sig[]>("getSignaturesForAddress", [address, { limit: 15 }]);
      return sigs.map((s) => ({
        hash: s.signature,
        direction: "unknown",
        amount: null,
        timestamp: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
        status: s.err ? "failed" : s.confirmationStatus === "finalized" || s.confirmationStatus === "confirmed" ? "confirmed" : "pending",
        confirmations: null,
      }));
    }
    case "ethereum":
    case "bsc": {
      if (!serverEnv.etherscanApiKey) {
        throw new ChainError("Transaction history needs an Etherscan API key", "NOT_CONFIGURED");
      }
      const chainId = network === "ethereum" ? 1 : 56;
      type EtherscanTx = { hash: string; from: string; to: string; value: string; timeStamp: string; isError: string; confirmations: string };
      const url = new URL("https://api.etherscan.io/v2/api");
      url.search = new URLSearchParams({
        chainid: String(chainId),
        module: "account",
        action: "txlist",
        address,
        page: "1",
        offset: "15",
        sort: "desc",
        apikey: serverEnv.etherscanApiKey,
      }).toString();
      const body = await fetchJson<{ status: string; message: string; result: EtherscanTx[] | string }>(url.toString());
      if (!Array.isArray(body.result)) {
        if (body.message === "No transactions found") return [];
        throw new ChainError("History provider error", "BAD_RESPONSE");
      }
      const me = address.toLowerCase();
      return body.result.map((t) => ({
        hash: t.hash,
        direction: t.from.toLowerCase() === me ? (t.to.toLowerCase() === me ? "self" : "out") : "in",
        amount: formatUnits(BigInt(t.value), 18),
        timestamp: new Date(Number(t.timeStamp) * 1000).toISOString(),
        status: t.isError === "1" ? "failed" : "confirmed",
        confirmations: Number(t.confirmations),
      }));
    }
  }
}

/** Lightweight liveness probe for the admin RPC health view. */
export async function probeNetwork(network: NetworkId): Promise<{ ok: boolean; latencyMs: number; detail: string }> {
  const start = Date.now();
  try {
    let detail = "";
    if (network === "ethereum" || network === "bsc") {
      detail = `block ${await evmClients[network].getBlockNumber()}`;
    } else if (network === "solana") {
      detail = `slot ${await solanaRpc<number>("getSlot", [])}`;
    } else {
      const res = await fetch(`${serverEnv.bitcoinApiUrl}/blocks/tip/height`, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(String(res.status));
      detail = `block ${await res.text()}`;
    }
    return { ok: true, latencyMs: Date.now() - start, detail };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, detail: e instanceof Error ? e.message.slice(0, 120) : "Unavailable" };
  }
}
