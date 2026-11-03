import { cookies } from "next/headers";
import { z } from "zod";
import { handleError, json, jsonError, readJson } from "@/lib/api";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/server/firebase-admin";
import { ensureUser } from "@/lib/server/repo";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/server/session";

const bodySchema = z.object({ idToken: z.string().min(20).max(5000), fullName: z.string().trim().max(100).optional() });

/** Exchanges a fresh Firebase ID token for an httpOnly session cookie. */
export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured) return jsonError(503, "Sign-in is not configured on the server yet.", "NOT_CONFIGURED");
  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Invalid sign-in request");

  try {
    const decoded = await adminAuth().verifyIdToken(parsed.data.idToken, true);
    // Only accept tokens from a sign-in that just happened.
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return jsonError(401, "Please sign in again.", "STALE_LOGIN");

    await ensureUser(decoded.uid, decoded.email ?? "", parsed.data.fullName ?? (decoded.name as string | undefined) ?? "");
    const sessionCookie = await adminAuth().createSessionCookie(parsed.data.idToken, { expiresIn: SESSION_MAX_AGE_MS });
    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });
    return json({ ok: true });
  } catch (e) {
    const code = (e as { code?: string })?.code ?? "";
    if (code.startsWith("auth/")) return jsonError(401, "Your sign-in could not be verified. Please try again.", "INVALID_TOKEN");
    return handleError(e);
  }
}

export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return json({ ok: true });
}
