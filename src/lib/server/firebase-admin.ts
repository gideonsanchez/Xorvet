import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { serverEnv } from "@/lib/config/server-env";

export const isFirebaseAdminConfigured = Boolean(
  serverEnv.firebaseProjectId && serverEnv.firebaseClientEmail && serverEnv.firebasePrivateKey,
);

function app(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  if (!isFirebaseAdminConfigured) throw new Error("Firebase Admin credentials are not configured");
  return initializeApp({
    credential: cert({
      projectId: serverEnv.firebaseProjectId,
      clientEmail: serverEnv.firebaseClientEmail,
      privateKey: serverEnv.firebasePrivateKey,
    }),
  });
}

export const adminAuth = () => getAuth(app());

let dbInitialized = false;
export function db() {
  const firestore = getFirestore(app());
  if (!dbInitialized) {
    firestore.settings({ ignoreUndefinedProperties: true });
    dbInitialized = true;
  }
  return firestore;
}
