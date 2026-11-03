import { MOWI_DISPLAY_RATE, MOWI_PRICE_USD } from "@/lib/config/assets";

export type AppConfig = {
  mowiPriceUsd: string;
  mowiDisplayRate: string;
  swapFeePercent: string;
  transactionSimulationMode: boolean;
  swapSimulationMode: boolean;
};

/** Safe defaults (simulation on) used whenever a value has not been configured. */
export const DEFAULT_APP_CONFIG: AppConfig = {
  mowiPriceUsd: MOWI_PRICE_USD,
  mowiDisplayRate: MOWI_DISPLAY_RATE,
  swapFeePercent: "0",
  transactionSimulationMode: true,
  swapSimulationMode: true,
};

export const CONFIG_FIELDS = Object.keys(DEFAULT_APP_CONFIG) as (keyof AppConfig)[];
