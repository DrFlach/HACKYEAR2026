// Check #8 (SPEC.md): amount > 2x the supplier's historical average -> WARN.

import type { CheckResult, Supplier } from "./types";
import { WEIGHTS } from "./types";

export const AMOUNT_ANOMALY_CHECK_ID = "amount-anomaly";

function historicalAverage(supplier: Supplier): number | null {
  if (supplier.paymentHistory.length === 0) return null;
  const total = supplier.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  return total / supplier.paymentHistory.length;
}

/**
 * With no payment history to compare against, there is nothing anomalous
 * to detect, so this defaults to PASS -- check #4 (payment history)
 * already flags unknown suppliers on its own.
 */
export function checkAmountAnomaly(
  amount: number,
  supplier: Supplier | undefined
): CheckResult {
  const title = "Amount anomaly";
  const average = supplier ? historicalAverage(supplier) : null;

  if (average === null) {
    return {
      id: AMOUNT_ANOMALY_CHECK_ID,
      title,
      status: "PASS",
      explanation:
        "No payment history for this supplier, so there is no historical average to compare against.",
      weight: 0,
    };
  }

  const currency = supplier!.paymentHistory[0]?.currency ?? "PLN";

  if (amount > 2 * average) {
    return {
      id: AMOUNT_ANOMALY_CHECK_ID,
      title,
      status: "WARN",
      explanation: `This invoice is ${(amount / average).toFixed(
        1
      )}x the historical average payment to ${supplier!.name} (avg ${average.toFixed(
        0
      )} ${currency}).`,
      weight: WEIGHTS.amountAnomaly.warn,
    };
  }

  return {
    id: AMOUNT_ANOMALY_CHECK_ID,
    title,
    status: "PASS",
    explanation: `This invoice (${amount} ${currency}) is within the normal range for ${supplier!.name} (avg ${average.toFixed(
      0
    )} ${currency}).`,
    weight: 0,
  };
}
