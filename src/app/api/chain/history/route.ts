import { NextResponse, type NextRequest } from "next/server";
import { json, jsonError, requireUser } from "@/lib/api";
import { ChainError, getRecentTransactions } from "@/lib/chains";
import { isNetworkId } from "@/lib/config/networks";
import { getAddress } from "@/lib/server/repo";

/** Recent on-chain transactions for the user's own address on one network. */
export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const network = request.nextUrl.searchParams.get("network");
  if (!isNetworkId(network)) return jsonError(400, "Unknown network");

  const address = await getAddress(auth.user.id, network);
  if (!address) return jsonError(404, "No wallet address on this network yet");

  try {
    const transactions = await getRecentTransactions(network, address);
    return json({ network, address, transactions, checkedAt: new Date().toISOString() });
  } catch (e) {
    const err = e instanceof ChainError ? e : new ChainError("History unavailable", "UNAVAILABLE");
    return jsonError(err.code === "RATE_LIMITED" ? 429 : err.code === "NOT_CONFIGURED" ? 501 : 502, err.message, err.code);
  }
}
