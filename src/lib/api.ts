import "server-only";
import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/server/firebase-admin";
import { getProfile, LedgerError, type Profile } from "@/lib/server/repo";
import { getUser, type SessionUser } from "@/lib/server/session";

export function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ error: { message, code } }, { status, headers: { "cache-control": "no-store" } });
}

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { "cache-control": "no-store", ...init?.headers } });
}

type Authed = { user: SessionUser; profile: Profile };

/** Resolves the verified session user and profile, or returns an error response. */
export async function requireUser(): Promise<Authed | NextResponse> {
  if (!isFirebaseAdminConfigured) return jsonError(503, "The server is not configured yet", "NOT_CONFIGURED");
  const user = await getUser();
  if (!user) return jsonError(401, "Please sign in", "UNAUTHENTICATED");
  const profile = await getProfile(user.id);
  if (!profile) return jsonError(401, "Please sign in again", "UNAUTHENTICATED");
  return { user, profile };
}

/** Like requireUser, and also checks the admin role stored on the server. */
export async function requireAdmin(): Promise<Authed | NextResponse> {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  if (auth.profile.role !== "admin" || auth.profile.status !== "active") {
    return jsonError(403, "Administrator access required", "FORBIDDEN");
  }
  return auth;
}

export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

const LEDGER_ERRORS: Record<string, [number, string]> = {
  INSUFFICIENT_BALANCE: [422, "Not enough demo balance for this amount."],
  INVALID_AMOUNT: [422, "Enter an amount greater than zero."],
  SAME_ASSET: [422, "Choose two different assets."],
  PRICE_UNAVAILABLE: [503, "A required price is unavailable right now, so no conversion can be made."],
  NETWORK_MISMATCH: [422, "That asset does not belong to the selected network."],
  RATE_LIMITED: [429, "Too many requests. Please wait a minute and try again."],
  ACCOUNT_INACTIVE: [403, "Your account is suspended. Contact support."],
  AMOUNT_TOO_SMALL: [422, "That amount is too small to swap."],
  INVALID_FEE: [500, "Swap fee configuration is invalid."],
  WALLET_MISMATCH: [409, "This phrase belongs to a different wallet than the one linked to your account."],
  WALLET_IN_USE: [409, "This wallet is already linked to another account."],
  CONVERSATION_CLOSED: [409, "This conversation is closed."],
  CANNOT_CHANGE_SELF: [422, "You cannot change your own status."],
  NOT_FOUND: [404, "Not found."],
};

/** Maps known domain errors to safe responses; anything else becomes a generic 500. */
export function handleError(error: unknown) {
  if (error instanceof LedgerError && LEDGER_ERRORS[error.code]) {
    const [status, text] = LEDGER_ERRORS[error.code];
    return jsonError(status, text, error.code);
  }
  console.error("API error", error instanceof Error ? error.message : error);
  return jsonError(500, "The request could not be completed. Please try again.");
}

export function ledgerError(code: string) {
  return handleError(new LedgerError(code));
}
