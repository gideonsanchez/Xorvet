import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Logo } from "@/components/brand/logo";
import { Hero3D } from "@/components/landing/hero-3d";
import { LandingNav } from "@/components/landing/landing-nav";
import { Reveal, RevealObserver } from "@/components/landing/reveal";
import { SwapPreview } from "@/components/landing/swap-preview";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/server/session";
import { NETWORKS, NETWORK_IDS, type NetworkId } from "@/lib/config/networks";
import { cn } from "@/lib/utils";

const TILE: Record<NetworkId, string> = {
  ethereum: "bg-tile-ice",
  bsc: "bg-tile-sand",
  solana: "bg-tile-lilac",
  bitcoin: "bg-tile-mint",
};

const STEPS = [
  { title: "Create your account", body: "Sign up with email or Google. This only protects access to the app." },
  { title: "Write down your phrase", body: "Twelve or twenty-four words, generated on your device. Paper, not screenshots." },
  { title: "Receive on any network", body: "Share your address or QR code. Balances are read straight from each blockchain." },
];

const SECURITY = [
  { icon: KeyRound, t: "Generated on your device", b: "Your phrase comes from your browser's secure random generator and is never sent to our servers." },
  { icon: LockKeyhole, t: "Encrypted with your password", b: "Stored locally with AES-256-GCM, using a key derived from a wallet password only you know." },
  { icon: ShieldCheck, t: "Permissions enforced server-side", b: "Every request is checked on the server, and the database refuses direct browser access. Admins cannot see phrases or keys." },
  { icon: EyeOff, t: "Honest labels", b: "On-chain, Demo and Simulated are always marked, so practice is never mistaken for real funds." },
];

const FAQ = [
  {
    q: "What is a crypto wallet?",
    a: "A wallet does not hold coins itself. It holds the keys that prove you control addresses on a blockchain. Anyone with those keys can move the funds.",
  },
  {
    q: "What is a recovery phrase?",
    a: "A list of 12 or 24 words that recreates your keys in any compatible wallet. Keep it offline and never share it. XORVET staff will never ask for it.",
  },
  {
    q: "Why do networks matter?",
    a: "Each blockchain is a separate network. Sending a coin on the wrong network can lose it, so the wallet always shows which network you are using.",
  },
  {
    q: "What does Simulated mean?",
    a: "Simulated activity happens only on a demo balance inside the app. It is never broadcast to a blockchain and never moves real funds.",
  },
];

