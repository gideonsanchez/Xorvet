import { NextResponse } from "next/server";
import { handleError, json, requireAdmin } from "@/lib/api";
import { listUsers } from "@/lib/server/repo";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return json({ users: await listUsers() });
  } catch (e) {
    return handleError(e);
  }
}
