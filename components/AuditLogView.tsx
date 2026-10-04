"use client";

// SPEC.md Screens: "5. Audit log -- table of all checks with timestamp,
// verdict, outcome, white list requestId."

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuditEntry } from "@/lib/store";
import { VERDICT_META } from "@/components/status-meta";

const OUTCOME_LABELS: Record<string, string> = {
  confirmed_by_phone: "Confirmed by phone",
  rejected_as_fraud: "Rejected as fraud",
  paid_anyway: "Paid anyway (override)",
};

export default function AuditLogView() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/audit")
      .then((res) => res.json())
      .then((data) => setEntries(data.entries))
      .catch(() => setError("Could not load the audit log."));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-navy">Audit log</h1>
        <p className="mt-1 text-sm text-slate-600">
          Every check run this session, and the outcome recorded for it.
        </p>
      </div>

      {error && <p className="text-sm text-fail">{error}</p>}

      <div className="overflow-x-auto card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Verdict</th>
              <th className="px-4 py-3">Risk score</th>
              <th className="px-4 py-3">Outcome</th>
              <th className="px-4 py-3">White list request ID</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries === null ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No checks yet.{" "}
                  <Link href="/new-check" className="font-medium text-accent">
                    Run your first check
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const meta = VERDICT_META[entry.verdict];
                return (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">
                        {entry.supplier?.name ?? entry.invoice.supplierName ?? "Unknown supplier"}
                      </p>
                      <p className="text-xs text-slate-400">NIP {entry.invoice.supplierNip}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.bgClass} ${meta.textClass}`}
                      >
                        {entry.verdict}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{entry.riskScore}/100</td>
                    <td className="px-4 py-3 text-slate-600">
                      {entry.outcome ? (
                        <>
                          {OUTCOME_LABELS[entry.outcome.type] ?? entry.outcome.type}
                          {entry.outcome.reason && (
                            <span className="block text-xs text-slate-400">
                              &quot;{entry.outcome.reason}&quot;
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">Not recorded</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {entry.whitelistRequestId ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/result?id=${entry.id}`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
