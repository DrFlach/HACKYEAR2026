// Shared types for every check function in /lib/checks.
// Each check is a pure function: given some subset of (email, invoice,
// supplier/payment-history) data, it returns one CheckResult. No I/O, no
// randomness, no reliance on the current date/time -- easy to unit test
// and easy to explain line by line.

export type CheckStatus = "PASS" | "WARN" | "FAIL" | "UNAVAILABLE";

export interface CheckResult {
  id: string;
  title: string;
  status: CheckStatus;
  explanation: string;
  /**
   * Risk points this result contributes to the 0-100 risk score (SPEC.md:
   * "risk score (sum of weights)"). 0 whenever status is PASS.
   *
   * SPEC.md does not pin down exact numbers, so these were chosen
   * deliberately (see WEIGHTS below) and documented so the team can
   * justify them to the jury:
   *   - Payment history (new account for a known supplier) is called out
   *     by SPEC.md as "the strongest signal", so it carries the most
   *     weight alongside the VAT white list (the one authoritative
   *     external source, added in a later step).
   *   - Sender domain look-alike and Reply-To mismatch are strong but
   *     slightly softer: an attacker could compromise the real mailbox
   *     and pass both, so they are corroborating rather than sole proof.
   *   - NIP/account FORMAT failures are usually typos, not fraud, so they
   *     carry less weight even though a malformed number blocks paying.
   *   - Pressure language and amount anomaly are soft, circumstantial
   *     signals -- real invoices are sometimes urgent or larger too -- so
   *     they carry the least weight.
   * The verdict itself is never purely score-driven (see SPEC.md
   * "Verdict logic"); the score is a supporting number shown in the UI.
   */
  weight: number;
}

/** Centralized weight table so every check pulls from the same numbers. */
export const WEIGHTS = {
  nipChecksum: { fail: 8 },
  accountFormat: { fail: 8 },
  paymentHistory: { warnUnknownSupplier: 10, failNewAccount: 25 },
  senderDomain: { warn: 8, fail: 20 },
  replyTo: { fail: 15, warnUnparseable: 5 },
  pressureLanguage: { warn: 5 },
  amountAnomaly: { warn: 5 },
} as const;

export interface PaymentHistoryEntry {
  date: string;
  amount: number;
  currency: string;
  account: string;
}

export interface Supplier {
  id: string;
  name: string;
  nip: string;
  knownAccounts: string[];
  domains: string[];
  verifiedPhone: string;
  paymentHistory: PaymentHistoryEntry[];
}
