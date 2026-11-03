import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { adminAuth, isFirebaseAdminConfigured } from "./firebase-admin";

export const SESSION_COOKIE = "xorvet_session";
export const SESSION_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export type SessionUser = { id: string; email: string; emailVerified: boolean; provider: string };

/**
 * Verified user from the httpOnly session cookie, checked against Firebase for revocation.
 * Cached per request.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  // Read cookies first so every page that checks the session is always rendered per request.
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie || !isFirebaseAdminConfigured) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return {
      id: decoded.uid,
      email: decoded.email ?? "",
      emailVerified: Boolean(decoded.email_verified),
      provider: decoded.firebase?.sign_in_provider ?? "password",
    };
  } catch {
    return null;
  }
});
