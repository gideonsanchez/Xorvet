"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Big from "big.js";
import { ArrowDownUp, CheckCircle2, ChevronDown } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/feedback";
import { Private, TxDetails, type TxRecord } from "@/components/wallet/bits";
import { useWallet } from "@/components/wallet/wallet-context";
import { ASSETS, ASSET_SYMBOLS, type AssetSymbol } from "@/lib/config/assets";
import { apiFetch, type ApiError } from "@/lib/hooks/use-api";
import { formatAmount, formatUsd, newIdempotencyKey } from "@/lib/format";
import { hasValidDecimals } from "@/lib/validation/ledger";

function AssetSelect({ value, onChange, label, exclude }: { value: AssetSymbol; onChange: (s: AssetSymbol) => void; label: string; exclude: AssetSymbol }) {
  const id = useId();
  return (
    <div className="relative shrink-0">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2">
        <AssetIcon symbol={value} className="size-7" />
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as AssetSymbol)}
        className="h-11 appearance-none rounded-full border border-border bg-card pr-9 pl-11 text-[15px] font-medium text-fg focus:border-primary focus:outline-none"
      >
        {ASSET_SYMBOLS.map((s) => (
          <option key={s} value={s} disabled={s === exclude}>
            {s}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
}

export default function SwapPage() {
  const { demo, priceOf, config, prices, user } = useWallet();
  const [from, setFrom] = useState<AssetSymbol>("BTC");
  const [to, setTo] = useState<AssetSymbol>("MOWI");
  const [amount, setAmount] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TxRecord | null>(null);
  const idempotencyKey = useRef("");

  const balance = demo.balances?.[from] ?? "0";
  const fromPrice = priceOf(from);
  const toPrice = priceOf(to);
  const fee = useMemo(() => new Big(config.swapFeePercent || "0"), [config.swapFeePercent]);

  const validAmount = /^\d+(\.\d+)?$/.test(amount) && new Big(amount).gt(0);
  const amountError = !amount
    ? null
    : !validAmount
      ? "Enter a valid amount"
      : !hasValidDecimals(amount, from)
        ? `${from} supports up to ${ASSETS[from].decimals} decimal places`
        : new Big(amount).gt(balance)
          ? "Not enough demo balance"
          : null;

  const quote = useMemo(() => {
    if (!fromPrice || !toPrice) return null;
    const rate = new Big(fromPrice).div(toPrice);
    if (!validAmount) return { rate, gross: null, output: null, feeAmount: null };
    const gross = new Big(amount).times(fromPrice).div(toPrice);
    const output = gross.times(new Big(100).minus(fee)).div(100);
    return { rate, gross, output, feeAmount: gross.minus(output) };
  }, [fromPrice, toPrice, amount, validAmount, fee]);

  function flip() {
    setFrom(to);
    setTo(from);
    setAmount("");
  }

  function openReview() {
    idempotencyKey.current = newIdempotencyKey();
    setError(null);
    setReviewOpen(true);
  }

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch<{ transaction: TxRecord }>("/api/demo/swap", {
        method: "POST",
        body: JSON.stringify({ from, to, amount, idempotencyKey: idempotencyKey.current }),
      });
      setResult(res.transaction);
      setReviewOpen(false);
      setAmount("");
      void demo.reload();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  }

  const priceMissing = !fromPrice || !toPrice;
  const canReview = config.swapSimulationMode && validAmount && !amountError && !priceMissing && user.status === "active";

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="display text-4xl sm:text-5xl">Swap</h1>
        <p className="mt-1 text-sm text-muted">Practice swaps on your demo balance.</p>
      </div>

      <Notice tone="warning" title="Simulated swap">
        Swaps run only on your demo balance. No blockchain exchange or market execution takes place, and on-chain funds are
        never used.
      </Notice>

      {!config.swapSimulationMode && <Notice tone="error">Swaps are currently turned off by an administrator.</Notice>}

      {result && (
        <Card className="border-success/40">
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-7 shrink-0 text-success" aria-hidden />
              <div>
                <p className="font-semibold">Successful: simulated swap</p>
                <p className="text-sm text-muted">Your demo balance has been updated.</p>
              </div>
            </div>
            <TxDetails tx={result} />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setResult(null)}>
                Swap again
              </Button>
              <Button asChild className="flex-1">
                <Link href="/activity">View activity</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {!result && (
        <Card>
          <CardBody className="space-y-2">
            <div className="rounded-[14px] border border-border bg-elevated/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">You pay</span>
                <span className="text-muted">
                  Demo balance:{" "}
                  <Private className="text-fg">
                    {formatAmount(balance, 8)} {from}
                  </Private>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <label htmlFor="swap-amount" className="sr-only">
                  Amount of {from} to swap
                </label>
                <input
                  id="swap-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(",", "."))}
                  aria-invalid={Boolean(amountError)}
                  aria-describedby={amountError ? "swap-amount-error" : undefined}
                  className="tabular min-w-0 flex-1 bg-transparent text-3xl font-semibold text-fg placeholder:text-muted/50 focus:outline-none"
                />
                <AssetSelect value={from} onChange={(s) => (s === to ? flip() : setFrom(s))} label="Asset to pay" exclude={to} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted">
                  {validAmount && fromPrice ? formatUsd(new Big(amount).times(fromPrice)) : " "}
                </span>
                <button type="button" className="text-primary hover:underline" onClick={() => setAmount(new Big(balance).toFixed())}>
                  Max
                </button>
              </div>
              {amountError && (
                <p id="swap-amount-error" role="alert" className="mt-1 text-[13px] text-danger">
                  {amountError}
                </p>
              )}
            </div>

            <div className="relative z-10 -my-4 flex justify-center">
              <button
                type="button"
                onClick={flip}
                className="flex size-11 items-center justify-center rounded-full border-4 border-card bg-elevated text-fg hover:text-primary"
                aria-label="Switch pay and receive assets"
              >
                <ArrowDownUp className="size-5" aria-hidden />
              </button>
            </div>

            <div className="rounded-[14px] border border-border bg-elevated/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">You receive (estimate)</span>
                <span className="text-muted">
                  Balance:{" "}
                  <Private className="text-fg">
                    {formatAmount(demo.balances?.[to] ?? "0", 8)} {to}
                  </Private>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <p className="tabular min-w-0 flex-1 truncate text-3xl font-semibold text-fg" aria-live="polite">
                  {quote?.output ? formatAmount(quote.output.toFixed(18), 8) : "0"}
                </p>
                <AssetSelect value={to} onChange={(s) => (s === from ? flip() : setTo(s))} label="Asset to receive" exclude={from} />
              </div>
            </div>

            <dl className="space-y-1.5 px-1 pt-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Rate</dt>
                <dd className="text-right">
                  {quote ? `1 ${from} = ${formatAmount(quote.rate.toFixed(18), 8)} ${to}` : "Unavailable"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Simulation fee</dt>
                <dd>{fee.toFixed()}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Price source</dt>
                <dd className="text-right">
                  {[from, to].includes("MOWI") ? "MOWI fixed price" : ""}
                  {[from, to].includes("MOWI") && [from, to].some((s) => s !== "MOWI") ? " and " : ""}
                  {[from, to].some((s) => s !== "MOWI") ? (prices.data ? "CoinGecko" : "Market data") : ""}
                </dd>
              </div>
            </dl>

            {priceMissing && (
              <Notice tone="error">
                {prices.loading ? "Loading prices." : "A required market price is unavailable right now, so no conversion can be quoted."}
              </Notice>
            )}

            <Button size="lg" className="mt-3 w-full" disabled={!canReview} onClick={openReview}>
              Review swap
            </Button>
          </CardBody>
        </Card>
      )}

      <Dialog open={reviewOpen} onOpenChange={(o) => !submitting && setReviewOpen(o)}>
        <DialogContent title="Review swap" description="Check the details before confirming.">
          {quote?.output && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Badge kind="simulated" />
                <Badge kind="demo" label="Demo balance" />
              </div>
              <dl className="divide-y divide-border rounded-[12px] border border-border text-sm">
                {[
                  ["You pay", `${formatAmount(amount, 18)} ${from}`],
                  ["You receive (estimate)", `${formatAmount(quote.output.toFixed(18), 8)} ${to}`],
                  ["Rate", `1 ${from} = ${formatAmount(quote.rate.toFixed(18), 8)} ${to}`],
                  ["Simulation fee", `${fee.toFixed()}% (${formatAmount(quote.feeAmount!.toFixed(18), 8)} ${to})`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-3.5 py-2.5">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[13px] text-muted">
                The final amount is calculated on the server with the latest prices when you confirm, so it may differ slightly.
                No blockchain transaction is created.
              </p>
              {error && <Notice tone="error">{error}</Notice>}
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="secondary" className="sm:flex-1" onClick={() => setReviewOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button className="sm:flex-1" onClick={confirm} loading={submitting}>
                  Confirm swap
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
