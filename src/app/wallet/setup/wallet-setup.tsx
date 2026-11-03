"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Import, KeyRound, PenLine, Sparkles } from "lucide-react";
import { AssetIcon } from "@/components/brand/asset-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/feedback";
import { Field, Input, PasswordInput, Textarea } from "@/components/ui/input";
import { NETWORKS, NETWORK_IDS } from "@/lib/config/networks";
import { apiFetch, type ApiError } from "@/lib/hooks/use-api";
import { deriveAddresses, type DerivedAddresses } from "@/lib/wallet/derive";
import {
  generateMnemonic,
  isBip39Word,
  normalizeMnemonic,
  pickConfirmationPositions,
  validateMnemonic,
  type PhraseLength,
} from "@/lib/wallet/mnemonic";
import { encryptVault, saveVault } from "@/lib/wallet/vault";
import { cn } from "@/lib/utils";

type Mode = "choose" | "create" | "restore";
type Step = "intro" | "phrase" | "confirm" | "input" | "preview" | "password" | "done";

const MIN_WALLET_PASSWORD = 10;

function StepHeader({ title, description, onBack }: { title: string; description?: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="mb-6">
      {onBack && (
        <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </button>
      )}
      <h1 className="display text-4xl">{title}</h1>
      {description && <div className="mt-2 text-[15px] leading-relaxed text-muted">{description}</div>}
    </div>
  );
}

