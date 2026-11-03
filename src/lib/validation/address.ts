import { isAddress } from "viem";
import { Address, NETWORK } from "@scure/btc-signer";
import { base58 } from "@scure/base";
import type { NetworkId } from "@/lib/config/networks";

export function isValidEvmAddress(value: string): boolean {
  // Strict mode rejects mixed-case addresses with a wrong checksum.
  return isAddress(value, { strict: true });
}

export function isValidSolanaAddress(value: string): boolean {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) return false;
  try {
    return base58.decode(value).length === 32;
  } catch {
    return false;
  }
}

/** Accepts any valid Bitcoin mainnet destination (P2PKH, P2SH, SegWit v0, Taproot). */
export function isValidBitcoinAddress(value: string): boolean {
  try {
    Address(NETWORK).decode(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidAddress(network: NetworkId, value: string): boolean {
  const v = value.trim();
  switch (network) {
    case "ethereum":
    case "bsc":
      return isValidEvmAddress(v);
    case "solana":
      return isValidSolanaAddress(v);
    case "bitcoin":
      return isValidBitcoinAddress(v);
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  const head = address.startsWith("0x") ? chars + 2 : chars;
  return `${address.slice(0, head)}...${address.slice(-chars)}`;
}
