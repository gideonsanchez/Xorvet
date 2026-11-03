"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog as D, DropdownMenu as DM } from "radix-ui";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  History,
  House,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  ShoppingCart,
  X,
  type LucideIcon,
} from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Notice } from "@/components/ui/feedback";
import { NETWORKS, NETWORK_IDS } from "@/lib/config/networks";
import { endServerSession } from "@/lib/firebase/client";
import { apiFetch } from "@/lib/hooks/use-api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Identicon } from "./identicon";
import { useWallet } from "./wallet-context";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/send", label: "Send", icon: ArrowUpRight },
  { href: "/receive", label: "Receive", icon: ArrowDownLeft },
  { href: "/swap", label: "Swap", icon: ArrowLeftRight },
  { href: "/buy", label: "Buy", icon: ShoppingCart },
  { href: "/activity", label: "Activity", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/activity", label: "Activity", icon: History },
  { href: "/swap", label: "Swap", icon: ArrowLeftRight },
  { href: "/settings", label: "Settings", icon: Settings },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useWallet();
  const items = user.role === "admin" ? [...NAV, { href: "/admin", label: "Admin", icon: ShieldCheck }] : NAV;
  return (
    <ul className="space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-full px-4 text-[15px] transition-colors",
                active ? "bg-elevated font-semibold text-fg" : "text-muted hover:bg-elevated/60 hover:text-fg",
              )}
            >
              <Icon className={cn("size-5", active && "text-primary")} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

async function signOut(router: ReturnType<typeof useRouter>) {
  await endServerSession();
  router.replace("/");
  router.refresh();
}

