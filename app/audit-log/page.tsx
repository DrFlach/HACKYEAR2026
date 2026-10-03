// Audit log — table of all checks with timestamp, verdict, outcome, white
// list requestId. Implemented in a later step.
export default function AuditLogPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-navy">Audit log</h1>
      <p className="mt-2 text-sm text-slate-600">
        A record of every check and outcome will appear here.
      </p>
    </div>
  );
}
