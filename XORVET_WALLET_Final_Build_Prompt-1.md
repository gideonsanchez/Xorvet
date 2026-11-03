# XORVET WALLET --- Master Product, UI/UX and Implementation Specification

**Document purpose:** Single source of truth for the coding agent\
**Product name:** XORVET WALLET\
**Product type:** Responsive, multi-chain cryptocurrency wallet web
application\
**Network strategy:** Mainnet for Bitcoin, Ethereum, BNB Chain, and Solana, with clearly separated real blockchain functionality and explicitly labelled internal simulations\
**Design direction:** MetaMask-inspired usability with original XORVET
branding; dark navy, electric blue and violet

------------------------------------------------------------------------

# 1. Instructions to the coding agent

**Critical network correction:** This project is a MAINNET wallet. Ethereum, BNB Smart Chain, Solana and Bitcoin must all be configured for their respective mainnets. Do not use testnet or devnet configurations anywhere in the production wallet network selection. Internal simulations may remain enabled as specified, but they must never be confused with mainnet blockchain activity.

Act as a senior product designer, full-stack engineer, blockchain
integration engineer, and security-conscious software architect.

Build and improve the existing XORVET WALLET repository according to
this complete specification.

Before changing anything:

1.  Inspect the repository, package manager, framework and versions,
    directory structure, installed dependencies, environment
    configuration, existing database schema, authentication, and current
    functionality.
2.  Identify which requirements are already implemented and which are
    missing.
3.  Produce a concise implementation plan that preserves working code.
4.  Do not replace the existing project or framework without a
    compelling technical reason.
5.  Implement in manageable phases, run the available checks, and report
    actual results. Do not claim a feature, test, or integration works
    unless it has been implemented and verified.

This document supersedes earlier product names and conflicting UI
instructions. The product must be branded **XORVET WALLET** throughout.

Do not fabricate balances, market prices, blockchain transactions,
successful purchases, OAuth configuration, wallet recovery, or security
guarantees.

## Scope guard

Implement only the features explicitly listed in this document. Do not
silently add extra wallet capabilities such as NFTs, staking, hardware
wallet support, DApp browsing, cross-chain bridges, or other future
features. Preserve the existing repository and working functionality.
The only additions to the previously defined wallet scope are: (1) the
public responsive marketing landing page with Login at the top right and
tasteful 3D motion, and (2) in-app customer support messaging between
users and administrators as specified below.

# 2. Product vision and operating modes

XORVET WALLET is a beginner-friendly, multi-chain wallet interface
supporting:

-   Ethereum Mainnet
-   BNB Smart Chain (BNB Chain) Mainnet
-   Solana Mainnet-beta
-   Bitcoin receiving-address display using an administrator-configured
    shared BTC address
-   An application-defined experimental asset named MOWI
-   Token sending and receiving flows
-   Internal simulated swaps
-   Transaction history
-   Account authentication and wallet recovery
-   An administrator console
-   A Buy section that directs users to legitimate external Bitcoin
    purchase providers

All supported blockchain networks must use their respective MAINNET environments. Bitcoin must use Bitcoin Mainnet; Ethereum must use Ethereum Mainnet; BNB Chain must use BNB Smart Chain Mainnet; and Solana must use Solana Mainnet-beta. Do not configure Sepolia, BNB Chain Testnet, Solana Devnet, or other test networks as the production network. The interface must always distinguish: - Verified on-chain balances and activity - Internal ledger
balances and activity - Simulated/demo balances and activity -
Application-defined assets that are not deployed blockchain tokens

Use explicit labels such as **Mainnet**, **Simulated**, **Internal balance**, and **On-chain** where appropriate. Never imply that simulated balances are real blockchain assets. Mainnet operations can involve real funds; implement strong safeguards, transaction previews, confirmation steps, and clear warnings.

# 3. Brand identity

## Product name

**XORVET WALLET**

Replace all old Nextbit Wallet / Nextbit branding in: - Browser title
and metadata - Landing page - Authentication screens - App header and
sidebar - Mobile navigation - Wallet screens - Admin console - Email
templates - Notifications - Footer and legal/help pages - Application
icons and documentation

Do not leave obsolete branding in user-facing content.

## Logo

Create an original, professional XORVET WALLET logo: - Geometric or
abstract X symbol - Electric-blue and violet accents - Clear XORVET
WALLET wordmark - Works on dark and light backgrounds - SVG or another
scalable local asset where practical - Legible at small mobile sizes

