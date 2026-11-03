import { NextResponse } from "next/server";
import { handleError, json, jsonError, ledgerError, readJson, requireUser } from "@/lib/api";
import type { AssetSymbol } from "@/lib/config/assets";
import { getPrices } from "@/lib/market/coingecko";
import { demoSwap, getConfig } from "@/lib/server/repo";
import { swapSchema } from "@/lib/validation/ledger";

/**
 * Simulated swap on the demo ledger. Prices are resolved here on the server, never taken
 * from the client. Nothing is broadcast and no on-chain asset is involved.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const parsed = swapSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid swap request");
  const { from, to, amount, idempotencyKey } = parsed.data;

  const config = await getConfig();
  if (!config.swapSimulationMode) {
    return jsonError(503, "Swaps are turned off. Real swaps are not available in this build.", "SWAPS_DISABLED");
  }

  const market = from !== "MOWI" || to !== "MOWI" ? await getPrices() : null;
  const priceOf = (s: AssetSymbol): string | null =>
    s === "MOWI" ? config.mowiPriceUsd : market?.ok ? (market.prices[s]?.usd ?? null) : null;
  const fromPrice = priceOf(from);
  const toPrice = priceOf(to);
  if (!fromPrice || !toPrice) return ledgerError("PRICE_UNAVAILABLE");

  try {
    const transaction = await demoSwap(auth.user.id, idempotencyKey, {
      from,
      to,
      amount,
      fromPrice,
      toPrice,
      feePercent: config.swapFeePercent,
    });
    return json({ transaction, prices: { [from]: fromPrice, [to]: toPrice } });
  } catch (e) {
    return handleError(e);
  }
}
