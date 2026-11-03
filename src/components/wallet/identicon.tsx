import { useMemo } from "react";
import { cn } from "@/lib/utils";

// MetaMask accent palette, so every account gets a distinct, on-brand avatar.
const PALETTE = ["#ff7940", "#b9f302", "#c66ef5", "#73a6ff", "#ffc0a5", "#fa4b00", "#e3ff89", "#8b99ff"];

/** Small deterministic PRNG (xorshift32) seeded from the address. */
function seeded(address: string) {
  let h = 2166136261;
  for (const ch of address.toLowerCase()) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let x = h >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/**
 * Mirrored 8 by 8 pixel avatar derived from a public address, in the spirit of web3 "blockies".
 * Purely visual: the same address always gives the same picture.
 */
export function Identicon({ address, className }: { address: string; className?: string }) {
  const { bg, fg, spot, cells } = useMemo(() => {
    const rand = seeded(address);
    const pick = () => PALETTE[Math.floor(rand() * PALETTE.length)];
    const bg = pick();
    let fg = pick();
    while (fg === bg) fg = pick();
    let spot = pick();
    while (spot === bg || spot === fg) spot = pick();
    const cells: { x: number; y: number; c: 1 | 2 }[] = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 4; x++) {
        const r = rand();
        const c = r < 0.45 ? 1 : r < 0.6 ? 2 : 0;
        if (c) {
          cells.push({ x, y, c });
          cells.push({ x: 7 - x, y, c });
        }
      }
    }
    return { bg, fg, spot, cells };
  }, [address]);

  return (
    <svg viewBox="0 0 8 8" className={cn("size-8 shrink-0 rounded-full", className)} aria-hidden shapeRendering="crispEdges">
      <rect width="8" height="8" fill={bg} />
      {cells.map((cell, i) => (
        <rect key={i} x={cell.x} y={cell.y} width="1" height="1" fill={cell.c === 1 ? fg : spot} />
      ))}
    </svg>
  );
}
