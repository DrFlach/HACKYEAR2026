// SPEC.md "Action protocol" -- what the Result screen tells the user to do
// next, depending on the verdict.

import type { Supplier } from "./types";
import type { Verdict } from "./verdict";

export function getActionProtocol(
  verdict: Verdict,
  supplier?: Pick<Supplier, "verifiedPhone"> | null
): string[] {
  switch (verdict) {
    case "RED":
      return [
        "Do not pay.",
        "Do not reply to this email.",
        supplier?.verifiedPhone
          ? `Call the supplier at the verified number on file (${supplier.verifiedPhone}) -- NOT the number from the email.`
          : "Call the supplier using the phone number stored in your supplier records -- NOT the number from the email.",
        "Report this to your bank and to CERT Polska (incydent.cert.pl).",
      ];
    case "AMBER":
      return [
        "Call the known contact to confirm the account.",
        "Record who confirmed it before paying.",
      ];
    case "GREEN":
      return ["Proceed with the payment.", "This check is logged."];
  }
}
