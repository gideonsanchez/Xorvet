import { ArrowDownUp, FlaskConical } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import type { AssetSymbol } from "@/lib/config/assets";

function Row({ label, symbol, amount, muted }: { label: string; symbol: AssetSymbol; amount: string; muted?: boolean }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs text-[#9aaec9]">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={`tabular font-display text-4xl font-medium ${muted ? "text-white/30" : "text-white"}`}>{amount}</span>
        <span className="flex items-center gap-2 rounded-full border border-white/15 py-1 pr-3 pl-1 text-sm font-medium text-white">
          <AssetIcon symbol={symbol} className="size-7" />
          {symbol}
        </span>
      </div>
    </div>
  );
}

/** Static illustration of the demo swap screen. Amounts are an example, not live data. */
export function SwapPreview() {
  return (
    <div className="mx-auto w-full max-w-[400px] rounded-[28px] border border-white/10 bg-[#0d1b31] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]" aria-hidden>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-2xl text-white">Swap</span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#f5b94c]/50 px-2 py-0.5 text-xs text-[#f5b94c]">
          <FlaskConical className="size-3.5" />
          Simulated
        </span>
      </div>
      <Row label="You pay" symbol="SOL" amount="2.5" />
      <div className="relative z-10 -my-3 flex justify-center">
        <span className="flex size-10 items-center justify-center rounded-full border-4 border-[#0d1b31] bg-[#13233d] text-white">
          <ArrowDownUp className="size-4" />
        </span>
      </div>
      <Row label="You receive (estimate)" symbol="MOWI" amount="0.00" muted />
      <div className="mt-4 space-y-1.5 px-1 text-sm">
        <div className="flex justify-between text-[#9aaec9]">
          <span>MOWI price</span>
          <span className="text-white">$35.55 fixed</span>
        </div>
        <div className="flex justify-between text-[#9aaec9]">
          <span>SOL price</span>
          <span className="text-white">Live market data</span>
        </div>
      </div>
      <div className="mt-5 flex h-12 items-center justify-center rounded-full bg-white font-medium text-[#071426]">Review swap</div>
    </div>
  );
}
