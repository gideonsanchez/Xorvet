"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppConfig } from "@/lib/app-config";
import type { AssetSymbol } from "@/lib/config/assets";
import { NETWORK_IDS, isNetworkId, type NetworkId } from "@/lib/config/networks";
import { apiFetch, useApi } from "@/lib/hooks/use-api";
import type { MarketPrice } from "@/lib/market/coingecko";
import { loadVault } from "@/lib/wallet/vault";
import type { BalanceEntry } from "@/app/api/chain/balances/route";

export type WalletUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  /** Firebase sign-in provider, for example "password" or "google.com". */
  provider: string;
  fullName: string;
  role: "user" | "admin";
  status: "active" | "suspended";
};

type PricesResponse = { ok: true; prices: Partial<Record<AssetSymbol, MarketPrice>>; updatedAt: string; source: string };
type BalancesResponse = { balances: BalanceEntry[]; checkedAt: string };

type WalletContextValue = {
  user: WalletUser;
  addresses: Record<NetworkId, string>;
  config: AppConfig;
  network: NetworkId;
  setNetwork: (n: NetworkId) => void;
  hideBalances: boolean;
  setHideBalances: (v: boolean) => void;
  vaultState: "checking" | "present" | "missing";
  refreshVaultState: () => void;
  prices: ReturnType<typeof useApi<PricesResponse>>;
  /** USD price for any asset; MOWI always uses the fixed configured price. */
  priceOf: (s: AssetSymbol) => string | null;
  chain: ReturnType<typeof useApi<BalancesResponse>>;
  demo: {
    balances: Partial<Record<AssetSymbol, string>> | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
  };
};

const WalletContext = createContext<WalletContextValue | null>(null);

function readPref<T>(key: string, fallback: T, valid: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return valid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Preferences are a convenience; ignore storage failures.
  }
}

export function WalletProvider({
  user,
  addresses,
  config,
  children,
}: {
  user: WalletUser;
  addresses: Record<NetworkId, string>;
  config: AppConfig;
  children: React.ReactNode;
}) {
  const [network, setNetworkState] = useState<NetworkId>("ethereum");
  const [hideBalances, setHideState] = useState(false);
  const [vaultState, setVaultState] = useState<WalletContextValue["vaultState"]>("checking");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted preferences after mount
    setNetworkState(readPref("xorvet:network", "ethereum", isNetworkId));
    setHideState(readPref("xorvet:hideBalances", false, (v): v is boolean => typeof v === "boolean"));
  }, []);

  const refreshVaultState = useCallback(() => {
    loadVault(user.id)
      .then((v) => setVaultState(v ? "present" : "missing"))
      .catch(() => setVaultState("missing"));
  }, [user.id]);

  useEffect(refreshVaultState, [refreshVaultState]);

  const setNetwork = useCallback((n: NetworkId) => {
    setNetworkState(n);
    writePref("xorvet:network", n);
  }, []);

  const setHideBalances = useCallback((v: boolean) => {
    setHideState(v);
    writePref("xorvet:hideBalances", v);
  }, []);

  const prices = useApi<PricesResponse>("/api/market/prices", 60_000);
  const chain = useApi<BalancesResponse>("/api/chain/balances", 120_000);

  const [demoBalances, setDemoBalances] = useState<Partial<Record<AssetSymbol, string>> | null>(null);
  const [demoLoading, setDemoLoading] = useState(true);
  const [demoError, setDemoError] = useState<string | null>(null);

  const reloadDemo = useCallback(async () => {
    setDemoLoading(true);
    try {
      const res = await apiFetch<{ balances: Partial<Record<AssetSymbol, string>> }>("/api/demo/balances");
      setDemoBalances(res.balances);
      setDemoError(null);
    } catch {
      setDemoError("Could not load demo balances.");
    }
    setDemoLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    void reloadDemo();
  }, [reloadDemo]);

  const priceOf = useCallback(
    (s: AssetSymbol) => (s === "MOWI" ? config.mowiPriceUsd : (prices.data?.prices[s]?.usd ?? null)),
    [config.mowiPriceUsd, prices.data],
  );

  const value = useMemo<WalletContextValue>(
    () => ({
      user,
      addresses,
      config,
      network,
      setNetwork,
      hideBalances,
      setHideBalances,
      vaultState,
      refreshVaultState,
      prices,
      priceOf,
      chain,
      demo: { balances: demoBalances, loading: demoLoading, error: demoError, reload: reloadDemo },
    }),
    [user, addresses, config, network, setNetwork, hideBalances, setHideBalances, vaultState, refreshVaultState, prices, priceOf, chain, demoBalances, demoLoading, demoError, reloadDemo],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}

export function chainBalanceFor(entries: BalanceEntry[] | undefined, network: NetworkId) {
  return entries?.find((e) => e.network === network);
}

export { NETWORK_IDS };
