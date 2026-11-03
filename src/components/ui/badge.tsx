import { CheckCircle2, Clock, FlaskConical, Globe, Link2, Database, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeKind = "mainnet" | "onchain" | "simulated" | "demo" | "pending" | "successful" | "failed" | "internal";

const BADGES: Record<BadgeKind, { label: string; icon: LucideIcon; className: string }> = {
  mainnet: { label: "Mainnet", icon: Globe, className: "border-border text-fg" },
  onchain: { label: "On-chain", icon: Link2, className: "border-success/45 text-success" },
  simulated: { label: "Simulated", icon: FlaskConical, className: "border-warning/45 text-warning" },
  demo: { label: "Demo", icon: FlaskConical, className: "border-violet/50 text-violet" },
  internal: { label: "Internal balance", icon: Database, className: "border-violet/50 text-violet" },
  pending: { label: "Pending", icon: Clock, className: "border-warning/45 text-warning" },
  successful: { label: "Successful", icon: CheckCircle2, className: "border-success/45 text-success" },
  failed: { label: "Failed", icon: XCircle, className: "border-danger/45 text-danger" },
};

export function Badge({ kind, label, className }: { kind: BadgeKind; label?: string; className?: string }) {
  const { label: defaultLabel, icon: Icon, className: tone } = BADGES[kind];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label ?? defaultLabel}
    </span>
  );
}
