# XORVET WALLET

A non-custodial, multi-chain crypto wallet web app built as a university project.

- Ethereum, BNB Smart Chain, Solana and Bitcoin **mainnet** addresses derived in the browser from the user's own BIP-39 recovery phrase. The phrase never leaves the device.
- Real on-chain balances, transaction history and CoinGecko price charts.
- A clearly labelled **demo ledger** for simulated swaps and sends, including the app-defined MOWI asset.
- Buy page linking to verified provider websites, customer support messaging and an admin console.

## Stack

Next.js 16 on Vercel, Firebase Authentication, Cloud Firestore (server-only access), Tailwind CSS, Three.js, viem and the scure crypto libraries.

## Getting started

See [docs/SETUP.md](docs/SETUP.md). In short:

```bash
pnpm install
cp .env.example .env.local   # then fill in Firebase values
pnpm firestore:deploy        # security rules and indexes
pnpm seed                    # default config and Buy providers
pnpm dev
```

## Docs

- [Project brief](docs/PROJECT_BRIEF.md) and [decisions](docs/DECISIONS.md)
- [Architecture](docs/ARCHITECTURE.md), [database](docs/DATABASE.md), [API](docs/API.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Tasks](docs/TASKS.md) and [changelog](docs/CHANGELOG.md)

Nothing in this app is financial advice.
