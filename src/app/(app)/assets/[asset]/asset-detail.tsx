"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Big from "big.js";
import { Tabs } from "radix-ui";
import { ArrowDownLeft, ArrowLeft, ArrowLeftRight, ArrowUpRight, ChartNoAxesColumn, ExternalLink, Info } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Private, TxRow, type TxRecord } from "@/components/wallet/bits";
import { ChainHistory } from "@/components/wallet/chain-history";
import { PriceChart } from "@/components/wallet/price-chart";
import { chainBalanceFor, useWallet } from "@/components/wallet/wallet-context";
import { ASSETS, type AssetSymbol } from "@/lib/config/assets";
import { NETWORKS } from "@/lib/config/networks";
import { apiFetch, useApi } from "@/lib/hooks/use-api";
import { formatAmount, formatPercent, formatUsd, timeAgo, usdValue } from "@/lib/format";
import { cn } from "@/lib/utils";

const RANGES = ["1D", "1W", "1M", "1Y", "ALL"] as const;
type Range = (typeof RANGES)[number];
type ChartResponse = { ok: true; points: [number, number][]; updatedAt: string; source: string };

function MarketChart({ symbol }: { symbol: AssetSymbol }) {
  const [range, setRange] = useState<Range>("1W");
  const { data, error, loading, reload } = useApi<ChartResponse>(`/api/market/chart?asset=${symbol}&range=${range}`);
  const points = data?.points;
  const first = points?.[0]?.[1];
  const last = points?.[points.length - 1]?.[1];
  const change = first && last ? new Big(last).minus(first) : null;
  const pct = change && first ? Number(change.div(first).times(100).toFixed(4)) : null;

  return (
    <Card>
      <CardHeader className="flex-wrap">
        <div>
          <CardTitle>Price history</CardTitle>
          {change && !loading && (
            <p className={cn("tabular mt-0.5 text-sm", change.gte(0) ? "text-success" : "text-danger")}>
              {change.gte(0) ? "+" : ""}
              {formatUsd(change)} ({formatPercent(pct)}) over {range === "ALL" ? "all available history" : range}
            </p>
          )}
        </div>
        <div role="tablist" aria-label="Chart range" className="flex rounded-full border border-border bg-elevated p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={cn("h-8 min-w-11 rounded-full px-2.5 text-sm", range === r ? "bg-fg font-medium text-bg" : "text-muted hover:text-fg")}
            >
              {r}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardBody>
        {loading && !data ? (
          <Skeleton className="h-[230px] w-full sm:h-[270px]" />
        ) : error ? (
          <ErrorState
            title={error.code === "RATE_LIMITED" ? "Market data rate limit reached" : "Price history unavailable"}
            description={`${error.message}. No chart is shown rather than an estimate.`}
            onRetry={reload}
          />
        ) : points ? (
          <div className={cn(loading && "opacity-60 transition-opacity")}>
            <PriceChart points={points} positive={change ? change.gte(0) : true} />
            <p className="mt-3 text-xs text-muted">
              Source: {data!.source}, USD. Updated {timeAgo(data!.updatedAt)}.
            </p>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

function DemoActivity({ symbol }: { symbol: AssetSymbol }) {
  const { user } = useWallet();
  const [txs, setTxs] = useState<TxRecord[] | null>(null);
  useEffect(() => {
    apiFetch<{ items: TxRecord[] }>(`/api/transactions?limit=5&asset=${symbol}`)
      .then((res) => setTxs(res.items))
      .catch(() => setTxs([]));
  }, [user.id, symbol]);
  if (txs === null) return <Skeleton className="h-16 w-full" />;
  if (txs.length === 0) return <p className="py-4 text-sm text-muted">No demo activity for {symbol} yet.</p>;
  return (
    <div className="divide-y divide-border">
      {txs.map((tx) => (
        <TxRow key={tx.id} tx={tx} />
      ))}
    </div>
  );
}

export function AssetDetail({ symbol }: { symbol: AssetSymbol }) {
  const { addresses, chain, demo, prices, priceOf, config } = useWallet();
  const asset = ASSETS[symbol];
  const network = asset.network ? NETWORKS[asset.network] : null;
  const price = priceOf(symbol);
  const isMowi = symbol === "MOWI";
  const chainEntry = asset.network ? chainBalanceFor(chain.data?.balances, asset.network) : undefined;
  const onchainQty = chainEntry?.status === "ok" ? chainEntry.confirmed : null;
  const demoQty = demo.balances?.[symbol] ?? "0";
  const change24 = prices.data?.prices[symbol]?.change24h;

  const actions = [
    { href: "/send", label: "Send", icon: ArrowUpRight, show: !isMowi },
    { href: "/receive", label: "Receive", icon: ArrowDownLeft, show: !isMowi },
    { href: "/swap", label: "Swap", icon: ArrowLeftRight, show: true },
  ].filter((a) => a.show);

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden />
        Dashboard
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <AssetIcon symbol={symbol} className="size-14" />
        <div className="min-w-0 flex-1">
          <h1 className="display text-4xl sm:text-5xl">
            {asset.name} <span className="text-muted">{symbol}</span>
          </h1>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {network ? <Badge kind="mainnet" label={network.mainnetLabel} /> : <Badge kind="demo" label="App-defined asset" />}
          </div>
        </div>
        <div className="text-right">
          <p className="tabular display text-4xl">{price ? formatUsd(price) : "Price unavailable"}</p>
          {isMowi ? (
            <p className="text-sm text-muted">Fixed display price</p>
          ) : (
            change24 !== undefined &&
            change24 !== null && (
              <p className={cn("text-sm", change24 >= 0 ? "text-success" : "text-danger")}>{formatPercent(change24)} today</p>
            )
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {actions.map(({ href, label, icon: Icon }) => (
          <Button key={href} asChild variant="secondary" className="flex-1 sm:flex-none">
            <Link href={href}>
              <Icon aria-hidden />
              {label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          {isMowi ? (
            <Card>
              <CardHeader>
                <CardTitle>About MOWI</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <EmptyState
                  icon={ChartNoAxesColumn}
                  title="No market history"
                  description="MOWI is not traded on any market, so there is no historical price data to chart."
                  className="py-6"
                />
                <dl className="divide-y divide-border rounded-[12px] border border-border text-sm">
                  <div className="flex justify-between gap-4 px-3.5 py-2.5">
                    <dt className="text-muted">Display price</dt>
                    <dd>{formatUsd(config.mowiPriceUsd)} (fixed)</dd>
                  </div>
                  <div className="flex justify-between gap-4 px-3.5 py-2.5">
                    <dt className="text-muted">Display rate</dt>
                    <dd>{config.mowiDisplayRate}% (fixed)</dd>
                  </div>
                </dl>
                <Notice tone="info" title="What these numbers mean">
                  MOWI is an experimental asset defined by this app for practice swaps. The {config.mowiDisplayRate}% rate is
                  a fixed informational display metric only. It is not a yield, interest, return or promise of any kind.
                  MOWI is not on a blockchain, is not listed or backed, and cannot be transferred or withdrawn.
                </Notice>
              </CardBody>
            </Card>
          ) : (
            <MarketChart symbol={symbol} />
          )}

          <Card>
            <Tabs.Root defaultValue={isMowi ? "demo" : "onchain"}>
              <CardHeader className="flex-wrap">
                <CardTitle>Recent activity</CardTitle>
                {!isMowi && (
                  <Tabs.List aria-label="Activity source" className="flex rounded-full border border-border bg-elevated p-1">
                    {[
                      { v: "onchain", l: "On-chain" },
                      { v: "demo", l: "Demo" },
                    ].map((t) => (
                      <Tabs.Trigger key={t.v} value={t.v} className="h-8 rounded-full px-3.5 text-sm text-muted data-[state=active]:bg-fg data-[state=active]:text-bg data-[state=active]:font-medium">
                        {t.l}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                )}
              </CardHeader>
              <CardBody className="pt-2 sm:pt-2">
                {asset.network && (
                  <Tabs.Content value="onchain">
                    <ChainHistory network={asset.network} />
                  </Tabs.Content>
                )}
                <Tabs.Content value="demo">
                  <DemoActivity symbol={symbol} />
                </Tabs.Content>
              </CardBody>
            </Tabs.Root>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Your holdings</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 pt-3 sm:pt-3">
              {!isMowi && (
                <div className="rounded-[12px] border border-border bg-elevated/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted">On-chain</p>
                    <Badge kind="onchain" />
                  </div>
                  {chain.loading && !chainEntry ? (
                    <Skeleton className="mt-2 h-6 w-32" />
                  ) : chainEntry?.status === "error" ? (
                    <p className="mt-1 text-sm text-warning">Balance unavailable right now</p>
                  ) : (
                    <>
                      <p className="tabular mt-1 text-xl font-semibold">
                        <Private>
                          {formatAmount(onchainQty, 8)} {symbol}
                        </Private>
                      </p>
                      <p className="tabular text-sm text-muted">
                        {usdValue(onchainQty, price) ? <Private>{formatUsd(usdValue(onchainQty, price))}</Private> : "Value unavailable"}
                      </p>
                      {chainEntry?.status === "ok" && chainEntry.unconfirmed && new Big(chainEntry.unconfirmed).gt(0) && (
                        <p className="mt-1 text-xs text-warning">+{formatAmount(chainEntry.unconfirmed, 8)} unconfirmed, not yet spendable</p>
                      )}
                    </>
                  )}
                </div>
              )}
              <div className="rounded-[12px] border border-border bg-elevated/50 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">Demo balance</p>
                  <Badge kind="simulated" />
                </div>
                <p className="tabular mt-1 text-xl font-semibold">
                  <Private>
                    {formatAmount(demoQty, 8)} {symbol}
                  </Private>
                </p>
                <p className="tabular text-sm text-muted">
                  {usdValue(demoQty, price) ? <Private>{formatUsd(usdValue(demoQty, price))}</Private> : "Value unavailable"}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardBody className="pt-3 sm:pt-3">
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Type</dt>
                  <dd>{isMowi ? "App-defined (not on-chain)" : "Native coin"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Network</dt>
                  <dd className="text-right">{network?.mainnetLabel ?? "None"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Decimals</dt>
                  <dd>{asset.decimals}</dd>
                </div>
                {network && asset.network && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Your address</dt>
                    <dd>
                      <a
                        href={network.explorer.address(addresses[asset.network])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {network.explorer.name}
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              {!isMowi && (
                <p className="mt-4 flex gap-2 text-xs text-muted">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  Native coins have no contract address.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
