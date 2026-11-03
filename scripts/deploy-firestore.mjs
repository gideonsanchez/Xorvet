// Publishes firestore.rules and creates the composite indexes in firestore.indexes.json,
// using the service account from .env.local. Same result as `firebase deploy --only firestore`.
// Usage: pnpm firestore:deploy
import { readFileSync } from "node:fs";
import { getSecurityRules } from "firebase-admin/security-rules";
import { app } from "./firebase-admin.mjs";

const projectId = process.env.FIREBASE_PROJECT_ID;

const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
await getSecurityRules(app).releaseFirestoreRulesetFromSource(rules);
console.log("Security rules published.");

const { indexes } = JSON.parse(readFileSync(new URL("../firestore.indexes.json", import.meta.url), "utf8"));
const { access_token: token } = await app.options.credential.getAccessToken();

for (const index of indexes) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/${index.collectionGroup}/indexes`;
  const fields = index.fields.map((f) =>
    f.arrayConfig ? { fieldPath: f.fieldPath, arrayConfig: f.arrayConfig } : { fieldPath: f.fieldPath, order: f.order },
  );
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ queryScope: index.queryScope, fields }),
  });
  const label = `${index.collectionGroup} (${index.fields.map((f) => f.fieldPath).join(", ")})`;
  if (res.ok) console.log(`Index requested: ${label}`);
  else if (res.status === 409) console.log(`Index already exists: ${label}`);
  else {
    const body = await res.json().catch(() => ({}));
    console.error(`Index failed: ${label}: ${res.status} ${body?.error?.message ?? ""}`);
    process.exitCode = 1;
  }
}
console.log("Indexes build in the background and can take a few minutes.");
