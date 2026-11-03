"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { LogoMark } from "@/components/brand/logo";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

function StaticMark() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-fg">
      <LogoMark className="size-40 sm:size-56" />
    </div>
  );
}

// Three.js is only downloaded on the client, after the page is interactive.
const HeroScene = dynamic(() => import("./hero-scene"), { ssr: false, loading: StaticMark });

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const subscribeNoop = () => () => {};

/**
 * Interactive 3D hero object. Falls back to the flat logo without WebGL, renders a single
 * still frame for reduced motion, and lowers resolution on small screens.
 */
export function Hero3D() {
  const webgl = useSyncExternalStore(subscribeNoop, hasWebGL, () => false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const small = useMediaQuery("(max-width: 767px)", false);

  return (
    <div className="absolute inset-0" role="img" aria-label="3D XORVET mark surrounded by Bitcoin, Ether, Solana and BNB coins">
      {webgl ? <HeroScene animate={!reduced} lowPower={small} /> : <StaticMark />}
    </div>
  );
}
