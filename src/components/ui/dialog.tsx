"use client";

import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

/** Centered dialog on desktop, bottom sheet on mobile. Focus is trapped by Radix. */
export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/60" />
      <D.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-[24px] border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] focus:outline-none",
          "sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px] sm:p-6",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <D.Title className="display text-2xl text-fg">{title}</D.Title>
            {description ? (
              <D.Description className="text-sm text-muted">{description}</D.Description>
            ) : (
              <D.Description className="sr-only">{title}</D.Description>
            )}
          </div>
          <D.Close
            className="-mt-1 -mr-2 flex size-10 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-fg"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  );
}
