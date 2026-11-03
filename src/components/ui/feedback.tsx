import { AlertTriangle, CheckCircle2, Info, Loader2, RefreshCw, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type NoticeTone = "info" | "warning" | "error" | "success";

const noticeStyles: Record<NoticeTone, { icon: LucideIcon; className: string }> = {
  info: { icon: Info, className: "border-border bg-elevated/60 [&>svg]:text-primary" },
  warning: { icon: AlertTriangle, className: "border-warning/45 bg-warning/[0.08] [&>svg]:text-warning" },
  error: { icon: XCircle, className: "border-danger/45 bg-danger/[0.08] [&>svg]:text-danger" },
  success: { icon: CheckCircle2, className: "border-success/45 bg-success/[0.08] [&>svg]:text-success" },
};

export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: NoticeTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClass } = noticeStyles[tone];
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn("flex gap-3 rounded-[14px] border p-3.5 text-sm leading-relaxed text-fg", toneClass, className)}
    >
      <Icon className="mt-0.5 size-[18px] shrink-0" aria-hidden />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-medium text-fg">{title}</p>}
        {children && <div className="text-fg/85">{children}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[10px] bg-elevated", className)} aria-hidden />;
}

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-10 text-center", className)}>
      <span className="mb-3 flex size-12 items-center justify-center rounded-full border border-border bg-elevated text-muted">
        <Icon className="size-[22px]" aria-hidden />
      </span>
      <p className="font-medium text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-4 py-8 text-center", className)}>
      <span className="mb-3 flex size-12 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <AlertTriangle className="size-[22px]" aria-hidden />
      </span>
      <p className="font-medium text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
