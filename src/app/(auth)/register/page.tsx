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
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { authErrorMessage, clientAuth, startServerSession } from "@/lib/firebase/client";
import { fieldErrors, registerSchema, type FieldErrors } from "@/lib/validation/auth";

type Values = { fullName: string; email: string; password: string; confirmPassword: string; terms: boolean };

export default function RegisterPage() {
  const router = useRouter();
  const [values, setValues] = useState<Values>({ fullName: "", email: "", password: "", confirmPassword: "", terms: false });
  const [errors, setErrors] = useState<FieldErrors<Values>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors<Values>(parsed.error));
      return;
    }
    setErrors({});
    setFormError(null);
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(clientAuth(), parsed.data.email, parsed.data.password);
      await updateProfile(user, { displayName: parsed.data.fullName });
      await sendEmailVerification(user, { url: `${window.location.origin}/login` }).catch(() => undefined);
      await startServerSession(user, parsed.data.fullName);
      router.replace("/wallet/setup");
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
        <h1 className="display mt-5 text-4xl">Create your account</h1>
        <p className="mt-1.5 text-[15px] text-muted">You will set up your wallet in the next step.</p>
      </div>

      {formError && (
        <Notice tone="error" className="mb-4">
          {formError}
        </Notice>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Full name" error={errors.fullName}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} autoComplete="name" value={values.fullName} onChange={(e) => set("fullName", e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
          )}
        </Field>
        <Field label="Email" error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="email" inputMode="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
          )}
        </Field>
        <Field label="Password" error={errors.password} hint="At least 8 characters with a letter and a number.">
          {({ id, describedBy, invalid }) => (
            <PasswordInput id={id} autoComplete="new-password" value={values.password} onChange={(e) => set("password", e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
          )}
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword}>
          {({ id, describedBy, invalid }) => (
            <PasswordInput id={id} autoComplete="new-password" value={values.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
          )}
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.terms}
              onChange={(e) => set("terms", e.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-[#3478F6]"
              aria-invalid={Boolean(errors.terms)}
              aria-describedby={errors.terms ? "terms-error" : undefined}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Notice</Link>.
            </span>
          </label>
          {errors.terms && (
            <p id="terms-error" role="alert" className="mt-1.5 text-[13px] text-danger">
              {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>

      <div className="my-5">
        <OrDivider />
      </div>
      <GoogleButton next="/wallet/setup" />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
