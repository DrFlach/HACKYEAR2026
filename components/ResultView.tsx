"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AuditEntry, Outcome } from "@/lib/store";
import VerdictBanner from "./VerdictBanner";
import CheckList from "./CheckList";
import EmailPreview from "./EmailPreview";
import AccountComparison from "./AccountComparison";
import ActionProtocol from "./ActionProtocol";
import OutcomeButtons from "./OutcomeButtons";

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
      <div className="p-8 text-sm text-fail">
        No check id was given. Start a new check first.
      </div>
    );
  }
  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading result…</div>;
  }
  if (fetchError) {
    return <div className="p-8 text-sm text-fail">{fetchError}</div>;
  }
  if (!result) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <VerdictBanner verdict={result.verdict} label={result.verdictLabel} riskScore={result.riskScore} />
      <CheckList checks={result.checks} />
      <EmailPreview email={result.email} />
      <AccountComparison supplier={result.supplier} invoiceAccount={result.invoice.account} />
      <ActionProtocol verdict={result.verdict} supplier={result.supplier} />
      <OutcomeButtons checkId={result.id} outcome={result.outcome} onRecorded={handleOutcomeRecorded} />
    </div>
  );
}
