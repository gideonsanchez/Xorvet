import type { AssetSymbol } from "@/lib/config/assets";
import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/** Original MOWI bunny token artwork in XORVET colors. */
export function MowiIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#0E2348" />
      <ellipse cx="12.4" cy="9.6" rx="2.7" ry="6.6" transform="rotate(-12 12.4 9.6)" fill="#F5F8FF" />
      <ellipse cx="19.6" cy="9.6" rx="2.7" ry="6.6" transform="rotate(12 19.6 9.6)" fill="#F5F8FF" />
      <ellipse cx="12.4" cy="10" rx="1.2" ry="4.4" transform="rotate(-12 12.4 10)" fill="#3478F6" />
      <ellipse cx="19.6" cy="10" rx="1.2" ry="4.4" transform="rotate(12 19.6 10)" fill="#3478F6" />
      <circle cx="16" cy="19.6" r="7.4" fill="#F5F8FF" />
      <circle cx="13.3" cy="18.6" r="1.05" fill="#071426" />
      <circle cx="18.7" cy="18.6" r="1.05" fill="#071426" />
      <ellipse cx="16" cy="21.2" rx="1.15" ry="0.8" fill="#8257F5" />
      <path d="M14.6 22.6 Q16 23.7 17.4 22.6" stroke="#071426" strokeWidth="0.7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function EthIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16 5 L23 16.3 L16 20.4 L9 16.3 Z" fill="#fff" />
      <path d="M16 21.8 L23 17.7 L16 27 L9 17.7 Z" fill="#fff" fillOpacity="0.8" />
    </svg>
  );
}

function BnbIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#F0B90B" />
      <g fill="#fff">
        <rect x="13" y="13" width="6" height="6" transform="rotate(45 16 16)" />
        <rect x="14.2" y="6.2" width="3.6" height="3.6" transform="rotate(45 16 8)" />
        <rect x="14.2" y="22.2" width="3.6" height="3.6" transform="rotate(45 16 24)" />
        <rect x="6.2" y="14.2" width="3.6" height="3.6" transform="rotate(45 8 16)" />
        <rect x="22.2" y="14.2" width="3.6" height="3.6" transform="rotate(45 24 16)" />
      </g>
    </svg>
  );
}

function SolIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#0B0F1E" />
      <path d="M11 9.5 H24 L21 12.5 H8 Z" fill="#14F195" />
      <path d="M8 14.5 H21 L24 17.5 H11 Z" fill="#7F7BFF" />
      <path d="M11 19.5 H24 L21 22.5 H8 Z" fill="#9945FF" />
    </svg>
  );
}

function BtcIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <g fill="#fff">
        <rect x="13.4" y="6.5" width="1.6" height="3" rx="0.5" />
        <rect x="16.6" y="6.5" width="1.6" height="3" rx="0.5" />
        <rect x="13.4" y="22.5" width="1.6" height="3" rx="0.5" />
        <rect x="16.6" y="22.5" width="1.6" height="3" rx="0.5" />
        <path d="M11 9 H18 C20.6 9 22 10.4 22 12.4 C22 13.9 21.2 14.9 19.9 15.3 C21.6 15.7 22.6 16.9 22.6 18.6 C22.6 21 21 23 18.2 23 H11 V20.8 H12.6 V11.2 H11 Z M15.4 11.4 V14.6 H17.8 C18.9 14.6 19.4 14 19.4 13 C19.4 12 18.9 11.4 17.8 11.4 Z M15.4 16.8 V20.6 H18.2 C19.4 20.6 20 19.9 20 18.7 C20 17.5 19.4 16.8 18.2 16.8 Z" />
      </g>
    </svg>
  );
}

const ICONS: Record<AssetSymbol, (p: IconProps) => React.ReactElement> = {
  BTC: BtcIcon,
  ETH: EthIcon,
  BNB: BnbIcon,
  SOL: SolIcon,
  MOWI: MowiIcon,
};

export function AssetIcon({ symbol, className }: { symbol: AssetSymbol; className?: string }) {
  const Icon = ICONS[symbol];
  return <Icon className={cn("h-8 w-8 shrink-0", className)} />;
}
