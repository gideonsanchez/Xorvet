@AGENTS.md

# XORVET WALLET: AI working rules

Read `docs/PROJECT_BRIEF.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md` and `docs/AI_CONTEXT.md` before changing code.

- Non-custodial mainnet wallet. Never add custodial deposit intake, admin crediting of real funds, or conversion of real assets into MOWI.
- Phrases, private keys and the vault never leave the browser. Never log them or send them to an API.
- Never fabricate balances, prices, chart history, transaction hashes or provider links. Show an unavailable state instead.
- Simulated activity is always labelled Simulated and lives only in the demo ledger.
- Authorization is enforced in the API routes (Firestore denies all client access), never only in the UI.
- Design: flat, no gradients. Oswald for headings (`.display`), Inter for body, JetBrains Mono for addresses. Lucide icons only. No emojis.
- Copy: plain and concise. No em dashes, en dashes, filler or hype.
- Search before creating new components. Make the smallest correct change. Run `pnpm test`, `pnpm lint`, `pnpm typecheck` after changes and report real results.
- Keep `docs/TASKS.md`, `docs/DECISIONS.md`, `docs/CHANGELOG.md` and `docs/AI_CONTEXT.md` current.
