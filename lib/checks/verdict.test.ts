import { describe, it, expect } from "vitest";
import { computeVerdict, computeRiskScore } from "./verdict";
import type { CheckResult } from "./types";

function result(partial: Partial<CheckResult> & Pick<CheckResult, "id" | "status">): CheckResult {
  return { title: partial.id, explanation: "", weight: 0, ...partial };
}

describe("computeVerdict", () => {
  it("is GREEN when every check PASSes", () => {
    const checks = [result({ id: "a", status: "PASS" }), result({ id: "b", status: "PASS" })];
    expect(computeVerdict(checks)).toEqual({ verdict: "GREEN", label: "Safe to pay" });
  });

  it("is AMBER when there is only a WARN", () => {
    const checks = [result({ id: "a", status: "PASS" }), result({ id: "pressure-language", status: "WARN" })];
    const { verdict } = computeVerdict(checks);
    expect(verdict).toBe("AMBER");
  });

  it("is RED when any check FAILs, even alongside WARNs", () => {
    const checks = [
      result({ id: "pressure-language", status: "WARN" }),
      result({ id: "reply-to-mismatch", status: "FAIL" }),
    ];
    expect(computeVerdict(checks)).toEqual({ verdict: "RED", label: "Do not pay" });
  });

  it("is AMBER (never GREEN) when the VAT white list is UNAVAILABLE, with no other issues", () => {
    const checks = [
      result({ id: "nip-checksum", status: "PASS" }),
      result({ id: "vat-whitelist", status: "UNAVAILABLE" }),
    ];
    const { verdict } = computeVerdict(checks);
    expect(verdict).toBe("AMBER");
    expect(verdict).not.toBe("GREEN");
  });

  it("is AMBER when payment history is UNAVAILABLE", () => {
    const checks = [result({ id: "payment-history", status: "UNAVAILABLE" })];
    expect(computeVerdict(checks).verdict).toBe("AMBER");
  });

  it("UNAVAILABLE on an unrelated check does not by itself force AMBER over a clean score", () => {
    // Only checks #3 and #4 are wired to force AMBER on UNAVAILABLE; no
    // other check in this codebase currently returns UNAVAILABLE, but the
    // rule should stay scoped to those two ids.
    const checks = [
      result({ id: "nip-checksum", status: "PASS" }),
      result({ id: "some-other-check", status: "UNAVAILABLE" }),
    ];
    expect(computeVerdict(checks).verdict).toBe("GREEN");
  });

  it("FAIL always wins over UNAVAILABLE", () => {
    const checks = [
      result({ id: "vat-whitelist", status: "UNAVAILABLE" }),
      result({ id: "reply-to-mismatch", status: "FAIL" }),
    ];
    expect(computeVerdict(checks).verdict).toBe("RED");
  });
});

describe("computeRiskScore", () => {
  it("sums the weights of every check", () => {
    const checks = [result({ id: "a", status: "FAIL", weight: 20 }), result({ id: "b", status: "WARN", weight: 5 })];
    expect(computeRiskScore(checks)).toBe(25);
  });

  it("clamps at 100", () => {
    const checks = [result({ id: "a", status: "FAIL", weight: 80 }), result({ id: "b", status: "FAIL", weight: 80 })];
    expect(computeRiskScore(checks)).toBe(100);
  });

  it("is 0 when every check PASSes", () => {
    const checks = [result({ id: "a", status: "PASS", weight: 0 })];
    expect(computeRiskScore(checks)).toBe(0);
  });
});