Place the logo at the **top-left corner** of the desktop app shell. On
mobile use a compact symbol and wordmark. Do not copy MetaMask's logo or
artwork.

# 4. Visual design and UX

## Design direction

Use MetaMask as a usability reference, not as a template to copy. The
product should feel like a polished, recognizable Web3 wallet:
wallet-centric, compact, clear, and easy for beginners.

Core palette: - Main background: `#071426` - Card background:
`#101F38` - Elevated background: `#152641` - Primary electric blue:
`#3478F6` - Violet accent: `#8257F5` - Success mint: `#22C99A` - Warning
amber: `#F5B94C` - Primary text: `#F5F8FF` - Secondary text: `#9AAEC9` -
Borders: `#243752`

Use accessible error colors with sufficient contrast. Use gradients
sparingly, primarily for brand accents and primary actions. Avoid
excessive glow, visual clutter, heavy glassmorphism, and distracting
animation.

Typography: Inter or Geist.

Design rules: - Consistent 8 px spacing scale - Cards with approximately
14--18 px corner radius - Restrained borders and shadows - Clear
typography hierarchy - Consistent Lucide iconography - Accessible hover,
focus, active, disabled, loading, success, empty, and error states -
Reduced-motion support - WCAG AA contrast wherever practical - Never use
color alone to communicate status

## Responsive behavior

### Desktop

-   Sidebar approximately 230--250 px wide
-   XORVET WALLET logo at top left
-   Main navigation: Dashboard, Send, Receive, Swap, Buy,
    Activity/Transactions, Settings
-   Network selector, notification area, and account menu
-   Fluid main content with a sensible maximum width
-   Clear dashboard hierarchy and asset list

### Tablet

-   Collapsible navigation
-   Adaptable card grids
-   No horizontal overflow

### Mobile

-   Compact top header with XORVET identity
-   Wallet balance near the top
-   Prominent Send, Receive, Swap, and Buy actions
-   Scrollable token list
-   Bottom navigation prioritizing Home, Activity, and Wallet/Settings
-   Responsive drawers and dialogs
-   Comfortable touch targets, ideally 44--48 px or larger
-   Forms usable with mobile keyboards
-   Test at 320 px width and above

# 5. Public marketing landing page and visitor journey

The root URL (`/`) must open a public marketing landing page. It must
not open directly to the login form or private wallet dashboard.

## Landing-page navigation

-   XORVET WALLET logo/wordmark at the top left.
-   A clearly visible **Login** option at the top right.
-   A **Get Started** call to action that opens the existing
    registration flow.
-   On narrow screens, use a compact, accessible mobile navigation while
    keeping Login easy to find.

## Landing-page content

Create a polished marketing page that introduces XORVET WALLET and
cryptocurrency in clear, beginner-friendly language. Include:

-   Hero headline, concise supporting copy, and prominent Login/Get
    Started calls to action.
-   A wallet/product visual that communicates the app's purpose.
-   A concise overview of the wallet's already specified capabilities.
-   Supported-network information.
-   A section explaining the wallet's approach to security and user
    control, without making unverified security claims.
-   A clear footer.

Do not add new wallet capabilities or make claims about services that
are not implemented. Keep the landing page content consistent with the
actual Mainnet network configuration and clearly labelled simulation boundaries described in this specification.

## 3D motion and visual direction

Give the landing page a premium, modern Web3 visual experience, taking
inspiration from the quality and motion design of MetaMask's public
website, while using original XORVET branding and artwork.

Use tasteful 3D wallet/crypto-inspired visuals, floating elements,
subtle parallax, scroll-triggered reveals, and smooth transitions.
Suitable libraries may include Three.js / React Three Fiber and Framer
Motion, but inspect the existing stack first and add dependencies only
when justified.

Animations must not obscure content, block navigation, or make the page
feel busy. Respect `prefers-reduced-motion`; provide a reduced-motion
experience. On mobile or low-powered devices, simplify or disable
expensive 3D effects while preserving the design and performance.

## Visitor and authentication flow

1.  Visitor opens `/` and sees the public marketing landing page.
2.  Clicking **Login** opens the existing login screen.
3.  Clicking **Get Started** opens the existing registration screen.
4.  After successful authentication, redirect to the existing
    authenticated wallet dashboard.
5.  Protect private wallet and settings routes from unauthenticated
    access.
