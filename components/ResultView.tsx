"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AuditEntry, Outcome } from "@/lib/store";
import VerdictBanner from "./VerdictBanner";
import CheckList, { CHECKS_START_DELAY_MS, CHECKS_STEP_MS } from "./CheckList";
import EmailPreview from "./EmailPreview";
import AccountComparison from "./AccountComparison";
import ActionProtocol from "./ActionProtocol";
import OutcomeButtons from "./OutcomeButtons";
import { ArrowRightIcon, ClockIcon } from "./icons";

export default function ResultView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [result, setResult] = useState<AuditEntry | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    // No id: nothing to fetch. Handled as a render branch below, not here,
    // so this effect never calls setState outside of the async fetch flow.
    if (!id) return;
    const checkId = id; // narrow once; TS doesn't narrow `id` inside the nested closure below.

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/verify?id=${encodeURIComponent(checkId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load this check.");
        if (!cancelled) setResult(data as AuditEntry);
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : "Could not load this check.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleOutcomeRecorded(outcome: Outcome) {
    setResult((prev) => (prev ? { ...prev, outcome } : prev));
  }

  if (!id) {
    return (
      <StateCard tone="error">No check id was given. Start a new check first.</StateCard>
    );
  }
  if (loading) {
    return <ResultSkeleton />;
  }
  if (fetchError) {
    return <StateCard tone="error">{fetchError}</StateCard>;
  }
  if (!result) {
    return null;
  }

  // Choreography for the projector: verdict first, then the checks stack
  // up one by one, then what to do about it, then the supporting detail.
  const afterChecks = CHECKS_START_DELAY_MS + result.checks.length * CHECKS_STEP_MS;
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-10">
      <div className="animate-fade-in flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Pre-transfer check · Result</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500">
            <ClockIcon className="h-4 w-4" />
            Checked {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
        <Link href="/new-check" className="btn btn-secondary">
          New check
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <VerdictBanner
        verdict={result.verdict}
        label={result.verdictLabel}
        riskScore={result.riskScore}
        supplierName={result.supplier?.name ?? result.invoice.supplierName}
        nip={result.invoice.supplierNip}
        amount={result.invoice.amount}
        currency={result.invoice.currency}
      />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CheckList checks={result.checks} />
        </div>
        <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-2">
          <ActionProtocol
            verdict={result.verdict}
            supplier={result.supplier}
            style={delay(afterChecks)}
          />
          <OutcomeButtons
            checkId={result.id}
            outcome={result.outcome}
            onRecorded={handleOutcomeRecorded}
            style={delay(afterChecks + 150)}
          />
        </div>
      </div>

      <AccountComparison
        supplier={result.supplier}
        invoiceAccount={result.invoice.account}
        style={delay(afterChecks + 300)}
      />
      <EmailPreview email={result.email} style={delay(afterChecks + 450)} />
    </div>
  );
}

function StateCard({ tone, children }: { tone: "error"; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className={`card p-6 text-sm ${tone === "error" ? "text-fail" : "text-slate-600"}`}>
        {children}
      </div>
    </div>
  );
}

/** Shown while the result loads -- keeps the layout steady instead of a bare "Loading…". */
function ResultSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 lg:px-10" aria-busy="true">
      <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
        <span className="animate-spin-slow h-4 w-4 rounded-full border-2 border-slate-300 border-t-accent" />
        Loading result…
      </p>
      <div className="card flex items-center gap-8 p-8">
        <div className="skeleton h-20 w-20 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-10 w-2/3" />
        </div>
        <div className="skeleton h-32 w-32 rounded-full" />
      </div>
      <div className="card space-y-4 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
