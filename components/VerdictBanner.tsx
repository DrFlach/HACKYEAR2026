// SPEC.md Result screen: "big verdict banner (green/amber/red), risk score".

import type { Verdict } from "@/lib/checks/verdict";
import { VERDICT_META } from "./status-meta";

export default function VerdictBanner({
  verdict,
  label,
  riskScore,
}: {
  verdict: Verdict;
  label: string;
  riskScore: number;
}) {
  const meta = VERDICT_META[verdict];
  const { Icon } = meta;

  return (
    <div
      className={`rounded-xl border-2 p-6 ${meta.bgClass} ${meta.borderClass}`}
      role="status"
    >
      <div className="flex flex-wrap items-center gap-4">
        <Icon className={`h-10 w-10 flex-none ${meta.textClass}`} />
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wide ${meta.textClass}`}>
            {verdict}
          </p>
          <p className="text-2xl font-semibold text-navy">{label}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Risk score
          </p>
          <p className={`text-3xl font-bold ${meta.textClass}`}>{riskScore}/100</p>
        </div>
      </div>
    </div>
  );
}
