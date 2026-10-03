// SPEC.md: "Connect them through an API route /api/verify."
// POST   -> run all 9 checks for one email+invoice pair, store the result,
//           return it (New Check screen calls this on "Verify before paying").
// GET    -> fetch a previously stored result by id (Result screen loads
//           this on mount, so a direct link / page refresh still works).
// PATCH  -> record the user's outcome against a stored result (Result
//           screen's outcome buttons).

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { findSupplierByNip } from "@/lib/suppliers";
import { runAllChecks, type EmailInput, type InvoiceInput } from "@/lib/checks/run-checks";
import { addAuditEntry, getAuditEntry, setOutcome, type OutcomeType } from "@/lib/store";
import type { VatWhitelistOptions } from "@/lib/checks/vat-whitelist";

export const dynamic = "force-dynamic";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(req: NextRequest) {
  let body: {
    email?: Partial<EmailInput>;
    invoice?: Partial<InvoiceInput>;
    whitelistOptions?: VatWhitelistOptions;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const { email, invoice, whitelistOptions } = body;

  if (!email || !isNonEmptyString(email.from)) {
    return NextResponse.json({ error: "email.from is required." }, { status: 400 });
  }
  if (!invoice || !isNonEmptyString(invoice.supplierNip)) {
    return NextResponse.json({ error: "invoice.supplierNip is required." }, { status: 400 });
  }
  if (!isNonEmptyString(invoice.account)) {
    return NextResponse.json({ error: "invoice.account is required." }, { status: 400 });
  }
  if (typeof invoice.amount !== "number" || !Number.isFinite(invoice.amount)) {
    return NextResponse.json({ error: "invoice.amount must be a number." }, { status: 400 });
  }

  const emailInput: EmailInput = {
    from: email.from,
    replyTo: email.replyTo || undefined,
    subject: email.subject || undefined,
    body: email.body || undefined,
  };
  const invoiceInput: InvoiceInput = {
    supplierNip: invoice.supplierNip,
    supplierName: invoice.supplierName || undefined,
    account: invoice.account,
    amount: invoice.amount,
    currency: invoice.currency || "PLN",
    dueDate: invoice.dueDate || undefined,
  };

  const supplier = findSupplierByNip(invoiceInput.supplierNip);
  // Mock mode is ON by default per SPEC.md ("default ON for demo");
  // callers (e.g. the "Service outage" demo scenario) can override it.
  const result = await runAllChecks(emailInput, invoiceInput, supplier, {
    mock: true,
    ...whitelistOptions,
  });

  const entry = addAuditEntry({
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    email: emailInput,
    invoice: invoiceInput as InvoiceInput & { currency: string },
    supplier: supplier
      ? {
          id: supplier.id,
          name: supplier.name,
          domains: supplier.domains,
          verifiedPhone: supplier.verifiedPhone,
          knownAccounts: supplier.knownAccounts,
        }
      : null,
    checks: result.checks,
    verdict: result.verdict,
    verdictLabel: result.verdictLabel,
    riskScore: result.riskScore,
    whitelistRequestId: result.whitelistRequestId,
    outcome: null,
  });

  return NextResponse.json(entry);
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Query param 'id' is required." }, { status: 400 });
  }
  const entry = getAuditEntry(id);
  if (!entry) {
    return NextResponse.json({ error: "No check found for this id." }, { status: 404 });
  }
  return NextResponse.json(entry);
}

const VALID_OUTCOME_TYPES: OutcomeType[] = [
  "confirmed_by_phone",
  "rejected_as_fraud",
  "paid_anyway",
];

export async function PATCH(req: NextRequest) {
  let body: { id?: string; outcome?: { type?: OutcomeType; reason?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const { id, outcome } = body;
  if (!isNonEmptyString(id)) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }
  if (!outcome?.type || !VALID_OUTCOME_TYPES.includes(outcome.type)) {
    return NextResponse.json(
      { error: `outcome.type must be one of: ${VALID_OUTCOME_TYPES.join(", ")}.` },
      { status: 400 }
    );
  }
  // SPEC.md: "Paid anyway (override, reason required)".
  if (outcome.type === "paid_anyway" && !isNonEmptyString(outcome.reason)) {
    return NextResponse.json(
      { error: "A reason is required to record 'Paid anyway'." },
      { status: 400 }
    );
  }

  const entry = setOutcome(id, {
    type: outcome.type,
    reason: outcome.reason || undefined,
    recordedAt: new Date().toISOString(),
  });

  if (!entry) {
    return NextResponse.json({ error: "No check found for this id." }, { status: 404 });
  }

  return NextResponse.json(entry);
}
