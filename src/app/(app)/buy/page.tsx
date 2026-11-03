"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ExternalLink, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { useWallet } from "@/components/wallet/wallet-context";
import { apiFetch } from "@/lib/hooks/use-api";

type Provider = {
  slug: string;
  name: string;
  description: string;
  url: string;
  regions: string[];
  paymentMethods: string[];
};

export default function BuyPage() {
  const { addresses } = useWallet();
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Provider | null>(null);
  const [returned, setReturned] = useState(false);

  async function load() {
    setError(false);
    try {
      const res = await apiFetch<{ providers: Provider[] }>("/api/buy-providers");
      setProviders(res.providers);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    void load();
  }, []);

  function leave() {
    if (!selected) return;
    // Only allowlisted https destinations reach this point (enforced by a database constraint).
    window.open(selected.url, "_blank", "noopener,noreferrer");
    setSelected(null);
    setReturned(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="display text-4xl sm:text-5xl">Buy Bitcoin</h1>
        <p className="mt-1 text-sm text-muted">
          Purchases happen on the provider&apos;s own website. XORVET WALLET does not process payments or collect card or
          identity details.
        </p>
      </div>

      {returned && (
        <Notice tone="info" title="Welcome back">
          A purchase only reaches your wallet when the provider sends it on-chain to your address. Clicking a provider link
          does not credit anything. Check your{" "}
          <Link href="/receive" className="font-medium text-fg underline underline-offset-2">
            Bitcoin receiving address
          </Link>{" "}
          for incoming deposits and their confirmations.
        </Notice>
      )}

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-elevated text-primary">
            <ArrowDownLeft className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Your Bitcoin Mainnet address</p>
            <p className="font-mono text-xs break-all text-muted">{addresses.bitcoin}</p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/receive">Show QR code</Link>
          </Button>
        </CardBody>
      </Card>

      {error ? (
        <Card>
          <ErrorState title="Providers could not be loaded" onRetry={load} />
        </Card>
      ) : providers === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-[16px]" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <Card>
          <EmptyState icon={Store} title="No purchase providers configured yet" description="An administrator needs to add and verify provider destinations before they appear here." />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {providers.map((p) => (
            <li key={p.slug}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-[12px] bg-elevated text-lg font-semibold text-fg" aria-hidden>
                    {p.name.charAt(0)}
                  </span>
                  <div>
                    <h2 className="font-semibold">{p.name}</h2>
                    <p className="text-xs text-muted">{new URL(p.url).hostname}</p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
                <dl className="mt-3 space-y-1 text-xs text-muted">
                  <div>
                    <dt className="inline">Regions: </dt>
                    <dd className="inline">{p.regions.length ? p.regions.join(", ") : "Varies by country. Check on the provider's site."}</dd>
                  </div>
                  {p.paymentMethods.length > 0 && (
                    <div>
                      <dt className="inline">Payment methods: </dt>
                      <dd className="inline">{p.paymentMethods.join(", ")}</dd>
                    </div>
                  )}
                </dl>
                <Button className="mt-4 w-full" onClick={() => setSelected(p)}>
                  Visit Provider
                  <ExternalLink aria-hidden />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <p className="flex items-start gap-2 text-[13px] text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        Only official provider domains approved by an administrator are listed. Always check the address bar before entering
        payment details.
      </p>

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent title={`Leave XORVET WALLET for ${selected.name}?`} description="You are about to open an external website.">
            <div className="space-y-4">
              <div className="rounded-[12px] border border-border bg-elevated/60 p-3.5 text-sm">
                <p className="text-muted">Destination</p>
                <p className="mt-0.5 font-mono text-xs break-all">{selected.url}</p>
              </div>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
                <li>{selected.name} handles payment, identity checks and any fees.</li>
                <li>Availability depends on your country and the provider&apos;s rules.</li>
                <li>If you buy, ask them to send BTC to your Bitcoin Mainnet address shown on this page.</li>
              </ul>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="secondary" className="sm:flex-1" onClick={() => setSelected(null)}>
                  Stay here
                </Button>
                <Button className="sm:flex-1" onClick={leave}>
                  Continue to {selected.name}
                  <ExternalLink aria-hidden />
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
