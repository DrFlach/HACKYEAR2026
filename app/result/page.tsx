// SPEC.md Screens: "3. Result".
import { Suspense } from "react";
import ResultView from "@/components/ResultView";

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading result…</div>}>
      <ResultView />
    </Suspense>
  );
}
