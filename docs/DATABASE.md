# Database (Cloud Firestore)

Only the server reads and writes Firestore, through the Firebase Admin SDK in Next.js route handlers (`src/lib/server/repo.ts`). `firestore.rules` denies all client access. Composite indexes are in `firestore.indexes.json`.

| Path | Contents | Written by |
| --- | --- | --- |
| `users/{uid}` | email, fullName, role (`user`/`admin`), status (`active`/`suspended`), timestamps | Created on first sign-in. Name via `/api/profile`. Role via `pnpm make-admin`. Status by admins |
| `users/{uid}/addresses/{network}` | public address, derivation path | `/api/wallet/addresses` |
| `addressIndex/{network}__{address}` | owning uid. Stops one wallet being linked to two accounts | Same transaction as above |
| `ledgers/{uid}` | `balances` map of decimal strings (demo only) | Seeded on sign-up; changed only by demo swaps |
| `transactions/{uid}__{idempotencyKey}` | userId, kind, mode, status, asset(s), amounts as decimal strings, rate, fee, recipient, note, createdAt. `txHash` always null for simulated | Demo send and swap transactions |
| `config/app` | MOWI price and rate, swap fee, simulation toggles | `pnpm seed`, admin config |
| `buyProviders/{slug}` | name, description, HTTPS url, enabled, verifiedAt, sortOrder | `pnpm seed`, admin providers |
| `supportConversations/{id}` and `/messages/{id}` | owner, subject, status; messages with senderId, ownerId, isStaff, body | Support API |
| `auditLog/{id}` | actorId, action, entity, entityId, details, createdAt. Append-only by convention: the app never updates or deletes it | Server, in the same transaction as the change |

## Integrity

- Demo ledger operations run in a Firestore transaction: idempotency by document id, active-account check, rate limit (10 per minute), balance check, then debit and credit together.
- Decimal math uses `big.js` on strings; no floating point in ledger values.
- Support messages are rate limited to 20 per 10 minutes per sender.

Nothing in Firestore stores a recovery phrase, private key, vault or wallet password.
