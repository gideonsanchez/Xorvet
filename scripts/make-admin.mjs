// Grants the admin role to an existing account. The person must have signed in at least once.
// Usage: pnpm make-admin you@example.com
import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "./firebase-admin.mjs";

const email = process.argv[2];
if (!email) {
  console.error("Usage: pnpm make-admin you@example.com");
  process.exit(1);
}

const user = await auth.getUserByEmail(email).catch(() => null);
if (!user) {
  console.error(`No Firebase account found for ${email}. Sign up in the app first.`);
  process.exit(1);
}

const ref = db.doc(`users/${user.uid}`);
if (!(await ref.get()).exists) {
  console.error("This account has not signed in to XORVET yet. Sign in once, then run this again.");
  process.exit(1);
}

await ref.update({ role: "admin", updatedAt: FieldValue.serverTimestamp() });
await db.collection("auditLog").add({ actorId: null, action: "grant_admin", entity: "users", entityId: user.uid, details: { email }, createdAt: FieldValue.serverTimestamp() });
console.log(`${email} is now an administrator.`);
