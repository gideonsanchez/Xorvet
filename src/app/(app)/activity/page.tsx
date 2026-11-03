"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs } from "radix-ui";
import { History, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { inputClass } from "@/components/ui/input";
import { TxDetails, TxRow, type TxRecord } from "@/components/wallet/bits";
import { ChainHistory } from "@/components/wallet/chain-history";
import { NetworkPicker } from "@/components/wallet/network-picker";
import { useWallet } from "@/components/wallet/wallet-context";
import { ASSET_SYMBOLS } from "@/lib/config/assets";
import { apiFetch } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

const PAGE = 20;

function AppActivity() {
  const [kind, setKind] = useState<"all" | "send" | "swap">("all");
  const [asset, setAsset] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [rows, setRows] = useState<TxRecord[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<TxRecord | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPage = useCallback(
    async (before?: string) => {
      const params = new URLSearchParams({ limit: String(PAGE) });
      if (kind !== "all") params.set("kind", kind);
      if (asset !== "all") params.set("asset", asset);
      if (before) params.set("before", before);
      const res = await apiFetch<{ items: TxRecord[]; hasMore: boolean }>(`/api/transactions?${params}`);
      return { list: res.items, more: res.hasMore };
    },
    [kind, asset],
  );

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the list when filters change
    setRows(null);
    setError(false);
    fetchPage()
      .then(({ list, more }) => {
        if (cancelled) return;
        setRows(list);
        setHasMore(more);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [fetchPage, reloadToken]);

  // Firestore has no substring search, so search filters the activity already loaded.
  const needle = debounced.toLowerCase();
  const visible = rows && needle ? rows.filter((r) => `${r.recipient ?? ""} ${r.asset} ${r.to_asset ?? ""}`.toLowerCase().includes(needle)) : rows;

  async function loadMore() {
    if (!rows?.length) return;
    setLoadingMore(true);
    try {
      const { list, more } = await fetchPage(rows[rows.length - 1].created_at);
      setRows([...rows, ...list]);
      setHasMore(more);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="activity-search" className="sr-only">
            Search activity
          </label>
          <input id="activity-search" type="search" placeholder="Search loaded activity by recipient" value={query} onChange={(e) => setQuery(e.target.value)} className={cn(inputClass, "pl-9")} />
        </div>
        <label htmlFor="activity-kind" className="sr-only">
          Type
        </label>
        <select id="activity-kind" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className={cn(inputClass, "sm:w-36")}>
          <option value="all">All types</option>
          <option value="send">Sends</option>
          <option value="swap">Swaps</option>
        </select>
        <label htmlFor="activity-asset" className="sr-only">
          Asset
        </label>
        <select id="activity-asset" value={asset} onChange={(e) => setAsset(e.target.value)} className={cn(inputClass, "sm:w-32")}>
          <option value="all">All assets</option>
          {ASSET_SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {error ? (
          <ErrorState title="Activity could not be loaded" onRetry={() => setReloadToken((t) => t + 1)} />
        ) : rows === null ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : visible!.length === 0 ? (
          <EmptyState icon={History} title="No matching activity" description="Simulated sends and swaps you make will be listed here." />
        ) : (
          <>
            <div className="divide-y divide-border">
              {visible!.map((tx) => (
                <TxRow key={tx.id} tx={tx} onSelect={setSelected} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={loadMore} loading={loadingMore}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent title="Transaction details">
            <TxDetails tx={selected} />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export default function ActivityPage() {
  const { network, setNetwork } = useWallet();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="display text-4xl sm:text-5xl">Activity</h1>
        <p className="mt-1 text-sm text-muted">App records and on-chain transactions are kept separate.</p>
      </div>
      <Tabs.Root defaultValue="app">
        <Tabs.List aria-label="Activity source" className="inline-flex rounded-full border border-border bg-card p-1">
          {[
            { v: "app", l: "Demo activity" },
            { v: "chain", l: "On-chain" },
          ].map((t) => (
            <Tabs.Trigger key={t.v} value={t.v} className="h-9 rounded-full px-4 text-sm text-muted data-[state=active]:bg-primary data-[state=active]:text-white">
              {t.l}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="app" className="mt-4">
          <Card>
            <CardBody>
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
                <Badge kind="simulated" />
                Recorded inside the app only. Simulated sends stay Pending; simulated swaps complete immediately.
              </div>
              <AppActivity />
            </CardBody>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="chain" className="mt-4">
          <Card>
            <CardBody className="space-y-5">
              <NetworkPicker value={network} onChange={setNetwork} />
              <ChainHistory key={network} network={network} />
            </CardBody>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
