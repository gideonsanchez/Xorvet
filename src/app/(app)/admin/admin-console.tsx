"use client";

import { Tabs } from "radix-ui";
import { ShieldCheck } from "lucide-react";
import { AuditPanel, ConfigPanel, OverviewPanel, ProvidersPanel, SupportPanel, TransactionsPanel, UsersPanel } from "./panels";

const TABS = [
  { v: "overview", l: "Overview", C: OverviewPanel },
  { v: "users", l: "Users", C: UsersPanel },
  { v: "transactions", l: "Transactions", C: TransactionsPanel },
  { v: "config", l: "Configuration", C: ConfigPanel },
  { v: "providers", l: "Buy providers", C: ProvidersPanel },
  { v: "support", l: "Support inbox", C: SupportPanel },
  { v: "audit", l: "Audit log", C: AuditPanel },
];

export function AdminConsole() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <ShieldCheck className="size-7 text-primary" aria-hidden />
        <div>
          <h1 className="display text-4xl sm:text-5xl">Admin console</h1>
          <p className="text-sm text-muted">Admins never see recovery phrases, private keys or wallet passwords.</p>
        </div>
      </div>
      <Tabs.Root defaultValue="overview">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Tabs.List aria-label="Admin sections" className="inline-flex min-w-max gap-1 rounded-full border border-border bg-card p-1">
            {TABS.map((t) => (
              <Tabs.Trigger key={t.v} value={t.v} className="h-9 rounded-full px-3.5 text-sm whitespace-nowrap text-muted data-[state=active]:bg-fg data-[state=active]:text-bg data-[state=active]:font-medium">
                {t.l}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>
        {TABS.map(({ v, C }) => (
          <Tabs.Content key={v} value={v} className="mt-5">
            <C />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
}
