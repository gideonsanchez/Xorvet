"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/input";
import { sendPasswordResetEmail } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { emailSchema } from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setLoading(true);
    // Firebase hosts the reset form; afterwards it returns the user to the sign-in page.
    await sendPasswordResetEmail(clientAuth(), parsed.data, { url: `${window.location.origin}/login` }).catch(() => undefined);
    // Same message whether or not the account exists, so emails cannot be enumerated.
    setLoading(false);
    setSent(true);
  }

  return (
    <Card className="rounded-[28px] p-6 sm:p-9">
      <h1 className="display text-4xl">Reset your password</h1>
      <p className="mt-1.5 text-[15px] text-muted">
        Enter your account email and we will send you a reset link. This resets your sign-in password only. It cannot
        recover your wallet recovery phrase.
      </p>
      {sent ? (
        <Notice tone="success" className="mt-6">
          If an account exists for that email, a reset link is on its way.
        </Notice>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <Field label="Email" error={error}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
            )}
          </Field>
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
