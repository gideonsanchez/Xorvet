import { NextResponse } from "next/server";
import { z } from "zod";
import { handleError, json, jsonError, readJson, requireAdmin } from "@/lib/api";
import { listProviders, saveProvider } from "@/lib/server/repo";
import { providerFields } from "@/lib/validation/admin";

const patchSchema = z.union([
  // Enable, disable, or mark verified (which also enables).
  z.object({ action: z.enum(["enable", "disable", "verify"]) }),
  // Editing details always resets verification and disables the provider.
  z.object({ action: z.literal("edit"), fields: providerFields }),
]);

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/providers/[slug]">) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { slug } = await ctx.params;
  const parsed = patchSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Invalid request");
  try {
    const provider = (await listProviders(false)).find((p) => p.slug === slug);
    if (!provider) return jsonError(404, "Provider not found");
    const body = parsed.data;
    if (body.action === "edit") {
      await saveProvider(auth.user.id, slug, { ...body.fields, enabled: false, verified: false });
    } else if (body.action === "verify") {
      await saveProvider(auth.user.id, slug, { enabled: true, verified: true });
    } else {
      if (body.action === "enable" && !provider.verifiedAt) return jsonError(422, "Verify the provider before enabling it");
      await saveProvider(auth.user.id, slug, { enabled: body.action === "enable" });
    }
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
