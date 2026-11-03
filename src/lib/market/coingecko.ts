import "server-only";
import { serverEnv } from "@/lib/config/server-env";
import { ASSETS, MARKET_ASSETS, type AssetSymbol } from "@/lib/config/assets";

export type MarketPrice = { usd: string; change24h: number | null };
export type PriceResult =
  | { ok: true; prices: Partial<Record<AssetSymbol, MarketPrice>>; updatedAt: string; source: "CoinGecko" }
  | { ok: false; error: string; rateLimited: boolean };

export const CHART_RANGES = { "1D": "1", "1W": "7", "1M": "30", "1Y": "365", ALL: "max" } as const;
export type ChartRange = keyof typeof CHART_RANGES;

export type ChartResult =
  | { ok: true; points: [number, number][]; updatedAt: string; source: "CoinGecko" }
  | { ok: false; error: string; rateLimited: boolean };

function baseUrl() {
  return serverEnv.coingeckoPlan === "pro" && serverEnv.coingeckoApiKey
    ? "https://pro-api.coingecko.com/api/v3"
    : "https://api.coingecko.com/api/v3";
}

function headers(): HeadersInit {
  const h: Record<string, string> = { accept: "application/json" };
  if (serverEnv.coingeckoApiKey) {
    h[serverEnv.coingeckoPlan === "pro" ? "x-cg-pro-api-key" : "x-cg-demo-api-key"] = serverEnv.coingeckoApiKey;
  }
  return h;
}

async function cgFetch(path: string, revalidate: number): Promise<Response> {
  return fetch(`${baseUrl()}${path}`, {
    headers: headers(),
    next: { revalidate },
    signal: AbortSignal.timeout(10_000),
  });
}

/** Market prices for on-chain assets. MOWI is deliberately excluded: it has a fixed configured price. */
export async function getPrices(): Promise<PriceResult> {
  const ids = MARKET_ASSETS.map((s) => ASSETS[s].coingeckoId).join(",");
  try {
    const res = await cgFetch(`/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&precision=full`, 60);
    if (!res.ok) return { ok: false, error: `Market data provider returned ${res.status}`, rateLimited: res.status === 429 };
    const body = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
    const prices: Partial<Record<AssetSymbol, MarketPrice>> = {};
    for (const symbol of MARKET_ASSETS) {
      const row = body[ASSETS[symbol].coingeckoId!];
      if (row?.usd && row.usd > 0) {
        prices[symbol] = { usd: String(row.usd), change24h: row.usd_24h_change ?? null };
      }
    }
    return { ok: true, prices, updatedAt: new Date().toISOString(), source: "CoinGecko" };
  } catch {
    return { ok: false, error: "Market data provider did not respond", rateLimited: false };
  }
}

export async function getChart(symbol: AssetSymbol, range: ChartRange): Promise<ChartResult> {
  const id = ASSETS[symbol].coingeckoId;
  if (!id) return { ok: false, error: "No market data exists for this asset", rateLimited: false };
  try {
    const res = await cgFetch(`/coins/${id}/market_chart?vs_currency=usd&days=${CHART_RANGES[range]}`, range === "1D" ? 300 : 1800);
    if (!res.ok) {
      return {
        ok: false,
        error: res.status === 401 && range === "ALL" ? "Full history is not available on the current market data plan" : `Market data provider returned ${res.status}`,
        rateLimited: res.status === 429,
      };
    }
    const body = (await res.json()) as { prices?: [number, number][] };
    const points = (body.prices ?? []).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (points.length < 2) return { ok: false, error: "Not enough price history returned", rateLimited: false };
    return { ok: true, points, updatedAt: new Date().toISOString(), source: "CoinGecko" };
  } catch {
    return { ok: false, error: "Market data provider did not respond", rateLimited: false };
  }
}
