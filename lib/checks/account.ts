// Check #2 (SPEC.md): account number format.
// A Polish bank account (NRB) is 26 digits. Validity is the IBAN mod-97
// checksum as if the account were prefixed with the "PL" country code —
// Poland designed the NRB so its own leading 2 check digits already equal
// the IBAN check digits for "PL" + NRB, i.e. no separate IBAN digits exist.

import type { CheckResult } from "./types";
import { WEIGHTS } from "./types";

/** Strips spaces and an optional leading "PL" so callers can pass either form. */
export function normalizeAccount(input: string): string {
  const stripped = input.replace(/\s/g, "").toUpperCase();
  return stripped.startsWith("PL") ? stripped.slice(2) : stripped;
}

// ISO 7064 MOD 97-10: letters become numbers, A=10 ... Z=35.
function letterToDigits(letter: string): string {
  return String(letter.charCodeAt(0) - 55);
}

/**
 * True if `input` normalizes to exactly 26 digits and satisfies the IBAN
 * mod-97 checksum for country code "PL".
 *
 * Algorithm (IBAN validation, not generation): move the country code and
 * check digits to the end of the BBAN, convert the letters to digits, and
 * check that the resulting number mod 97 equals 1.
 */
export function isValidPolishAccount(input: string): boolean {
  const account = normalizeAccount(input);
  if (!/^\d{26}$/.test(account)) return false;

  const checkDigits = account.slice(0, 2);
  const bban = account.slice(2);
  const rearranged =
    bban + letterToDigits("P") + letterToDigits("L") + checkDigits;

  // BigInt: the rearranged number has ~28 digits, far past Number precision.
  // (Using BigInt(97)/BigInt(1) instead of 97n/1n avoids bumping the ES target.)
  return BigInt(rearranged) % BigInt(97) === BigInt(1);
}

export const ACCOUNT_FORMAT_CHECK_ID = "account-format";

/** Wraps isValidPolishAccount as the {id, title, status, explanation, weight} shape every check returns. */
export function checkAccountFormat(account: string): CheckResult {
  const normalized = normalizeAccount(account);
  const valid = isValidPolishAccount(account);
  return {
    id: ACCOUNT_FORMAT_CHECK_ID,
    title: "Account number format",
    status: valid ? "PASS" : "FAIL",
    explanation: valid
      ? `Account PL${normalized} is 26 digits with a valid IBAN checksum.`
      : `"${account}" is not a valid Polish account number (expected 26 digits with a valid IBAN mod-97 checksum).`,
    weight: valid ? 0 : WEIGHTS.accountFormat.fail,
  };
}
