import { NextResponse } from "next/server";
import { z } from "zod";
import { handleError, json, jsonError, readJson, requireAdmin } from "@/lib/api";
import { getConfig, updateConfig } from "@/lib/server/repo";

const decimal = z.string().trim().regex(/^\d{1,9}(\.\d{1,8})?$/, "Use a plain decimal number, for example 35.55");

const patchSchema = z
  .object({
    mowiPriceUsd: decimal.refine((v) => Number(v) > 0, "MOWI price must be greater than zero"),
    mowiDisplayRate: decimal,
    swapFeePercent: decimal.refine((v) => Number(v) <= 10, "Swap fee must be 10 percent or less"),
    transactionSimulationMode: z.boolean(),
    swapSimulationMode: z.boolean(),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    return json({ config: await getConfig() });
  } catch (e) {
    return handleError(e);
  }
}

/** Validated, audited update of app configuration. */
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const parsed = patchSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid configuration");
  try {
    await updateConfig(auth.user.id, parsed.data);
    return json({ config: await getConfig() });
  } catch (e) {
    return handleError(e);
  }
}
