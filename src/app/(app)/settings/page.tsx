"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Eye, EyeOff, Import, KeyRound, LifeBuoy, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Notice } from "@/components/ui/feedback";
import { Field, Input, PasswordInput } from "@/components/ui/input";
import { NetworkPicker } from "@/components/wallet/network-picker";
import { useWallet } from "@/components/wallet/wallet-context";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { authErrorMessage, clientAuth, endServerSession, startServerSession } from "@/lib/firebase/client";
import { apiFetch, type ApiError } from "@/lib/hooks/use-api";
import { passwordSchema } from "@/lib/validation/auth";
import { decryptVault, deleteVault, loadVault, WrongPasswordError } from "@/lib/wallet/vault";

function ProfileCard() {
  const router = useRouter();
  const { user } = useWallet();
  const [name, setName] = useState(user.fullName);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      setStatus({ tone: "error", text: "Name must be between 2 and 100 characters." });
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify({ fullName: trimmed }) });
      setStatus({ tone: "success", text: "Profile saved." });
      router.refresh();
    } catch (err) {
      setStatus({ tone: "error", text: (err as ApiError).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={save} className="space-y-4">
          <Field label="Full name">
            {({ id }) => <Input id={id} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="mt-1 text-sm text-muted">
              {user.email} {user.emailVerified ? "(verified)" : "(not verified yet)"}
            </p>
          </div>
          {status && <Notice tone={status.tone}>{status.text}</Notice>}
          <Button type="submit" variant="secondary" loading={saving}>
            Save profile
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function SecurityCard() {
  const router = useRouter();
  const { user } = useWallet();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const usesPassword = user.provider === "password";

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!current) return setError("Enter your current password");
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    if (password !== password2) return setError("Passwords do not match");
    setError(undefined);
    setSaving(true);
    try {
      // Re-authenticate, change the password, then issue a fresh session because the change revokes old ones.
      const { user: fbUser } = await signInWithEmailAndPassword(clientAuth(), user.email, current);
      await updatePassword(fbUser, password);
      await startServerSession(fbUser);
      setStatus({ tone: "success", text: "Password changed. Other devices have been signed out." });
      setCurrent("");
      setPassword("");
      setPassword2("");
    } catch (err) {
      setStatus({ tone: "error", text: authErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function signOutEverywhere() {
    setRevoking(true);
    try {
      await apiFetch("/api/auth/revoke", { method: "POST" });
      await endServerSession();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setRevoking(false);
      setStatus({ tone: "error", text: (err as ApiError).message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign-in and security</CardTitle>
      </CardHeader>
      <CardBody className="space-y-6">
        {usesPassword ? (
          <form onSubmit={changePassword} noValidate className="space-y-4">
            <p className="text-sm text-muted">Change the password you use to sign in. This does not change your wallet password.</p>
            <Field label="Current password">
              {({ id }) => <PasswordInput id={id} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />}
            </Field>
            <Field label="New password" error={error}>
              {({ id, describedBy, invalid }) => (
                <PasswordInput id={id} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
              )}
            </Field>
            <Field label="Confirm new password">
              {({ id }) => <PasswordInput id={id} autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />}
            </Field>
            <Button type="submit" variant="secondary" loading={saving}>
              Change password
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted">You sign in with Google. Manage that password in your Google account.</p>
        )}
        {status && <Notice tone={status.tone}>{status.text}</Notice>}
        <div className="border-t border-border pt-5">
          <p className="text-sm font-medium">Sessions</p>
          <p className="mt-1 text-sm text-muted">Sign out of XORVET on every browser and device, including this one.</p>
          <Button variant="secondary" className="mt-3" onClick={signOutEverywhere} loading={revoking}>
            <LogOut aria-hidden />
            Sign out everywhere
          </Button>
        </div>
        <p className="text-xs text-muted">Two-factor authentication is not available yet.</p>
      </CardBody>
    </Card>
  );
}

function RevealPhrase() {
  const { user } = useWallet();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function close(o: boolean) {
    setOpen(o);
    if (!o) {
      setPhrase(null);
      setPassword("");
      setVisible(false);
      setError(null);
      clearTimeout(timer.current);
    }
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const vault = await loadVault(user.id);
      if (!vault) throw new Error("missing");
      const secret = await decryptVault(vault, password);
      setPhrase(secret.mnemonic);
      setPassword("");
      // Hide automatically after a minute.
      timer.current = setTimeout(() => close(false), 60_000);
    } catch (err) {
      setError(err instanceof WrongPasswordError ? "Incorrect wallet password." : "No wallet is stored on this device.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Dialog open={open} onOpenChange={close}>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <KeyRound aria-hidden />
        Reveal recovery phrase
      </Button>
      <DialogContent title="Reveal recovery phrase" description="Anyone who sees this phrase can take your funds.">
        {phrase ? (
          <div className="space-y-4">
            <ol className={visible ? "grid grid-cols-2 gap-2 sm:grid-cols-3" : "grid grid-cols-2 gap-2 blur-md select-none sm:grid-cols-3"} aria-hidden={!visible}>
              {phrase.split(" ").map((w, i) => (
                <li key={i} className="flex h-10 items-center gap-2 rounded-[10px] border border-border bg-elevated px-2.5 font-mono text-sm">
                  <span className="w-5 text-right text-xs text-muted">{i + 1}</span>
                  {w}
                </li>
              ))}
            </ol>
            <Button variant="secondary" className="w-full" onClick={() => setVisible((v) => !v)}>
              {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              {visible ? "Hide words" : "Show words"}
            </Button>
            <p className="text-xs text-muted">This closes automatically after one minute.</p>
          </div>
        ) : (
          <form onSubmit={unlock} className="space-y-4">
            <Notice tone="warning">Make sure nobody can see your screen. XORVET staff will never ask for your phrase.</Notice>
            {error && <Notice tone="error">{error}</Notice>}
            <Field label="Wallet password">
              {({ id }) => <PasswordInput id={id} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
            </Field>
            <Button type="submit" className="w-full" loading={busy} disabled={!password}>
              Unlock
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WalletCard() {
  const { user, vaultState, refreshVaultState } = useWallet();
  const [removeOpen, setRemoveOpen] = useState(false);

  async function remove() {
    await deleteVault(user.id);
    setRemoveOpen(false);
    refreshVaultState();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet and recovery</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm text-muted">
          {vaultState === "present"
            ? "Your encrypted recovery phrase is stored in this browser."
            : vaultState === "missing"
              ? "This browser does not hold your recovery phrase. Restore it to reveal it here."
              : "Checking this device."}
        </p>
        <div className="flex flex-wrap gap-2">
          {vaultState === "present" && <RevealPhrase />}
          <Button asChild variant="secondary">
            <Link href="/wallet/setup?mode=restore">
              <Import aria-hidden />
              Import or restore wallet
            </Link>
          </Button>
          {vaultState === "present" && (
            <Button variant="danger" onClick={() => setRemoveOpen(true)}>
              <Trash2 aria-hidden />
              Remove from this device
            </Button>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Your phrase is encrypted with your wallet password and kept only in this browser. Clearing site data removes it.
          Your written phrase is the only way to restore the wallet, and support cannot recover it for you.
        </p>
      </CardBody>
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent title="Remove wallet from this device?" description="Your account and addresses stay linked.">
          <Notice tone="warning" className="mb-4">
            Make sure your recovery phrase is written down. Without it you cannot restore this wallet on any device.
          </Notice>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PreferencesCard() {
  const { network, setNetwork, hideBalances, setHideBalances } = useWallet();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardBody className="space-y-5">
        <NetworkPicker value={network} onChange={setNetwork} label="Default network" />
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-medium">Hide balances</span>
            <span className="block text-sm text-muted">Mask amounts across the wallet on this device.</span>
          </span>
          <input type="checkbox" role="switch" checked={hideBalances} onChange={(e) => setHideBalances(e.target.checked)} className="size-5 accent-[#ff7940]" />
        </label>
        <p className="text-xs text-muted">
          Notifications: replies from support appear under the bell icon. Email notifications are not sent for wallet
          activity.
        </p>
      </CardBody>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="display text-4xl sm:text-5xl">Settings</h1>
      <ProfileCard />
      <WalletCard />
      <SecurityCard />
      <PreferencesCard />
      <Link href="/settings/support" className="block">
        <Card className="flex items-center gap-4 p-5 transition-colors hover:border-primary/50">
          <span className="flex size-11 items-center justify-center rounded-[12px] bg-elevated text-primary">
            <LifeBuoy className="size-5" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block font-medium">Help and support</span>
            <span className="block text-sm text-muted">Message the XORVET team.</span>
          </span>
          <ChevronRight className="size-5 text-muted" aria-hidden />
        </Card>
      </Link>
    </div>
  );
}
