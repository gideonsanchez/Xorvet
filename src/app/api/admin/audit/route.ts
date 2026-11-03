import { NextResponse } from "next/server";
import { handleError, json, requireAdmin } from "@/lib/api";
import { listAudit } from "@/lib/server/repo";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return json({ entries: await listAudit() });
  } catch (e) {
    return handleError(e);
  }
}
