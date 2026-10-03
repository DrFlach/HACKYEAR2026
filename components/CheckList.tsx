// SPEC.md Result screen: "list of checks with icons and explanations."

import type { CheckResult } from "@/lib/checks/types";
import { CHECK_STATUS_META } from "./status-meta";

export default function CheckList({ checks }: { checks: CheckResult[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-navy">
        Checks
      </h2>
      <ul className="divide-y divide-slate-100">
        {checks.map((check) => {
          const meta = CHECK_STATUS_META[check.status];
          const { Icon } = meta;
          return (
            <li key={check.id} className="flex gap-3 px-5 py-4">
              <Icon className={`mt-0.5 h-5 w-5 flex-none ${meta.textClass}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-navy">{check.title}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.bgClass} ${meta.textClass}`}
                  >
                    {meta.label}
                    {check.weight > 0 ? ` · +${check.weight} pts` : ""}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{check.explanation}</p>
                {check.requestId && (
                  <p className="mt-1 text-xs text-slate-400">
                    White list request ID (proof of check): {check.requestId}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
