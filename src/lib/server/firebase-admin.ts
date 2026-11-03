import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
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

// The Firestore instance is shared per process, but route bundles each get their own copy of
// this module, so the "settings applied" flag must live on globalThis or settings() runs twice.
const globalForFirestore = globalThis as typeof globalThis & { __xorvetFirestore?: Firestore };

export function db(): Firestore {
  if (globalForFirestore.__xorvetFirestore) return globalForFirestore.__xorvetFirestore;
  const firestore = getFirestore(app());
  try {
    firestore.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Already configured by another bundle in this process.
  }
  globalForFirestore.__xorvetFirestore = firestore;
  return firestore;
}
