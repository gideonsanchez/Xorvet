import { NextResponse } from "next/server";
import { handleError, json, requireAdmin } from "@/lib/api";
import { listTransactions } from "@/lib/server/repo";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return json(await listTransactions({ limit: 100 }));
  } catch (e) {
    return handleError(e);
  }
}