function NetworkSelector() {
  const { network, setNetwork } = useWallet();
  const current = NETWORKS[network];
  return (
    <DM.Root>
      <DM.Trigger
        className="flex h-10 items-center gap-2 rounded-full border border-border bg-card pr-2.5 pl-1.5 text-sm text-fg hover:border-primary/50"
        aria-label={`Selected network: ${current.mainnetLabel}. Change network`}
      >
        <AssetIcon symbol={current.nativeAsset} className="size-7" />
        <span className="hidden sm:inline">{current.name}</span>
        <ChevronDown className="size-4 text-muted" aria-hidden />
      </DM.Trigger>
      <DM.Portal>
        <DM.Content
          align="end"
          sideOffset={8}
          className="z-50 w-64 rounded-[14px] border border-border bg-card p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          <DM.Label className="px-2.5 py-1.5 text-xs text-muted">Network (mainnet)</DM.Label>
          {NETWORK_IDS.map((id) => (
            <DM.Item
              key={id}
              onSelect={() => setNetwork(id)}
              className="flex h-11 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-sm outline-none data-[highlighted]:bg-elevated"
            >
              <AssetIcon symbol={NETWORKS[id].nativeAsset} className="size-7" />
              <span className="flex-1">{NETWORKS[id].mainnetLabel}</span>
              {id === network && <Check className="size-4 text-primary" aria-label="Selected" />}
            </DM.Item>
          ))}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

type StaffReply = { id: string; conversation_id: string; body: string; created_at: string };

function Notifications() {
  const [items, setItems] = useState<StaffReply[] | null>(null);
  const [lastSeen, setLastSeen] = useState<string>("");

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage
      setLastSeen(localStorage.getItem("xorvet:notificationsSeen") ?? "");
    } catch {}
    apiFetch<{ items: StaffReply[] }>("/api/notifications")
      .then((res) => setItems(res.items))
      .catch(() => setItems([]));
  }, []);

  const unread = (items ?? []).filter((i) => i.created_at > lastSeen).length;

  function markSeen(open: boolean) {
    if (!open || !items?.length) return;
    const latest = items[0].created_at;
    setLastSeen(latest);
    try {
      localStorage.setItem("xorvet:notificationsSeen", latest);
    } catch {}
  }

  return (
    <DM.Root onOpenChange={markSeen}>
      <DM.Trigger
        className="relative flex size-10 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-fg"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" aria-hidden />}
      </DM.Trigger>
      <DM.Portal>
        <DM.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-[14px] border border-border bg-card p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          <DM.Label className="px-2.5 py-1.5 text-xs text-muted">Support replies</DM.Label>
          {items === null ? (
            <p className="px-2.5 py-3 text-sm text-muted">Loading</p>
          ) : items.length === 0 ? (
            <p className="px-2.5 py-3 text-sm text-muted">No notifications yet.</p>
          ) : (
            items.map((item) => (
              <DM.Item key={item.id} asChild>
                <Link
                  href={`/settings/support/${item.conversation_id}`}
                  className="block rounded-[10px] px-2.5 py-2 outline-none data-[highlighted]:bg-elevated"
                >
                  <p className="line-clamp-2 text-sm text-fg">{item.body}</p>
                  <p className="mt-0.5 text-xs text-muted">{timeAgo(item.created_at)}</p>
                </Link>
              </DM.Item>
            ))
          )}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

function AccountMenu() {
  const router = useRouter();
  const { user, addresses } = useWallet();
  return (
    <DM.Root>
      <DM.Trigger className="flex size-10 items-center justify-center rounded-full ring-2 ring-border hover:ring-primary" aria-label="Account menu">
        <Identicon address={addresses.ethereum} className="size-9" />
      </DM.Trigger>
      <DM.Portal>
        <DM.Content
          align="end"
          sideOffset={8}
          className="z-50 w-64 rounded-[14px] border border-border bg-card p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-fg">{user.fullName || "Your account"}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <DM.Separator className="my-1 h-px bg-border" />
          {[
            { href: "/settings", label: "Settings", icon: Settings },
            { href: "/settings/support", label: "Help and support", icon: LifeBuoy },
          ].map(({ href, label, icon: Icon }) => (
            <DM.Item key={href} asChild>
              <Link href={href} className="flex h-10 items-center gap-2.5 rounded-[10px] px-2.5 text-sm outline-none data-[highlighted]:bg-elevated">
                <Icon className="size-4 text-muted" aria-hidden />
                {label}
              </Link>
            </DM.Item>
          ))}
          <DM.Item
            onSelect={() => void signOut(router)}
            className="flex h-10 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-sm text-danger outline-none data-[highlighted]:bg-elevated"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </DM.Item>
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useWallet();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:pl-[240px]">
      <a href="#app-main" className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-[#0d0d0f] focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] flex-col border-r border-border bg-black px-3 py-5 lg:flex">
        <Link href="/dashboard" className="mb-8 px-2" aria-label="XORVET WALLET dashboard">
          <Logo />
        </Link>
        <nav aria-label="Wallet" className="flex-1">
          <NavLinks />
        </nav>
        <Link
          href="/settings/support"
          className="flex h-11 items-center gap-3 rounded-full px-4 text-[15px] text-muted hover:bg-elevated/60 hover:text-fg"
        >
          <LifeBuoy className="size-5" aria-hidden />
          Support
        </Link>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-2 px-4 sm:px-6">
          <button
            type="button"
            className="hidden size-10 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-fg md:flex lg:hidden"
            aria-label="Open navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <Link href="/dashboard" className="lg:hidden" aria-label="XORVET WALLET dashboard">
            <span className="sm:hidden">
              <LogoMark className="size-8" />
            </span>
            <span className="hidden sm:inline">
              <Logo compact />
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <NetworkSelector />
            <Notifications />
            <AccountMenu />
          </div>
        </div>
      </header>

      {/* Tablet drawer */}
      <D.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-40 bg-black/60" />
          <D.Content className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-card px-3 py-5 focus:outline-none">
            <D.Title className="sr-only">Navigation</D.Title>
            <D.Description className="sr-only">Wallet sections</D.Description>
            <div className="mb-8 flex items-center justify-between px-2">
              <Logo compact />
              <D.Close className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-elevated" aria-label="Close navigation">
                <X className="size-5" aria-hidden />
              </D.Close>
            </div>
            <nav aria-label="Wallet">
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </nav>
          </D.Content>
        </D.Portal>
      </D.Root>

      <main id="app-main" className="mx-auto max-w-[1120px] px-4 pt-5 pb-28 sm:px-6 md:pb-12">
        {!user.emailVerified && user.provider === "password" && (
          <Notice tone="info" title="Confirm your email address" className="mb-5">
            We sent a link to {user.email}. Signing in again sends a new one if it expired.
          </Notice>
        )}
        {user.status === "suspended" && (
          <Notice tone="error" title="Account suspended" className="mb-5">
            Demo transactions are disabled. Your on-chain funds are unaffected and remain under your control. Contact
            support for help.
          </Notice>
        )}
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-4">
          {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px]", active ? "font-semibold text-fg" : "text-muted")}
                >
                  <Icon className={cn("size-[22px]", active && "text-primary")} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
