import { NextResponse } from "next/server";
import { json, requireUser } from "@/lib/api";
import { ChainError, getNativeBalance } from "@/lib/chains";
import { NETWORK_IDS, type NetworkId } from "@/lib/config/networks";
import { getAddresses } from "@/lib/server/repo";

export type BalanceEntry =
  | { network: NetworkId; address: string; status: "ok"; confirmed: string; unconfirmed?: string }
  | { network: NetworkId; address: string; status: "error"; error: string; rateLimited: boolean };

/** On-chain native balances for the signed-in user's own stored addresses. */
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const addresses = await getAddresses(auth.user.id);

  const balances = await Promise.all(
    NETWORK_IDS.filter((n) => addresses[n]).map(async (network): Promise<BalanceEntry> => {
      const address = addresses[network]!;
      try {
        return { network, address, status: "ok", ...(await getNativeBalance(network, address)) };
      } catch (e) {
        return {
          network,
          address,
          status: "error",
          error: e instanceof ChainError ? e.message : "Network unavailable",
          rateLimited: e instanceof ChainError && e.code === "RATE_LIMITED",
        };
      }
    }),
  );
  return json({ balances, checkedAt: new Date().toISOString() });
}
