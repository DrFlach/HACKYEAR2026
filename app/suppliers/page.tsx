// SPEC.md Screens: "4. Suppliers -- table of known suppliers (name, NIP,
// known accounts, domains, verified phone, payment history)."
// Static seed data -- no need to force dynamic rendering.

import { suppliers } from "@/lib/suppliers";
import { formatAccountForDisplay } from "@/lib/format";

function average(amounts: number[]): number {
  return amounts.reduce((a, b) => a + b, 0) / amounts.length;
}

export default function SuppliersPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-navy">Suppliers</h1>
        <p className="mt-1 text-sm text-slate-600">
          Known suppliers and the data checks compare new invoices against.
        </p>
      </div>

      <div className="space-y-4">
        {suppliers.map((supplier) => {
          const amounts = supplier.paymentHistory.map((p) => p.amount);
          const currency = supplier.paymentHistory[0]?.currency ?? "PLN";
          return (
            <div key={supplier.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-navy">{supplier.name}</h2>
                <span className="font-mono text-sm text-slate-500">NIP {supplier.nip}</span>
              </div>

              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Known domains
                  </dt>
                  <dd className="mt-1 text-sm text-navy">{supplier.domains.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Verified phone
                  </dt>
                  <dd className="mt-1 text-sm text-navy">{supplier.verifiedPhone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Known account(s)
                  </dt>
                  <dd className="mt-1 space-y-0.5 font-mono text-sm text-navy">
                    {supplier.knownAccounts.map((a) => (
                      <p key={a}>{formatAccountForDisplay(a)}</p>
                    ))}
                  </dd>
                </div>
              </dl>

              <details className="mt-4 rounded-lg border border-slate-200">
                <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-navy">
                  Payment history -- {supplier.paymentHistory.length} payments, avg{" "}
                  {amounts.length > 0 ? Math.round(average(amounts)).toLocaleString() : 0}{" "}
                  {currency}
                </summary>
                <table className="w-full border-t border-slate-200 text-left text-sm">
                  <thead>
                    <tr className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplier.paymentHistory.map((payment, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-slate-600">{payment.date}</td>
                        <td className="px-4 py-2 text-slate-600">
                          {payment.amount.toLocaleString()} {payment.currency}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-slate-500">
                          {formatAccountForDisplay(payment.account)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
