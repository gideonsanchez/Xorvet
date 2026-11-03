import { redirect } from "next/navigation";
import { AppShell } from "@/components/wallet/app-shell";
import { WalletProvider } from "@/components/wallet/wallet-context";
import { loadWalletSession } from "@/lib/session";

export default async function WalletLayout({ children }: LayoutProps<"/">) {
  const { user, addresses, config } = await loadWalletSession();
  if (!addresses) redirect("/wallet/setup");

  return (
    <WalletProvider user={user} addresses={addresses} config={config}>
      <AppShell>{children}</AppShell>
    </WalletProvider>
  );
}
