import { NextResponse } from "next/server";
import { z } from "zod";
import { handleError, json, jsonError, readJson, requireAdmin } from "@/lib/api";
import { setUserStatus } from "@/lib/server/repo";

const schema = z.object({ status: z.enum(["active", "suspended"]) });

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/users/[uid]">) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Invalid status");
  try {
    await setUserStatus(auth.user.id, (await ctx.params).uid, parsed.data.status);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
