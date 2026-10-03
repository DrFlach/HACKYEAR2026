"use client";

// SPEC.md Screens: "1. Dashboard -- counts of checks by verdict, recent
// checks, 'New check' button, mock/live toggle for the white list."

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuditEntry } from "@/lib/store";
import type { Verdict } from "@/lib/checks/verdict";
import { VERDICT_META } from "@/components/status-meta";
import WhitelistToggle from "@/components/WhitelistToggle";

const VERDICTS: Verdict[] = ["RED", "AMBER", "GREEN"];
const RECENT_COUNT = 6;

export default function DashboardView() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/audit")
      .then((res) => res.json())
      .then((data) => setEntries(data.entries))
      .catch(() => setError("Could not load the audit store."));
  }, []);

  const counts: Record<Verdict, number> = { RED: 0, AMBER: 0, GREEN: 0 };
  for (const entry of entries ?? []) counts[entry.verdict]++;
  const recent = (entries ?? []).slice(0, RECENT_COUNT);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pre-transfer checks run so far, this session.
          </p>
        </div>
        <Link
          href="/new-check"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          New check
        </Link>
      </div>

      {error && <p className="text-sm text-fail">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total checks
          </p>
          <p className="mt-1 text-3xl font-bold text-navy">{entries?.length ?? "–"}</p>
        </div>
        {VERDICTS.map((verdict) => {
          const meta = VERDICT_META[verdict];
          const { Icon } = meta;
          return (
            <div
              key={verdict}
              className={`rounded-xl border p-4 ${meta.bgClass} ${meta.borderClass}`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`h-4 w-4 ${meta.textClass}`} />
                <p className={`text-xs font-medium uppercase tracking-wide ${meta.textClass}`}>
                  {verdict}
                </p>
              </div>
              <p className={`mt-1 text-3xl font-bold ${meta.textClass}`}>
                {entries ? counts[verdict] : "–"}
              </p>
            </div>
          );
        })}
      </div>

      <WhitelistToggle />

      <div className="rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-navy">
          Recent checks
        </h2>
        {entries === null ? (
          <p className="px-5 py-6 text-sm text-slate-500">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">
            No checks yet.{" "}
            <Link href="/new-check" className="font-medium text-accent">
              Run your first check
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((entry) => {
              const meta = VERDICT_META[entry.verdict];
              const { Icon } = meta;
              return (
                <li key={entry.id} className="flex items-center gap-3 px-5 py-3">
                  <Icon className={`h-5 w-5 flex-none ${meta.textClass}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy">
                      {entry.supplier?.name ?? entry.invoice.supplierName ?? "Unknown supplier"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()} ·{" "}
                      {entry.invoice.amount.toLocaleString()} {entry.invoice.currency}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${meta.textClass}`}>
                    {entry.verdict}
                  </span>
                  <Link
                    href={`/result?id=${entry.id}`}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    View
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
