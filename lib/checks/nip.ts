// Check #1 (SPEC.md): NIP checksum.
// A Polish NIP is 10 digits. Weights 6,5,7,2,3,4,5,6,7 are applied to the
// first 9 digits; the sum mod 11 must equal the 10th digit.

import type { CheckResult } from "./types";
import { WEIGHTS } from "./types";

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

/** Strips spaces and dashes so callers can pass formatted or raw NIPs. */
export function normalizeNip(input: string): string {
  return input.replace(/[\s-]/g, "");
}

/** True if `input` normalizes to exactly 10 digits with a valid checksum. */
export function isValidNip(input: string): boolean {
  const nip = normalizeNip(input);
  if (!/^\d{10}$/.test(nip)) return false;

  const digits = nip.split("").map(Number);
  const sum = NIP_WEIGHTS.reduce((acc, weight, i) => acc + weight * digits[i], 0);
  const check = sum % 11;
  // A remainder of 10 has no matching single digit, so it can never be valid.
  return check !== 10 && check === digits[9];
}

export const NIP_CHECKSUM_CHECK_ID = "nip-checksum";

/** Wraps isValidNip as the {id, title, status, explanation, weight} shape every check returns. */
export function checkNipChecksum(nip: string): CheckResult {
  const normalized = normalizeNip(nip);
  const valid = isValidNip(nip);
  return {
    id: NIP_CHECKSUM_CHECK_ID,
    title: "NIP checksum",
    status: valid ? "PASS" : "FAIL",
    explanation: valid
      ? `NIP ${normalized} has a valid checksum.`
      : `"${nip}" does not have a valid NIP checksum (expected 10 digits where the weighted sum of the first 9 mod 11 equals the 10th digit).`,
    weight: valid ? 0 : WEIGHTS.nipChecksum.fail,
  };
}