6.  If an authenticated user visits `/`, provide a clear route into
    their wallet; do not unexpectedly discard their session.

The landing page is an addition to the existing product, not a
replacement for authentication, dashboard, or any wallet feature.

# 6. Technology and architecture

Preserve the existing stack if it is sound. Where the project is not
already configured, preferred technologies are:

-   Next.js App Router
-   TypeScript with strict typing
-   Tailwind CSS
-   shadcn/ui
-   Lucide icons
-   Supabase Auth and Postgres where appropriate
-   Viem for EVM networks
-   A current supported Solana client library configured for Solana Mainnet-beta
-   Zod for validation
-   React Hook Form for complex forms where useful

Separate UI, business logic, data access, blockchain adapters, pricing,
and configuration. Use typed interfaces and server-side validation. Do
not put privileged operations in client components.

Create `.env.example` with variable names and explanations, never actual
secrets. Keep server secrets out of `NEXT_PUBLIC_` variables. Do not
commit API keys, passwords, private keys, seed phrases, or service-role
credentials.

# 7. Authentication and account creation

Create professional sign-in, registration, and recovery entry screens.

## Sign-in screen

Include: - XORVET WALLET logo - Professional welcome heading and concise
supporting copy - Email field - Password field - Show/hide password
control - Remember-session option only if supported safely - Forgot
password link - Primary Sign In button - Divider labelled "OR" -
**Continue with Google** button - Create Account link - Accessible
validation, loading, and error states

## Registration screen

Include: - Full name - Email - Password - Confirm password -
Terms/privacy consent - Continue with Google - Existing-account sign-in
link - Clear validation and loading states

## Google OAuth

Implement actual Google OAuth through the configured authentication
provider, preferably existing Supabase Auth if present.

Requirements: - Correct OAuth provider setup and redirect URLs -
Callback route and secure session handling - Loading and error states -
Safe account-linking behavior - Redirect to the dashboard after
successful authentication

Do not pretend Google sign-in works before provider credentials and
redirect settings have been configured. Document the exact configuration
needed.

Google authentication is not itself wallet recovery. A Google account
must never silently gain access to a different wallet.

# 8. Wallet creation, unique addresses, and recovery phrase

Every newly created wallet must have its own unique cryptographic wallet
material and recovery phrase.

## Generation

-   Use a cryptographically secure random number generator.
-   Use a recognized BIP-39 mnemonic implementation for compatible
    wallets.
-   Support a properly generated 12-word or 24-word phrase according to
    the chosen configuration.
-   Never use a shared or hard-coded phrase.
-   Never generate predictable words or derive phrases from user
    details.
-   Ensure independent users receive independently generated wallets.
-   Generate network addresses with the correct chain-specific
    derivation and account rules.

## Recovery phrase setup flow

After wallet creation: 1. Explain what the recovery phrase does. 2.
Generate the phrase securely. 3. Display it only in a protected setup
flow. 4. Provide reveal/hide controls and a clear warning not to share
it. 5. Ask the user to confirm selected words at specified positions. 6.
Complete setup only after correct confirmation. 7. Show a
recovery-complete screen.

Never send recovery phrases through email, analytics, notifications,
support logs, or ordinary server logs.

## Key security

-   Never store plaintext mnemonic phrases or private keys in ordinary
    database columns.
-   Never expose phrases or private keys to administrators.
-   Never transmit the recovery phrase to the server.
-   Use an appropriately designed client-side wallet and encrypted local
    vault, with strong encryption and a user-controlled secret.
-   Explain browser-storage risks and recovery limitations.
-   Do not claim that encryption removes all risks.
-   Do not store raw wallet secrets in ordinary localStorage.
-   Consider a dedicated wallet library and carefully reviewed
    cryptographic implementation rather than custom cryptography.

## Wallet restore

Provide an Import/Restore Wallet screen: - User enters the recovery
phrase locally. - Validate mnemonic locally. - Derive addresses using
the correct network-specific derivation rules. - Restore supported
accounts and display derived addresses. - Never send the phrase to the
server or log it. - Do not assume Bitcoin, EVM networks, and Solana use
identical derivation paths.

A recovery phrase must genuinely restore the same wallet keys and
addresses. A phrase that is merely displayed but cannot restore the
wallet is unacceptable.

# 9. Networks and receiving addresses

All blockchain networks supported by XORVET WALLET must use MAINNET. This is a firm requirement, not a future suggestion.

