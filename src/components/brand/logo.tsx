import { useId } from "react";
import { cn } from "@/lib/utils";

type LogoMarkProps = { className?: string; title?: string };

/**
 * XORVET mark: two interlocking bars forming an X.
 * One bar follows the text color (ink on light, white on dark), the other is solid electric blue.
 */
export function LogoMark({ className, title }: LogoMarkProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <mask id={`${id}-cut`}>
          <rect width="32" height="32" fill="white" />
          <polygon points="5,4 11,4 27,28 21,28" fill="black" stroke="black" strokeWidth="3" strokeLinejoin="round" />
        </mask>
      </defs>
      <polygon points="21,4 27,4 11,28 5,28" fill="#3478F6" mask={`url(#${id}-cut)`} />
      <polygon points="5,4 11,4 27,28 21,28" fill="currentColor" />
    </svg>
  );
}

type LogoProps = { className?: string; compact?: boolean };

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-fg", className)}>
      <LogoMark className={compact ? "h-7 w-7" : "h-8 w-8"} />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className={cn("font-display font-semibold tracking-[0.08em]", compact ? "text-[19px]" : "text-[21px]")}>XORVET</span>
        <span className={cn("font-display font-normal tracking-[0.14em] text-muted", compact ? "text-[13px]" : "text-sm")}>WALLET</span>
      </span>
      <span className="sr-only">XORVET WALLET</span>
    </span>
  );
}
