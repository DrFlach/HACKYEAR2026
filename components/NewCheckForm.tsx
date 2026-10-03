"use client";

// SPEC.md New check screen: "form + 3 demo scenario buttons."

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_SCENARIOS } from "@/lib/demo-scenarios";
import { extractNip, extractAccount } from "@/lib/email-parsing";
import type { VatWhitelistOptions } from "@/lib/checks/vat-whitelist";

const DEFAULT_WHITELIST_OPTIONS: VatWhitelistOptions = { mock: true };

export default function NewCheckForm() {
  const router = useRouter();

  const [emailFrom, setEmailFrom] = useState("");
  const [emailReplyTo, setEmailReplyTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [supplierNip, setSupplierNip] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("PLN");
  const [dueDate, setDueDate] = useState("");

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [whitelistOptions, setWhitelistOptions] = useState<VatWhitelistOptions>(
    DEFAULT_WHITELIST_OPTIONS
  );
  const [extractMessage, setExtractMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Any manual edit after loading a demo scenario should go back to default (mock) white list behavior. */
  function clearScenario() {
    if (activeScenarioId !== null) {
      setActiveScenarioId(null);
      setWhitelistOptions(DEFAULT_WHITELIST_OPTIONS);
    }
  }

  function loadScenario(id: string) {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === id);
    if (!scenario) return;
    setEmailFrom(scenario.email.from);
    setEmailReplyTo(scenario.email.replyTo ?? "");
    setEmailSubject(scenario.email.subject ?? "");
    setEmailBody(scenario.email.body ?? "");
    setSupplierNip(scenario.invoice.supplierNip);
    setSupplierName(scenario.invoice.supplierName ?? "");
    setAccount(scenario.invoice.account);
    setAmount(String(scenario.invoice.amount));
    setCurrency(scenario.invoice.currency ?? "PLN");
    setDueDate(scenario.invoice.dueDate ?? "");
    setActiveScenarioId(id);
    setWhitelistOptions(scenario.whitelistOptions);
    setExtractMessage(null);
    setError(null);
  }

  function handleAutoExtract() {
    const foundNip = extractNip(emailBody);
    const foundAccount = extractAccount(emailBody);
    if (foundNip) setSupplierNip(foundNip);
    if (foundAccount) setAccount(foundAccount);
    if (!foundNip && !foundAccount) {
      setExtractMessage("No 10-digit NIP or 26-digit account number found in the email body.");
    } else {
      setExtractMessage(
        `Found ${foundNip ? `NIP ${foundNip}` : "no NIP"} and ${
          foundAccount ? `account ${foundAccount}` : "no account number"
        } in the email body.`
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!emailFrom.trim()) return setError("From address is required.");
    if (!supplierNip.trim()) return setError("Supplier NIP is required.");
    if (!account.trim()) return setError("Bank account is required.");
    if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return setError("Amount must be a positive number.");
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: {
            from: emailFrom.trim(),
            replyTo: emailReplyTo.trim() || undefined,
            subject: emailSubject.trim() || undefined,
            body: emailBody.trim() || undefined,
          },
          invoice: {
            supplierNip: supplierNip.trim(),
            supplierName: supplierName.trim() || undefined,
            account: account.trim(),
            amount: parsedAmount,
            currency: currency.trim() || "PLN",
            dueDate: dueDate || undefined,
          },
          whitelistOptions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");
      router.push(`/result?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">New check</h1>
        <p className="mt-1 text-sm text-slate-600">
          Paste the email and invoice details below, or load a demo scenario.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Demo scenarios</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => loadScenario(scenario.id)}
              title={scenario.description}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                activeScenarioId === scenario.id
                  ? "border-accent bg-accent text-white"
                  : "border-slate-300 text-navy hover:bg-slate-50"
              }`}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-navy">Email</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">From *</span>
              <input
                type="text"
                value={emailFrom}
                onChange={(e) => {
                  setEmailFrom(e.target.value);
                  clearScenario();
                }}
                placeholder="biuro@supplier.pl"
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Reply-To</span>
              <input
                type="text"
                value={emailReplyTo}
                onChange={(e) => {
                  setEmailReplyTo(e.target.value);
                  clearScenario();
                }}
                placeholder="(optional)"
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
              />
            </label>
          </div>
          <label className="mt-4 block text-sm">
            <span className="font-medium text-slate-700">Subject</span>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => {
                setEmailSubject(e.target.value);
                clearScenario();
              }}
              className="mt-1 w-full rounded-md border border-slate-300 p-2"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-medium text-slate-700">Body</span>
            <textarea
              value={emailBody}
              onChange={(e) => {
                setEmailBody(e.target.value);
                clearScenario();
              }}
              rows={6}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 font-mono text-sm"
              placeholder="Paste the email body here. You can also paste the raw email including the account number -- Auto-extract below will pull out the NIP and account number for you."
            />
          </label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleAutoExtract}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-navy hover:bg-slate-50"
            >
              Auto-extract NIP &amp; account from body
            </button>
            {extractMessage && <span className="text-xs text-slate-500">{extractMessage}</span>}
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
          <legend className="px-1 text-sm font-semibold text-navy">Invoice</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Supplier NIP *</span>
              <input
                type="text"
                value={supplierNip}
                onChange={(e) => {
                  setSupplierNip(e.target.value);
                  clearScenario();
                }}
                placeholder="10 digits"
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Supplier name</span>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => {
                  setSupplierName(e.target.value);
                  clearScenario();
                }}
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">Bank account (IBAN/NRB) *</span>
              <input
                type="text"
                value={account}
                onChange={(e) => {
                  setAccount(e.target.value);
                  clearScenario();
                }}
                placeholder="26 digits, optional PL prefix"
                className="mt-1 w-full rounded-md border border-slate-300 p-2 font-mono"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Amount *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  clearScenario();
                }}
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Currency</span>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  clearScenario();
                }}
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
              >
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  clearScenario();
                }}
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
              />
            </label>
          </div>
        </fieldset>

        {error && <p className="text-sm text-fail">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Checking…" : "Verify before paying"}
        </button>
      </form>
    </div>
  );
}
