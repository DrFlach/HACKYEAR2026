import { describe, it, expect } from "vitest";
import { checkAmountAnomaly, AMOUNT_ANOMALY_CHECK_ID } from "./amount-anomaly";
import type { Supplier } from "./types";

const kowalski: Supplier = {
  id: "hurtownia-kowalski",
  name: "Hurtownia Kowalski sp. z o.o.",
  nip: "2046483277",
  knownAccounts: ["40495009592248961325478503"],
  domains: ["hurtowniakowalski.pl"],
  verifiedPhone: "+48 601 234 567",
  paymentHistory: [
    { date: "2026-01-01", amount: 4800, currency: "PLN", account: "40495009592248961325478503" },
    { date: "2026-02-01", amount: 5000, currency: "PLN", account: "40495009592248961325478503" },
    { date: "2026-03-01", amount: 5200, currency: "PLN", account: "40495009592248961325478503" },
  ],
};
// average = 5000

describe("checkAmountAnomaly", () => {
  it("PASSes for an amount close to the historical average", () => {
    const result = checkAmountAnomaly(5300, kowalski);
    expect(result.id).toBe(AMOUNT_ANOMALY_CHECK_ID);
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
  });

  it("WARNs when the amount is more than 2x the historical average (SPEC.md: 3x normal attack amount)", () => {
    const result = checkAmountAnomaly(15600, kowalski); // 3.12x average
    expect(result.status).toBe("WARN");
    expect(result.weight).toBeGreaterThan(0);
    expect(result.explanation).toMatch(/3\.1x/);
  });

  it("is exactly at the 2x boundary -> PASS (strictly greater than 2x triggers WARN)", () => {
    const result = checkAmountAnomaly(10000, kowalski); // exactly 2x
    expect(result.status).toBe("PASS");
  });

  it("PASSes with no history to compare against (unknown supplier)", () => {
    const result = checkAmountAnomaly(999999, undefined);
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
  });
});
