# AI Context

Quick orientation for any coding agent.

- **Stack:** Next.js 16 (App Router, `src/proxy.ts` instead of middleware), React 19, TypeScript strict, Tailwind v4, Radix primitives, Firebase Auth + Firestore (server-only via Admin SDK), viem, scure crypto libraries, Three.js via React Three Fiber.
- **Route groups:** `src/app/page.tsx` landing (light theme); `(auth)` login, register, forgot password; `wallet/setup` create or restore; `(app)` the signed-in wallet with `AppShell`; `(app)/admin` role-checked.
- **Client wallet:** `src/lib/wallet/` (mnemonic, derive, vault). Tested against published vectors in `tests/wallet.test.ts`.
- **Server data:** `src/lib/chains`, `src/lib/market`, route handlers in `src/app/api`.
- **State:** `WalletProvider` in `src/components/wallet/wallet-context.tsx` holds addresses, config, prices, chain and demo balances.
- **Themes:** `.theme-light` class remaps tokens for public pages. Dialogs portal to `body`, so they use the dark app theme.
- **Not done yet:** real on-chain sending, 2FA, Playwright end-to-end tests, verification against a live Firebase project.
