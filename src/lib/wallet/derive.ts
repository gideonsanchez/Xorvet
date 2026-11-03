import { mnemonicToSeedSync } from "@scure/bip39";
import { HDKey } from "@scure/bip32";
import { HDKey as Ed25519HDKey } from "micro-ed25519-hdkey";
import { p2wpkh, NETWORK } from "@scure/btc-signer";
import { base58 } from "@scure/base";
import { mnemonicToAccount } from "viem/accounts";
import { NETWORKS, type NetworkId } from "@/lib/config/networks";
import { normalizeMnemonic, validateMnemonic } from "./mnemonic";

export type DerivedAddress = { network: NetworkId; address: string; derivationPath: string };
export type DerivedAddresses = Record<NetworkId, DerivedAddress>;

/**
 * Derives the public receiving address for every supported mainnet.
 * Each network uses its own standard path; they are not interchangeable.
 */
export function deriveAddresses(mnemonic: string): DerivedAddresses {
  if (!validateMnemonic(mnemonic)) throw new Error("Invalid recovery phrase");
  const phrase = normalizeMnemonic(mnemonic);
  const seed = mnemonicToSeedSync(phrase);

  // Ethereum and BNB Smart Chain share the BIP-44 coin type 60 address.
  const evm = mnemonicToAccount(phrase, { path: NETWORKS.ethereum.derivationPath as `m/44'/60'/${string}` });

  // Solana: SLIP-0010 ed25519, fully hardened path.
  const solKey = Ed25519HDKey.fromMasterSeed(seed).derive(NETWORKS.solana.derivationPath);
  const solAddress = base58.encode(solKey.publicKeyRaw);

  // Bitcoin: BIP-84 native SegWit on mainnet.
  const btcKey = HDKey.fromMasterSeed(seed).derive(NETWORKS.bitcoin.derivationPath);
  if (!btcKey.publicKey) throw new Error("Bitcoin key derivation failed");
  const btcAddress = p2wpkh(btcKey.publicKey, NETWORK).address;
  if (!btcAddress) throw new Error("Bitcoin address derivation failed");

  seed.fill(0);

  return {
    ethereum: { network: "ethereum", address: evm.address, derivationPath: NETWORKS.ethereum.derivationPath },
    bsc: { network: "bsc", address: evm.address, derivationPath: NETWORKS.bsc.derivationPath },
    solana: { network: "solana", address: solAddress, derivationPath: NETWORKS.solana.derivationPath },
    bitcoin: { network: "bitcoin", address: btcAddress, derivationPath: NETWORKS.bitcoin.derivationPath },
  };
}
