"use client";

import { useId, useMemo, useState } from "react";
import { formatDateTime, formatUsd } from "@/lib/format";

const W = 640;
const H = 220;
const PAD_Y = 12;

/** Responsive line chart of observed price points. No interpolation beyond drawing straight segments. */
export function PriceChart({ points, positive }: { points: [number, number][]; positive: boolean }) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const geo = useMemo(() => {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanY = maxY - minY || 1;
    const x = (t: number) => ((t - minX) / (maxX - minX || 1)) * W;
    const y = (v: number) => PAD_Y + (1 - (v - minY) / spanY) * (H - PAD_Y * 2);
    const line = points.map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join("");
    return { x, y, line, area: `${line}L${W},${H}L0,${H}Z`, minY, maxY };
  }, [points]);

  const color = positive ? "var(--success)" : "var(--danger)";
  const active = hover !== null ? points[hover] : null;

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))));
  }

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <figure className="relative">
      <div className="h-6 text-sm" aria-live="polite">
        {active ? (
          <span>
            <span className="tabular font-medium text-fg">{formatUsd(String(active[1]))}</span>{" "}
            <span className="text-muted">{formatDateTime(new Date(active[0]).toISOString())}</span>
          </span>
        ) : (
          <span className="text-muted">Hover or touch the chart to see a price</span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[200px] w-full touch-none sm:h-[240px]"
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        aria-hidden
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={geo.area} fill={`url(#${id}-fill)`} />
        <path d={geo.line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {active && (
          <>
            <line x1={geo.x(active[0])} x2={geo.x(active[0])} y1="0" y2={H} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={geo.x(active[0])} cy={geo.y(active[1])} r="4" fill={color} vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      <figcaption className="sr-only">
        Price moved from {formatUsd(String(first[1]))} on {formatDateTime(new Date(first[0]).toISOString())} to{" "}
        {formatUsd(String(last[1]))} on {formatDateTime(new Date(last[0]).toISOString())}. Low {formatUsd(String(geo.minY))}, high{" "}
        {formatUsd(String(geo.maxY))}.
      </figcaption>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>Low {formatUsd(String(geo.minY))}</span>
        <span>High {formatUsd(String(geo.maxY))}</span>
      </div>
    </figure>
  );
}
