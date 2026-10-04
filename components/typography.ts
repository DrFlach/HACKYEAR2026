// Display-only text helpers. The check logic in /lib writes plain ASCII
// (e.g. "Unverified -- confirm before paying"); on screen -- especially
// on a projector -- those read better with proper typography. Nothing
// here changes what the checks decide.

/** Turns ASCII " -- " into a real em dash. */
export function prettify(text: string): string {
  return text.replace(/\s--\s/g, " — ");
}

/** "15,600.00 PLN" -- fixed locale so the demo looks the same on every laptop. */
export function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}
