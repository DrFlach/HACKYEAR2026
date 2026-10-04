// SPEC.md Result screen: "list of checks with icons and explanations."
// Each row fades up in turn, so on a projector the evidence visibly
// "stacks up" underneath the verdict. Purely presentational: the checks
// were all computed by the server before this renders.

import type { CheckResult, CheckStatus } from "@/lib/checks/types";
import { CHECK_STATUS_META } from "./status-meta";
import { prettify } from "./typography";

/** Timing shared with ResultView so later sections can wait for the list. */
export const CHECKS_START_DELAY_MS = 350;
export const CHECKS_STEP_MS = 140;

const SUMMARY_ORDER: CheckStatus[] = ["FAIL", "WARN", "UNAVAILABLE", "PASS"];

export default function CheckList({ checks }: { checks: CheckResult[] }) {
  const counts = checks.reduce<Record<CheckStatus, number>>(
    (acc, c) => ({ ...acc, [c.status]: acc[c.status] + 1 }),
    { PASS: 0, WARN: 0, FAIL: 0, UNAVAILABLE: 0 }
  );

  return (
    <section className="card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-navy">Checks</h2>
          <p className="text-xs text-slate-500">
            {checks.length} deterministic checks · every flag has a concrete reason
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUMMARY_ORDER.filter((s) => counts[s] > 0).map((status) => {
            const meta = CHECK_STATUS_META[status];
            const { Icon } = meta;
            return (
              <span
                key={status}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bgClass} ${meta.textClass}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {counts[status]} {meta.label.toLowerCase()}
              </span>
            );
          })}
        </div>
      </header>

      <ol className="divide-y divide-slate-100">
        {checks.map((check, index) => {
          const meta = CHECK_STATUS_META[check.status];
          const { Icon } = meta;
          return (
            <li
              key={check.id}
              className="animate-fade-up relative flex gap-4 px-6 py-4"
              style={{ animationDelay: `${CHECKS_START_DELAY_MS + index * CHECKS_STEP_MS}ms` }}
            >
              {check.status !== "PASS" && (
                <span
                  className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full ${meta.solidClass}`}
                  aria-hidden="true"
                />
              )}
              <div
                className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${meta.bgClass} ${meta.textClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-navy">
                    <span className="mr-2 text-xs font-semibold tabular-nums text-slate-400">
                      {index + 1}
                    </span>
                    {check.title}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.bgClass} ${meta.textClass}`}
                  >
                    {meta.label}
                    {check.weight > 0 && (
                      <span className="tabular-nums opacity-80">· +{check.weight} pts</span>
                    )}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {prettify(check.explanation)}
                </p>
                {check.requestId && (
                  <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
                    White list request ID
                    <span className="font-mono font-medium text-navy">{check.requestId}</span>
                    <span className="text-slate-400">— proof of check</span>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
