"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Headset, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/input";
import { apiFetch, type ApiError } from "@/lib/hooks/use-api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SupportMessage = { id: string; sender_id: string; is_staff: boolean; body: string; created_at: string };
export type SupportConversation = { id: string; user_id: string; subject: string; status: "open" | "closed"; created_at: string; last_message_at: string };

const PHRASE_HINT = /\b(seed|recovery|mnemonic|private key|phrase)\b/i;

/**
 * Message thread shared by the user support page and the admin inbox.
 * Access is enforced by the support API: users only see their own conversations; staff replies require the admin role.
 */
export function SupportThread({ conversation, asStaff }: { conversation: SupportConversation; asStaff: boolean }) {
  const [messages, setMessages] = useState<SupportMessage[] | null>(null);
  const [error, setError] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ messages: SupportMessage[] }>(`/api/support/conversations/${conversation.id}`);
      setError(false);
      setMessages(res.messages);
    } catch {
      setError(true);
    }
  }, [conversation.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load and polling
    void load();
    const t = setInterval(() => document.visibilityState === "visible" && void load(), 15_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages?.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    if (text.length > 4000) {
      setSendError("Messages can be up to 4000 characters.");
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      await apiFetch(`/api/support/conversations/${conversation.id}`, { method: "POST", body: JSON.stringify({ body: text }) });
    } catch (e) {
      setSending(false);
      const err = e as ApiError;
      setSendError(err.code === "RATE_LIMITED" ? "You are sending messages too quickly. Please wait a few minutes." : err.message);
      return;
    }
    setSending(false);
    setBody("");
    void load();
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <ErrorState title="Messages could not be loaded" onRetry={load} />
      ) : messages === null ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="ml-auto h-16 w-2/3" />
        </div>
      ) : (
        <ol className="space-y-3" aria-label="Messages">
          {messages.map((m) => {
            const mine = asStaff ? m.is_staff : !m.is_staff;
            return (
              <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-sm", mine ? "bg-primary/20 text-fg" : "border border-border bg-elevated text-fg")}>
                  <p className="mb-1 flex items-center gap-1.5 text-xs text-muted">
                    {m.is_staff && <Headset className="size-3.5" aria-hidden />}
                    {m.is_staff ? "XORVET support" : asStaff ? "Customer" : "You"}
                    <span aria-hidden>,</span>
                    <time dateTime={m.created_at}>{formatDateTime(m.created_at)}</time>
                  </p>
                  <p className="leading-relaxed break-words whitespace-pre-wrap">{m.body}</p>
                </div>
              </li>
            );
          })}
          <div ref={endRef} />
        </ol>
      )}

      {conversation.status === "closed" ? (
        <Notice tone="info">This conversation is closed.{asStaff ? "" : " Start a new one if you need more help."}</Notice>
      ) : (
        <form onSubmit={send} className="space-y-2">
          <label htmlFor={`reply-${conversation.id}`} className="sr-only">
            Your message
          </label>
          <Textarea id={`reply-${conversation.id}`} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder={asStaff ? "Write a reply" : "Write a message"} maxLength={4000} />
          {!asStaff && PHRASE_HINT.test(body) && (
            <Notice tone="warning">Never share your recovery phrase or private keys. Support will never ask for them.</Notice>
          )}
          {sendError && <Notice tone="error">{sendError}</Notice>}
          <div className="flex justify-end">
            <Button type="submit" loading={sending} disabled={!body.trim()}>
              <Send aria-hidden />
              {asStaff ? "Send reply" : "Send"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
