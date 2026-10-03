import { describe, it, expect } from "vitest";
import {
  checkPaymentHistory,
  PAYMENT_HISTORY_CHECK_ID,
} from "./payment-history";
import type { Supplier } from "./types";

const kowalski: Supplier = {
  id: "hurtownia-kowalski",
  name: "Hurtownia Kowalski sp. z o.o.",
  nip: "2046483277",
  knownAccounts: ["40495009592248961325478503"],
  domains: ["hurtowniakowalski.pl"],
  verifiedPhone: "+48 601 234 567",
  paymentHistory: [
    { date: "2026-01-01", amount: 5000, currency: "PLN", account: "40495009592248961325478503" },
  ],
};

describe("checkPaymentHistory", () => {
  it("PASSes when the account was used before", () => {
    const result = checkPaymentHistory(
      kowalski,
      "40495009592248961325478503"
    );
    expect(result.id).toBe(PAYMENT_HISTORY_CHECK_ID);
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
  });

  it("PASSes when the account is passed with a PL prefix and spaces", () => {
    const result = checkPaymentHistory(
      kowalski,
      "PL40 4950 0959 2248 9613 2547 8503"
    );
    expect(result.status).toBe("PASS");
  });

  it("FAILs with the highest weight when a known supplier gets a brand-new account (SPEC.md: strongest signal)", () => {
    const result = checkPaymentHistory(
      kowalski,
      "69244915051998392161174484"
    );
    expect(result.status).toBe("FAIL");
    expect(result.weight).toBeGreaterThan(0);
  });

  it("WARNs when the supplier (NIP) is not known at all", () => {
    const result = checkPaymentHistory(undefined, "69244915051998392161174484");
    expect(result.status).toBe("WARN");
  });

  it("weighs a new account for a known supplier more than an unknown supplier", () => {
    const newAccountResult = checkPaymentHistory(kowalski, "69244915051998392161174484");
    const unknownSupplierResult = checkPaymentHistory(undefined, "69244915051998392161174484");
    expect(newAccountResult.weight).toBeGreaterThan(unknownSupplierResult.weight);
  });
});
