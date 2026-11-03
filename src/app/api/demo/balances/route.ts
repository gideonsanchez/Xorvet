import { NextResponse } from "next/server";
import { handleError, json, requireUser } from "@/lib/api";
import { getDemoBalances } from "@/lib/server/repo";

/** Simulated demo ledger balances. Never on-chain funds. */
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    return json({ balances: await getDemoBalances(auth.user.id) });
  } catch (e) {
    return handleError(e);
  }
}
