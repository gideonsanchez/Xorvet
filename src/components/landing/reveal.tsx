"use client";

import { useEffect } from "react";

/**
 * Scroll reveal that never hides content by default.
 * Server HTML is fully visible; once mounted, RevealObserver marks on-screen blocks as
 * revealed immediately and fades in the rest as they scroll into view.
 * The CSS lives in globals.css and is disabled for reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div data-reveal className={className} style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}>
      {children}
    </div>
  );
}

export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const pending: HTMLElement[] = [];
    for (const el of items) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.dataset.revealed = "";
      else pending.push(el);
    }
    if (typeof IntersectionObserver === "undefined") {
      pending.forEach((el) => (el.dataset.revealed = ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "";
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    pending.forEach((el) => io.observe(el));
    root.classList.add("reveal-ready");
    return () => {
      io.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
  return null;
}
