"use client";

import Link from "next/link";
import Big from "big.js";
import { ChevronRight, RefreshCw } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/feedback";
import { ASSETS, ASSET_SYMBOLS, type AssetSymbol } from "@/lib/config/assets";
import { NETWORKS, NETWORK_IDS } from "@/lib/config/networks";
import { formatAmount, formatPercent, formatUsd, usdValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { assetHref, Private } from "./bits";
import { chainBalanceFor, useWallet } from "./wallet-context";

function Change({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return null;
  return (
    <span className={cn("text-xs", value >= 0 ? "text-success" : "text-danger")}>
      {formatPercent(value)}
      <span className="sr-only"> in 24 hours</span>
    </span>
  );
}

function RowShell({ symbol, children }: { symbol: AssetSymbol; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={assetHref(symbol)}
        className="flex min-h-16 items-center gap-3 rounded-[12px] px-2 py-2.5 transition-colors hover:bg-elevated/60 sm:px-3"
      >
        {children}
        <ChevronRight className="hidden size-4 shrink-0 text-muted sm:block" aria-hidden />
      </Link>
    </li>
  );
}

export function OnChainAssetList() {
  const { chain, prices, priceOf } = useWallet();
  return (
    <ul className="space-y-0.5">
      {NETWORK_IDS.map((id) => {
        const n = NETWORKS[id];
        const symbol = n.nativeAsset;
        const entry = chainBalanceFor(chain.data?.balances, id);
        const price = priceOf(symbol);
        const qty = entry?.status === "ok" ? entry.confirmed : null;
        const value = usdValue(qty, price);
        return (
          <RowShell key={id} symbol={symbol}>
            <AssetIcon symbol={symbol} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium">{ASSETS[symbol].name}</p>
              <p className="truncate text-xs text-muted">
                {price ? formatUsd(price) : prices.loading ? "Loading price" : "Price unavailable"}{" "}
                <Change value={prices.data?.prices[symbol]?.change24h} />
              </p>
            </div>
            <div className="text-right">
              {chain.loading && !entry ? (
                <Skeleton className="ml-auto h-4 w-20" />
              ) : entry?.status === "error" ? (
                <p className="text-sm text-warning">Unavailable</p>
              ) : (
                <p className="tabular text-[15px] font-medium">
                  <Private>
                    {formatAmount(qty, 6)} {symbol}
                  </Private>
                </p>
              )}
              <p className="tabular text-xs text-muted">
                {value ? <Private>{formatUsd(value)}</Private> : entry?.status === "ok" && !price ? "Value unavailable" : " "}
              </p>
            </div>
          </RowShell>
        );
      })}
    </ul>
  );
}

export function DemoAssetList() {
  const { demo, priceOf, config } = useWallet();
  return (
    <ul className="space-y-0.5">
      {ASSET_SYMBOLS.map((symbol) => {
        const qty = demo.balances?.[symbol] ?? "0";
        const price = priceOf(symbol);
        const value = usdValue(qty, price);
        return (
          <RowShell key={symbol} symbol={symbol}>
            <AssetIcon symbol={symbol} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-[15px] font-medium">
                {ASSETS[symbol].name}
                {symbol === "MOWI" && <Badge kind="demo" label="App-defined" className="hidden sm:inline-flex" />}
              </p>
              <p className="truncate text-xs text-muted">
                {symbol === "MOWI"
                  ? `${formatUsd(config.mowiPriceUsd)} fixed, ${config.mowiDisplayRate}% display rate`
                  : price
                    ? formatUsd(price)
                    : "Price unavailable"}
              </p>
            </div>
            <div className="text-right">
              {demo.loading && !demo.balances ? (
                <Skeleton className="ml-auto h-4 w-20" />
              ) : (
                <p className="tabular text-[15px] font-medium">
                  <Private>
                    {formatAmount(qty, 6)} {symbol}
                  </Private>
                </p>
              )}
              <p className="tabular text-xs text-muted">{value ? <Private>{formatUsd(value)}</Private> : " "}</p>
            </div>
          </RowShell>
        );
      })}
    </ul>
  );
}

/** Sums USD value; reports whether any component was missing a balance or price. */
export function useTotals() {
  const { chain, demo, priceOf } = useWallet();
  let onchain = new Big(0);
  let onchainPartial = false;
  for (const id of NETWORK_IDS) {
    const entry = chainBalanceFor(chain.data?.balances, id);
    const v = entry?.status === "ok" ? usdValue(entry.confirmed, priceOf(NETWORKS[id].nativeAsset)) : null;
    if (v) onchain = onchain.plus(v);
    else if (!(entry?.status === "ok" && new Big(entry.confirmed).eq(0))) onchainPartial = true;
  }
  let demoTotal = new Big(0);
  let demoPartial = false;
  for (const s of ASSET_SYMBOLS) {
    const qty = demo.balances?.[s] ?? "0";
    const v = usdValue(qty, priceOf(s));
    if (v) demoTotal = demoTotal.plus(v);
    else if (!new Big(qty).eq(0)) demoPartial = true;
  }
  return { onchain, onchainPartial, demoTotal, demoPartial };
}

export function RetryLink({ onClick, label = "Retry" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline">
      <RefreshCw className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}
