import { NextResponse, type NextRequest } from "next/server";
import { json, jsonError, requireUser } from "@/lib/api";
import { isAssetSymbol } from "@/lib/config/assets";
import { CHART_RANGES, getChart, type ChartRange } from "@/lib/market/coingecko";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const asset = request.nextUrl.searchParams.get("asset");
  const range = request.nextUrl.searchParams.get("range") ?? "1W";
  if (!isAssetSymbol(asset)) return jsonError(400, "Unknown asset");
  if (!(range in CHART_RANGES)) return jsonError(400, "Unknown range");
  const result = await getChart(asset, range as ChartRange);
  if (!result.ok) return jsonError(result.rateLimited ? 429 : 502, result.error, result.rateLimited ? "RATE_LIMITED" : "UNAVAILABLE");
  return json(result);
}
