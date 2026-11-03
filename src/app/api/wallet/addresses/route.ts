import { NextResponse } from "next/server";
import { handleError, json, jsonError, readJson, requireUser } from "@/lib/api";
import { NETWORKS, NETWORK_IDS, type NetworkId } from "@/lib/config/networks";
import { linkAddresses } from "@/lib/server/repo";
import { isValidAddress } from "@/lib/validation/address";
import { addressesSchema } from "@/lib/validation/ledger";

/**
 * Links the public addresses derived in the browser to the signed-in account.
 * Only public data is accepted here: never phrases or keys.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const parsed = addressesSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(400, "Invalid address payload");

  const byNetwork = new Map(parsed.data.addresses.map((a) => [a.network as NetworkId, a]));
  const addresses = {} as Record<NetworkId, string>;
  for (const network of NETWORK_IDS) {
    const entry = byNetwork.get(network);
    if (!entry) return jsonError(400, `Missing ${NETWORKS[network].name} address`);
    if (entry.derivationPath !== NETWORKS[network].derivationPath) return jsonError(400, "Unexpected derivation path");
    if (!isValidAddress(network, entry.address)) return jsonError(400, `Invalid ${NETWORKS[network].name} address`);
    if (network === "bitcoin" && !entry.address.startsWith("bc1q")) return jsonError(400, "Expected a native SegWit address");
    addresses[network] = entry.address;
  }

  try {
    await linkAddresses(auth.user.id, addresses, Boolean(parsed.data.replace));
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
