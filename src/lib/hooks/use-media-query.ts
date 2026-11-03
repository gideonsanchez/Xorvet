"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string, serverDefault = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}

/** True when rich motion is appropriate: no reduced-motion preference and a tablet-or-larger fine pointer. */
export function useRichMotion(): boolean {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const large = useMediaQuery("(min-width: 768px) and (pointer: fine)", false);
  return !reduced && large;
}
