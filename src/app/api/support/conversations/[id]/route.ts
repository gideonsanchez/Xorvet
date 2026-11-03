import { NextResponse } from "next/server";
import { z } from "zod";
import { handleError, json, jsonError, readJson, requireUser } from "@/lib/api";
import { addMessage, getConversation, listMessages, setConversationStatus } from "@/lib/server/repo";

const messageSchema = z.object({ body: z.string().trim().min(1).max(4000) });
const statusSchema = z.object({ status: z.enum(["open", "closed"]) });

/** Loads a conversation the caller may access: the owner, or an admin. Others get 404. */
async function access(id: string) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const conversation = await getConversation(id);
  const isStaff = auth.profile.role === "admin" && auth.profile.status === "active";
  if (!conversation || (conversation.user_id !== auth.user.id && !isStaff)) return jsonError(404, "Conversation not found");
  return { ...auth, conversation, isStaff };
}

export async function GET(_: Request, ctx: RouteContext<"/api/support/conversations/[id]">) {
  const a = await access((await ctx.params).id);
  if (a instanceof NextResponse) return a;
  try {
    return json({ conversation: a.conversation, messages: await listMessages(a.conversation.id) });
  } catch (e) {
    return handleError(e);
  }
}

/** Posts a message. Admins post as staff; everyone else as the customer. */
export async function POST(request: Request, ctx: RouteContext<"/api/support/conversations/[id]">) {
  const a = await access((await ctx.params).id);
  if (a instanceof NextResponse) return a;
  const parsed = messageSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Messages must be between 1 and 4000 characters.");
  const asStaff = a.isStaff && a.conversation.user_id !== a.user.id;
  try {
    await addMessage(a.conversation, a.user.id, asStaff, parsed.data.body);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}

/** Admins can close or reopen a conversation. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/support/conversations/[id]">) {
  const a = await access((await ctx.params).id);
  if (a instanceof NextResponse) return a;
  if (!a.isStaff) return jsonError(403, "Administrator access required", "FORBIDDEN");
  const parsed = statusSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Invalid status");
  try {
    await setConversationStatus(a.user.id, a.conversation.id, parsed.data.status);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
