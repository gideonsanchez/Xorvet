# Architecture

## Stack

| Area | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 App Router | Server routes for privileged work, file-based routing, Vercel hosting |
| Language | TypeScript, strict | Typed chain adapters and ledger code |
| Styling | Tailwind CSS v4 with CSS variable tokens | Matches the design system tokens directly |
| Components | Own shadcn-style components on Radix primitives | Accessible dialogs, menus and tabs without a large kit |
| Icons | Lucide only | Spec requirement, one consistent set |
| Motion | `motion` (Framer Motion) with CSS 3D transforms | Tasteful 3D on the landing page without a WebGL engine |
| Auth | Firebase Authentication (email/password, Google) with server-issued httpOnly session cookies | Hosted auth; the server verifies and can revoke sessions |
| Database | Cloud Firestore, accessed only by the server via the Admin SDK | Rules deny all client access; ownership checked in each route; transactions for ledger writes |
| Wallet crypto | `@scure/bip39`, `@scure/bip32`, `@scure/btc-signer`, `micro-ed25519-hdkey`, `viem/accounts` | Audited, widely used libraries; no custom cryptography |
| EVM | `viem` | Typed clients for Ethereum (1) and BNB Smart Chain (56) |
| Solana | JSON-RPC over `fetch` for reads | Balance and signature reads only; no heavy client needed yet |
| Bitcoin | mempool.space REST API | Address balance and history on mainnet |
| Prices and charts | CoinGecko API through a cached server route | One pricing source for portfolio and charts |
| Validation | Zod | Shared client and server schemas |
| Decimal math | `big.js` everywhere, values stored as decimal strings | No binary floating point in accounting |
| Tests | Vitest (unit), in-app browser checks (UI) | Lightweight; Playwright can be added later |
| Hosting | Vercel (app) + Firebase (auth and Firestore) | Owner's chosen platforms; free tiers fit a university project |

## Boundaries

```text
Browser (client components)
  - Wallet vault: phrase generation, encryption, key derivation, signing
  - Never sends the phrase or private keys anywhere
        |
        | HTTPS, xorvet_session httpOnly cookie
        v
Next.js server (route handlers, server components, proxy.ts)
  - Session check on every private route and API
  - Price, chart, balance and history proxies (keeps provider keys server-side)
  - Demo ledger operations in Firestore transactions
  - Admin operations (role checked server-side)
        |
        v
Cloud Firestore (rules: deny all clients)     External: RPC nodes, mempool.space, CoinGecko
```

## Data flow

- **Wallet creation:** browser generates the phrase, user confirms words, browser derives public addresses and encrypts the phrase with a wallet password (PBKDF2-SHA256 600k iterations, AES-256-GCM) into IndexedDB. Only public addresses are sent to `POST /api/wallet/addresses`.
- **Balances:** client calls `/api/chain/balance` with a network; the server looks up the user's stored address and queries the chain. The server never accepts arbitrary addresses for balance lookups, so it cannot be used as an open proxy.
- **Prices:** `/api/market/prices` and `/api/market/chart` call CoinGecko with caching. MOWI is never fetched; it always uses the configured fixed price.
- **Demo swap:** client sends `{from, to, amount, idempotencyKey}`. The server fetches prices itself, then runs a Firestore transaction that checks idempotency, account status, rate limit and funds, debits and credits together, and records the transaction.
- **Simulated send:** server validates the recipient format and demo balance, then records a `pending` simulated transaction. Nothing is broadcast.

## Security boundaries

- Phrase and private keys exist only in browser memory while unlocked and as ciphertext in IndexedDB.
- `FIREBASE_PRIVATE_KEY`, `COINGECKO_API_KEY`, RPC URLs with keys and `ETHERSCAN_API_KEY` are server-only (never `NEXT_PUBLIC_`).
- Admin is `users/{uid}.role = 'admin'`, checked on the server in the admin layout and every admin route. Hiding UI is never the control.
- Audit log is append-only (trigger rejects update and delete).
- Rate limits for swaps, sends and support messages are enforced in the server data layer.

## Project structure

```text
src/
  app/
    page.tsx                    public landing page
    (auth)/login, register, forgot-password, reset-password
    auth/callback/route.ts      OAuth and email link callback
    (app)/dashboard, send, receive, swap, buy, activity, settings, assets/[asset], wallet/setup
    admin/                      admin console (role checked in layout and APIs)
    api/                        route handlers
  components/  ui/ brand/ landing/ wallet/ admin/
  lib/
    config/      networks, assets, env
    wallet/      mnemonic, derivation, vault
    chains/      evm, solana, bitcoin adapters
    market/      CoinGecko client
    server/      Firebase Admin, session, Firestore repository
    firebase/    browser Auth client
    validation/  zod schemas
  proxy.ts       session refresh and route protection
scripts/         seed and make-admin
firestore.rules, firestore.indexes.json, firebase.json
tests/
```

## Environments

- **Development:** `pnpm dev`, a Firebase project, `.env.local`.
- **Production:** Vercel project with the same variables; the production domain added to Firebase authorized domains.
- See `.env.example` for every variable.

## Testing

- Vitest unit tests: derivation against published test vectors, vault round-trip, address validation, swap math, MOWI constants.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`.
- Manual UI checks in a browser at 320, 768, 1280 and 1600 px.

## Deployment and rollback

Vercel builds from the main branch. Rollback is Vercel "Promote to production" on the previous deployment. Database migrations are forward-only SQL files; a rollback needs a new corrective migration.

## Open technical decisions

- Real (non-simulated) sending is behind `TRANSACTION_SIMULATION_MODE`. Real EVM sending needs a funded mainnet account to verify, so it stays off until it can be tested.
- EVM transaction history needs an `ETHERSCAN_API_KEY` (Etherscan v2 covers Ethereum and BNB Chain). Without it, the UI says history is unavailable.
