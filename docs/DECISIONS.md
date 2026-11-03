# Decisions

## 2026-11-02 Non-custodial mainnet instead of shared BTC address
The spec's shared operator BTC address, manual admin crediting and permanently pending sends form a custodial trap on mainnet. Chosen with the user: per-user addresses on all four networks, MOWI and swaps on a separate demo ledger only. See `PROJECT_BRIEF.md`.

## 2026-11-02 Fresh Next.js 16 project
The repository had no existing code, so there was nothing to preserve. Scaffolded with create-next-app (App Router, TypeScript, Tailwind v4, pnpm).

## 2026-11-02 CSS 3D and Motion instead of Three.js
The landing page uses CSS 3D transforms and the `motion` library. A WebGL engine would add a large bundle for a hero visual; CSS 3D gives depth and parallax and is trivially disabled for reduced motion and small screens.

## 2026-11-02 Solana reads via JSON-RPC fetch
Balance and signature lookups are two JSON-RPC calls. A full Solana client is deferred until real Solana sending is built.

## 2026-11-02 Bitcoin derivation is BIP-84
Native SegWit (`bc1q...`), path `m/84'/0'/0'/0/0`. Matches what most modern wallets restore by default.

## 2026-11-02 Demo ledger starting allocation
Each new account receives a fixed simulated allocation so the swap and send flows can be demonstrated. All demo balances are labelled Simulated and are stored apart from anything on-chain.

## 2026-11-02 Vault stored in IndexedDB
Encrypted with a separate wallet password. Losing browser data means restoring from the phrase. Not stored server-side, so the server cannot be used to recover or reveal it.

## 2026-11-03 Flat, MetaMask-style redesign
The owner asked for a mature look with no gradients. metamask.io was inspected: headings in Grotzec Condensed (commercial, MetaMask's license), body in Inter, mono in JetBrains Mono, flat light gray background, ink pill buttons, solid tiles. We use Oswald (the fallback MetaMask itself declares for Grotzec), Inter and JetBrains Mono. Public pages use a light theme; the wallet keeps the spec's navy as a flat dark theme.

## 2026-11-03 WebGL hero replaces CSS 3D
The owner asked for dynamic 3D. Three.js through React Three Fiber and drei, loaded lazily on the client only. Environment lighting is built in-scene with Lightformers, so no HDR files are fetched at runtime.

## 2026-11-03 One stock photo
Unsplash photo of a person writing in a notebook (photo-1522881451255), free Unsplash license, stored locally. A second phone photo was skipped because the image host was unreachable at the time.

## 2026-11-03 Firebase and Vercel replace Supabase
The owner chose Firebase and Vercel. Firebase Authentication handles email/password and Google; the browser exchanges a fresh ID token for a 5-day httpOnly session cookie that the server verifies (with revocation) on every request. Firestore is used only from the server through the Admin SDK, and the rules deny all client access, so every authorization check lives in one place. Demo ledger writes use Firestore transactions with the idempotency key as the document id. Password reset uses Firebase's hosted page.

## 2026-11-03 No shared Bitcoin receiving address
The owner offered a single Bitcoin mainnet address to show every user on Receive. Not built: with the non-custodial scope, each user already has their own BIP-84 address from their phrase, and a shared owner address would send every user's BTC to one person who alone can spend it. If the coursework needs the original shared-address flow, it should be built on Bitcoin testnet.

## 2026-11-03 Activity search filters loaded rows
Firestore has no substring search. Type and asset filters run on the server with indexes; the text search filters the rows already loaded.
