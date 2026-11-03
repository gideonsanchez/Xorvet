import { z } from "zod";
import { ASSETS, ASSET_SYMBOLS, type AssetSymbol } from "@/lib/config/assets";
import { NETWORK_IDS } from "@/lib/config/networks";

const decimalString = z
  .string()
  .trim()
  .regex(/^\d{1,18}(\.\d{1,18})?$/, "Enter a valid amount");

const idempotencyKey = z.string().min(8).max(80).regex(/^[A-Za-z0-9-]+$/);

export function hasValidDecimals(amount: string, symbol: AssetSymbol): boolean {
  const decimals = amount.split(".")[1]?.length ?? 0;
  return decimals <= ASSETS[symbol].decimals;
}

export const swapSchema = z
  .object({
    from: z.enum(ASSET_SYMBOLS as [AssetSymbol, ...AssetSymbol[]]),
    to: z.enum(ASSET_SYMBOLS as [AssetSymbol, ...AssetSymbol[]]),
    amount: decimalString,
    idempotencyKey,
  })
  .refine((v) => v.from !== v.to, { path: ["to"], message: "Choose two different assets" })
  .refine((v) => hasValidDecimals(v.amount, v.from), { path: ["amount"], message: "Too many decimal places" });

export const sendSchema = z
  .object({
    network: z.enum(NETWORK_IDS as [string, ...string[]]),
    amount: decimalString,
    recipient: z.string().trim().min(20).max(100),
    idempotencyKey,
  });

export const addressesSchema = z.object({
  addresses: z
    .array(
      z.object({
        network: z.enum(NETWORK_IDS as [string, ...string[]]),
        address: z.string().trim().min(20).max(100),
        derivationPath: z.string().max(40),
      }),
    )
    .length(NETWORK_IDS.length),
  replace: z.boolean().optional(),
});
