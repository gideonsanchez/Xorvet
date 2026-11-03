import type { NetworkId } from "./networks";

export type AssetSymbol = "BTC" | "ETH" | "BNB" | "SOL" | "MOWI";

export type AssetConfig = {
  symbol: AssetSymbol;
  name: string;
  /** Network the asset natively lives on. MOWI has none: it is application-defined. */
  network: NetworkId | null;
  decimals: number;
  /** CoinGecko id for market data. MOWI never uses market data. */
  coingeckoId: string | null;
  kind: "native" | "app-defined";
};

/** Fixed display price for MOWI. Never overwritten by market data. */
export const MOWI_PRICE_USD = "35.55";
/** Fixed informational display metric. Not a yield, return or promise. */
export const MOWI_DISPLAY_RATE = "15.99";

export const ASSETS: Record<AssetSymbol, AssetConfig> = {
  BTC: { symbol: "BTC", name: "Bitcoin", network: "bitcoin", decimals: 8, coingeckoId: "bitcoin", kind: "native" },
  ETH: { symbol: "ETH", name: "Ether", network: "ethereum", decimals: 18, coingeckoId: "ethereum", kind: "native" },
  BNB: { symbol: "BNB", name: "BNB", network: "bsc", decimals: 18, coingeckoId: "binancecoin", kind: "native" },
  SOL: { symbol: "SOL", name: "Solana", network: "solana", decimals: 9, coingeckoId: "solana", kind: "native" },
  MOWI: { symbol: "MOWI", name: "MOWI", network: null, decimals: 8, coingeckoId: null, kind: "app-defined" },
};

export const ASSET_SYMBOLS = Object.keys(ASSETS) as AssetSymbol[];
export const MARKET_ASSETS = ASSET_SYMBOLS.filter((s) => ASSETS[s].coingeckoId !== null);

export function isAssetSymbol(value: unknown): value is AssetSymbol {
  return typeof value === "string" && value in ASSETS;
}
