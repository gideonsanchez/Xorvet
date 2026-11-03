import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Notice } from "@/components/ui/feedback";
import { isFirebaseConfigured } from "@/lib/config/public-env";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="theme-light relative isolate flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="XORVET WALLET home">
          <Logo />
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden />
          Home
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:items-center sm:pt-0">
        <div className="w-full max-w-[420px]">
          {!isFirebaseConfigured && (
            <Notice tone="warning" title="Authentication is not configured" className="mb-4">
              Add the Firebase web config to <code className="font-mono">.env.local</code> to enable sign-in. See{" "}
              <code className="font-mono">docs/SETUP.md</code>.
            </Notice>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
