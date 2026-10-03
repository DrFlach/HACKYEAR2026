// Orchestrates all 9 SPEC.md checks for one invoice + email pair, then
// derives the verdict and risk score. This is the single function the
// /api/verify route (and tests) call.

import type { CheckResult, Supplier } from "./types";
import { checkNipChecksum } from "./nip";
import { checkAccountFormat } from "./account";
import { checkVatWhitelist, type VatWhitelistOptions } from "./vat-whitelist";
import { checkPaymentHistory } from "./payment-history";
import { checkSenderDomain } from "./sender-domain";
import { checkReplyToMismatch } from "./reply-to";
import { checkPressureLanguage } from "./pressure-language";
import { checkAmountAnomaly } from "./amount-anomaly";
import { checkSplitPaymentHint } from "./split-payment-hint";
import { computeVerdict, computeRiskScore, type Verdict } from "./verdict";

export interface EmailInput {
  from: string;
  replyTo?: string;
  subject?: string;
  body?: string;
}

export interface InvoiceInput {
  supplierNip: string;
  supplierName?: string;
  account: string;
  amount: number;
  currency?: string;
  dueDate?: string;
}

export interface RunChecksResult {
  checks: CheckResult[];
  verdict: Verdict;
  verdictLabel: string;
  riskScore: number;
  /** Convenience copy of check #3's requestId, if the lookup ran. */
  whitelistRequestId?: string;
}

export async function runAllChecks(
  email: EmailInput,
  invoice: InvoiceInput,
  supplier: Supplier | undefined,
  whitelistOptions: VatWhitelistOptions = {}
): Promise<RunChecksResult> {
  const whitelistResult = await checkVatWhitelist(
    invoice.supplierNip,
    invoice.account,
    whitelistOptions
  );

  // Order matches SPEC.md's numbered check list 1-9.
  const checks: CheckResult[] = [
    checkNipChecksum(invoice.supplierNip),
    checkAccountFormat(invoice.account),
    whitelistResult,
    checkPaymentHistory(supplier, invoice.account),
    checkSenderDomain(email.from, supplier),
    checkReplyToMismatch(email.from, email.replyTo),
    checkPressureLanguage(email.subject, email.body),
    checkAmountAnomaly(invoice.amount, supplier),
    checkSplitPaymentHint(invoice.amount, invoice.currency, whitelistResult.status),
  ];

  const { verdict, label } = computeVerdict(checks);
  const riskScore = computeRiskScore(checks);

  return {
    checks,
    verdict,
    verdictLabel: label,
    riskScore,
    whitelistRequestId: whitelistResult.requestId,
  };
}
