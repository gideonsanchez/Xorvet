import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Oswald } from "next/font/google";
import "./globals.css";

// Body and UI text.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Condensed display face for headings.
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["400", "500", "600"] });
// Addresses, hashes and derivation paths.
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "XORVET WALLET",
    template: "%s | XORVET WALLET",
  },
  description:
    "A non-custodial multi-chain wallet for Ethereum, BNB Chain, Solana and Bitcoin. You hold your own recovery phrase.",
  applicationName: "XORVET WALLET",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
