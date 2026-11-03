"use client";

import { ExternalLink, TriangleAlert } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Notice } from "@/components/ui/feedback";
import { QrCode } from "@/components/wallet/bits";
import { ChainHistory } from "@/components/wallet/chain-history";
import { NetworkPicker } from "@/components/wallet/network-picker";
import { useWallet } from "@/components/wallet/wallet-context";
import { NETWORKS } from "@/lib/config/networks";

const CONFIRMATION_NOTE: Record<string, string> = {
  bitcoin: "Bitcoin deposits usually need 1 to 6 block confirmations (about 10 to 60 minutes) before they are considered final.",
  ethereum: "Ethereum transfers are usually confirmed within a minute.",
  bsc: "BNB Smart Chain transfers are usually confirmed within seconds.",
  solana: "Solana transfers are usually confirmed within seconds.",
};

export default function ReceivePage() {
  const { addresses, network, setNetwork } = useWallet();
  const n = NETWORKS[network];
  const address = addresses[network];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="display text-4xl sm:text-5xl">Receive</h1>
        <p className="mt-1 text-sm text-muted">Share your address to receive funds on a mainnet.</p>
      </div>

      <Card>
        <CardBody className="space-y-6">
          <NetworkPicker value={network} onChange={setNetwork} />

          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <AssetIcon symbol={n.nativeAsset} className="size-7" />
              <p className="font-medium">
                {n.nativeAsset} on {n.mainnetLabel}
              </p>
            </div>
            <QrCode value={address} label={`QR code for your ${n.mainnetLabel} address`} />
            <p className="mx-auto mt-4 max-w-sm font-mono text-sm break-all text-fg">{address}</p>
            <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
              <CopyButton value={address} label="Copy address" />
              <a
                href={n.explorer.address(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] px-4 text-[15px] text-muted hover:bg-elevated hover:text-fg"
              >
                View on {n.explorer.name}
                <ExternalLink className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          <Notice tone="warning" title={`Only send ${network === "bsc" ? "BNB Smart Chain (BEP-20)" : n.nativeAsset} assets on ${n.mainnetLabel}`}>
            Sending from another network, or sending an asset this wallet does not support, can result in permanent loss.
            {network === "ethereum" || network === "bsc"
              ? " This address is the same on Ethereum and BNB Smart Chain. Check which network the sender is using."
              : ""}{" "}
            Only native {n.nativeAsset} balances are shown in this wallet.
          </Notice>

          <p className="flex gap-2 text-[13px] text-muted">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {CONFIRMATION_NOTE[network]} Unconfirmed deposits are not final and should not be treated as spendable.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent deposits</CardTitle>
          <Badge kind="onchain" />
        </CardHeader>
        <CardBody className="pt-2 sm:pt-2">
          <ChainHistory key={network} network={network} filter="in" />
        </CardBody>
      </Card>
    </div>
  );
}
