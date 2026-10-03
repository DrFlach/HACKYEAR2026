"use client";

// SPEC.md Result screen: "outcome buttons" -- "Confirmed by phone with
// known contact", "Rejected as fraud", "Paid anyway (override, reason
// required)". Persisted via PATCH /api/verify (SPEC.md: "Everything is
// stored in the Audit log").

import { useState } from "react";
import type { Outcome, OutcomeType } from "@/lib/store";

const OUTCOME_LABELS: Record<OutcomeType, string> = {
  confirmed_by_phone: "Confirmed by phone with known contact",
  rejected_as_fraud: "Rejected as fraud",
  paid_anyway: "Paid anyway (override)",
};

export default function OutcomeButtons({
  checkId,
  outcome,
  onRecorded,
}: {
  checkId: string;
  outcome: Outcome | null;
  onRecorded: (outcome: Outcome) => void;
}) {
  const [pendingReason, setPendingReason] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState<OutcomeType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function recordOutcome(type: OutcomeType, outcomeReason?: string) {
    setSubmitting(type);
    setError(null);
    try {
      const res = await fetch("/api/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: checkId, outcome: { type, reason: outcomeReason } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record the outcome.");
      onRecorded(data.outcome);
      setPendingReason(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record the outcome.");
    } finally {
      setSubmitting(null);
    }
  }

  if (outcome) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Outcome</h2>
        <p className="mt-2 text-sm text-slate-700">
          {OUTCOME_LABELS[outcome.type]}
          {outcome.reason ? ` -- "${outcome.reason}"` : ""}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Recorded {new Date(outcome.recordedAt).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-navy">Record the outcome</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting !== null}
          onClick={() => recordOutcome("confirmed_by_phone")}
          className="rounded-md bg-pass px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {OUTCOME_LABELS.confirmed_by_phone}
        </button>
        <button
          type="button"
          disabled={submitting !== null}
          onClick={() => recordOutcome("rejected_as_fraud")}
          className="rounded-md bg-fail px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {OUTCOME_LABELS.rejected_as_fraud}
        </button>
        <button
          type="button"
          disabled={submitting !== null}
          onClick={() => setPendingReason(true)}
          className="rounded-md border border-warn px-3 py-2 text-sm font-medium text-warn disabled:opacity-50"
        >
          {OUTCOME_LABELS.paid_anyway}
        </button>
      </div>

      {pendingReason && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="paid-anyway-reason">
            Reason (required to override)
          </label>
          <textarea
            id="paid-anyway-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
            placeholder="e.g. Director approved by phone despite the warning."
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={submitting !== null || reason.trim().length === 0}
              onClick={() => recordOutcome("paid_anyway", reason.trim())}
              className="rounded-md bg-warn px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Confirm override
            </button>
            <button
              type="button"
              onClick={() => setPendingReason(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-fail">{error}</p>}
    </div>
  );
}
