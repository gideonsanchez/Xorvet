import { NextResponse } from "next/server";
import { z } from "zod";
import { handleError, json, jsonError, readJson, requireUser } from "@/lib/api";
import { createConversation, listConversations } from "@/lib/server/repo";

const createSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  body: z.string().trim().min(1).max(4000),
});

/** The signed-in user's own conversations only. */
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    return json({ conversations: await listConversations(auth.user.id) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const parsed = createSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Add a subject of at least 3 characters and a message.");
  try {
    const id = await createConversation(
      { id: auth.user.id, email: auth.user.email, name: auth.profile.fullName },
      parsed.data.subject,
      parsed.data.body,
    );
    return json({ id });
  } catch (e) {
    return handleError(e);
  }
}
