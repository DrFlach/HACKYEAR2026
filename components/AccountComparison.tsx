// SPEC.md Result screen: side-by-side "Known account vs. account in this invoice".

import { formatAccountForDisplay } from "@/lib/format";
import { normalizeAccount } from "@/lib/checks/account";
import type { SupplierSummary } from "@/lib/store";

export default function AccountComparison({
  supplier,
  invoiceAccount,
}: {
  supplier: SupplierSummary | null;
  invoiceAccount: string;
}) {
  const invoiceNormalized = normalizeAccount(invoiceAccount);
  const isKnown =
    supplier?.knownAccounts.some((a) => normalizeAccount(a) === invoiceNormalized) ?? false;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-navy">Known account vs. account in this invoice</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Known account(s) on file
          </p>
          {supplier && supplier.knownAccounts.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-navy">
              {supplier.knownAccounts.map((a) => (
                <li key={a} className="font-mono">
                  {formatAccountForDisplay(a)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              {supplier ? "No accounts on file yet." : "Unknown supplier -- no history to compare against."}
            </p>
          )}
        </div>
        <div
          className={`rounded-lg border p-4 ${
            isKnown ? "border-pass/30 bg-pass/5" : "border-fail/30 bg-fail/5"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Account in this invoice
          </p>
          <p className="mt-2 font-mono text-sm text-navy">
            {formatAccountForDisplay(invoiceAccount)}
          </p>
          <p className={`mt-2 text-sm font-medium ${isKnown ? "text-pass" : "text-fail"}`}>
            {isKnown
              ? "Matches a known account."
              : supplier
                ? "Does NOT match any known account for this supplier."
                : "No history to compare against (unknown supplier)."}
          </p>
        </div>
      </div>
    </div>
  );
}
