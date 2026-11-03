import { NextResponse } from "next/server";
import { handleError, json, requireAdmin } from "@/lib/api";
import { listConversations } from "@/lib/server/repo";

/** Every customer conversation, newest activity first. */
export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return json({ conversations: await listConversations() });
  } catch (e) {
    return handleError(e);
  }
}
