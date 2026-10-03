// Dashboard — counts of checks by verdict, recent checks, "New check" entry
// point, mock/live toggle for the white list. Implemented in a later step.
export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">
        Verdict counts and recent checks will appear here.
      </p>
    </div>
  );
}
