// SPEC.md Result screen: "big verdict banner (green/amber/red), risk score".
// The first thing the room sees on the projector: icon + verdict word +
// label (never colour alone), the subject of the check, and the risk
// score drawn as a gauge that sweeps in.

import type { CSSProperties } from "react";
import type { Verdict } from "@/lib/checks/verdict";
import { VERDICT_META } from "./status-meta";
import { prettify, formatAmount } from "./typography";

const GAUGE_SIZE = 152;
const GAUGE_STROKE = 12;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function RiskGauge({ score, textClass }: { score: number; textClass: string }) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = GAUGE_CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="relative flex-none" style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}>
      <svg
        width={GAUGE_SIZE}
        height={GAUGE_SIZE}
        viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={GAUGE_RADIUS}
          fill="none"
          strokeWidth={GAUGE_STROKE}
          className="stroke-white/80"
        />
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={GAUGE_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={GAUGE_STROKE}
          strokeLinecap="round"
          strokeDasharray={GAUGE_CIRCUMFERENCE}
          className={`animate-ring-sweep ${textClass}`}
          style={
            {
              strokeDashoffset: offset,
              "--ring-circumference": `${GAUGE_CIRCUMFERENCE}`,
            } as CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="tabular-nums leading-none">
          <span className={`text-5xl font-bold tracking-tight ${textClass}`}>{clamped}</span>
          <span className="text-base font-medium text-slate-400">/100</span>
        </p>
        <p className="eyebrow mt-1.5">Risk score</p>
      </div>
    </div>
  );
}

export default function VerdictBanner({
  verdict,
  label,
  riskScore,
  supplierName,
  amount,
  currency,
  nip,
}: {
  verdict: Verdict;
  label: string;
  riskScore: number;
  supplierName?: string;
  amount?: number;
  currency?: string;
  nip?: string;
}) {
  const meta = VERDICT_META[verdict];
  const { Icon } = meta;

  return (
    <section
      role="status"
      className={`animate-scale-in relative overflow-hidden rounded-3xl border-2 bg-linear-to-br p-8 shadow-raised ${meta.gradientClass} ${meta.borderClass}`}
    >
      {/* soft decorative glow, purely visual */}
      <div
        className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl ${meta.solidClass}`}
        aria-hidden="true"
      />

      <div className="relative flex flex-wrap items-center gap-8">
        <div className="relative flex-none">
          {verdict === "RED" && (
            <span
              className={`animate-pulse-ring absolute inset-0 rounded-2xl ${meta.solidClass}`}
              aria-hidden="true"
            />
          )}
          <div
            className={`relative flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg ${meta.solidClass}`}
          >
            <Icon className="h-11 w-11" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold uppercase tracking-[0.2em] ${meta.textClass}`}>
            Verdict · {verdict}
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-navy md:text-5xl">
            {prettify(label)}
          </h1>
          {(supplierName || amount !== undefined) && (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-slate-600">
              {supplierName && <span className="font-medium text-navy">{supplierName}</span>}
              {nip && <span className="font-mono text-sm text-slate-500">NIP {nip}</span>}
              {amount !== undefined && currency && (
                <span className="rounded-full bg-white/80 px-3 py-0.5 font-semibold tabular-nums text-navy ring-1 ring-slate-200">
                  {formatAmount(amount, currency)}
                </span>
              )}
            </p>
          )}
        </div>

        <RiskGauge score={riskScore} textClass={meta.textClass} />
      </div>
    </section>
  );
}
