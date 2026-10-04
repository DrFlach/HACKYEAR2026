"use client";

// SPEC.md Result screen: "outcome buttons" -- "Confirmed by phone with
// known contact", "Rejected as fraud", "Paid anyway (override, reason
// required)". Persisted via PATCH /api/verify (SPEC.md: "Everything is
// stored in the Audit log").

import { useState, type CSSProperties } from "react";
import type { Outcome, OutcomeType } from "@/lib/store";
import { PhoneIcon, XCircleIcon, AlertTriangleIcon, CheckCircleIcon } from "./icons";

const OUTCOME_LABELS: Record<OutcomeType, string> = {
  confirmed_by_phone: "Confirmed by phone with known contact",
  rejected_as_fraud: "Rejected as fraud",
  paid_anyway: "Paid anyway (override)",
};

export default function OutcomeButtons({
  checkId,
  outcome,
  onRecorded,
  style,
}: {
  checkId: string;
  outcome: Outcome | null;
  onRecorded: (outcome: Outcome) => void;
  style?: CSSProperties;
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
      <section className="card animate-fade-in p-6" style={style}>
        <header className="flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold text-navy">Outcome recorded</h2>
        </header>
        <p className="mt-3 text-[15px] font-medium text-navy">{OUTCOME_LABELS[outcome.type]}</p>
        {outcome.reason && (
          <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-slate-600">
            “{outcome.reason}”
          </p>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Saved to the audit log · {new Date(outcome.recordedAt).toLocaleString()}
        </p>
      </section>
    );
  }

  return (
    <section className="card animate-fade-up p-6" style={style}>
      <h2 className="text-base font-semibold text-navy">Record the outcome</h2>
      <p className="mt-1 text-xs text-slate-500">Every decision is saved to the audit log.</p>
      <div className="mt-4 grid gap-2 text-left">
        <button
          type="button"
          disabled={submitting !== null}
          onClick={() => recordOutcome("confirmed_by_phone")}
          className="btn justify-start bg-pass text-white hover:brightness-95"
        >
          <PhoneIcon className="h-4 w-4" />
          {OUTCOME_LABELS.confirmed_by_phone}
        </button>
        <button
          type="button"
          disabled={submitting !== null}
          onClick={() => recordOutcome("rejected_as_fraud")}
          className="btn justify-start bg-fail text-white hover:brightness-95"
        >
          <XCircleIcon className="h-4 w-4" />
          {OUTCOME_LABELS.rejected_as_fraud}
        </button>
        <button
          type="button"
          disabled={submitting !== null}
          onClick={() => setPendingReason(true)}
          className="btn justify-start border border-warn/50 bg-white text-warn hover:bg-warn/5"
        >
          <AlertTriangleIcon className="h-4 w-4" />
          {OUTCOME_LABELS.paid_anyway}
        </button>
      </div>

      {pendingReason && (
        <div className="animate-fade-in mt-4 space-y-2 rounded-xl bg-warn/5 p-4 ring-1 ring-warn/20">
          <label className="block text-sm font-medium text-navy" htmlFor="paid-anyway-reason">
            Reason (required to override)
          </label>
          <textarea
            id="paid-anyway-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="field mt-0"
            placeholder="e.g. Director approved by phone despite the warning."
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={submitting !== null || reason.trim().length === 0}
              onClick={() => recordOutcome("paid_anyway", reason.trim())}
              className="btn bg-warn text-white hover:brightness-95"
            >
              Confirm override
            </button>
            <button
              type="button"
              onClick={() => setPendingReason(false)}
              className="btn text-slate-500 hover:text-navy"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-fail">{error}</p>}
    </section>
  );
}