function NetworkStrip() {
  const items = [...NETWORK_IDS, ...NETWORK_IDS];
  return (
    <div className="relative overflow-hidden border-y border-border bg-card py-5" aria-hidden>
      <div className="animate-marquee flex w-max gap-14 pr-14">
        {[...items, ...items].map((id, i) => (
          <span key={i} className="flex items-center gap-3 whitespace-nowrap">
            <AssetIcon symbol={NETWORKS[id].nativeAsset} className="size-8" />
            <span className="font-display text-2xl tracking-tight text-fg uppercase">{NETWORKS[id].mainnetLabel}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function LandingPage() {
  const user = await getUser();
  const signedIn = Boolean(user);
  const primaryHref = signedIn ? "/dashboard" : "/register";
  const primaryLabel = signedIn ? "Open your wallet" : "Get Started";

  return (
    <div className="theme-light relative isolate flex min-h-dvh flex-col overflow-x-clip">
      <a href="#main" className="sr-only z-50 rounded-full bg-fg px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <LandingNav signedIn={signedIn} />
      <RevealObserver />

      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-[1280px] items-center gap-8 px-4 pt-8 pb-14 sm:px-6 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-20">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-muted">
              <ShieldCheck className="size-4 text-fg" aria-hidden />
              Self-custody wallet for four mainnets
            </p>
            <h1
              className="display animate-fade-up mt-6 text-[58px] text-fg sm:text-[84px] lg:text-[104px] xl:text-[116px]"
              style={{ "--delay": "0.06s" } as React.CSSProperties}
            >
              Your keys.
              <br />
              Your coins.
              <br />
              <span className="text-muted">No middleman.</span>
            </h1>
            <p
              className="animate-fade-up mt-6 max-w-[520px] text-lg leading-relaxed text-muted sm:text-xl"
              style={{ "--delay": "0.12s" } as React.CSSProperties}
            >
              XORVET WALLET keeps Ethereum, BNB Chain, Solana and Bitcoin in one place. Your recovery phrase is created on
              your device, and every balance tells you exactly where it comes from.
            </p>
            <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={{ "--delay": "0.18s" } as React.CSSProperties}>
              <Button asChild size="lg">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              {!signedIn && (
                <Button asChild size="lg" variant="secondary">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="animate-fade-up relative aspect-square w-full overflow-hidden rounded-[32px] bg-tile-ice sm:aspect-[5/4] lg:aspect-square" style={{ "--delay": "0.1s" } as React.CSSProperties}>
            <Hero3D />
            <p className="pointer-events-none absolute bottom-4 left-5 hidden text-xs font-medium text-fg/50 md:block">Move your cursor</p>
          </div>
        </section>

        <NetworkStrip />

        {/* Networks */}
        <section id="networks" className="mx-auto max-w-[1280px] scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
          <Reveal className="max-w-3xl">
            <h2 className="display text-5xl text-fg sm:text-7xl">Four mainnets. One recovery phrase.</h2>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Each network uses its own standard derivation path, so your phrase restores the same addresses in other
              compatible wallets.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NETWORK_IDS.map((id, i) => {
              const n = NETWORKS[id];
              return (
                <Reveal key={id} delay={i * 0.06}>
                  <div className={cn("flex h-full min-h-[280px] flex-col rounded-[28px] p-6", TILE[id])}>
                    <AssetIcon symbol={n.nativeAsset} className="size-14" />
                    <div className="mt-auto pt-10">
                      <h3 className="display text-4xl text-fg">{n.name}</h3>
                      <p className="mt-2 text-sm font-medium text-fg/70">{n.mainnetLabel}</p>
                      <p className="mt-4 font-mono text-xs text-fg/60">{n.derivationPath}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal>
            <div className="mt-4 flex flex-col gap-4 rounded-[28px] border border-border bg-card p-6 sm:flex-row sm:items-center">
              <AssetIcon symbol="MOWI" className="size-14" />
              <div>
                <h3 className="display text-3xl text-fg">MOWI, the demo asset</h3>
                <p className="mt-1 max-w-3xl text-muted">
                  MOWI is defined by this app for practice swaps. It is not a blockchain token, is not listed anywhere and
                  cannot be bought or withdrawn.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Self-custody, with photo */}
        <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 pb-20 sm:px-6 sm:pb-28 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <figure className="relative overflow-hidden rounded-[32px]">
              <Image
                src="/images/writing-notebook.jpg"
                alt="A person writing in a notebook at a desk"
                width={3200}
                height={1910}
                quality={85}
                // The landscape photo is cropped into a taller frame, so request enough width to cover the crop.
                sizes="(min-width: 1024px) 1260px, (min-width: 640px) 126vw, 210vw"
                className="aspect-[4/5] w-full object-cover object-[62%_50%] sm:aspect-[4/3] lg:aspect-[4/5]"
              />
              <figcaption className="absolute right-4 bottom-3 text-[11px] text-white/80">Photo: Unsplash</figcaption>
            </figure>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="display text-5xl text-fg sm:text-7xl">Self-custody, in three steps.</h2>
              <p className="mt-5 text-lg text-muted">The most important tool for your wallet is a pen.</p>
            </Reveal>
            <ol className="mt-10 space-y-8">
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08}>
                  <li className="flex gap-6 border-t border-border pt-6">
                    <span className="display w-12 shrink-0 text-5xl text-fg/25">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-fg">{s.title}</h3>
                      <p className="mt-1.5 text-muted">{s.body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Demo swaps: dark section */}
        <section className="bg-[#071426] text-white">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
            <Reveal>
              <p className="text-sm font-medium tracking-wide text-[#9aaec9] uppercase">Practice mode</p>
              <h2 className="display mt-4 text-5xl sm:text-7xl">Learn to swap before it is real.</h2>
              <p className="mt-5 max-w-lg text-lg text-[#c3d0e2]">
                Every account gets a separate demo balance for trying swaps and sends. It runs inside the app only, is
                always labelled Simulated, and never touches your on-chain funds.
              </p>
              <ul className="mt-8 space-y-3 text-[#c3d0e2]">
                {["Real market prices for BTC, ETH, BNB and SOL", "MOWI at its fixed $35.55 display price", "Full history of every simulated trade"].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="size-1.5 shrink-0 rounded-full bg-white" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <SwapPreview />
            </Reveal>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="mx-auto max-w-[1280px] scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <Reveal>
              <h2 className="display text-5xl text-fg sm:text-7xl">Security, without the slogans.</h2>
              <p className="mt-5 text-lg text-muted">No wallet can promise perfect safety. Here is what this one does, and what stays your responsibility.</p>
              <div className="mt-8 flex items-start gap-3 rounded-[20px] border border-warning/45 bg-warning/[0.08] p-5 text-fg">
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
                <p>If you lose your recovery phrase and your browser data, nobody can restore your wallet. Not even us.</p>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {SECURITY.map((item, i) => (
                <Reveal key={item.t} delay={(i % 2) * 0.06}>
                  <div className="flex h-full flex-col rounded-[24px] border border-border bg-card p-6">
                    <span className="flex size-12 items-center justify-center rounded-full bg-fg text-bg">
                      <item.icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-8 text-lg font-semibold text-fg">{item.t}</h3>
                    <p className="mt-1.5 text-muted">{item.b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Learn */}
        <section id="learn" className="scroll-mt-20 border-t border-border bg-card">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <Reveal>
              <h2 className="display text-5xl text-fg sm:text-7xl">New to crypto?</h2>
              <p className="mt-5 text-lg text-muted">The basics, in plain language.</p>
            </Reveal>
            <div className="divide-y divide-border border-y border-border">
              {FAQ.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium text-fg [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="pb-6 leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-8 rounded-[32px] bg-[#0b0f17] px-6 py-14 text-white sm:px-12 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="display max-w-3xl text-6xl sm:text-8xl">Create your wallet in minutes.</h2>
              <Link
                href={primaryHref}
                className="inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-white px-8 text-base font-medium text-[#0b0f17] transition-opacity hover:opacity-85"
              >
                {primaryLabel}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-muted">A non-custodial wallet built as a university project. Nothing on this site is financial advice.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm sm:grid-cols-3">
            <a href="#networks" className="text-muted hover:text-fg">Networks</a>
            <a href="#security" className="text-muted hover:text-fg">Security</a>
            <a href="#learn" className="text-muted hover:text-fg">Learn</a>
            <Link href="/login" className="text-muted hover:text-fg">Login</Link>
            <Link href="/register" className="text-muted hover:text-fg">Get Started</Link>
            <Link href="/terms" className="text-muted hover:text-fg">Terms</Link>
            <Link href="/privacy" className="text-muted hover:text-fg">Privacy</Link>
          </nav>
        </div>
        <div className="mx-auto max-w-[1280px] border-t border-border px-4 py-6 text-xs text-muted sm:px-6">
          &copy; {new Date().getFullYear()} XORVET WALLET
        </div>
      </footer>
    </div>
  );
}
