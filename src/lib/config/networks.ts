export type NetworkId = "ethereum" | "bsc" | "solana" | "bitcoin";
export type NetworkFamily = "evm" | "solana" | "bitcoin";

export type NetworkConfig = {
  id: NetworkId;
  name: string;
  family: NetworkFamily;
  /** Human readable mainnet label shown in the UI. */
  mainnetLabel: string;
  /** EVM chain id, only for EVM networks. */
  chainId?: number;
  nativeAsset: "ETH" | "BNB" | "SOL" | "BTC";
  derivationPath: string;
  explorer: {
    name: string;
    tx: (hash: string) => string;
    address: (address: string) => string;
  };
};

// Mainnet only. Testnets and devnets are intentionally absent.
export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    family: "evm",
    mainnetLabel: "Ethereum Mainnet",
    chainId: 1,
    nativeAsset: "ETH",
    derivationPath: "m/44'/60'/0'/0/0",
    explorer: {
      name: "Etherscan",
      tx: (h) => `https://etherscan.io/tx/${h}`,
      address: (a) => `https://etherscan.io/address/${a}`,
    },
  },
  bsc: {
    id: "bsc",
    name: "BNB Chain",
    family: "evm",
    mainnetLabel: "BNB Smart Chain Mainnet",
    chainId: 56,
    nativeAsset: "BNB",
    derivationPath: "m/44'/60'/0'/0/0",
    explorer: {
      name: "BscScan",
      tx: (h) => `https://bscscan.com/tx/${h}`,
      address: (a) => `https://bscscan.com/address/${a}`,
    },
  },
  solana: {
    id: "solana",
    name: "Solana",
    family: "solana",
    mainnetLabel: "Solana Mainnet-beta",
    nativeAsset: "SOL",
    derivationPath: "m/44'/501'/0'/0'",
    explorer: {
      name: "Solscan",
      tx: (h) => `https://solscan.io/tx/${h}`,
      address: (a) => `https://solscan.io/account/${a}`,
    },
  },
  bitcoin: {
    id: "bitcoin",
    name: "Bitcoin",
    family: "bitcoin",
    mainnetLabel: "Bitcoin Mainnet",
    nativeAsset: "BTC",
    derivationPath: "m/84'/0'/0'/0/0",
    explorer: {
      name: "mempool.space",
      tx: (h) => `https://mempool.space/tx/${h}`,
      address: (a) => `https://mempool.space/address/${a}`,
    },
  },
};

export const NETWORK_IDS = Object.keys(NETWORKS) as NetworkId[];

export function isNetworkId(value: unknown): value is NetworkId {
  return typeof value === "string" && value in NETWORKS;
}
