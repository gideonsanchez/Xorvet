import Big from "big.js";

/** Formats a decimal string for display without converting through floating point. */
export function formatAmount(value: string | null | undefined, maxDecimals = 6): string {
  if (value === null || value === undefined || value === "") return "0";
  let b: Big;
  try {
    b = new Big(value);
  } catch {
    return "0";
  }
  if (b.eq(0)) return "0";
  const abs = b.abs();
  if (abs.lt(new Big(10).pow(-maxDecimals))) return `< ${new Big(10).pow(-maxDecimals).toFixed(maxDecimals)}`;
  const fixed = b.round(maxDecimals, Big.roundDown).toFixed(maxDecimals);
  const [int, frac = ""] = fixed.split(".");
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = frac.replace(/0+$/, "");
  return trimmed ? `${intFormatted}.${trimmed}` : intFormatted;
}

export function formatUsd(value: Big | string | null | undefined): string {
  if (value === null || value === undefined) return "Unavailable";
  const b = typeof value === "string" ? new Big(value) : value;
  const decimals = b.abs().lt(1) && !b.eq(0) ? 4 : 2;
  const fixed = b.round(decimals, Big.roundHalfUp).toFixed(decimals);
  const negative = fixed.startsWith("-");
  const [int, frac] = fixed.replace("-", "").split(".");
  return `${negative ? "-" : ""}$${int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${frac}`;
}

export function usdValue(amount: string | null | undefined, priceUsd: string | null | undefined): Big | null {
  if (!amount || !priceUsd) return null;
  try {
    return new Big(amount).times(priceUsd);
  } catch {
    return null;
  }
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function timeAgo(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return formatDateTime(iso);
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
