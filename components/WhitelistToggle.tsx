"use client";

// SPEC.md Dashboard: "mock/live toggle for the white list."
// Mock mode (default) answers check #3 from /data/whitelist-mock.json and
// always works offline. Live mode calls the real Ministry of Finance API
// (requires internet) for any check run from this point on -- except the
// 3 demo scenario buttons, which always force their own mode so the demo
// never depends on network access.

import { useEffect, useState } from "react";
import type { WhitelistMode } from "@/lib/store";

export default function WhitelistToggle() {
  const [mode, setMode] = useState<WhitelistMode | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setMode(data.whitelistMode))
      .catch(() => setError("Could not load the current setting."));
  }, []);

  async function changeMode(next: WhitelistMode) {
    if (next === mode) return;
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whitelistMode: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update the setting.");
      setMode(data.whitelistMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the setting.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-navy">VAT white list source</h2>
      <p className="mt-1 text-sm text-slate-600">
        Mock answers from seed data and always works offline. Live calls the real Ministry of
        Finance API. Demo scenario buttons always use their own fixed mode, regardless of this
        setting.
      </p>
      <div className="mt-3 inline-flex rounded-md border border-slate-300 p-0.5">
        {(["mock", "live"] as const).map((option) => (
          <button
            key={option}
            type="button"
            disabled={updating || mode === null}
            onClick={() => changeMode(option)}
            className={`rounded px-4 py-1.5 text-sm font-medium capitalize transition-colors disabled:opacity-50 ${
              mode === option ? "bg-accent text-white" : "text-navy hover:bg-slate-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-fail">{error}</p>}
    </div>
  );
}
