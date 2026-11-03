"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs } from "radix-ui";
import { Activity, ArrowRight, CircleCheck, CircleAlert, Eye, EyeOff, KeyRound } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState, Notice, Skeleton } from "@/components/ui/feedback";
import { DemoAssetList, OnChainAssetList, RetryLink, useTotals } from "@/components/wallet/asset-lists";
import { Private, QuickActions, TxRow, type TxRecord } from "@/components/wallet/bits";
import { chainBalanceFor, useWallet } from "@/components/wallet/wallet-context";
import { NETWORKS, NETWORK_IDS } from "@/lib/config/networks";
import { formatUsd, timeAgo } from "@/lib/format";
import { apiFetch } from "@/lib/hooks/use-api";
import { shortenAddress } from "@/lib/validation/address";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function RecentActivity() {
  const { user } = useWallet();
  const [txs, setTxs] = useState<TxRecord[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch<{ items: TxRecord[] }>("/api/transactions?limit=5")
      .then((res) => setTxs(res.items))
      .catch(() => setError(true));
  }, [user.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <Link href="/activity" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View all
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </CardHeader>
      <CardBody className="pt-2 sm:pt-2">
        {error ? (
          <p className="py-6 text-center text-sm text-muted">Activity could not be loaded.</p>
        ) : txs === null ? (
          <div className="space-y-3 py-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : txs.length === 0 ? (
          <EmptyState icon={Activity} title="No activity yet" description="Your demo swaps and sends will appear here." action={<Button asChild size="sm" variant="secondary"><Link href="/swap">Try a demo swap</Link></Button>} />
        ) : (
          <div className="divide-y divide-border">
            {txs.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function NetworkStatus() {
  const { chain } = useWallet();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Network status</CardTitle>
        {chain.data && <span className="text-xs text-muted">Checked {timeAgo(chain.data.checkedAt)}</span>}
      </CardHeader>
      <CardBody className="pt-3 sm:pt-3">
        <ul className="space-y-2.5">
          {NETWORK_IDS.map((id) => {
            const entry = chainBalanceFor(chain.data?.balances, id);
            return (
              <li key={id} className="flex items-center gap-3 text-sm">
                <AssetIcon symbol={NETWORKS[id].nativeAsset} className="size-6" />
                <span className="flex-1 truncate">{NETWORKS[id].mainnetLabel}</span>
                {!entry ? (
                  <span className="text-muted">{chain.loading ? "Checking" : "No data"}</span>
                ) : entry.status === "ok" ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <CircleCheck className="size-4" aria-hidden />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-warning">
                    <CircleAlert className="size-4" aria-hidden />
                    {entry.rateLimited ? "Rate limited" : "Unavailable"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {chain.error && (
          <div className="mt-3">
            <RetryLink onClick={chain.reload} />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function Dashboard() {
  const { user, addresses, network, hideBalances, setHideBalances, chain, prices, vaultState, config } = useWallet();
  const { onchain, onchainPartial, demoTotal, demoPartial } = useTotals();
  const firstName = user.fullName.split(" ")[0];
  const address = addresses[network];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="display text-4xl sm:text-5xl">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">Here is your wallet across four mainnets.</p>
        </div>
      </div>

      {vaultState === "missing" && (
        <Notice tone="warning" title="Recovery phrase not on this device">
          Balances and receiving work, but this browser does not hold your encrypted phrase.{" "}
          <Link href="/wallet/setup?mode=restore" className="font-medium text-fg underline underline-offset-2">
            Restore it here
          </Link>{" "}
          if you want to reveal or use it on this device.
        </Notice>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AssetIcon symbol={NETWORKS[network].nativeAsset} className="size-10" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Account 1</p>
                  <p className="font-mono text-xs text-muted" title={address}>
                    {shortenAddress(address, 5)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge kind="mainnet" label={NETWORKS[network].mainnetLabel} className="hidden sm:inline-flex" />
                <CopyButton value={address} size="sm" label="Copy address" />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted">On-chain balance</p>
                <Badge kind="onchain" />
                <button
                  type="button"
                  onClick={() => setHideBalances(!hideBalances)}
                  className="ml-auto flex size-10 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-fg"
                  aria-label={hideBalances ? "Show balances" : "Hide balances"}
                  aria-pressed={hideBalances}
                >
                  {hideBalances ? <Eye className="size-5" aria-hidden /> : <EyeOff className="size-5" aria-hidden />}
                </button>
              </div>
              {(chain.loading && !chain.data) || (prices.loading && !prices.data) ? (
                <Skeleton className="mt-2 h-11 w-48" />
              ) : (
                <p className="tabular display mt-2 text-5xl sm:text-6xl">
                  <Private>{formatUsd(onchain)}</Private>
                </p>
              )}
              {onchainPartial && !chain.loading && !prices.loading && (
                <p className="mt-1 text-xs text-warning">
                  Partial total. Some balances or prices are unavailable right now.
                </p>
              )}
              {prices.data && (
                <p className="mt-1 text-xs text-muted">
                  Prices from {prices.data.source}, updated {timeAgo(prices.data.updatedAt)}
                </p>
              )}
            </div>

            <QuickActions className="mt-6" />
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Demo balance</CardTitle>
            <Badge kind="simulated" />
          </CardHeader>
          <CardBody className="flex flex-1 flex-col pt-3 sm:pt-3">
            <p className="tabular display text-4xl">
              <Private>{formatUsd(demoTotal)}</Private>
            </p>
            {demoPartial && <p className="mt-1 text-xs text-warning">Partial total. Some prices are unavailable.</p>}
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A practice balance for trying swaps and sends. It is stored inside the app, is not on any blockchain and
              cannot be withdrawn. MOWI is valued at its fixed {formatUsd(config.mowiPriceUsd)} display price.
            </p>
            <div className="mt-auto pt-4">
              <Button asChild variant="secondary" size="sm">
                <Link href="/swap">Practice a swap</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <Tabs.Root defaultValue="onchain">
            <CardHeader className="flex-wrap">
              <CardTitle>Assets</CardTitle>
              <Tabs.List aria-label="Asset balances" className="flex rounded-full border border-border bg-elevated p-1">
                {[
                  { v: "onchain", l: "On-chain" },
                  { v: "demo", l: "Demo" },
                ].map((t) => (
                  <Tabs.Trigger
                    key={t.v}
                    value={t.v}
                    className="h-8 rounded-full px-3.5 text-sm text-muted data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    {t.l}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </CardHeader>
            <CardBody className="pt-3 sm:pt-3">
              <Tabs.Content value="onchain">
                {chain.error && (
                  <Notice tone="error" className="mb-3">
                    {chain.error.message} <RetryLink onClick={chain.reload} />
                  </Notice>
                )}
                <OnChainAssetList />
              </Tabs.Content>
              <Tabs.Content value="demo">
                <Notice tone="info" className="mb-3">
                  Demo balances are simulated and separate from your on-chain funds.
                </Notice>
                <DemoAssetList />
              </Tabs.Content>
            </CardBody>
          </Tabs.Root>
        </Card>

        <div className="space-y-5">
          <RecentActivity />
          <NetworkStatus />
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <KeyRound className="size-3.5" aria-hidden />
        Your phrase never leaves this device. XORVET staff will never ask for it.
      </p>
    </div>
  );
}
