"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/feedback";
import { Field, Input, PasswordInput } from "@/components/ui/input";
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { authErrorMessage, clientAuth, startServerSession } from "@/lib/firebase/client";
import { fieldErrors, loginSchema, safeNext, type FieldErrors } from "@/lib/validation/auth";

type Values = { email: string; password: string };

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<Values>>({});
  const [formError, setFormError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const destination = safeNext(next);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors<Values>(parsed.error));
      return;
    }
    setErrors({});
    setFormError(null);
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(clientAuth(), parsed.data.email, parsed.data.password);
      // Resend the verification link on sign-in until the address is confirmed.
      if (!user.emailVerified) {
        await sendEmailVerification(user, { url: `${window.location.origin}/login` }).catch(() => undefined);
      }
      await startServerSession(user);
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setFormError(authErrorMessage(err));
    }
  }

  return (
    <Card className="rounded-[28px] p-6 sm:p-9">
      <div className="mb-6 text-center">
        <LogoMark className="mx-auto size-11" />
        <h1 className="display mt-5 text-4xl">Welcome back</h1>
        <p className="mt-1.5 text-[15px] text-muted">Sign in to open your XORVET WALLET.</p>
      </div>

      {formError && (
        <Notice tone="error" className="mb-4">
          {formError}
        </Notice>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Email" error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              aria-describedby={describedBy}
              aria-invalid={invalid}
            />
          )}
        </Field>
        <Field
          label="Password"
          error={errors.password}
          labelAside={
            <Link href="/forgot-password" className="text-[13px] text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          {({ id, describedBy, invalid }) => (
            <PasswordInput
              id={id}
              autoComplete="current-password"
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              aria-describedby={describedBy}
              aria-invalid={invalid}
            />
          )}
        </Field>
        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>
      </form>

      <div className="my-5">
        <OrDivider />
      </div>
      <GoogleButton next={destination} />

      <p className="mt-6 text-center text-sm text-muted">
        New to XORVET?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create Account
        </Link>
      </p>
    </Card>
  );
}
