// SPEC.md "Verdict logic":
//   - Any FAIL -> RED "Do not pay".
//   - Any UNAVAILABLE on check 3 or 4 -> at least AMBER "Unverified --
//     confirm before paying". Never GREEN.
//   - Only WARNs -> AMBER "Verify before paying".
//   - All PASS -> GREEN "Safe to pay".
// The verdict is rule-driven, not score-driven (the risk score is shown
// alongside it, but never decides it).

import type { CheckResult } from "./types";
import { VAT_WHITELIST_CHECK_ID } from "./vat-whitelist";
import { PAYMENT_HISTORY_CHECK_ID } from "./payment-history";

export type Verdict = "RED" | "AMBER" | "GREEN";

export interface VerdictResult {
  verdict: Verdict;
  label: string;
}

const UNVERIFIABLE_CHECK_IDS = new Set([
  VAT_WHITELIST_CHECK_ID,
  PAYMENT_HISTORY_CHECK_ID,
]);

export function computeVerdict(checks: CheckResult[]): VerdictResult {
  if (checks.some((c) => c.status === "FAIL")) {
    return { verdict: "RED", label: "Do not pay" };
  }

  const unavailable = checks.some(
    (c) => c.status === "UNAVAILABLE" && UNVERIFIABLE_CHECK_IDS.has(c.id)
  );
  if (unavailable) {
    return { verdict: "AMBER", label: "Unverified -- confirm before paying" };
  }

  if (checks.some((c) => c.status === "WARN")) {
    return { verdict: "AMBER", label: "Verify before paying" };
  }

  return { verdict: "GREEN", label: "Safe to pay" };
}

/** Sum of every check's weight, clamped to the 0-100 scale shown in the UI. */
export function computeRiskScore(checks: CheckResult[]): number {
  const sum = checks.reduce((acc, c) => acc + c.weight, 0);
  return Math.max(0, Math.min(100, sum));
}