Supported networks:
- Ethereum Mainnet (chain ID 1)
- BNB Smart Chain Mainnet (chain ID 56)
- Solana Mainnet-beta
- Bitcoin Mainnet

Do not use Ethereum Sepolia, BNB Chain Testnet, Solana Devnet, Bitcoin Testnet, or other test networks for the wallet's configured networks. Ensure RPC endpoints, chain IDs, explorer links, address validation, token metadata and transaction handling all correspond to the correct mainnet.

Each user must have their own cryptographic wallet addresses for Ethereum, BNB Smart Chain and Solana, using correct chain-specific derivation and secure key handling. Bitcoin uses the single project-owner-configured shared receiving address described below.

Requirements:
- Correct chain-specific address derivation and network identifiers.
- Store public address-to-user and address-to-network relationships.
- Show the correct address for the selected network.
- Generate QR codes from the exact address and selected network/asset.
- Show network compatibility warnings before transfers.
- Handle RPC errors, rate limits, retries and unavailable networks.
- Never store private keys in plaintext database fields or logs.
- Do not enable real mainnet signing or broadcasting until secure signing, explicit user confirmation, fee estimation, nonce/sequence handling, and transaction verification are correctly implemented.

## Shared Bitcoin Mainnet receiving address

BTC uses one project-owner-provided Bitcoin MAINNET receiving address for all registered users. Configure it using a protected server-side setting such as `BTC_SHARED_RECEIVE_ADDRESS`.

Requirements:
- All users see the exact same configured Bitcoin Mainnet address.
- Generate the QR code from that exact address.
- Provide a copy-address action.
- Do not generate individual Bitcoin addresses while shared-address mode is enabled.
- Do not derive, rewrite, or substitute another address.
- Validate the address as a valid Bitcoin Mainnet destination before saving.
- An authorized administrator may update the address; changes apply to all users.
- If it is not configured, show a clear setup message and never invent a replacement.
- Use the neutral heading **Bitcoin Receiving Address**.
- Do not use the phrase “This is a shared backup address.”
- Do not mislead users into believing the common address is unique to them. Explain clearly that the project uses a common receiving destination and that the sender's identity cannot be inferred from the address alone.

## Bitcoin incoming deposit monitoring and manual crediting

Implement the following required business workflow: **user sends BTC to the configured shared address → monitoring detects the transaction → administrator verifies it and assigns the intended recipient → administrator approves the credit → the recipient's internal BTC balance is updated → an email notification is sent.**

### Transaction monitoring
- Integrate a Bitcoin Mainnet node or reputable blockchain data provider to monitor the configured address.
- Detect incoming transactions and retrieve the TXID, output index (`vout`), BTC amount, receiving address, timestamp and confirmation count/status.
- Display detected transactions in a dedicated **Bitcoin Deposits Management** admin section.
- Clearly show detected, pending-confirmation and confirmed states.
- If the provider is unavailable, show a monitoring error; never fabricate transaction data.

### Manual recipient assignment and approval
- The blockchain transaction does not identify the registered XORVET user. Do not guess or automatically assign a recipient based only on amount or timing.
- Allow an authorized administrator to open a detected transaction, select the intended registered user, inspect the transaction details and approve or reject the credit.
- If the intended recipient is uncertain, leave the deposit unassigned pending review.
- Credit only after the transaction meets the configured confirmation policy and the administrator approves it.
- The credit amount must match the verified on-chain output amount. If an adjustment is needed, use a separate documented adjustment operation with a reason; never silently change the amount.

### Ledger integrity
- Maintain an internal BTC balance ledger separately from the actual blockchain address balance.
- A user's displayed BTC balance represents the amount credited to that user's XORVET account; it is not proof of an individually controlled on-chain address.
- Store TXID and output index and enforce a unique constraint so the same output cannot be credited twice.
- Make ledger credit and deposit status changes atomic and idempotent.
- Record the assigned user, approving administrator, approval timestamp, amount, transaction reference and any adjustment reason.
- Maintain an immutable or append-only audit trail for credits, rejections and corrections.

### User deposit history
Users may view only their own credited deposit records, including amount, date, TXID, status and confirmation details. Do not expose another user's deposit records.

### Deposit statuses
Use explicit statuses such as **Detected**, **Pending confirmations**, **Confirmed**, **Awaiting admin assignment**, **Awaiting approval**, **Credited**, and **Rejected**. A detected or confirmed transaction is not automatically a user credit.

