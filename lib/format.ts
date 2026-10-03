// Formats a Polish account number for display, grouped in 4-character
// blocks with the "PL" prefix (e.g. "PL40 4950 0959 2248 9613 2547 8503"),
// the conventional way banks print IBANs.

import { normalizeAccount } from "./checks/account";

export function formatAccountForDisplay(raw: string): string {
  const digits = normalizeAccount(raw);
  const full = `PL${digits}`;
  return full.match(/.{1,4}/g)?.join(" ") ?? full;
}
