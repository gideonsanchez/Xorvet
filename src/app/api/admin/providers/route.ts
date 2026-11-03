import { NextResponse } from "next/server";
import { handleError, json, jsonError, readJson, requireAdmin } from "@/lib/api";
import { listProviders, saveProvider } from "@/lib/server/repo";
import { providerFields } from "@/lib/validation/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return json({ providers: await listProviders(false) });
  } catch (e) {
    return handleError(e);
  }
}

/** New providers start disabled and unverified until an admin confirms the official domain. */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const parsed = providerFields.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid provider");
  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  if (slug.length < 2) return jsonError(400, "Invalid provider name");
  try {
    const existing = await listProviders(false);
    if (existing.some((p) => p.slug === slug)) return jsonError(409, "A provider with this name already exists");
    await saveProvider(auth.user.id, slug, { ...parsed.data, regions: [], paymentMethods: [], enabled: false, verified: false });
    return json({ slug });
  } catch (e) {
    return handleError(e);
  }
}
