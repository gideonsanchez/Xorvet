"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, Inbox, Plus } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, inputClass } from "@/components/ui/input";
import { SupportThread, type SupportConversation } from "@/components/support/support-thread";
import { TxDetails, TxRow, type TxRecord } from "@/components/wallet/bits";
import { useWallet } from "@/components/wallet/wallet-context";
import type { AppConfig } from "@/lib/app-config";
import { NETWORKS, type NetworkId } from "@/lib/config/networks";
import { apiFetch, useApi, type ApiError } from "@/lib/hooks/use-api";
import { formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function Loading() {
  return (
    <div className="space-y-2 p-5">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

type Health = {
  networks: { network: NetworkId; ok: boolean; latencyMs: number; detail: string }[];
  market: { ok: boolean; detail: string };
  checkedAt: string;
};

export function OverviewPanel() {
  const health = useApi<Health>("/api/admin/health");
  const counts = useApi<{ users: number; txs: number; open: number }>("/api/admin/stats");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Users", value: counts.data?.users },
          { label: "Demo transactions", value: counts.data?.txs },
          { label: "Open support conversations", value: counts.data?.open },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-muted">{s.label}</p>
            {s.value === undefined ? (
              counts.error ? <p className="mt-2 text-sm text-danger">Unavailable</p> : <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="tabular display mt-1 text-4xl">{s.value}</p>
            )}
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Network and provider health</CardTitle>
          <Button size="sm" variant="secondary" onClick={health.reload} loading={health.loading}>
            Check again
          </Button>
        </CardHeader>
        <CardBody>
          {health.error ? (
            <ErrorState description={health.error.message} onRetry={health.reload} />
          ) : !health.data ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <ul className="divide-y divide-border">
              {health.data.networks.map((n) => (
                <li key={n.network} className="flex items-center gap-3 py-3 text-sm">
                  <AssetIcon symbol={NETWORKS[n.network].nativeAsset} className="size-7" />
                  <span className="flex-1">{NETWORKS[n.network].mainnetLabel}</span>
                  <span className="hidden text-muted sm:inline">{n.detail}</span>
                  <span className="tabular w-16 text-right text-muted">{n.latencyMs} ms</span>
                  {n.ok ? <CircleCheck className="size-5 text-success" aria-label="Online" /> : <CircleAlert className="size-5 text-danger" aria-label="Unavailable" />}
                </li>
              ))}
              <li className="flex items-center gap-3 py-3 text-sm">
                <span className="flex-1">Market data (CoinGecko)</span>
                <span className="text-muted">{health.data.market.detail}</span>
                {health.data.market.ok ? <CircleCheck className="size-5 text-success" aria-label="Online" /> : <CircleAlert className="size-5 text-danger" aria-label="Unavailable" />}
              </li>
            </ul>
          )}
          {health.data && <p className="mt-2 text-xs text-muted">Checked {timeAgo(health.data.checkedAt)}</p>}
        </CardBody>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

type ProfileRow = { id: string; email: string; fullName: string; role: string; status: "active" | "suspended"; createdAt: string | null };

export function UsersPanel() {
  const { user } = useWallet();
  const { data, error, reload } = useApi<{ users: ProfileRow[] }>("/api/admin/users");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function toggle(p: ProfileRow) {
    setBusy(p.id);
    try {
      await apiFetch(`/api/admin/users/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: p.status === "active" ? "suspended" : "active" }),
      });
      setMessage(null);
    } catch (e) {
      setMessage((e as ApiError).message);
    }
    setBusy(null);
    void reload();
  }

  return (
    <Card>
      {message && (
        <Notice tone="error" className="m-4">
          {message}
        </Notice>
      )}
      {error ? (
        <ErrorState description={error.message} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.users.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium">{p.fullName || "No name"}</p>
                    <p className="text-xs text-muted">{p.email}</p>
                  </td>
                  <td className="px-3 py-3 capitalize">{p.role}</td>
                  <td className="px-3 py-3">
                    <span className={cn("inline-flex items-center gap-1", p.status === "active" ? "text-success" : "text-danger")}>
                      {p.status === "active" ? <CircleCheck className="size-4" aria-hidden /> : <CircleAlert className="size-4" aria-hidden />}
                      {p.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted">{p.createdAt ? formatDateTime(p.createdAt) : "Unknown"}</td>
                  <td className="px-5 py-3 text-right">
                    {p.id !== user.id && (
                      <Button size="sm" variant={p.status === "active" ? "danger" : "secondary"} loading={busy === p.id} onClick={() => toggle(p)}>
                        {p.status === "active" ? "Suspend" : "Reactivate"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------

export function TransactionsPanel() {
  const { data, error, reload } = useApi<{ items: TxRecord[] }>("/api/admin/transactions");
  const [selected, setSelected] = useState<TxRecord | null>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest 100 demo transactions</CardTitle>
        <Badge kind="simulated" />
      </CardHeader>
      <CardBody className="pt-2 sm:pt-2">
        {error ? (
          <ErrorState description={error.message} onRetry={reload} />
        ) : !data ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <EmptyState icon={Inbox} title="No transactions yet" />
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((tx) => (
              <TxRow key={tx.id} tx={tx} onSelect={setSelected} />
            ))}
          </div>
        )}
      </CardBody>
      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent title="Transaction details">
            <TxDetails tx={selected} />
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------

const CONFIG_LABELS: Record<keyof AppConfig, { label: string; hint: string }> = {
  mowiPriceUsd: { label: "MOWI display price (USD)", hint: "Default 35.55. Used for every MOWI valuation and swap." },
  mowiDisplayRate: { label: "MOWI display rate (%)", hint: "Default 15.99. Informational only, never a yield." },
  swapFeePercent: { label: "Simulation swap fee (%)", hint: "0 to 10. Shown to users before they confirm." },
  transactionSimulationMode: {
    label: "Transaction simulation mode",
    hint: "When on, sends are recorded as simulated and never broadcast. Real sending is not built, so turning this off disables sending.",
  },
  swapSimulationMode: { label: "Swap simulation mode", hint: "When off, swaps are disabled. Real swaps are not built." },
};

export function ConfigPanel() {
  const { data, error, reload } = useApi<{ config: AppConfig }>("/api/admin/config");
  const [draft, setDraft] = useState<Partial<Record<keyof AppConfig, string>>>({});
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function save(key: keyof AppConfig, value: string | boolean) {
    setSaving(key);
    try {
      await apiFetch("/api/admin/config", { method: "PATCH", body: JSON.stringify({ [key]: typeof value === "string" ? value.trim() : value }) });
      setStatus({ tone: "success", text: "Saved. The change is recorded in the audit log." });
      setDraft((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      void reload();
    } catch (e) {
      setStatus({ tone: "error", text: (e as ApiError).message });
    } finally {
      setSaving(null);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        {status && <Notice tone={status.tone}>{status.text}</Notice>}
        {error ? (
          <ErrorState description={error.message} onRetry={reload} />
        ) : !data ? (
          <Loading />
        ) : (
          (Object.keys(CONFIG_LABELS) as (keyof AppConfig)[]).map((key) => {
            const value = data.config[key];
            const meta = CONFIG_LABELS[key];
            if (typeof value === "boolean") {
              return (
                <div key={key} className="flex items-start justify-between gap-4 border-b border-border pb-5 last:border-0">
                  <div>
                    <p className="font-medium">{meta.label}</p>
                    <p className="mt-0.5 text-sm text-muted">{meta.hint}</p>
                  </div>
                  <Button size="sm" variant={value ? "primary" : "secondary"} loading={saving === key} onClick={() => save(key, !value)} aria-pressed={value}>
                    {value ? "On" : "Off"}
                  </Button>
                </div>
              );
            }
            const current = draft[key] ?? value;
            return (
              <form
                key={key}
                onSubmit={(e) => {
                  e.preventDefault();
                  void save(key, current);
                }}
                className="flex flex-col gap-2 border-b border-border pb-5 last:border-0 sm:flex-row sm:items-end"
              >
                <Field label={meta.label} hint={meta.hint} className="flex-1">
                  {({ id, describedBy }) => (
                    <Input id={id} inputMode="decimal" value={current} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} aria-describedby={describedBy} />
                  )}
                </Field>
                <Button type="submit" variant="secondary" loading={saving === key} disabled={current === value} className="sm:mb-6">
                  Save
                </Button>
              </form>
            );
          })
        )}
      </CardBody>
    </Card>
  );
}

// ---------------------------------------------------------------------------

type ProviderRow = { slug: string; name: string; description: string; url: string; enabled: boolean; verifiedAt: string | null; sortOrder: number };
type ProviderDraft = { slug?: string; name: string; description: string; url: string; sortOrder: number };

export function ProvidersPanel() {
  const { data, error, reload } = useApi<{ providers: ProviderRow[] }>("/api/admin/providers");
  const [editing, setEditing] = useState<ProviderDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function act(slug: string, action: "enable" | "disable" | "verify") {
    try {
      await apiFetch(`/api/admin/providers/${slug}`, { method: "PATCH", body: JSON.stringify({ action }) });
      setActionError(null);
    } catch (e) {
      setActionError((e as ApiError).message);
    }
    void reload();
  }

  async function saveProvider(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const fields = { name: editing.name.trim(), description: editing.description.trim(), url: editing.url.trim(), sortOrder: editing.sortOrder };
    try {
      if (editing.slug) {
        await apiFetch(`/api/admin/providers/${editing.slug}`, { method: "PATCH", body: JSON.stringify({ action: "edit", fields }) });
      } else {
        await apiFetch("/api/admin/providers", { method: "POST", body: JSON.stringify(fields) });
      }
      setEditing(null);
      void reload();
    } catch (err) {
      setFormError((err as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Notice tone="info">
        Only add a provider after opening its URL yourself and confirming it is the official domain. Saving a new or edited
        provider disables it until you verify it again.
      </Notice>
      {actionError && <Notice tone="error">{actionError}</Notice>}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setFormError(null);
            setEditing({ name: "", description: "", url: "https://", sortOrder: 100 });
          }}
        >
          <Plus aria-hidden />
          Add provider
        </Button>
      </div>
      <Card>
        {error ? (
          <ErrorState description={error.message} onRetry={reload} />
        ) : !data ? (
          <Loading />
        ) : data.providers.length === 0 ? (
          <EmptyState icon={Inbox} title="No providers" description="Run the seed script or add one here." />
        ) : (
          <ul className="divide-y divide-border">
            {data.providers.map((p) => (
              <li key={p.slug} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {p.name}{" "}
                    <span className={cn("ml-1 text-xs", p.enabled ? "text-success" : "text-muted")}>{p.enabled ? "Enabled" : "Disabled"}</span>
                  </p>
                  <p className="font-mono text-xs break-all text-muted">{p.url}</p>
                  <p className="mt-0.5 text-xs text-muted">{p.verifiedAt ? `Verified ${formatDateTime(p.verifiedAt)}` : "Not verified"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFormError(null);
                      setEditing({ slug: p.slug, name: p.name, description: p.description, url: p.url, sortOrder: p.sortOrder });
                    }}
                  >
                    Edit
                  </Button>
                  {p.verifiedAt ? (
                    <Button size="sm" variant={p.enabled ? "danger" : "secondary"} onClick={() => act(p.slug, p.enabled ? "disable" : "enable")}>
                      {p.enabled ? "Disable" : "Enable"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => act(p.slug, "verify")}>
                      Mark verified and enable
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <DialogContent title={editing.slug ? "Edit provider" : "Add provider"}>
            <form onSubmit={saveProvider} className="space-y-4">
              <Field label="Name">{({ id }) => <Input id={id} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />}</Field>
              <Field label="Official URL" hint="The provider's own HTTPS page for buying BTC.">
                {({ id, describedBy }) => <Input id={id} type="url" value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} aria-describedby={describedBy} />}
              </Field>
              <Field label="Short description">
                {({ id }) => (
                  <textarea id={id} rows={3} maxLength={280} className={cn(inputClass, "h-auto py-2.5")} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                )}
              </Field>
              {formError && <Notice tone="error">{formError}</Notice>}
              <Button type="submit" className="w-full" loading={saving}>
                Save (disabled until verified)
              </Button>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------

type InboxRow = SupportConversation & { user_email: string; user_name: string };

export function SupportPanel() {
  const { data, error, reload } = useApi<{ conversations: InboxRow[] }>("/api/admin/support");
  const [open, setOpen] = useState<InboxRow | null>(null);

  async function setStatus(c: InboxRow, status: "open" | "closed") {
    await apiFetch(`/api/support/conversations/${c.id}`, { method: "PATCH", body: JSON.stringify({ status }) }).catch(() => undefined);
    setOpen({ ...c, status });
    void reload();
  }

  return (
    <Card>
      {error ? (
        <ErrorState description={error.message} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : data.conversations.length === 0 ? (
        <EmptyState icon={Inbox} title="Inbox is empty" />
      ) : (
        <ul className="divide-y divide-border">
          {data.conversations.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setOpen(c)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-elevated/50">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.subject}</p>
                  <p className="truncate text-xs text-muted">
                    {c.user_name || c.user_email || "Unknown user"}, {timeAgo(c.last_message_at)}
                  </p>
                </div>
                <span className={cn("text-xs", c.status === "open" ? "text-warning" : "text-muted")}>{c.status === "open" ? "Open" : "Closed"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent title={open.subject} description={open.user_email} className="sm:max-w-xl">
            <div className="mb-4 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setStatus(open, open.status === "open" ? "closed" : "open")}>
                {open.status === "open" ? "Close conversation" : "Reopen"}
              </Button>
            </div>
            <SupportThread key={open.id + open.status} conversation={open} asStaff />
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------

type AuditRow = { id: string; actor_id: string | null; action: string; entity: string; entity_id: string | null; details: unknown; created_at: string };

export function AuditPanel() {
  const { data, error, reload } = useApi<{ entries: AuditRow[] }>("/api/admin/audit");
  return (
    <Card>
      {error ? (
        <ErrorState description={error.message} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : data.entries.length === 0 ? (
        <EmptyState icon={Inbox} title="No audit entries yet" />
      ) : (
        <ul className="divide-y divide-border">
          {data.entries.map((r) => (
            <li key={r.id} className="px-5 py-3 text-sm">
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium">
                    {r.action} {r.entity}
                  </span>
                  <span className="font-mono text-xs text-muted">{r.entity_id}</span>
                  <span className="ml-auto text-xs text-muted">{r.created_at ? formatDateTime(r.created_at) : ""}</span>
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-[10px] bg-elevated p-3 text-xs text-muted">{JSON.stringify(r.details, null, 2)}</pre>
                <p className="mt-1 text-xs text-muted">Actor: {r.actor_id ?? "system"}</p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
