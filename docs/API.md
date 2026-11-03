# API

Every route except `/api/auth/session` requires the `xorvet_session` httpOnly cookie, verified with Firebase (including revocation) on each request. Errors are `{ error: { message, code } }`. Responses are `no-store`.

## Auth and account

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/auth/session` | POST | `{ idToken, fullName? }` from a sign-in under 5 minutes old. Creates the profile on first sign-in and sets a 5-day session cookie |
| `/api/auth/session` | DELETE | Clears the cookie |
| `/api/auth/revoke` | POST | Revokes all sessions on every device |
| `/api/profile` | PATCH | `{ fullName }` |

## Wallet

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/wallet/addresses` | POST | Link four public addresses. `409 WALLET_MISMATCH` unless `replace: true`; `409 WALLET_IN_USE` if another account holds them |
| `/api/chain/balances` | GET | Native balances for the user's own addresses |
| `/api/chain/history?network=` | GET | Recent on-chain transactions. `501 NOT_CONFIGURED` for EVM without an Etherscan key |
| `/api/market/prices` | GET | CoinGecko USD prices, cached 60 s. MOWI never fetched |
| `/api/market/chart?asset=&range=` | GET | Historical prices. `1D 1W 1M 1Y ALL` |
| `/api/demo/balances` | GET | Demo ledger balances |
| `/api/demo/swap` | POST | `{ from, to, amount, idempotencyKey }`. Server-side prices |
| `/api/demo/send` | POST | `{ network, amount, recipient, idempotencyKey }`. Recorded as pending, never broadcast |
| `/api/transactions?kind=&asset=&before=&limit=` | GET | Own demo transactions with cursor paging |
| `/api/buy-providers` | GET | Enabled providers |
| `/api/notifications` | GET | Latest staff replies to the user |
| `/api/support/conversations` | GET, POST | Own conversations; start one with `{ subject, body }` |
| `/api/support/conversations/{id}` | GET, POST, PATCH | Messages for the owner or an admin. POST adds a message (admins reply as staff). PATCH `{ status }` is admin only |

## Admin (role checked on the server)

`/api/admin/stats`, `/users`, `/users/{uid}` (PATCH status), `/transactions`, `/config` (GET, PATCH), `/providers` (GET, POST), `/providers/{slug}` (PATCH `enable`, `disable`, `verify`, `edit`), `/support`, `/audit`, `/health`.

Ledger error codes: `INSUFFICIENT_BALANCE`, `INVALID_AMOUNT`, `SAME_ASSET`, `PRICE_UNAVAILABLE`, `RATE_LIMITED`, `ACCOUNT_INACTIVE`, `WALLET_MISMATCH`, `WALLET_IN_USE`.
