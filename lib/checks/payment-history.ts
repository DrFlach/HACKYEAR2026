// Check #4 (SPEC.md): has this company paid this supplier before, and is
// the invoice's account one we've paid into before?
//   - No known supplier for this NIP -> WARN (nothing to compare against).
//   - Known supplier, but the account is new/different -> FAIL ("the
//     strongest signal" per SPEC.md: this is exactly the BEC /
//     account-change scam pattern).
//   - Known supplier, same account as before -> PASS.

import type { CheckResult, Supplier } from "./types";
import { WEIGHTS } from "./types";
import { normalizeAccount } from "./account";

export const PAYMENT_HISTORY_CHECK_ID = "payment-history";

export function checkPaymentHistory(
  supplier: Supplier | undefined,
  account: string
): CheckResult {
  const title = "Payment history";
  const normalized = normalizeAccount(account);

  if (!supplier) {
    return {
      id: PAYMENT_HISTORY_CHECK_ID,
      title,
      status: "WARN",
      explanation:
        "No payment history for a supplier with this NIP -- this would be the first payment.",
      weight: WEIGHTS.paymentHistory.warnUnknownSupplier,
    };
  }

  const isKnownAccount = supplier.knownAccounts.some(
    (known) => normalizeAccount(known) === normalized
  );

  if (isKnownAccount) {
    return {
      id: PAYMENT_HISTORY_CHECK_ID,
      title,
      status: "PASS",
      explanation: `${supplier.name} has been paid into this account before.`,
      weight: 0,
    };
  }

  return {
    id: PAYMENT_HISTORY_CHECK_ID,
    title,
    status: "FAIL",
    explanation: `${supplier.name} is a known supplier, but we have never paid into this account before. This is exactly the pattern of an account-change scam.`,
    weight: WEIGHTS.paymentHistory.failNewAccount,
  };
}
