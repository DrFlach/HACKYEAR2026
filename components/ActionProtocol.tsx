// SPEC.md Result screen: "action protocol."

import type { CSSProperties } from "react";
import type { Verdict } from "@/lib/checks/verdict";
import { getActionProtocol } from "@/lib/checks/action-protocol";
import { VERDICT_META } from "./status-meta";
import type { SupplierSummary } from "@/lib/store";
import { ShieldCheckIcon } from "./icons";
import { prettify } from "./typography";

export default function ActionProtocol({
  verdict,
  supplier,
  style,
}: {
  verdict: Verdict;
  supplier: SupplierSummary | null;
  style?: CSSProperties;
}) {
  const steps = getActionProtocol(verdict, supplier);
  const meta = VERDICT_META[verdict];

  return (
    <section
      className={`card animate-fade-up border-t-4 p-6 ${meta.topBorderClass}`}
      style={style}
    >
      <header className="flex items-center gap-2">
        <ShieldCheckIcon className={`h-5 w-5 ${meta.textClass}`} />
        <h2 className="text-base font-semibold text-navy">What to do now</h2>
      </header>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-semibold text-white ${meta.solidClass}`}
            >
              {i + 1}
            </span>
            <span className="pt-0.5 text-[15px] leading-relaxed text-navy">{prettify(step)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
