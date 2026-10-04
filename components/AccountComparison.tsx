// SPEC.md Result screen: side-by-side "Known account vs. account in this invoice".
// On a mismatch, the 4-digit groups that differ from the account on file
// are highlighted, so the room can see at a glance *where* the numbers
// diverge (a red tint plus the "differs" label -- never colour alone).

import type { CSSProperties } from "react";
import { formatAccountForDisplay } from "@/lib/format";
import { normalizeAccount } from "@/lib/checks/account";
import type { SupplierSummary } from "@/lib/store";
import { CheckCircleIcon, XCircleIcon, InfoIcon, EqualIcon, NotEqualIcon } from "./icons";

function AccountGroups({
  account,
  compareTo,
}: {
  account: string;
  compareTo?: string;
}) {
  const groups = formatAccountForDisplay(account).split(" ");
  const reference = compareTo ? formatAccountForDisplay(compareTo).split(" ") : null;

  return (
    <p className="flex flex-wrap gap-1 font-mono text-base tabular-nums text-navy">
      {groups.map((group, i) => {
        const differs = reference !== null && reference[i] !== group;
        return (
          <span
            key={i}
            className={`rounded px-1 py-0.5 ${
              differs ? "bg-fail/15 text-fail ring-1 ring-fail/30" : "bg-slate-50"
            }`}
          >
            {group}
          </span>
        );
      })}
    </p>
  );
}

export default function AccountComparison({
  supplier,
  invoiceAccount,
  style,
}: {
  supplier: SupplierSummary | null;
  invoiceAccount: string;
  style?: CSSProperties;
}) {
  const invoiceNormalized = normalizeAccount(invoiceAccount);
  const isKnown =
    supplier?.knownAccounts.some((a) => normalizeAccount(a) === invoiceNormalized) ?? false;
  const hasHistory = Boolean(supplier && supplier.knownAccounts.length > 0);
  const firstKnown = hasHistory ? supplier!.knownAccounts[0] : undefined;

  const status = isKnown
    ? { text: "Matches a known account", Icon: CheckCircleIcon, cls: "bg-pass/10 text-pass" }
    : hasHistory
      ? { text: "Does NOT match the account on file", Icon: XCircleIcon, cls: "bg-fail/10 text-fail" }
      : { text: "No history to compare against", Icon: InfoIcon, cls: "bg-slate-100 text-slate-600" };
  const StatusIcon = status.Icon;

  return (
    <section className="card animate-fade-up p-6" style={style}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-navy">
          Known account vs. account in this invoice
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${status.cls}`}
        >
          <StatusIcon className="h-4 w-4" />
          {status.text}
        </span>
      </header>

      <div className="mt-5 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-slate-200 p-5">
          <p className="eyebrow">Known account on file{supplier ? ` · ${supplier.name}` : ""}</p>
          <div className="mt-3 space-y-2">
            {hasHistory ? (
              supplier!.knownAccounts.map((a) => <AccountGroups key={a} account={a} />)
            ) : (
              <p className="text-sm text-slate-500">
                {supplier ? "No accounts on file yet." : "Unknown supplier — never paid before."}
              </p>
            )}
          </div>
        </div>

        <div
          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
            isKnown ? "bg-pass/10 text-pass" : hasHistory ? "bg-fail/10 text-fail" : "bg-slate-100 text-slate-400"
          }`}
        >
          {isKnown ? (
            <EqualIcon className="h-5 w-5" />
          ) : (
            <NotEqualIcon className="h-5 w-5" />
          )}
          <span className="sr-only">{isKnown ? "equals" : "does not equal"}</span>
        </div>

        <div
          className={`rounded-xl border p-5 ${
            isKnown
              ? "border-pass/30 bg-pass/5"
              : hasHistory
                ? "border-fail/30 bg-fail/5"
                : "border-slate-200"
          }`}
        >
          <p className="eyebrow">Account in this invoice</p>
          <div className="mt-3">
            <AccountGroups
              account={invoiceAccount}
              compareTo={!isKnown && hasHistory ? firstKnown : undefined}
            />
          </div>
          {!isKnown && hasHistory && (
            <p className="mt-3 text-xs font-medium text-fail">
              Highlighted groups differ from the account on file.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
