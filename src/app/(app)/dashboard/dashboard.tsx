"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs } from "radix-ui";
import { Activity, ArrowRight, CircleAlert, CircleCheck, Eye, EyeOff, FlaskConical, KeyRound, ShieldCheck } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState, Notice, Skeleton } from "@/components/ui/feedback";
import { ChangePill, DemoAssetList, OnChainAssetList, RetryLink, useTotals } from "@/components/wallet/asset-lists";
import { Private, QuickActions, TxRow, type TxRecord } from "@/components/wallet/bits";
import { Identicon } from "@/components/wallet/identicon";
import { chainBalanceFor, useWallet } from "@/components/wallet/wallet-context";
import { NETWORKS, NETWORK_IDS } from "@/lib/config/networks";
import { apiFetch } from "@/lib/hooks/use-api";
import { formatUsd, timeAgo } from "@/lib/format";
import { shortenAddress } from "@/lib/validation/address";
import { cn } from "@/lib/utils";

function RecentActivity() {
  const [txs, setTxs] = useState<TxRecord[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch<{ items: TxRecord[] }>("/api/transactions?limit=6")
      .then((res) => setTxs(res.items))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="py-8 text-center text-sm text-muted">Activity could not be loaded.</p>;
  if (txs === null) {
    return (
      <div className="space-y-2 py-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (txs.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Your demo swaps and sends will appear here."
        action={
          <Button asChild size="sm">
            <Link href="/swap">Try a demo swap</Link>
          </Button>
        }
      />
    );
  }
  return (
    <>
      <div className="divide-y divide-border">
        {txs.map((tx) => (
          <TxRow key={tx.id} tx={tx} />
        ))}
      </div>
      <Link href="/activity" className="mt-3 inline-flex items-center gap-1 px-1 text-sm font-medium text-primary hover:underline">
        View all activity
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </>
  );
}

function NetworkStatus() {
  const { chain } = useWallet();
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Networks</h2>
        {chain.data && <span className="text-xs text-muted">Checked {timeAgo(chain.data.checkedAt)}</span>}
      </div>
      <ul className="mt-4 space-y-3">
        {NETWORK_IDS.map((id) => {
          const entry = chainBalanceFor(chain.data?.balances, id);
          return (
            <li key={id} className="flex items-center gap-3 text-sm">
              <AssetIcon symbol={NETWORKS[id].nativeAsset} className="size-7" />
              <span className="flex-1 truncate">{NETWORKS[id].mainnetLabel}</span>
              {!entry ? (
                <span className="text-muted">{chain.loading ? "Checking" : "No data"}</span>
              ) : entry.status === "ok" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                  <CircleCheck className="size-3.5" aria-hidden />
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                  <CircleAlert className="size-3.5" aria-hidden />
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
    </Card>
  );
}

function DemoCard() {
  const { config } = useWallet();
  const { demoTotal, demoPartial } = useTotals();
  return (
    <Card className="overflow-hidden">
      <div className="bg-accent-purple px-5 py-4 text-[#0d0d0f]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Demo balance</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0d0d0f]/15 px-2 py-0.5 text-xs font-semibold">
            <FlaskConical className="size-3.5" aria-hidden />
            Simulated
          </span>
        </div>
        <p className="tabular display mt-2 text-4xl">
          <Private>{formatUsd(demoTotal)}</Private>
        </p>
      </div>
      <div className="p-5">
        {demoPartial && <p className="mb-2 text-xs text-warning">Partial total. Some prices are unavailable.</p>}
        <p className="text-sm leading-relaxed text-muted">
          A practice balance for swaps and sends. It lives inside the app, is not on any blockchain and cannot be
          withdrawn. MOWI is valued at its fixed {formatUsd(config.mowiPriceUsd)} display price.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/swap">Practice a swap</Link>
        </Button>
      </div>
    </Card>
  );
}

const TAB_CLASS =
  "relative h-11 px-1 text-[15px] font-semibold text-muted transition-colors hover:text-fg data-[state=active]:text-fg after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:after:bg-primary";

export function Dashboard() {
  const { user, addresses, network, hideBalances, setHideBalances, chain, prices, vaultState } = useWallet();
  const { onchain, onchainChange, onchainChangePct, onchainPartial } = useTotals();
  const firstName = user.fullName.split(" ")[0];
  const address = addresses[network];
  const loadingTotal = (chain.loading && !chain.data) || (prices.loading && !prices.data);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        {vaultState === "missing" && (
          <Notice tone="warning" title="Recovery phrase not on this device">
            Balances and receiving work, but this browser does not hold your encrypted phrase.{" "}
            <Link href="/wallet/setup?mode=restore" className="font-medium text-fg underline underline-offset-2">
              Restore it here
            </Link>{" "}
            if you want to reveal or use it on this device.
          </Notice>
        )}

        {/* Account */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Identicon address={addresses.ethereum} className="size-11 ring-2 ring-border" />
            <div className="min-w-0">
              <p className="text-sm text-muted">{firstName ? `Hi ${firstName}` : "Welcome back"}</p>
              <p className="flex items-center gap-2 font-semibold">
                Account 1
                <span className="rounded-full bg-elevated px-2 py-0.5 font-mono text-xs font-normal text-muted" title={address}>
                  {shortenAddress(address, 4)}
                </span>
              </p>
            </div>
          </div>
          <CopyButton value={address} size="sm" label={`Copy ${NETWORKS[network].name} address`} copiedLabel="Address copied" />
        </div>

        {/* Balance */}
        <section aria-labelledby="balance-label">
          <div className="flex items-center gap-2">
            <p id="balance-label" className="text-sm font-medium text-muted">
              On-chain balance
            </p>
            <button
              type="button"
              onClick={() => setHideBalances(!hideBalances)}
              className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-fg"
              aria-label={hideBalances ? "Show balances" : "Hide balances"}
              aria-pressed={hideBalances}
            >
              {hideBalances ? <Eye className="size-[18px]" aria-hidden /> : <EyeOff className="size-[18px]" aria-hidden />}
            </button>
          </div>
          {loadingTotal ? (
            <Skeleton className="mt-2 h-16 w-60" />
          ) : (
            <p className="tabular display mt-1 text-6xl sm:text-7xl">
              <Private>{formatUsd(onchain)}</Private>
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {!loadingTotal && onchainChangePct !== null && (
              <>
                <span className={cn("tabular font-medium", onchainChange.gte(0) ? "text-success" : "text-danger")}>
                  <Private>
                    {onchainChange.gte(0) ? "+" : "-"}
                    {formatUsd(onchainChange.abs())}
                  </Private>
                </span>
                <ChangePill value={onchainChangePct} />
                <span className="text-muted">today</span>
              </>
            )}
            {prices.data && (
              <span className="text-xs text-muted">
                Prices from {prices.data.source}, {timeAgo(prices.data.updatedAt)}
              </span>
            )}
          </div>
          {onchainPartial && !loadingTotal && (
            <p className="mt-1 text-xs text-warning">Partial total. Some balances or prices are unavailable right now.</p>
          )}
        </section>

        <QuickActions />

        {/* Tabs */}
        <Tabs.Root defaultValue="tokens">
          <Tabs.List aria-label="Wallet" className="flex gap-6 border-b border-border">
            <Tabs.Trigger value="tokens" className={TAB_CLASS}>
              Tokens
            </Tabs.Trigger>
            <Tabs.Trigger value="demo" className={TAB_CLASS}>
              Demo
            </Tabs.Trigger>
            <Tabs.Trigger value="activity" className={TAB_CLASS}>
              Activity
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tokens" className="pt-3">
            {chain.error && (
              <Notice tone="error" className="mb-3">
                {chain.error.message} <RetryLink onClick={chain.reload} />
              </Notice>
            )}
            <OnChainAssetList />
          </Tabs.Content>
          <Tabs.Content value="demo" className="pt-3">
            <Notice tone="info" className="mb-3">
              Demo balances are simulated and separate from your on-chain funds.
            </Notice>
            <DemoAssetList />
          </Tabs.Content>
          <Tabs.Content value="activity" className="pt-3">
            <RecentActivity />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <aside className="space-y-5">
        <DemoCard />
        <NetworkStatus />
        <Card className="flex gap-3 p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-lime text-[#0d0d0f]">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div className="text-sm">
            <p className="font-semibold">Your keys stay with you</p>
            <p className="mt-1 text-muted">Your recovery phrase never leaves this device. XORVET staff will never ask for it.</p>
            <Link href="/settings" className="mt-2 inline-flex items-center gap-1 font-medium text-primary hover:underline">
              <KeyRound className="size-4" aria-hidden />
              Security settings
            </Link>
          </div>
        </Card>
      </aside>
    </div>
  );
}
