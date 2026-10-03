// SPEC.md Result screen: "action protocol."

import type { Verdict } from "@/lib/checks/verdict";
import { getActionProtocol } from "@/lib/checks/action-protocol";
import { VERDICT_META } from "./status-meta";
import type { SupplierSummary } from "@/lib/store";

export default function ActionProtocol({
  verdict,
  supplier,
}: {
  verdict: Verdict;
  supplier: SupplierSummary | null;
}) {
  const steps = getActionProtocol(verdict, supplier);
  const meta = VERDICT_META[verdict];

  return (
    <div className={`rounded-xl border-l-4 bg-white p-5 ${meta.borderClass} border border-slate-200`}>
      <h2 className="text-sm font-semibold text-navy">What to do now</h2>
      <ol className="mt-3 space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-slate-700">
            <span className={`flex-none font-semibold ${meta.textClass}`}>{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
