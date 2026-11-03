# XORVET WALLET: Project Brief

The full product specification is `XORVET_WALLET_Final_Build_Prompt-1.md` in the repository root. This brief records what is actually being built, which differs from that specification in one important area (see "Scope decision").

## Product

A responsive, beginner-friendly, **non-custodial** multi-chain wallet web app for a university project.

- Public marketing landing page at `/` with Login (top right) and Get Started.
- Email/password and Google sign-in (Firebase Authentication).
- Client-side wallet creation with a BIP-39 recovery phrase, phrase confirmation, and restore.
- Each user owns their own mainnet addresses on Ethereum, BNB Smart Chain, Solana and Bitcoin.
- Real on-chain balances, read from mainnet RPC and block explorers.
- Token detail screens with real historical price charts (CoinGecko).
- MOWI: an application-defined demo asset with a fixed display price of $35.55 and a fixed informational rate of 15.99%.
- A separate, clearly labelled **demo ledger** for simulated sends and simulated swaps.
- Buy page that links out to verified official provider websites.
- Settings, customer support messaging, and an admin console.

## Scope decision (2026-11-02)

The specification describes a single operator-controlled Bitcoin mainnet address that all users deposit into, with an administrator manually crediting internal balances that can then be swapped into MOWI, while outgoing sends stay pending forever. Combined, that is a custodial deposit system where real funds can go in but cannot come out, which is the structure used by fake-wallet scams regardless of the labels shown. It is not being built against mainnet.

Instead:

- Bitcoin uses a per-user BIP-84 address derived from the user's own phrase, like the other networks.
- There is no shared deposit address, no admin crediting of real deposits, and no internal BTC ledger backed by real BTC.
- MOWI and all swaps live only on the demo ledger. Real on-chain assets can never be converted into MOWI.
- Users hold their own keys. Their phrase restores the same addresses in any standard wallet.

If the full specification is ever needed for coursework, build it on testnets (Sepolia, BSC Testnet, Solana Devnet, Bitcoin Testnet) where no real money is involved.

## Out of scope

NFTs, staking, hardware wallets, DApp browser, bridges, in-app payments, 2FA (not yet), custodial deposits.