### Email notification
After the database credit succeeds, send the recipient a branded transactional email containing the credited BTC amount, date/time, TXID, updated internal BTC balance and credited status. Use a server-side transactional email provider; never expose API credentials in frontend code.

- Do not send a successful-credit email before the ledger update succeeds.
- Prevent duplicate emails for the same approved deposit.
- Track delivery status where supported.
- Email failure must not reverse or duplicate a successful ledger credit; provide safe notification retry.
- Use a transactional outbox or equivalent reliable pattern so notification processing is decoupled from the atomic ledger operation.

# 10. Dashboard

Build a wallet-centric dashboard with: - Personalized greeting -
Selected network indicator - Account name and abbreviated address -
Total value only when based on available verified/configured pricing
data - Hide/show balance privacy control - Separate internal and
on-chain balance summaries - Quick actions: Send, Receive, Swap, Buy -
Token/asset list - Token quantity and price where available - Recent
activity - Network status - Empty, loading, offline, and error states

Never fabricate balances, market prices, portfolio performance, or
transaction activity. If there is no data, show a useful zero/empty
state. Clearly label any sample/demo data.

# 11. Assets and MOWI

Create an application-defined experimental asset:

-   Name: MOWI
-   Symbol: MOWI
-   Display price: **\$35.55**
-   Display rate: **15.99%**
-   Artwork: distinctive bunny/rabbit illustration
-   Price behavior: fixed
-   Rate behavior: fixed

Create an original local bunny-themed token icon using the XORVET navy,
blue, and violet identity. It must remain recognizable at small sizes
and must not depend on an unreliable remote image.

Configuration constants: - `MOWI_PRICE_USD = 35.55` -
`MOWI_DISPLAY_RATE = 15.99`

Requirements: - Never overwrite MOWI's fixed price with market API
data. - Never fluctuate its displayed rate. - Keep values consistent on
dashboard, asset details, swap, and portfolio calculations. - Other
supported tokens should use configured market data when available. - If
other token market prices are unavailable, show unavailable rather than
inventing prices. - Define the 15.99% metric clearly in the UI as a
fixed informational display metric, not guaranteed yield, earned return,
or investment promise.

Initially MOWI is an application-defined experimental asset unless a
genuine token contract is deployed and verified. Do not claim it is
independently transferable, listed, backed, or on-chain when it is not.
Clearly distinguish its internal simulated balance from verified
on-chain token holdings.

## Token detail screen and price/movement chart

When a user clicks or selects a token/asset anywhere in the dashboard or asset list, open a dedicated token detail screen (or a well-designed detail view) similar to a professional cryptocurrency wallet. This interaction is required.

Display, where reliable data is available:
- Token name, symbol, logo and selected network.
- User's token quantity and verified on-chain balance, clearly distinguished from any internal/simulated balance.
- Current token price and its quote currency.
- Total value of the user's holding, calculated from the displayed quantity and a verified price.
- Price movement chart showing historical price movement over selectable periods (for example 1D, 1W, 1M, 1Y and ALL), subject to data-provider availability.
- Percentage and absolute price change over the selected period.
- Relevant token details such as contract/mint address, decimals, network and explorer link, when applicable and verified.
- Recent transactions/activity for that asset, with status, date, amount and transaction/explorer reference where available.
- Quick actions appropriate to the asset: Send, Receive and Swap where those actions are genuinely supported.

Chart and market-data requirements:
- Use a reputable market-data provider or configured API for supported on-chain assets.
- Use real historical price points; never invent, interpolate as if observed, or fabricate chart movement.
- Clearly display a useful unavailable state when price history cannot be obtained. Do not show a fake flat chart as real market history.
- Show the data source or an appropriate “market data unavailable” indication and the last-updated time where available.
- Handle loading, empty, stale-data, rate-limit and provider-error states.
- Ensure the chart is responsive, accessible and readable on mobile.
- Keep chart prices and portfolio valuation consistent with the same configured pricing source and timestamp policy.
- For MOWI, retain the fixed application-defined display price of $35.55 and fixed display rate of 15.99%. Do not invent historical market movement for MOWI. Unless genuine historical pricing data exists for a verified deployed token, show a clearly labelled informational/static asset detail view and state that historical market chart data is unavailable.
- Do not present internal or simulated MOWI balances as verified on-chain holdings.

# 12. Send and Receive

## Receive

Include: - Network and asset selection - Correct receiving address -
Copy-address action and feedback - QR code - Network compatibility
warning - Deposit history and confirmation progress - Mainnet network and asset compatibility guidance

