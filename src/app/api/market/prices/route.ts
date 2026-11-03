import { NextResponse } from "next/server";
import { json, jsonError, requireUser } from "@/lib/api";
import { getPrices } from "@/lib/market/coingecko";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const result = await getPrices();
  if (!result.ok) return jsonError(result.rateLimited ? 429 : 502, result.error, result.rateLimited ? "RATE_LIMITED" : "UNAVAILABLE");
  return json(result);
}
