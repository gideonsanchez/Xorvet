import { NextResponse } from "next/server";
import { json, requireAdmin } from "@/lib/api";
import { probeNetwork } from "@/lib/chains";
import { NETWORK_IDS } from "@/lib/config/networks";
import { getPrices } from "@/lib/market/coingecko";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const [networks, market] = await Promise.all([
    Promise.all(NETWORK_IDS.map(async (id) => ({ network: id, ...(await probeNetwork(id)) }))),
    getPrices(),
  ]);
  return json({
    networks,
    market: market.ok ? { ok: true, detail: `${Object.keys(market.prices).length} prices` } : { ok: false, detail: market.error },
    checkedAt: new Date().toISOString(),
  });
}
