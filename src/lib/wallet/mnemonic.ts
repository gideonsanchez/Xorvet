import { generateMnemonic as scureGenerate, validateMnemonic as scureValidate } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

export type PhraseLength = 12 | 24;

/** Generates a BIP-39 phrase from the platform CSPRNG (crypto.getRandomValues). */
export function generateMnemonic(words: PhraseLength = 12): string {
  return scureGenerate(wordlist, words === 24 ? 256 : 128);
}

/** Lowercases and collapses whitespace so pasted phrases validate predictably. */
export function normalizeMnemonic(input: string): string {
  return input.trim().toLowerCase().split(/\s+/).join(" ");
}

export function validateMnemonic(input: string): boolean {
  const phrase = normalizeMnemonic(input);
  const count = phrase.split(" ").length;
  if (count !== 12 && count !== 24) return false;
  return scureValidate(phrase, wordlist);
}

export function isBip39Word(word: string): boolean {
  return wordlist.includes(word.trim().toLowerCase());
}

/** Picks distinct 0-based word positions for the confirmation step. */
export function pickConfirmationPositions(wordCount: number, count = 3): number[] {
  const picked = new Set<number>();
  const buf = new Uint32Array(1);
  while (picked.size < Math.min(count, wordCount)) {
    crypto.getRandomValues(buf);
    picked.add(buf[0] % wordCount);
  }
  return [...picked].sort((a, b) => a - b);
}
