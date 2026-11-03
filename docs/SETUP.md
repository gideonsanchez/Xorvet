# Setup

Stack: Next.js on **Vercel**, **Firebase Authentication** for sign-in, **Cloud Firestore** for data. All Firestore access goes through the app's server routes; the security rules deny every direct browser request.

## 1. Firebase project

1. console.firebase.google.com > Add project.
2. **Authentication > Sign-in method**: enable **Email/Password** and **Google**.
3. **Authentication > Settings > Authorized domains**: add `localhost` (usually present), your domain, and your Vercel domain (`your-project.vercel.app`).
4. **Firestore Database > Create database**: production mode, pick a region near your users.
5. **Project settings > General > Your apps > Add app > Web**. Copy `apiKey`, `authDomain`, `projectId`, `appId` into the `NEXT_PUBLIC_FIREBASE_*` variables.
6. **Project settings > Service accounts > Generate new private key**. From the downloaded JSON copy `project_id`, `client_email` and `private_key` into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`. Then delete the JSON file. Never commit it or paste it into chat.

## 2. Local run

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Fill `.env.local` from step 1.

## 3. Deploy Firestore rules and indexes

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore
```

This publishes `firestore.rules` (deny all client access) and `firestore.indexes.json`. Indexes take a few minutes to build.

## 4. Seed data and your admin account

```bash
pnpm seed
```

Then register in the app, sign in once, and run:

```bash
pnpm make-admin you@example.com
```

## 5. GitHub and Vercel

1. Push the repository to GitHub.
2. vercel.com > Add New > Project > import the repository. Framework: Next.js (detected).
3. Settings > Environment Variables: add every variable from `.env.local`, with `NEXT_PUBLIC_SITE_URL` set to `https://your-domain`. For `FIREBASE_PRIVATE_KEY`, paste the key including the `\n` sequences.
4. Deploy.

## 6. Your domain

1. Vercel > Project > Settings > Domains > add `your-domain` and `www.your-domain`.
2. At your registrar, add the DNS records Vercel shows (an `A` record for the root, a `CNAME` for `www`). SSL is issued automatically.
3. Add the domain to Firebase **Authorized domains** (step 1.3) so sign-in works there.

## 7. Optional keys

- `COINGECKO_API_KEY`: free demo key avoids strict public rate limits on prices and charts.
- `ETHERSCAN_API_KEY`: enables Ethereum and BNB Chain transaction history.
- Keyed RPC URLs for production traffic.

## 8. Checks

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```
