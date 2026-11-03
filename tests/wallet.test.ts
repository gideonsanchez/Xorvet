import { describe, expect, it } from "vitest";
import { deriveAddresses } from "@/lib/wallet/derive";
import { generateMnemonic, normalizeMnemonic, pickConfirmationPositions, validateMnemonic } from "@/lib/wallet/mnemonic";
import { decryptVault, encryptVault, WrongPasswordError } from "@/lib/wallet/vault";

// Standard BIP-39 test phrase. Published vectors exist for each derivation path.
const TEST_PHRASE = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

describe("mnemonic", () => {
  it("generates valid 12 and 24 word phrases", () => {
    const twelve = generateMnemonic(12);
    const twentyFour = generateMnemonic(24);
    expect(twelve.split(" ")).toHaveLength(12);
    expect(twentyFour.split(" ")).toHaveLength(24);
    expect(validateMnemonic(twelve)).toBe(true);
    expect(validateMnemonic(twentyFour)).toBe(true);
  });

  it("never repeats across generations", () => {
    const phrases = new Set(Array.from({ length: 200 }, () => generateMnemonic()));
    expect(phrases.size).toBe(200);
  });

  it("rejects a bad checksum and wrong word counts", () => {
    expect(validateMnemonic(TEST_PHRASE.replace("about", "abandon"))).toBe(false);
    expect(validateMnemonic("abandon abandon abandon")).toBe(false);
    expect(validateMnemonic("")).toBe(false);
  });

  it("normalizes spacing and case", () => {
    expect(normalizeMnemonic(`  ${TEST_PHRASE.toUpperCase().replace(/ /g, "   ")} `)).toBe(TEST_PHRASE);
    expect(validateMnemonic(TEST_PHRASE.toUpperCase())).toBe(true);
  });

  it("picks distinct confirmation positions", () => {
    const positions = pickConfirmationPositions(12, 3);
    expect(new Set(positions).size).toBe(3);
    positions.forEach((p) => expect(p).toBeGreaterThanOrEqual(0));
    positions.forEach((p) => expect(p).toBeLessThan(12));
  });
});

describe("address derivation", () => {
  const addrs = deriveAddresses(TEST_PHRASE);

  it("derives the published Ethereum address for m/44'/60'/0'/0/0", () => {
    expect(addrs.ethereum.address).toBe("0x9858EfFD232B4033E47d90003D41EC34EcaEda94");
  });

  it("uses the same EVM address on BNB Smart Chain", () => {
    expect(addrs.bsc.address).toBe(addrs.ethereum.address);
  });

  it("derives the BIP-84 test vector Bitcoin address", () => {
    expect(addrs.bitcoin.address).toBe("bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu");
  });

  it("derives the standard Solana address for m/44'/501'/0'/0'", () => {
    expect(addrs.solana.address).toBe("HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk");
  });

  it("restores identical addresses from the same phrase", () => {
    expect(deriveAddresses(TEST_PHRASE.toUpperCase())).toEqual(addrs);
  });

  it("gives different users different addresses", () => {
    const a = deriveAddresses(generateMnemonic());
    const b = deriveAddresses(generateMnemonic());
    expect(a.ethereum.address).not.toBe(b.ethereum.address);
    expect(a.solana.address).not.toBe(b.solana.address);
    expect(a.bitcoin.address).not.toBe(b.bitcoin.address);
  });
});

describe("vault", () => {
  it("round-trips and rejects a wrong password", async () => {
    const vault = await encryptVault({ mnemonic: TEST_PHRASE }, "correct horse battery");
    expect(vault.ciphertext).not.toContain("abandon");
    expect(JSON.stringify(vault)).not.toContain("abandon");
    await expect(decryptVault(vault, "correct horse battery")).resolves.toEqual({ mnemonic: TEST_PHRASE });
    await expect(decryptVault(vault, "wrong password")).rejects.toBeInstanceOf(WrongPasswordError);
  });

  it("uses a fresh salt and iv each time", async () => {
    const a = await encryptVault({ mnemonic: TEST_PHRASE }, "pw-123456");
    const b = await encryptVault({ mnemonic: TEST_PHRASE }, "pw-123456");
    expect(a.salt).not.toBe(b.salt);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });
});
