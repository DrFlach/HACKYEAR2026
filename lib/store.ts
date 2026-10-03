// The mutable "in-memory store" from SPEC.md: every check that has been
// run, plus the outcome the user recorded for it. A plain module-level
// array -- it resets whenever the server process restarts, which is fine
// for a demo/no-database tool. /api/verify is the reader/writer; the
// Dashboard and Audit log screens read it directly (same process, so no
// extra API route is needed for that).

import type { CheckResult, Supplier } from "./checks/types";
import type { Verdict } from "./checks/verdict";
import type { EmailInput, InvoiceInput } from "./checks/run-checks";

export type OutcomeType = "confirmed_by_phone" | "rejected_as_fraud" | "paid_anyway";

export interface Outcome {
  type: OutcomeType;
  /** Required for "paid_anyway" (SPEC.md: "override, reason required"); optional note for the others. */
  reason?: string;
  recordedAt: string;
}

/** Trimmed-down supplier snapshot stored on the entry, so later reads don't need a fresh lookup. */
export type SupplierSummary = Pick<
  Supplier,
  "id" | "name" | "domains" | "verifiedPhone" | "knownAccounts"
>;

export interface AuditEntry {
  id: string;
  timestamp: string;
  email: EmailInput;
  invoice: InvoiceInput & { currency: string };
  supplier: SupplierSummary | null;
  checks: CheckResult[];
  verdict: Verdict;
  verdictLabel: string;
  riskScore: number;
  whitelistRequestId?: string;
  outcome: Outcome | null;
}

const entries: AuditEntry[] = [];

export function addAuditEntry(entry: AuditEntry): AuditEntry {
  entries.push(entry);
  return entry;
}

export function getAuditEntry(id: string): AuditEntry | undefined {
  return entries.find((e) => e.id === id);
}

export function setOutcome(id: string, outcome: Outcome): AuditEntry | undefined {
  const entry = getAuditEntry(id);
  if (!entry) return undefined;
  entry.outcome = outcome;
  return entry;
}

/** Newest first -- used by the Dashboard/Audit log screens. */
export function listAuditEntries(): AuditEntry[] {
  return [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// Dashboard's mock/live toggle for the white list (SPEC.md Screens: "1.
// Dashboard -- ... mock/live toggle for the white list"). Another bit of
// process-lifetime in-memory state, same as `entries` above. Manual "New
// check" submissions default to whatever this is set to; the 3 demo
// scenarios always force their own mode (mock, or forced-unavailable for
// "Service outage") so they keep working offline regardless of this toggle.
export type WhitelistMode = "mock" | "live";

let whitelistMode: WhitelistMode = "mock";

export function getWhitelistMode(): WhitelistMode {
  return whitelistMode;
}

export function setWhitelistMode(mode: WhitelistMode): WhitelistMode {
  whitelistMode = mode;
  return whitelistMode;
}
