import { NextResponse, type NextRequest } from "next/server";
import { handleError, json, requireUser } from "@/lib/api";
import { isAssetSymbol } from "@/lib/config/assets";
import { listTransactions } from "@/lib/server/repo";

/** The signed-in user's own demo transactions, newest first, with cursor pagination. */
export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const p = request.nextUrl.searchParams;
  const kind = p.get("kind");
  const asset = p.get("asset");
  const before = p.get("before");
  const limit = Math.min(Math.max(Number(p.get("limit")) || 20, 1), 50);
  try {
    return json(
      await listTransactions({
        uid: auth.user.id,
        kind: kind === "send" || kind === "swap" ? kind : undefined,
        asset: isAssetSymbol(asset) ? asset : undefined,
        before: before && !Number.isNaN(Date.parse(before)) ? before : undefined,
        limit,
      }),
    );
  } catch (e) {
    return handleError(e);
  }
}
