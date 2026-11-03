import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { handleError, json, requireUser } from "@/lib/api";
import { adminAuth } from "@/lib/server/firebase-admin";
import { SESSION_COOKIE } from "@/lib/server/session";

/** Signs the user out on every device by revoking all refresh tokens and session cookies. */
export async function POST() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    await adminAuth().revokeRefreshTokens(auth.user.id);
    (await cookies()).delete(SESSION_COOKIE);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
