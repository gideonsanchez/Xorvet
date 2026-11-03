"use client";

import { ArrowDownLeft, ArrowUpRight, ExternalLink, History, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { NETWORKS, type NetworkId } from "@/lib/config/networks";
import { useApi } from "@/lib/hooks/use-api";
import { formatAmount, formatDateTime } from "@/lib/format";
import { shortenAddress } from "@/lib/validation/address";
import { Private } from "./bits";
import type { ChainTx } from "@/lib/chains";

type HistoryResponse = { network: NetworkId; address: string; transactions: ChainTx[] };

/** Recent on-chain transactions for the user's own address, straight from the network provider. */
export function ChainHistory({ network, filter }: { network: NetworkId; filter?: "in" }) {
  const n = NETWORKS[network];
  const { data, error, loading, reload } = useApi<HistoryResponse>(`/api/chain/history?network=${network}`);

  if (loading && !data) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    if (error.code === "NOT_CONFIGURED") {
      return (
        <p className="py-4 text-sm text-muted">
          On-chain history for {n.name} needs a block explorer API key on the server. You can view your address on{" "}
          {n.explorer.name} instead.
        </p>
      );
    }
    return <ErrorState title="History unavailable" description={error.message} onRetry={reload} />;
  }
  const txs = (data?.transactions ?? []).filter((t) => !filter || t.direction === "in" || t.direction === "unknown");
  if (txs.length === 0) {
    return <EmptyState icon={History} title="No transactions found" description={`Nothing on ${n.mainnetLabel} for this address yet.`} />;
  }

  return (
    <ul className="divide-y divide-border">
      {txs.map((tx) => {
        const Icon = tx.direction === "in" ? ArrowDownLeft : tx.direction === "out" ? ArrowUpRight : Repeat;
        const label = tx.direction === "in" ? "Received" : tx.direction === "out" ? "Sent" : tx.direction === "self" ? "Self transfer" : "Transaction";
        return (
          <li key={tx.hash} className="flex items-center gap-3 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-elevated text-muted">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium">{label}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge kind="onchain" />
                {tx.status === "pending" ? (
                  <Badge kind="pending" label={tx.confirmations === 0 ? "Unconfirmed" : "Pending"} />
                ) : tx.status === "failed" ? (
                  <Badge kind="failed" />
                ) : (
                  <Badge kind="successful" label={tx.confirmations ? `${tx.confirmations > 99 ? "99+" : tx.confirmations} confirmations` : "Confirmed"} />
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              {tx.amount !== null && (
                <p className="tabular text-sm font-medium">
                  <Private>
                    {tx.direction === "out" ? "-" : tx.direction === "in" ? "+" : ""}
                    {formatAmount(tx.amount, 8)} {n.nativeAsset}
                  </Private>
                </p>
              )}
              <p className="text-xs text-muted">{tx.timestamp ? formatDateTime(tx.timestamp) : "Awaiting block"}</p>
              <a
                href={n.explorer.tx(tx.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                aria-label={`View transaction ${shortenAddress(tx.hash, 6)} on ${n.explorer.name}`}
              >
                {shortenAddress(tx.hash, 6)}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
