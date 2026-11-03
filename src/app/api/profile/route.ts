import { NextResponse } from "next/server";
import { z } from "zod";
import { handleError, json, jsonError, readJson, requireUser } from "@/lib/api";
import { updateProfileName } from "@/lib/server/repo";

const schema = z.object({ fullName: z.string().trim().min(2).max(100) });

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Name must be between 2 and 100 characters.");
  try {
    await updateProfileName(auth.user.id, parsed.data.fullName);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
