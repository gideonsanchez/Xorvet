"use client";

import { getApps, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence, type Auth, type User } from "firebase/auth";
import { firebaseWebConfig } from "@/lib/config/public-env";

let authInstance: Auth | undefined;

/**
 * Firebase Auth in the browser is only used to sign in and obtain an ID token.
 * The server then issues an httpOnly session cookie, which is the real session.
 */
export function clientAuth(): Auth {
  if (authInstance) return authInstance;
  const app = getApps()[0] ?? initializeApp(firebaseWebConfig);
  authInstance = getAuth(app);
  void setPersistence(authInstance, browserSessionPersistence);
  return authInstance;
}

/** Exchanges the signed-in Firebase user for a server session cookie. */
export async function startServerSession(user: User, fullName?: string): Promise<void> {
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken, fullName }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Could not start your session.");
  }
}

export async function endServerSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
  await clientAuth().signOut().catch(() => undefined);
}

/** Friendly messages for Firebase Auth error codes. */
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a stronger password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method has not been enabled for this site yet.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for sign-in yet.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Allow pop-ups and try again.";
    case "auth/requires-recent-login":
      return "Please confirm your current password and try again.";
    case "auth/network-request-failed":
      return "You appear to be offline. Check your connection and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email. Sign in with your password first.";
    default:
      return error instanceof Error && !code ? error.message : "Something went wrong. Please try again.";
  }
}
