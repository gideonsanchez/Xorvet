import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { loadWalletSession } from "@/lib/session";
import { WalletSetup } from "./wallet-setup";

export const metadata: Metadata = { title: "Set up your wallet" };

export default async function WalletSetupPage({ searchParams }: PageProps<"/wallet/setup">) {
  const { user, addresses } = await loadWalletSession();
  const params = await searchParams;
  const mode = params.mode === "restore" ? "restore" : params.mode === "create" ? "create" : "choose";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-4 sm:px-6">
        <Logo compact />
        {addresses && (
          <Link href="/dashboard" className="text-sm text-muted hover:text-fg">
            Back to wallet
          </Link>
        )}
      </header>
      <main className="flex flex-1 justify-center px-4 pt-4 pb-16">
        <div className="w-full max-w-[560px]">
          <WalletSetup userId={user.id} initialMode={mode} hasLinkedWallet={Boolean(addresses)} />
        </div>
      </main>
    </div>
  );
}
