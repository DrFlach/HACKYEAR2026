// SPEC.md Result screen: "the email body with highlighted suspicious words."

import { buildHighlightSegments } from "@/lib/highlight";
import type { EmailInput } from "@/lib/checks/run-checks";

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-20 flex-none font-medium text-slate-500">{label}</span>
      <span className="text-navy">{value}</span>
    </div>
  );
}

export default function EmailPreview({ email }: { email: EmailInput }) {
  const segments = buildHighlightSegments(email.body ?? "");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-navy">Email</h2>
      <div className="mt-3 space-y-1">
        <Field label="From" value={email.from} />
        <Field label="Reply-To" value={email.replyTo} />
        <Field label="Subject" value={email.subject} />
      </div>
      {email.body && (
        <div className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          {segments.map((segment, i) =>
            segment.highlighted ? (
              <mark key={i} className="rounded bg-warn/30 px-0.5 text-navy">
                {segment.text}
              </mark>
            ) : (
              <span key={i}>{segment.text}</span>
            )
          )}
        </div>
      )}
    </div>
  );
}
