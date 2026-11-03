import { NextResponse } from "next/server";
import { handleError, json, jsonError, readJson, requireUser } from "@/lib/api";
import { NETWORKS, type NetworkId } from "@/lib/config/networks";
import { demoSend, getConfig } from "@/lib/server/repo";
import { isValidAddress } from "@/lib/validation/address";
import { hasValidDecimals, sendSchema } from "@/lib/validation/ledger";

/**
 * Simulated send. Records a pending transaction against the demo ledger and never
 * broadcasts. Real sending is not enabled in this build.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const parsed = sendSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid send request");
  const network = parsed.data.network as NetworkId;
  const asset = NETWORKS[network].nativeAsset;
  const recipient = parsed.data.recipient.trim();

  if (!isValidAddress(network, recipient)) {
    return jsonError(422, `That is not a valid ${NETWORKS[network].mainnetLabel} address.`, "INVALID_ADDRESS");
  }
  if (!hasValidDecimals(parsed.data.amount, asset)) return jsonError(422, "Too many decimal places for this asset.");

  const config = await getConfig();
  if (!config.transactionSimulationMode) {
    return jsonError(501, "Real on-chain sending is not available in this build.", "REAL_SEND_DISABLED");
  }

  try {
    const transaction = await demoSend(auth.user.id, parsed.data.idempotencyKey, {
      network,
      asset,
      amount: parsed.data.amount,
      recipient,
    });
    return json({ transaction });
  } catch (e) {
    return handleError(e);
  }
}
