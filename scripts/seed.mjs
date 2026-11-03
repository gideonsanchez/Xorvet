// Seeds default app configuration and the verified Buy provider allowlist.
// Usage: pnpm seed   (safe to run more than once; existing values are kept)
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase-admin.mjs";

const CONFIG_DEFAULTS = {
  mowiPriceUsd: "35.55",
  mowiDisplayRate: "15.99",
  swapFeePercent: "0",
  transactionSimulationMode: true,
  swapSimulationMode: true,
};

// Each URL was opened on 2026-11-02 and confirmed to load on the provider's official domain over HTTPS.
// Regions and payment methods are left empty because they were not verified.
// Ramp Network was checked and left out: its previous buy URL now redirects to a page that returns 404.
const VERIFIED_AT = Timestamp.fromDate(new Date("2026-11-02T00:00:00Z"));
const PROVIDERS = [
  ["coinbase", "Coinbase", "Cryptocurrency exchange. Buy BTC in a Coinbase account, then withdraw it to your own address.", "https://www.coinbase.com/how-to-buy/bitcoin", 10],
  ["kraken", "Kraken", "Cryptocurrency exchange. Usually requires an account and identity verification before buying.", "https://www.kraken.com/buy/btc", 20],
  ["binance", "Binance", "Cryptocurrency exchange. Its services are restricted in some countries.", "https://www.binance.com/en/how-to-buy/bitcoin", 30],
  ["moonpay", "MoonPay", "Payment service for buying crypto and sending it to a wallet address you provide.", "https://www.moonpay.com/buy/btc", 40],
  ["transak", "Transak", "Payment service for buying crypto and sending it to a wallet address you provide.", "https://transak.com/buy/btc", 50],
];

const configRef = db.doc("config/app");
const existing = (await configRef.get()).data() ?? {};
const missing = Object.fromEntries(Object.entries(CONFIG_DEFAULTS).filter(([k]) => existing[k] === undefined));
if (Object.keys(missing).length) {
  await configRef.set({ ...missing, updatedAt: FieldValue.serverTimestamp(), updatedBy: "seed" }, { merge: true });
  console.log("Config defaults written:", Object.keys(missing).join(", "));
} else {
  console.log("Config already present.");
}

for (const [slug, name, description, url, sortOrder] of PROVIDERS) {
  const ref = db.doc(`buyProviders/${slug}`);
  if ((await ref.get()).exists) {
    console.log(`Provider ${slug} already present.`);
    continue;
  }
  await ref.set({ name, description, url, sortOrder, regions: [], paymentMethods: [], enabled: true, verifiedAt: VERIFIED_AT, updatedBy: "seed", updatedAt: FieldValue.serverTimestamp() });
  console.log(`Provider ${slug} added.`);
}

await db.collection("auditLog").add({ actorId: null, action: "seed", entity: "system", entityId: null, details: {}, createdAt: FieldValue.serverTimestamp() });
console.log("Done.");
