import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="theme-light min-h-dvh">
      <header className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="XORVET WALLET home">
          <Logo compact />
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden />
          Home
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-8 pb-20 sm:px-6">
        <h1 className="display text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated {updated}</p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg">{children}</div>
      </main>
    </div>
  );
}