Do not imply that an unconfirmed deposit is available to spend. Avoid
crediting the same deposit twice.

## Send

Use a guided flow: 1. Select network and asset. 2. Enter recipient and
amount. 3. Validate address and available balance. 4. Show fee and
estimated total where real fee data is available. 5. Review recipient,
network, asset, amount, and fee. 6. Require explicit confirmation. 7.
Show the actual result and hash if a real transaction is broadcast.

Handle insufficient balance, invalid address, rejected signing, RPC
failure, pending, duplicate submission, and network mismatch.

## Outgoing transaction simulation

Configuration: `TRANSACTION_SIMULATION_MODE=true`

When enabled: - Send submissions create internal simulated transaction
records only. - Status remains `PENDING` indefinitely in transaction
history. - Clearly label them as **Simulated**. - Do not broadcast to a
blockchain. - Do not transfer or deduct actual on-chain
cryptocurrency. - Explain in details that this is an experimental
simulation and no real network settlement is taking place.

When simulation mode is disabled, real transaction status must reflect
genuine network evidence. Never force a real transaction to remain
pending if it confirms, fails, or is replaced.

# 13. Swap feature

Provide a prominent **Swap** action on the dashboard and in navigation.

Allow users to exchange any supported displayed asset pair, including: -
BTC to MOWI - MOWI to BTC - ETH to MOWI - BNB to BTC - SOL to MOWI -
Other supported pairs

The interface must include: - From-token selector - Available balance -
Amount input - Swap-direction control - To-token selector - Estimated
output - Exchange-rate information - Clearly disclosed simulation fee,
if configured - Review screen - Final confirmation - Success/error
result

## Simulated swaps

Configuration: `SWAP_SIMULATION_MODE=true`

In simulation mode: - Support all configured token pairs. - Calculate
output using the configured asset prices. - Use MOWI's fixed \$35.55
price. - Use live/configured prices for other assets only when
available. - If a required price is unavailable, do not invent a
conversion. - Use precise decimal arithmetic suitable for financial
calculations; never use binary floating-point for ledger accounting. -
Check available balance. - Debit input and credit output atomically. -
Prevent duplicate submissions with idempotency controls. - Update the
user's internal balances after success. - Create a transaction record
with both assets, quantities, rate, fee, timestamp, and status. - Mark
successful simulated swaps as **SUCCESSFUL --- SIMULATED SWAP**. -
Clearly explain that no blockchain exchange or external market execution
occurred.

A simulated swap must never broadcast a blockchain transaction or be
described as a real exchange.

For real swap mode in the future, integrate a suitable verified provider
and show actual quote, route, fees, slippage, approval, signing, and
transaction results. Do not present simulated swaps as real swaps.

# 14. Buy Bitcoin feature --- external provider redirection

Add a dedicated **Buy** option to the main wallet navigation and
dashboard quick actions.

For the initial release, the Buy page should redirect users to
legitimate third-party services where they can investigate or purchase
Bitcoin. It is not an in-app payment processor unless a genuine provider
integration is later implemented.

## Buy page layout

Include: - Heading: **Buy Bitcoin** - Short explanation that purchases
take place on an external provider's website - Professional provider
cards - Provider logo/name - Short factual description - Supported
countries/regions only when verified - Payment methods only when
verified - Provider website link - Clear **Visit Provider** action -
External-site notice before leaving XORVET WALLET

## Provider selection and legitimacy

Do not invent provider URLs or use lookalike domains.

Use a configurable, administrator-maintained allowlist of official
provider URLs. Candidate services may include established providers such
as: - Coinbase - Kraken - Binance - MoonPay - Ramp Network - Transak -
Other reputable services after verification

Before enabling a provider: - Verify its official domain and current
purchase/redirect destination. - Check whether its Bitcoin purchase
service is available in the user's region. - Do not imply that every
provider supports every country or payment method. - Prefer the
provider's official BTC buy page or official supported redirect flow. -
Use HTTPS. - Open external sites safely, preferably with appropriate
new-tab protections. - Do not collect provider passwords, card
information, or identity documents inside XORVET WALLET. - Do not claim
a purchase has completed just because the user clicked a provider
link. - Do not credit a user's wallet automatically unless a real,
verified payment/deposit integration exists.

If provider availability or destination cannot be verified, show the
provider as unavailable or omit it until configured. Do not invent
links.

