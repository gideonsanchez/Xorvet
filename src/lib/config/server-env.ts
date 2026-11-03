import "server-only";

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const serverEnv = {
  // Firebase Admin service account (Project settings > Service accounts > Generate new private key).
  firebaseProjectId: optional("FIREBASE_PROJECT_ID"),
  firebaseClientEmail: optional("FIREBASE_CLIENT_EMAIL"),
  // Vercel and .env files store the key with literal \n sequences.
  firebasePrivateKey: optional("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),

  ethereumRpcUrl: optional("ETHEREUM_RPC_URL") ?? "https://ethereum-rpc.publicnode.com",
  bscRpcUrl: optional("BSC_RPC_URL") ?? "https://bsc-dataseed.bnbchain.org",
  solanaRpcUrl: optional("SOLANA_RPC_URL") ?? "https://api.mainnet-beta.solana.com",
  bitcoinApiUrl: optional("BITCOIN_API_URL") ?? "https://mempool.space/api",
  coingeckoApiKey: optional("COINGECKO_API_KEY"),
  coingeckoPlan: optional("COINGECKO_API_PLAN") === "pro" ? "pro" : "demo",
  etherscanApiKey: optional("ETHERSCAN_API_KEY"),
} as const;
