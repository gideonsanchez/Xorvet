import { NextResponse } from "next/server";
import { handleError, json, requireUser } from "@/lib/api";
import { staffReplies } from "@/lib/server/repo";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    return json({ items: await staffReplies(auth.user.id) });
  } catch (e) {
    return handleError(e);
  }
}
