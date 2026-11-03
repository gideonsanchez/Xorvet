"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, ExternalLink, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/feedback";
import { isAssetSymbol, type AssetSymbol } from "@/lib/config/assets";
import { NETWORKS, isNetworkId } from "@/lib/config/networks";
import { formatAmount, formatDateTime } from "@/lib/format";
import { shortenAddress } from "@/lib/validation/address";
import { cn } from "@/lib/utils";
import { useWallet } from "./wallet-context";

/** Renders a sensitive value, or a mask when the user has hidden balances. */
export function Private({ children, className }: { children: React.ReactNode; className?: string }) {
  const { hideBalances } = useWallet();
  if (hideBalances) {
    return (
      <span className={className}>
        <span aria-hidden>******</span>
        <span className="sr-only">Hidden</span>
      </span>
    );
  }
  return <span className={className}>{children}</span>;
}

export type TxRecord = {
  id: string;
  kind: "send" | "swap" | "adjustment";
  mode: "simulated" | "onchain";
  status: "pending" | "successful" | "failed";
  network: string | null;
  asset: string;
  amount: string;
  to_asset: string | null;
  to_amount: string | null;
  rate: string | null;
  fee: string;
  fee_asset: string | null;
  recipient: string | null;
  tx_hash: string | null;
  note: string | null;
  created_at: string;
};

function txTitle(tx: TxRecord) {
  if (tx.kind === "swap") return `Swap ${tx.asset} to ${tx.to_asset}`;
  if (tx.kind === "send") return `Send ${tx.asset}`;
  return `Adjustment ${tx.asset}`;
}

const TX_ICONS = { send: ArrowUpRight, swap: ArrowLeftRight, adjustment: SlidersHorizontal };

export function TxRow({ tx, onSelect }: { tx: TxRecord; onSelect?: (tx: TxRecord) => void }) {
  const Icon = TX_ICONS[tx.kind];
  const content = (
    <>
      <span className="relative shrink-0">
        {isAssetSymbol(tx.asset) ? <AssetIcon symbol={tx.asset} className="size-10" /> : <span className="block size-10 rounded-full bg-elevated" />}
        <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-elevated text-muted">
          <Icon className="size-3" aria-hidden />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-fg">{txTitle(tx)}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge kind={tx.mode === "simulated" ? "simulated" : "onchain"} />
          <Badge kind={tx.status} />
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="tabular block text-[15px] font-medium text-fg">
          <Private>
            {tx.kind === "swap" ? `+${formatAmount(tx.to_amount, 6)} ${tx.to_asset}` : `-${formatAmount(tx.amount, 8)} ${tx.asset}`}
          </Private>
        </span>
        <span className="mt-0.5 block text-xs text-muted">{formatDateTime(tx.created_at)}</span>
      </span>
    </>
  );
  if (!onSelect) return <div className="flex items-center gap-3 py-3">{content}</div>;
  return (
    <button type="button" onClick={() => onSelect(tx)} className="flex w-full items-center gap-3 rounded-[12px] px-2 py-3 text-left hover:bg-elevated/60">
      {content}
    </button>
  );
}

export function TxDetails({ tx }: { tx: TxRecord }) {
  const network = tx.network && isNetworkId(tx.network) ? NETWORKS[tx.network] : null;
  const rows: [string, React.ReactNode][] = [
    ["Type", tx.kind === "swap" ? "Swap" : tx.kind === "send" ? "Send" : "Adjustment"],
    ["Status", <Badge key="s" kind={tx.status} />],
    ["Settlement", <Badge key="m" kind={tx.mode === "simulated" ? "simulated" : "onchain"} />],
    ["Amount", `${formatAmount(tx.amount, 18)} ${tx.asset}`],
  ];
  if (tx.kind === "swap") {
    rows.push(["Received", `${formatAmount(tx.to_amount, 18)} ${tx.to_asset}`]);
    rows.push(["Rate", `1 ${tx.asset} = ${formatAmount(tx.rate, 8)} ${tx.to_asset}`]);
    rows.push(["Fee", `${formatAmount(tx.fee, 18)} ${tx.fee_asset ?? ""}`]);
  }
  if (network) rows.push(["Network", network.mainnetLabel]);
  if (tx.recipient) rows.push(["Recipient", <span key="r" className="font-mono text-xs break-all">{tx.recipient}</span>]);
  rows.push(["Date", formatDateTime(tx.created_at)]);
  rows.push(["Reference", <span key="id" className="font-mono text-xs break-all">{tx.id}</span>]);
  rows.push([
    "Transaction hash",
    tx.tx_hash && network ? (
      <a key="h" href={network.explorer.tx(tx.tx_hash)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs break-all text-primary">
        {shortenAddress(tx.tx_hash, 8)}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    ) : (
      "None. Not broadcast to a blockchain."
    ),
  ]);

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-border rounded-[12px] border border-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 px-3.5 py-2.5 text-sm">
            <dt className="shrink-0 text-muted">{k}</dt>
            <dd className="min-w-0 text-right text-fg">{v}</dd>
          </div>
        ))}
      </dl>
      {tx.note && <p className="text-[13px] leading-relaxed text-muted">{tx.note}</p>}
    </div>
  );
}

export function QrCode({ value, label }: { value: string; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    QRCode.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#071426", light: "#ffffff" } })
      .then((s) => !cancelled && setSvg(s))
      .catch(() => !cancelled && setSvg(null));
    return () => {
      cancelled = true;
    };
  }, [value]);
  return (
    <div role="img" aria-label={label} className="mx-auto size-[200px] overflow-hidden rounded-[14px] bg-white p-2 sm:size-[220px]">
      {svg ? <div className="size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} /> : <Skeleton className="size-full" />}
    </div>
  );
}

export function QuickActions({ className }: { className?: string }) {
  const actions = [
    { href: "/send", label: "Send", icon: ArrowUpRight },
    { href: "/receive", label: "Receive", icon: ArrowDownLeft },
    { href: "/swap", label: "Swap", icon: ArrowLeftRight },
    { href: "/buy", label: "Buy", icon: ShoppingCart },
  ];
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {actions.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="group flex flex-col items-center gap-2 rounded-[14px] py-1.5">
          <span className="flex size-12 items-center justify-center rounded-full bg-fg text-bg transition-transform group-hover:scale-105 group-active:scale-95">
            <Icon className="size-[22px]" aria-hidden />
          </span>
          <span className="text-[13px] font-medium text-fg">{label}</span>
        </Link>
      ))}
    </div>
  );
}

export function assetHref(symbol: AssetSymbol) {
  return `/assets/${symbol.toLowerCase()}`;
}