## Buy flow

1.  User opens Buy.
2.  User selects an enabled provider.
3.  Show a concise external-provider notice.
4.  User confirms they want to leave XORVET WALLET.
5.  Open the verified official provider destination.
6.  On return, show the user's wallet and explain that purchases must be
    verified through actual deposit detection before being credited.

The Buy page should remain usable even if no provider has yet been
configured: show a clear "No purchase providers configured yet" state
rather than fake provider buttons.

# 15. Transactions and activity

Provide search, filters, pagination/incremental loading, and detailed
records.

Each record should distinguish: - Deposit - Withdrawal/send - Swap -
External purchase deposit, only if verified - Internal ledger
adjustment, if permitted and audited

Display: - Asset - Amount - Network - Timestamp - Status - Transaction
hash where applicable - Simulation/real indicator - Explorer link where
applicable

Do not invent transaction hashes. Do not present internal ledger
activity as on-chain activity.

Simulated sends remain pending indefinitely. Simulated swaps can be
successful. Genuine blockchain transactions must reflect actual status.

# 16. Settings and account security

Include: - Profile - Authentication settings - Password change/reset -
Two-factor authentication only if genuinely supported - Active sessions
where supported - Notification preferences - Network preferences -
Privacy controls - Help/support - Wallet recovery/import flow

Never reveal private keys or recovery phrases in the admin console or
ordinary support tools.

# 17. Administrator console

Create a protected admin area with: - User management - Account status -
Transaction monitoring - Deposit reconciliation - Network/RPC health -
Error and audit logs - Shared BTC address configuration - MOWI fixed
price and display-rate configuration, with validation and defaults -
Transaction simulation toggle - Swap simulation toggle - Buy-provider
allowlist and official destination configuration - Provider
enable/disable state - System configuration

All privileged operations must be authorized server-side. Hiding admin
controls in the UI is not authorization.

Record sensitive changes in an audit log. Do not expose wallet secrets
or recovery phrases to administrators.

# 18. Data integrity and security

Use: - Database constraints - Atomic ledger updates - Idempotency keys -
Server-side validation - Role-based access control - Rate limiting for
sensitive operations - Secure session handling - Appropriate secret
management - Audit logging - Safe error messages that do not reveal
secrets

If an internal ledger is used, maintain a consistent accounting model. A
deposit must not be credited twice. Reconcile blockchain observations
with confirmation rules. Keep simulated balances isolated from real
on-chain assets.

Never store plaintext private keys, seed phrases, OAuth secrets, or
service-role credentials in ordinary database fields, logs, analytics,
or client-side code.

# 19. Accessibility and interaction quality

Every visible interactive control must work.

Requirements: - Keyboard-accessible navigation and forms - Visible focus
states - Semantic labels and accessible names - Correct dialog focus
behavior - Confirmation before irreversible real actions - Loading
states that prevent duplicate submissions - Helpful validation - Empty
states with next actions - Retry and error recovery - Mobile-friendly
drawers and dialogs - Reduced-motion support

Use links for navigation and buttons for actions. Avoid inert
placeholder controls.

# 20. Testing and verification

Create or update tests for:

## Branding and responsive UI

-   XORVET branding appears consistently
-   No old Nextbit branding remains in user-facing screens
-   Desktop, tablet, and mobile layouts
-   No horizontal overflow at 320 px and above
-   Accessible navigation and forms

## Authentication and recovery

-   Email/password registration and sign-in
-   Google OAuth callback behavior when configured
-   Safe account linking
-   Unique recovery phrase generation
-   Phrase confirmation
-   Wallet restore
-   No phrase sent to server or logs
-   Correct network-specific address derivation

## Addresses and deposits

-   Different users have different EVM and Solana receiving addresses
-   All users see configured BTC address in shared mode
-   BTC address validation and configuration updates
-   Duplicate deposit prevention
-   Ambiguous shared BTC deposits flagged for review

## Assets and swaps

-   MOWI always displays \$35.55
-   MOWI informational rate always displays 15.99%
-   Other token pricing uses configured sources
-   BTC-to-MOWI and all configured token pairs
-   Correct decimal conversion
-   Insufficient-balance protection
-   Atomic debit/credit
-   Duplicate swap prevention
-   Simulated swaps marked successful and simulated

## Transactions and Buy

