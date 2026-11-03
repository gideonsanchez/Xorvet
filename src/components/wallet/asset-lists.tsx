"use client";

import Link from "next/link";
import Big from "big.js";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Skeleton } from "@/components/ui/feedback";
import { ASSETS, ASSET_SYMBOLS, type AssetSymbol } from "@/lib/config/assets";
import { NETWORKS, NETWORK_IDS } from "@/lib/config/networks";
import { formatAmount, formatPercent, formatUsd, usdValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { assetHref, Private } from "./bits";
import { chainBalanceFor, useWallet } from "./wallet-context";

/** 24 hour change shown as a colored pill with a direction icon, so it never relies on color alone. */
export function ChangePill({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium tabular",
        up ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {formatPercent(value)}
      <span className="sr-only"> in 24 hours</span>
    </span>
  );
}

function Row({
  symbol,
  subtitle,
  value,
  quantity,
  loading,
}: {
  symbol: AssetSymbol;
  subtitle: React.ReactNode;
  value: React.ReactNode;
  quantity: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <li>
      <Link
        href={assetHref(symbol)}
        className="flex min-h-[68px] items-center gap-3.5 rounded-[16px] px-2.5 py-2.5 transition-colors hover:bg-elevated sm:px-3"
      >
        <AssetIcon symbol={symbol} className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-fg">{ASSETS[symbol].name}</p>
          <div className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-muted">{subtitle}</div>
        </div>
        <div className="text-right">
          {loading ? (
            <Skeleton className="ml-auto h-4 w-20" />
          ) : (
            <p className="tabular text-[15px] font-semibold text-fg">{value}</p>
          )}
          <p className="tabular mt-0.5 text-[13px] text-muted">{quantity}</p>
        </div>
      </Link>
    </li>
  );
}

export function OnChainAssetList() {
  const { chain, prices, priceOf } = useWallet();
  return (
    <ul className="space-y-1">
      {NETWORK_IDS.map((id) => {
        const symbol = NETWORKS[id].nativeAsset;
        const entry = chainBalanceFor(chain.data?.balances, id);
        const price = priceOf(symbol);
        const qty = entry?.status === "ok" ? entry.confirmed : null;
        const value = usdValue(qty, price);
        return (
          <Row
            key={id}
            symbol={symbol}
            loading={chain.loading && !entry}
            subtitle={
              <>
                <span>{price ? formatUsd(price) : prices.loading ? "Loading price" : "Price unavailable"}</span>
                <ChangePill value={prices.data?.prices[symbol]?.change24h} />
              </>
            }
            value={
              entry?.status === "error" ? (
                <span className="text-warning">Unavailable</span>
              ) : value ? (
                <Private>{formatUsd(value)}</Private>
              ) : (
                <span className="text-muted">{entry ? "No price" : ""}</span>
              )
            }
            quantity={
              entry?.status === "ok" ? (
                <Private>
                  {formatAmount(qty, 6)} {symbol}
                </Private>
              ) : (
                NETWORKS[id].name
              )
            }
          />
        );
      })}
    </ul>
  );
}

export function DemoAssetList() {
  const { demo, priceOf, config } = useWallet();
  return (
    <ul className="space-y-1">
      {ASSET_SYMBOLS.map((symbol) => {
        const qty = demo.balances?.[symbol] ?? "0";
        const price = priceOf(symbol);
        const value = usdValue(qty, price);
        return (
          <Row
            key={symbol}
            symbol={symbol}
            loading={demo.loading && !demo.balances}
            subtitle={
              symbol === "MOWI" ? (
                <>
                  <span>{formatUsd(config.mowiPriceUsd)} fixed</span>
                  <span className="rounded-full bg-violet/15 px-1.5 py-0.5 text-xs font-medium text-violet">
                    {config.mowiDisplayRate}% display rate
                  </span>
                </>
              ) : (
                <span>{price ? formatUsd(price) : "Price unavailable"}</span>
              )
            }
            value={value ? <Private>{formatUsd(value)}</Private> : <span className="text-muted">No price</span>}
            quantity={
              <Private>
                {formatAmount(qty, 6)} {symbol}
              </Private>
            }
          />
        );
      })}
    </ul>
  );
}

/**
 * USD totals and the on-chain 24 hour change, computed from real balances and CoinGecko's
 * 24 hour price change. Reports when any part was missing so the UI can say the total is partial.
 */
export function useTotals() {
  const { chain, demo, prices, priceOf } = useWallet();
  let onchain = new Big(0);
  let onchainChange = new Big(0);
  let onchainPartial = false;
  for (const id of NETWORK_IDS) {
    const symbol = NETWORKS[id].nativeAsset;
    const entry = chainBalanceFor(chain.data?.balances, id);
    const v = entry?.status === "ok" ? usdValue(entry.confirmed, priceOf(symbol)) : null;
    if (v) {
      onchain = onchain.plus(v);
      const pct = prices.data?.prices[symbol]?.change24h;
      // Value change over 24h = now - now / (1 + pct/100).
      if (pct !== null && pct !== undefined && Number.isFinite(pct) && pct > -100) {
        onchainChange = onchainChange.plus(v.minus(v.div(new Big(1).plus(new Big(pct).div(100)))));
      }
    } else if (!(entry?.status === "ok" && new Big(entry.confirmed).eq(0))) {
      onchainPartial = true;
    }
  }
  const previous = onchain.minus(onchainChange);
  const onchainChangePct = previous.gt(0) ? Number(onchainChange.div(previous).times(100).toFixed(4)) : null;

  let demoTotal = new Big(0);
  let demoPartial = false;
  for (const s of ASSET_SYMBOLS) {
    const qty = demo.balances?.[s] ?? "0";
    const v = usdValue(qty, priceOf(s));
    if (v) demoTotal = demoTotal.plus(v);
    else if (!new Big(qty).eq(0)) demoPartial = true;
  }
  return { onchain, onchainChange, onchainChangePct, onchainPartial, demoTotal, demoPartial };
}

export function RetryLink({ onClick, label = "Retry" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline">
      <RefreshCw className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}
