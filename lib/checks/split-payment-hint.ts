// Check #9 (SPEC.md): split payment hint.
// amount > 15,000 PLN AND the white list check did not PASS -> extra WARN
// explaining the tax consequences of paying a non-confirmed account.

import type { CheckResult, CheckStatus } from "./types";
import { WEIGHTS } from "./types";

export const SPLIT_PAYMENT_HINT_CHECK_ID = "split-payment-hint";

const SPLIT_PAYMENT_THRESHOLD_PLN = 15000;

export function checkSplitPaymentHint(
  amount: number,
  currency: string | undefined,
  whitelistStatus: CheckStatus
): CheckResult {
  const title = "Split payment hint";
  const isPln = !currency || currency.toUpperCase() === "PLN";
  const triggered =
    isPln && amount > SPLIT_PAYMENT_THRESHOLD_PLN && whitelistStatus !== "PASS";

  if (!triggered) {
    return {
      id: SPLIT_PAYMENT_HINT_CHECK_ID,
      title,
      status: "PASS",
      explanation:
        "No extra tax exposure: either the amount is 15,000 PLN or under, or the account is confirmed on the white list.",
      weight: 0,
    };
  }

  return {
    id: SPLIT_PAYMENT_HINT_CHECK_ID,
    title,
    status: "WARN",
    explanation:
      "This payment is over 15,000 PLN and the account is not confirmed on the VAT white list. Paying a non-listed account above this threshold means you may lose the right to deduct the expense and risk joint-and-several VAT liability with the supplier.",
    weight: WEIGHTS.splitPaymentHint.warn,
  };
}
