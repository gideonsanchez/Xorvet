"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { SupportConversation } from "@/components/support/support-thread";
import { apiFetch, type ApiError } from "@/lib/hooks/use-api";
import { timeAgo } from "@/lib/format";

export default function SupportPage() {
  const router = useRouter();
  const [list, setList] = useState<SupportConversation[] | null>(null);
  const [error, setError] = useState(false);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ conversations: SupportConversation[] }>("/api/support/conversations");
      setList(res.conversations);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    void load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (subject.trim().length < 3) return setFormError("Add a short subject (at least 3 characters).");
    if (!message.trim()) return setFormError("Write a message.");
    setFormError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{ id: string }>("/api/support/conversations", {
        method: "POST",
        body: JSON.stringify({ subject: subject.trim().slice(0, 120), body: message.trim().slice(0, 4000) }),
      });
      router.push(`/settings/support/${res.id}`);
    } catch (e) {
      setSaving(false);
      setFormError((e as ApiError).message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden />
        Settings
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl sm:text-5xl">Help and support</h1>
        {!composing && (
          <Button onClick={() => setComposing(true)}>
            <Plus aria-hidden />
            New conversation
          </Button>
        )}
      </div>

      <Notice tone="warning">Support will never ask for your recovery phrase, private keys or wallet password.</Notice>

      {composing && (
        <Card>
          <CardHeader>
            <CardTitle>New conversation</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={create} className="space-y-4">
              <Field label="Subject">
                {({ id }) => <Input id={id} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />}
              </Field>
              <Field label="Message">
                {({ id }) => <Textarea id={id} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} />}
              </Field>
              {formError && <Notice tone="error">{formError}</Notice>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setComposing(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Send
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        {error ? (
          <ErrorState title="Conversations could not be loaded" onRetry={load} />
        ) : list === null ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No conversations yet" description="Start one and the XORVET team will reply here." />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((c) => (
              <li key={c.id}>
                <Link href={`/settings/support/${c.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-elevated/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.subject}</p>
                    <p className="text-xs text-muted">
                      {c.status === "open" ? "Open" : "Closed"}, last message {timeAgo(c.last_message_at)}
                    </p>
                  </div>
                  <ChevronRight className="size-5 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
