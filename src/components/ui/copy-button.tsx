"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "./button";

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  ...props
}: { value: string; label?: string; copiedLabel?: string } & Omit<ButtonProps, "onClick">) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }

  return (
    <Button variant="secondary" onClick={copy} {...props}>
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      <span aria-live="polite">{failed ? "Copy failed" : copied ? copiedLabel : label}</span>
    </Button>
  );
}
