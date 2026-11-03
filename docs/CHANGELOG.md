# Changelog

## Unreleased

### 2026-11-03 Firebase backend
- Replaced Supabase with Firebase Authentication and Cloud Firestore (server-only access, deny-all rules).
- New session cookie flow, sign out everywhere, password change with re-authentication, email verification banner.
- New API routes for demo balances, transactions, providers, notifications, support and all admin actions.
- Added `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `pnpm seed` and `pnpm make-admin`.
- Removed `supabase/migrations`, the OAuth callback route and the custom reset-password page.

### 2026-11-03 Redesign
- Replaced gradients everywhere with a flat system: light public site (`#F3F3F0`, ink pill buttons, solid tiles) and flat dark navy app.
- Fonts: Oswald (display), Inter (body), JetBrains Mono (addresses), matching MetaMask's open font choices.
- New WebGL 3D hero: extruded XORVET mark and floating BTC, ETH, SOL and BNB coins, pointer and scroll reactive, reduced-motion still frame.
- New landing sections: network marquee, network tiles, self-custody steps with photo, dark practice-mode section, security grid, FAQ, CTA.
- Flat logo, MOWI icon and Solana icon. Notices and badges simplified to outline styles.
- Fixed: reduced-motion users saw a blank hero (hydration mismatch); coin textures never appeared with on-demand rendering.

### 2026-11-02 Build
- Project scaffolded (Next.js 16, TypeScript, Tailwind v4).
- Foundation docs, Supabase schema, wallet crypto, all wallet screens, admin console and support messaging.