function AddressList({ addresses }: { addresses: DerivedAddresses }) {
  return (
    <ul className="divide-y divide-border rounded-[12px] border border-border bg-elevated/50">
      {NETWORK_IDS.map((id) => (
        <li key={id} className="flex items-center gap-3 px-3.5 py-3">
          <AssetIcon symbol={NETWORKS[id].nativeAsset} className="size-8" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{NETWORKS[id].mainnetLabel}</p>
            <p className="font-mono text-xs break-all text-muted">{addresses[id].address}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function WalletSetup({ userId, initialMode, hasLinkedWallet }: { userId: string; initialMode: Mode; hasLinkedWallet: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>(initialMode === "restore" ? "input" : "intro");

  // Create flow
  const [length, setLength] = useState<PhraseLength>(12);
  const [acks, setAcks] = useState([false, false, false]);
  const [phrase, setPhrase] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [positions, setPositions] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Restore flow
  const [restoreInput, setRestoreInput] = useState("");
  const [maskRestore, setMaskRestore] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Shared
  const [derived, setDerived] = useState<DerivedAddresses | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{ password?: string; password2?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [mismatchOpen, setMismatchOpen] = useState(false);

  const words = useMemo(() => (phrase ? phrase.split(" ") : []), [phrase]);

  function startCreate() {
    setMode("create");
    setStep("intro");
  }

  function startRestore() {
    setMode("restore");
    setStep("input");
  }

  function generate() {
    setPhrase(generateMnemonic(length));
    setRevealed(false);
    setStep("phrase");
  }

  function goConfirm() {
    setPositions(pickConfirmationPositions(words.length, 3));
    setAnswers({});
    setConfirmError(null);
    setStep("confirm");
  }

  function checkConfirmation(e: React.FormEvent) {
    e.preventDefault();
    const ok = positions.every((p) => (answers[p] ?? "").trim().toLowerCase() === words[p]);
    if (!ok) {
      setConfirmError("One or more words do not match. Check your written copy and try again.");
      return;
    }
    setDerived(deriveAddresses(phrase));
    setStep("password");
  }

  function checkRestore(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeMnemonic(restoreInput);
    const list = normalized ? normalized.split(" ") : [];
    if (list.length !== 12 && list.length !== 24) {
      setRestoreError(`Recovery phrases have 12 or 24 words. You entered ${list.length}.`);
      return;
    }
    const unknown = list.map((w, i) => (isBip39Word(w) ? null : i + 1)).filter(Boolean);
    if (unknown.length) {
      setRestoreError(`Word ${unknown.join(", ")} is not in the standard word list. Check the spelling.`);
      return;
    }
    if (!validateMnemonic(normalized)) {
      setRestoreError("The words are valid, but the phrase checksum does not match. Check the word order.");
      return;
    }
    setRestoreError(null);
    setPhrase(normalized);
    setRestoreInput("");
    setDerived(deriveAddresses(normalized));
    setStep("preview");
  }

  async function save(replace = false) {
    if (!derived) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Link public addresses first, so a mismatch is caught before the local vault is overwritten.
      await apiFetch("/api/wallet/addresses", {
        method: "POST",
        body: JSON.stringify({
          addresses: NETWORK_IDS.map((id) => ({ network: id, address: derived[id].address, derivationPath: derived[id].derivationPath })),
          replace,
        }),
      });
      const vault = await encryptVault({ mnemonic: phrase }, password);
      await saveVault(userId, vault);
      setPhrase("");
      setPassword("");
      setPassword2("");
      setStep("done");
      router.refresh();
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "WALLET_MISMATCH") setMismatchOpen(true);
      else setSaveError(err.message ?? "Could not save your wallet. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof passwordErrors = {};
    if (password.length < MIN_WALLET_PASSWORD) errs.password = `Use at least ${MIN_WALLET_PASSWORD} characters`;
    if (password !== password2) errs.password2 = "Passwords do not match";
    setPasswordErrors(errs);
    if (Object.keys(errs).length === 0) void save();
  }

  if (mode === "choose") {
    return (
      <>
        <StepHeader
          title="Set up your wallet"
          description="Create a brand new wallet, or restore one you already have with its recovery phrase."
        />
        <div className="grid gap-3">
          <button type="button" onClick={startCreate} className="text-left">
            <Card className="flex items-start gap-4 p-5 transition-colors hover:border-primary/50">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-fg text-bg">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Create a new wallet</span>
                <span className="mt-1 block text-sm text-muted">Generate a new recovery phrase and new addresses.</span>
              </span>
            </Card>
          </button>
          <button type="button" onClick={startRestore} className="text-left">
            <Card className="flex items-start gap-4 p-5 transition-colors hover:border-primary/50">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-elevated text-primary">
                <Import className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Restore an existing wallet</span>
                <span className="mt-1 block text-sm text-muted">Enter your 12 or 24 word recovery phrase.</span>
              </span>
            </Card>
          </button>
        </div>
      </>
    );
  }

  return (
    <Card className="p-5 sm:p-8">
      {mode === "create" && step === "intro" && (
        <>
          <StepHeader
            title="Your recovery phrase"
            description="Your recovery phrase is the master key to your wallet. Anyone who has it can take your funds, and without it nobody can restore your wallet if this browser's data is lost."
            onBack={hasLinkedWallet ? undefined : () => setMode("choose")}
          />
          {hasLinkedWallet && (
            <Notice tone="warning" className="mb-5">
              Your account already has a wallet. Creating a new one will replace the addresses linked to your account.
              Funds on the old addresses stay there and need the old phrase to access.
            </Notice>
          )}
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-medium">Before you continue, confirm that you understand:</legend>
            {[
              "I will write the phrase down on paper and keep it somewhere safe and offline.",
              "XORVET staff will never ask for my phrase, and I will never share it.",
              "If I lose the phrase, my wallet cannot be recovered by anyone.",
            ].map((label, i) => (
              <label key={label} className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-border bg-elevated/50 p-3.5 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 shrink-0 accent-[#ff7940]"
                  checked={acks[i]}
                  onChange={(e) => setAcks((a) => a.map((v, j) => (j === i ? e.target.checked : v)))}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium" id="length-label">Phrase length</p>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="length-label">
              {([12, 24] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={length === n}
                  onClick={() => setLength(n)}
                  className={cn(
                    "h-11 rounded-[12px] border text-sm",
                    length === n ? "border-primary bg-primary/15 text-fg" : "border-border bg-elevated text-muted hover:text-fg",
                  )}
                >
                  {n} words
                </button>
              ))}
            </div>
          </div>
          <Button className="mt-6 w-full" size="lg" disabled={!acks.every(Boolean)} onClick={generate}>
            <KeyRound aria-hidden />
            Generate my phrase
          </Button>
        </>
      )}

      {mode === "create" && step === "phrase" && (
        <>
          <StepHeader
            title="Write down your phrase"
            description="Write these words on paper in order. Do not take a screenshot or store them in a notes app."
          />
          <Notice tone="warning" className="mb-4">
            Make sure nobody can see your screen.
          </Notice>
          <div className="relative">
            <ol
              className={cn(
                "grid grid-cols-2 gap-2 sm:grid-cols-3",
                !revealed && "pointer-events-none blur-md select-none",
              )}
              aria-hidden={!revealed}
            >
              {words.map((w, i) => (
                <li key={i} className="flex h-11 items-center gap-2 rounded-[10px] border border-border bg-elevated px-3 font-mono text-sm">
                  <span className="w-5 text-right text-xs text-muted">{i + 1}</span>
                  <span>{w}</span>
                </li>
              ))}
            </ol>
            {!revealed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="secondary" onClick={() => setRevealed(true)}>
                  <Eye aria-hidden />
                  Reveal phrase
                </Button>
              </div>
            )}
          </div>
          {revealed && (
            <button type="button" onClick={() => setRevealed(false)} className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
              <EyeOff className="size-4" aria-hidden />
              Hide phrase
            </button>
          )}
          <Button className="mt-6 w-full" size="lg" disabled={!revealed} onClick={goConfirm}>
            <PenLine aria-hidden />
            I have written it down
          </Button>
        </>
      )}

      {mode === "create" && step === "confirm" && (
        <form onSubmit={checkConfirmation} noValidate>
          <StepHeader
            title="Confirm your phrase"
            description="Enter the requested words from your written copy."
            onBack={() => setStep("phrase")}
          />
          {confirmError && (
            <Notice tone="error" className="mb-4">
              {confirmError}
            </Notice>
          )}
          <div className="space-y-4">
            {positions.map((p) => (
              <Field key={p} label={`Word #${p + 1}`}>
                {({ id }) => (
                  <Input
                    id={id}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={answers[p] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [p]: e.target.value }))}
                  />
                )}
              </Field>
            ))}
          </div>
          <Button type="submit" className="mt-6 w-full" size="lg">
            Confirm
          </Button>
        </form>
      )}

      {mode === "restore" && step === "input" && (
        <form onSubmit={checkRestore} noValidate>
          <StepHeader
            title="Restore your wallet"
            description="Enter your recovery phrase with a space between each word. It is checked and used only in this browser and is never sent to our servers."
            onBack={initialMode === "restore" ? undefined : () => setMode("choose")}
          />
          {restoreError && (
            <Notice tone="error" className="mb-4">
              {restoreError}
            </Notice>
          )}
          <Field
            label="Recovery phrase"
            labelAside={
              <button type="button" onClick={() => setMaskRestore((m) => !m)} className="inline-flex items-center gap-1 text-[13px] text-primary">
                {maskRestore ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                {maskRestore ? "Show" : "Hide"}
              </button>
            }
          >
            {({ id }) => (
              <Textarea
                id={id}
                rows={4}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={restoreInput}
                onChange={(e) => setRestoreInput(e.target.value)}
                className="font-mono"
                style={maskRestore ? ({ WebkitTextSecurity: "disc" } as React.CSSProperties) : undefined}
              />
            )}
          </Field>
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={!restoreInput.trim()}>
            Continue
          </Button>
        </form>
      )}

      {mode === "restore" && step === "preview" && derived && (
        <>
          <StepHeader
            title="Check your addresses"
            description="These addresses were derived from your phrase using the standard path for each network. They should match what your previous wallet showed."
            onBack={() => {
              setPhrase("");
              setDerived(null);
              setStep("input");
            }}
          />
          <AddressList addresses={derived} />
          <Button className="mt-6 w-full" size="lg" onClick={() => setStep("password")}>
            These look right
          </Button>
        </>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} noValidate>
          <StepHeader
            title="Set a wallet password"
            description="This password encrypts your recovery phrase on this device. It is separate from your sign-in password and cannot be reset. If you forget it, restore the wallet with your phrase."
          />
          {saveError && (
            <Notice tone="error" className="mb-4">
              {saveError}
            </Notice>
          )}
          <div className="space-y-4">
            <Field label="Wallet password" error={passwordErrors.password} hint={`At least ${MIN_WALLET_PASSWORD} characters.`}>
              {({ id, describedBy, invalid }) => (
                <PasswordInput id={id} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
              )}
            </Field>
            <Field label="Confirm wallet password" error={passwordErrors.password2}>
              {({ id, describedBy, invalid }) => (
                <PasswordInput id={id} autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
              )}
            </Field>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            Encryption lowers the risk of someone reading your phrase from this browser, but it cannot protect against
            malware on your device. Keep your written phrase as the real backup.
          </p>
          <Button type="submit" className="mt-6 w-full" size="lg" loading={saving}>
            Save and finish
          </Button>
        </form>
      )}

      {step === "done" && derived && (
        <>
          <div className="mb-6 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-7" aria-hidden />
            </span>
            <h1 className="display mt-4 text-4xl">{mode === "restore" ? "Wallet restored" : "Recovery setup complete"}</h1>
            <p className="mt-2 text-[15px] text-muted">
              Your wallet is ready. These are your receiving addresses on each network.
            </p>
          </div>
          <AddressList addresses={derived} />
          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/dashboard">Go to my wallet</Link>
          </Button>
        </>
      )}

      <Dialog open={mismatchOpen} onOpenChange={setMismatchOpen}>
        <DialogContent title="Replace your linked wallet?" description="This phrase belongs to a different wallet than the one linked to your account.">
          <Notice tone="warning" className="mb-5">
            Continuing will link these new addresses to your account. Funds on the previous addresses are not moved and
            can only be reached with the previous phrase.
          </Notice>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setMismatchOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={saving}
              onClick={() => {
                setMismatchOpen(false);
                void save(true);
              }}
            >
              Replace linked wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
