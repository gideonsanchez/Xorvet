import { NextResponse } from "next/server";
import { handleError, json, requireUser } from "@/lib/api";
import { listProviders } from "@/lib/server/repo";

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  try {
    const providers = await listProviders(true);
    return json({ providers: providers.map(({ slug, name, description, url, regions, paymentMethods }) => ({ slug, name, description, url, regions, paymentMethods })) });
  } catch (e) {
    return handleError(e);
  }
}