-   Simulated sends remain pending and are never broadcast
-   Real transactions reflect genuine status
-   Buy provider links use only verified allowlisted destinations
-   No purchase is marked completed from a click alone
-   External-provider return does not automatically credit a balance
    without verified deposit evidence

## Landing page and support

-   Root URL opens the public landing page.
-   Login and Get Started route to the existing authentication screens.
-   Authenticated users reach the existing dashboard after sign-in.
-   Landing page is responsive and 3D motion respects reduced-motion
    preferences and mobile performance.
-   A user can create and view only their own support conversations.
-   Admin can view and reply to support conversations in the admin
    panel.
-   Admin replies appear in the correct user's conversation.
-   Unauthorized users cannot access admin support inbox or other users'
    messages.

## Authorization and operations

-   Unauthorized users cannot access admin routes or change
    configuration
-   Secrets do not appear in client bundles or logs
-   Lint, type checking, tests, and production build

Run the actual available commands and report their results honestly.

# 21. Implementation phases

Implement in this order:

**Phase 1 --- Repository audit and plan** - Inspect current code and
report architecture. - Identify existing features and missing
requirements. - Confirm migrations and dependencies needed.

**Phase 2 --- Rebrand and design system** - Replace old brand with
XORVET WALLET. - Build original logo. - Implement dark navy,
electric-blue, violet design system. - Build responsive app shell and
navigation. - Implement dashboard layout and reusable components.

**Phase 3 --- Authentication and wallet lifecycle** - Sign-in and
registration. - Google OAuth configuration and callback. - Secure wallet
creation. - Recovery phrase confirmation and restoration.

**Phase 4 --- Networks and addresses** - Ethereum Mainnet, BNB Smart Chain Mainnet, Solana Mainnet-beta, and Bitcoin Mainnet only. - User-specific Ethereum, BNB Chain and Solana addresses. - Shared configured Bitcoin Mainnet receiving address. - Deposit monitoring, admin recipient assignment, verification, crediting and email notifications.

**Phase 5 --- Assets, MOWI, and transactions** - MOWI fixed configuration and bunny artwork. - Token lists and clickable token detail screens. - Responsive historical price/movement charts and token details using verified market data. - Receive and send flows. - Honest separation of simulated and on-chain activity.

**Phase 6 --- Swap** - Simulated swaps for all configured pairs. -
Accurate conversion calculations. - Atomic internal ledger updates. -
Successful simulated-swap records.

**Phase 7 --- Buy Bitcoin** - Buy page and provider cards. - Verified
official provider destinations. - Admin allowlist and availability
configuration. - External redirect and return messaging.

**Phase 8 --- Public landing page and customer support** - Build the
responsive public marketing landing page with top-right Login, Get
Started, and tasteful 3D motion. - Connect the landing page to the
existing authentication flow. - Add the user's Customer Support area in
Settings and the administrator Support Inbox/reply workflow. - Add
ownership, authorization, persistence, and support-message tests.

**Phase 9 --- Admin, security, and quality** - Admin settings and audit
logs. - Authorization and data integrity. - Responsive/accessibility
review. - Tests, lint, type checking, production build.

Do not stop after writing a plan or generating static mockups. Continue
with implementation in manageable steps. If credentials, provider
approvals, RPC endpoints, or other external configuration are missing,
implement the safe configuration boundary and document exactly what is
needed. Never fabricate successful integrations.

# 22. Final delivery report

At completion, provide:

1.  Summary of implemented features, including landing page and support
    messaging
2.  Important files created or modified
3.  Database migrations and schema changes
4.  Environment variables required
5.  Google OAuth setup instructions
6.  Wallet generation, key protection, and recovery design
7.  Blockchain/RPC configuration required
8.  Verified Buy-provider destinations configured and any regional
    limitations
9.  Which features are simulated versus genuinely on-chain
10. Tests and build commands actually run, with results
11. Support messaging data model, access controls, and tested user/admin
    reply flow
12. Known limitations and recommended next steps

**Final product:** XORVET WALLET\
**Design:** Original MetaMask-inspired Web3 experience\
**Palette:** Dark navy, electric blue, violet\
**Platforms:** Responsive desktop, tablet, and mobile web\
**Network configuration:** Ethereum Mainnet, BNB Smart Chain Mainnet, Solana Mainnet-beta, and Bitcoin Mainnet only. No testnet or devnet configurations. **Operating model:** Honest simulation boundaries, secure wallet recovery, admin-managed shared Bitcoin deposits, token detail charts, and external Bitcoin purchase redirects.
