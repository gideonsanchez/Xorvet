/**
 * Encrypted local vault for the recovery phrase.
 *
 * PBKDF2-SHA256 (600,000 iterations, OWASP 2023 guidance) derives an AES-256-GCM key
 * from a wallet password the user chooses. Only ciphertext is persisted, in IndexedDB.
 * This reduces risk but does not remove it: malware or a malicious extension running
 * in the browser while the wallet is unlocked can still read secrets.
 */
import { get, set, del } from "idb-keyval";
import { base64 } from "@scure/base";

export const PBKDF2_ITERATIONS = 600_000;
const VAULT_VERSION = 1;

export type EncryptedVault = {
  v: typeof VAULT_VERSION;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  createdAt: string;
};

export type VaultSecret = { mnemonic: string };

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptVault(secret: VaultSecret, password: string): Promise<EncryptedVault> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  const plaintext = new TextEncoder().encode(JSON.stringify(secret));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  plaintext.fill(0);
  return {
    v: VAULT_VERSION,
    kdf: "PBKDF2-SHA256",
    iterations: PBKDF2_ITERATIONS,
    salt: base64.encode(salt),
    iv: base64.encode(iv),
    ciphertext: base64.encode(ciphertext),
    createdAt: new Date().toISOString(),
  };
}

export class WrongPasswordError extends Error {
  constructor() {
    super("Incorrect wallet password");
  }
}

export async function decryptVault(vault: EncryptedVault, password: string): Promise<VaultSecret> {
  const key = await deriveKey(password, base64.decode(vault.salt), vault.iterations);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64.decode(vault.iv) as BufferSource },
      key,
      base64.decode(vault.ciphertext) as BufferSource,
    );
  } catch {
    throw new WrongPasswordError();
  }
  return JSON.parse(new TextDecoder().decode(plaintext)) as VaultSecret;
}

// Vaults are scoped per signed-in user so two accounts on one browser never share a wallet.
const storageKey = (userId: string) => `xorvet:vault:${userId}`;

export async function loadVault(userId: string): Promise<EncryptedVault | undefined> {
  return get<EncryptedVault>(storageKey(userId));
}

export async function saveVault(userId: string, vault: EncryptedVault): Promise<void> {
  await set(storageKey(userId), vault);
}

export async function deleteVault(userId: string): Promise<void> {
  await del(storageKey(userId));
}
