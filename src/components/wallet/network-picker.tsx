"use client";

import { AssetIcon } from "@/components/brand/asset-icon";
import { NETWORKS, NETWORK_IDS, type NetworkId } from "@/lib/config/networks";
import { cn } from "@/lib/utils";

/** Segmented network choice used on Receive and Send. */
export function NetworkPicker({ value, onChange, label = "Network" }: { value: NetworkId; onChange: (n: NetworkId) => void; label?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {NETWORK_IDS.map((id) => {
          const active = id === value;
          return (
            <label
              key={id}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-2 rounded-[12px] border px-3 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
                active ? "border-primary bg-primary/15 text-fg" : "border-border bg-elevated text-muted hover:text-fg",
              )}
            >
              <input type="radio" name={label} value={id} checked={active} onChange={() => onChange(id)} className="sr-only" />
              <AssetIcon symbol={NETWORKS[id].nativeAsset} className="size-6" />
              <span className="leading-tight">{NETWORKS[id].name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
