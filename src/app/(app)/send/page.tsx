"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Big from "big.js";
import { ArrowLeft, Clock, FlaskConical, Send } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/input";
import { Private, TxDetails, type TxRecord } from "@/components/wallet/bits";
import { NetworkPicker } from "@/components/wallet/network-picker";
import { chainBalanceFor, useWallet } from "@/components/wallet/wallet-context";
import { ASSETS } from "@/lib/config/assets";
import { NETWORKS } from "@/lib/config/networks";
import { apiFetch, type ApiError } from "@/lib/hooks/use-api";
import { formatAmount, formatUsd, newIdempotencyKey, usdValue } from "@/lib/format";
import { isValidAddress } from "@/lib/validation/address";
import { hasValidDecimals } from "@/lib/validation/ledger";

type Step = "form" | "review" | "result";

export default function SendPage() {
  const { network, setNetwork, addresses, demo, chain, priceOf, config, user } = useWallet();
  const n = NETWORKS[network];
  const asset = n.nativeAsset;
  const [step, setStep] = useState<Step>("form");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<TxRecord | null>(null);
  // One key per reviewed send, so a double click or retry never records twice.
  const idempotencyKey = useRef<string>("");

  const demoBalance = demo.balances?.[asset] ?? "0";
  const chainEntry = chainBalanceFor(chain.data?.balances, network);
  const simulation = config.transactionSimulationMode;

  function changeNetwork(id: typeof network) {
    setNetwork(id);
    setErrors({});
    setRecipient("");
    setAmount("");
  }

  function review(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    const to = recipient.trim();
    if (!to) errs.recipient = "Enter a recipient address";
    else if (!isValidAddress(network, to)) errs.recipient = `This is not a valid ${n.mainnetLabel} address`;
    else if (to === addresses[network]) errs.recipient = "This is your own address";

    const a = amount.trim();
    if (!/^\d+(\.\d+)?$/.test(a) || new Big(a).lte(0)) errs.amount = "Enter an amount greater than zero";
    else if (!hasValidDecimals(a, asset)) errs.amount = `${asset} supports up to ${ASSETS[asset].decimals} decimal places`;
    else if (new Big(a).gt(demoBalance)) errs.amount = "Amount is more than your demo balance";

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      idempotencyKey.current = newIdempotencyKey();
      setSubmitError(null);
      setStep("review");
    }
  }

  async function confirm() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiFetch<{ transaction: TxRecord }>("/api/demo/send", {
        method: "POST",
        body: JSON.stringify({ network, amount: amount.trim(), recipient: recipient.trim(), idempotencyKey: idempotencyKey.current }),
      });
      setResult(res.transaction);
      setStep("result");
    } catch (e) {
      setSubmitError((e as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep("form");
    setRecipient("");
    setAmount("");
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="display text-4xl sm:text-5xl">Send</h1>
        <p className="mt-1 text-sm text-muted">
          {simulation ? "Simulation mode is on. Sends are recorded on your demo balance only." : "Send funds on a mainnet."}
        </p>
      </div>

      {!simulation && (
        <Notice tone="error" title="Real sending is not available">
          On-chain sending has not been enabled in this build. You can move on-chain funds by importing your recovery phrase
          into another compatible wallet.
        </Notice>
      )}

      {simulation && step !== "result" && (
        <Notice tone="warning" title="Simulated send">
          Nothing is broadcast to {n.mainnetLabel} and no real funds move. Simulated sends stay Pending in your activity.
          To move on-chain funds, import your recovery phrase into another compatible wallet.
        </Notice>
      )}

      {step === "form" && (
        <Card>
          <CardBody>
            <form onSubmit={review} noValidate className="space-y-5">
              <NetworkPicker value={network} onChange={changeNetwork} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] border border-border bg-elevated/50 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted">Demo balance</p>
                    <Badge kind="simulated" />
                  </div>
                  <p className="tabular mt-1 font-medium">
                    <Private>
                      {formatAmount(demoBalance, 8)} {asset}
                    </Private>
                  </p>
                </div>
                <div className="rounded-[12px] border border-border bg-elevated/50 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted">On-chain balance</p>
                    <Badge kind="onchain" />
                  </div>
                  <p className="tabular mt-1 font-medium">
                    {chainEntry?.status === "ok" ? (
                      <Private>
                        {formatAmount(chainEntry.confirmed, 8)} {asset}
                      </Private>
                    ) : (
                      <span className="text-muted">Unavailable</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Not used by simulated sends</p>
                </div>
              </div>

              <Field label="Recipient address" error={errors.recipient}>
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={network === "bitcoin" ? "bc1..." : network === "solana" ? "Solana address" : "0x..."}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="font-mono text-sm"
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                  />
                )}
              </Field>

              <Field
                label={`Amount (${asset})`}
                error={errors.amount}
                labelAside={
                  <button type="button" className="text-[13px] text-primary hover:underline" onClick={() => setAmount(new Big(demoBalance).toFixed())}>
                    Use max
                  </button>
                }
                hint={(() => {
                  const v = /^\d+(\.\d+)?$/.test(amount) ? usdValue(amount, priceOf(asset)) : null;
                  return v ? `About ${formatUsd(v)}` : undefined;
                })()}
              >
                {({ id, describedBy, invalid }) => (
                  <Input id={id} inputMode="decimal" autoComplete="off" value={amount} onChange={(e) => setAmount(e.target.value.replace(",", "."))} placeholder="0.00" className="tabular" aria-describedby={describedBy} aria-invalid={invalid} />
                )}
              </Field>

              <Button type="submit" size="lg" className="w-full" disabled={!simulation || user.status !== "active"}>
                Review
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {step === "review" && (
        <Card>
          <CardBody className="space-y-5">
            <button type="button" onClick={() => setStep("form")} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
              <ArrowLeft className="size-4" aria-hidden />
              Edit
            </button>
            <div className="text-center">
              <AssetIcon symbol={asset} className="mx-auto size-12" />
              <p className="tabular mt-3 text-3xl font-semibold">
                {formatAmount(amount, 18)} {asset}
              </p>
              <div className="mt-2 flex justify-center">
                <Badge kind="simulated" />
              </div>
            </div>
            <dl className="divide-y divide-border rounded-[12px] border border-border text-sm">
              {[
                ["From", "Demo balance"],
                ["To", <span key="to" className="font-mono text-xs break-all">{recipient.trim()}</span>],
                ["Network", n.mainnetLabel],
                ["Network fee", "None. Simulated sends are not broadcast."],
                ["Total", `${formatAmount(amount, 18)} ${asset}`],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex items-start justify-between gap-4 px-3.5 py-2.5">
                  <dt className="shrink-0 text-muted">{k}</dt>
                  <dd className="min-w-0 text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <Notice tone="warning">
              This records a simulated send that stays Pending. It will not arrive at the recipient.
            </Notice>
            {submitError && <Notice tone="error">{submitError}</Notice>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="secondary" className="sm:flex-1" onClick={() => setStep("form")} disabled={submitting}>
                Cancel
              </Button>
              <Button className="sm:flex-1" onClick={confirm} loading={submitting}>
                <Send aria-hidden />
                Confirm simulated send
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {step === "result" && result && (
        <Card>
          <CardBody className="space-y-5">
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-warning/15 text-warning">
                <Clock className="size-7" aria-hidden />
              </span>
              <h2 className="mt-4 text-xl font-semibold">Simulated send recorded</h2>
              <p className="mt-1 text-sm text-muted">Status: Pending. This is an experimental simulation and no network settlement is taking place.</p>
            </div>
            <TxDetails tx={result} />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="sm:flex-1" onClick={reset}>
                <FlaskConical aria-hidden />
                New send
              </Button>
              <Button asChild className="sm:flex-1">
                <Link href="/activity">View activity</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
