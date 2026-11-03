"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Wallet, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#networks", label: "Networks" },
  { href: "#security", label: "Security" },
  { href: "#learn", label: "Learn" },
];

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-200",
        scrolled || open ? "border-b border-border bg-bg/90 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="XORVET WALLET home" className="rounded-md">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-4 py-2 text-[15px] font-medium text-muted transition-colors hover:bg-elevated hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <Button asChild size="sm">
              <Link href="/dashboard">
                <Wallet aria-hidden />
                Open wallet
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-fg">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-fg md:hidden"
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="landing-mobile-menu" className="border-t border-border/70 px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center rounded-lg px-2 text-[15px] text-fg hover:bg-elevated"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          {!signedIn && (
            <Button asChild className="w-full">
              <Link href="/register">Get Started</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
