# Tasks

## Done
- [x] Foundation docs, architecture, database and API plans
- [x] Wallet crypto: BIP-39 generation, per-network derivation, encrypted vault (13 unit tests passing)
- [x] Firebase backend: Auth with session cookies, Firestore data layer, deny-all rules, indexes, seed and admin scripts
- [x] Landing page redesign: flat MetaMask-style system, Oswald and Inter, WebGL 3D hero, photo section
- [x] Auth screens: sign in, register, forgot password (Firebase-hosted reset page), Google sign-in
- [x] Wallet setup: create with phrase confirmation, restore, mismatch protection
- [x] Dashboard, token detail with real price chart, Receive with QR, Send (simulated), Swap (simulated), Buy, Activity
- [x] Settings: profile, password, sessions, reveal phrase, remove from device, preferences
- [x] Customer support for users and the admin inbox
- [x] Admin console: overview and RPC health, users, transactions, config, providers, support, audit log

## Needs the project owner
- [ ] Create the Firebase project, fill `.env.local`, deploy rules and indexes, run `pnpm seed` (see `SETUP.md`)
- [ ] Push to GitHub, import into Vercel, connect the domain
- [ ] Optional: CoinGecko key, Etherscan key

## Next
- [ ] End-to-end check of every signed-in flow against the live Firebase project
- [ ] Playwright tests for auth, swap idempotency and per-user data isolation
- [ ] Step 6 reports: TEST_REPORT, SECURITY_REVIEW, PERFORMANCE, ACCESSIBILITY
- [ ] Replace deprecated `micro-ed25519-hdkey` with `micro-key-producer/slip10`
