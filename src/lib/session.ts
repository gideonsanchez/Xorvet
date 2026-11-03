import "server-only";
import { redirect } from "next/navigation";
import { NETWORK_IDS, type NetworkId } from "@/lib/config/networks";
import { ensureUser, getAddresses, getConfig, getProfile } from "@/lib/server/repo";
import { getUser } from "@/lib/server/session";
import type { WalletUser } from "@/components/wallet/wallet-context";

/** Loads the signed-in user's profile, linked addresses and app config, or redirects to login. */
export async function loadWalletSession() {
  const sessionUser = await getUser();
  if (!sessionUser) redirect("/login");

  let profile = await getProfile(sessionUser.id);
  if (!profile) {
    await ensureUser(sessionUser.id, sessionUser.email, "");
    profile = await getProfile(sessionUser.id);
  }
  const [rows, config] = await Promise.all([getAddresses(sessionUser.id), getConfig()]);

  const user: WalletUser = {
    id: sessionUser.id,
    email: sessionUser.email,
    emailVerified: sessionUser.emailVerified,
    provider: sessionUser.provider,
    fullName: profile?.fullName ?? "",
    role: profile?.role ?? "user",
    status: profile?.status ?? "active",
  };

  const complete = NETWORK_IDS.every((n) => rows[n]);
  const addresses = complete ? (rows as Record<NetworkId, string>) : null;
  return { user, addresses, config };
}
