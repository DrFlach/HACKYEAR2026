// SPEC.md Result screen: "the email body with highlighted suspicious words."
// Styled like a mail client so it reads as "the email you received".

import type { CSSProperties } from "react";
import { buildHighlightSegments } from "@/lib/highlight";
import type { EmailInput } from "@/lib/checks/run-checks";
import { AlertTriangleIcon } from "./icons";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-16 flex-none text-slate-400">{label}</span>
      <span className="min-w-0 break-all text-navy">{value}</span>
    </div>
  );
}

export default function EmailPreview({
  email,
  style,
}: {
  email: EmailInput;
  style?: CSSProperties;
}) {
  const segments = buildHighlightSegments(email.body ?? "");
  const highlightCount = segments.filter((s) => s.highlighted).length;
  const initial = (email.from.trim()[0] ?? "?").toUpperCase();

  return (
    <section className="card animate-fade-up overflow-hidden" style={style}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-semibold text-navy">Email</h2>
        {highlightCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warn/10 px-3 py-1 text-xs font-semibold text-warn">
            <AlertTriangleIcon className="h-3.5 w-3.5" />
            {highlightCount} suspicious {highlightCount === 1 ? "phrase" : "phrases"} highlighted
          </span>
        )}
      </header>

      <div className="px-6 py-5">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-navy text-base font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {email.subject && (
              <p className="text-lg font-semibold leading-snug text-navy">{email.subject}</p>
            )}
            <Row label="From" value={email.from} />
            <Row label="Reply-To" value={email.replyTo} />
          </div>
        </div>

        {email.body && (
          <div className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-[15px] leading-7 text-slate-700 ring-1 ring-slate-100">
            {segments.map((segment, i) =>
              segment.highlighted ? (
                <mark
                  key={i}
                  className="rounded bg-warn/20 px-1 font-medium text-navy underline decoration-warn decoration-2 underline-offset-4"
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={i}>{segment.text}</span>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
