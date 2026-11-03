import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="2 November 2026">
      <section>
        <h2>About this service</h2>
        <p>
          XORVET WALLET is a university project. It is provided as is, without warranties, and is not a bank, exchange or
          financial service. Nothing in the app is financial advice.
        </p>
      </section>
      <section>
        <h2>Your keys, your responsibility</h2>
        <p>
          The wallet is non-custodial. Your recovery phrase is created on your device and is never sent to us. We cannot
          see, recover or reset it. If you lose it, nobody can restore access to your funds.
        </p>
      </section>
      <section>
        <h2>Demo balances and MOWI</h2>
        <p>
          Demo balances, simulated sends and simulated swaps exist only inside the app. They have no monetary value, are
          not on any blockchain and cannot be withdrawn or exchanged for real assets. MOWI is an application-defined demo
          asset. Its displayed price and rate are fixed informational values, not market prices, yields or promises.
        </p>
      </section>
      <section>
        <h2>Third-party providers</h2>
        <p>
          The Buy page links to external providers. Any purchase is between you and that provider, under their terms.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>Do not use the service for unlawful activity or attempt to access other users&apos; data. We may suspend accounts that do.</p>
      </section>
    </LegalPage>
  );
}
