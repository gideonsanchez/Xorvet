import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice" updated="2 November 2026">
      <section>
        <h2>What we store</h2>
        <p>
          Your name, email address, account role and status; the public receiving addresses derived from your wallet;
          demo balances and demo transaction records; and support conversations you start.
        </p>
      </section>
      <section>
        <h2>What we never receive</h2>
        <p>
          Your recovery phrase, private keys and wallet password stay in your browser. The encrypted phrase is stored only
          in your browser&apos;s local database.
        </p>
      </section>
      <section>
        <h2>Service providers</h2>
        <p>
          Accounts are managed with Firebase Authentication and data is stored in Google Cloud Firestore. The app is hosted on Vercel. Blockchain balances are read from public network providers using your
          public addresses, and prices come from CoinGecko. Public addresses are visible on their blockchains to anyone.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You can update your name in Settings and contact support to ask for your account to be deleted.</p>
      </section>
    </LegalPage>
  );
}
