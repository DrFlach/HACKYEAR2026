import { describe, it, expect } from "vitest";
import { DEMO_SCENARIOS } from "./demo-scenarios";
import { findSupplierByNip } from "./suppliers";
import { runAllChecks } from "./checks/run-checks";

// End-to-end proof that the full pipeline (suppliers -> 9 checks ->
// verdict) matches SPEC.md's 3 demo scenarios exactly. If any individual
// check's behavior regresses, one of these should fail.
describe("demo scenarios match SPEC.md's expected verdicts", () => {
  it("Legit invoice -> GREEN (Safe to pay)", async () => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === "legit-invoice")!;
    const supplier = findSupplierByNip(scenario.invoice.supplierNip);
    const result = await runAllChecks(
      scenario.email,
      scenario.invoice,
      supplier,
      scenario.whitelistOptions
    );
    expect(result.verdict).toBe("GREEN");
    expect(result.verdictLabel).toBe("Safe to pay");
    expect(result.checks.every((c) => c.status === "PASS")).toBe(true);
    expect(result.riskScore).toBe(0);
  });

  it("Account change attack -> RED (Do not pay), with multiple FAILs", async () => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === "account-change-attack")!;
    const supplier = findSupplierByNip(scenario.invoice.supplierNip);
    const result = await runAllChecks(
      scenario.email,
      scenario.invoice,
      supplier,
      scenario.whitelistOptions
    );
    expect(result.verdict).toBe("RED");
    expect(result.verdictLabel).toBe("Do not pay");

    const byId = Object.fromEntries(result.checks.map((c) => [c.id, c]));
    expect(byId["payment-history"].status).toBe("FAIL"); // new account for a known supplier
    expect(byId["sender-domain"].status).toBe("FAIL"); // kowalski-hurtownia.com lookalike
    expect(byId["reply-to-mismatch"].status).toBe("FAIL"); // gmail.com Reply-To
    expect(byId["vat-whitelist"].status).toBe("FAIL"); // mule account is NIE
    expect(byId["pressure-language"].status).toBe("WARN"); // pilne / zmiana rachunku / ...
    expect(byId["amount-anomaly"].status).toBe("WARN"); // ~3x average
    expect(byId["split-payment-hint"].status).toBe("WARN"); // >15,000 PLN and not PASS
    expect(byId["nip-checksum"].status).toBe("PASS"); // NIP itself wasn't tampered with
    expect(byId["account-format"].status).toBe("PASS"); // mule account is still format-valid

    expect(result.riskScore).toBeGreaterThan(50);
  });

  it("Service outage -> AMBER (Unverified), never GREEN, with everything else clean", async () => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === "service-outage")!;
    const supplier = findSupplierByNip(scenario.invoice.supplierNip);
    const result = await runAllChecks(
      scenario.email,
      scenario.invoice,
      supplier,
      scenario.whitelistOptions
    );
    expect(result.verdict).toBe("AMBER");
    expect(result.verdict).not.toBe("GREEN");
    expect(result.verdictLabel).toMatch(/unverified/i);

    const byId = Object.fromEntries(result.checks.map((c) => [c.id, c]));
    expect(byId["vat-whitelist"].status).toBe("UNAVAILABLE");
    const others = result.checks.filter((c) => c.id !== "vat-whitelist" && c.id !== "split-payment-hint");
    expect(others.every((c) => c.status === "PASS")).toBe(true);
  });

  it("resolves a known supplier for all 3 scenarios (sanity check on seed data wiring)", () => {
    for (const scenario of DEMO_SCENARIOS) {
      expect(findSupplierByNip(scenario.invoice.supplierNip)?.name).toBe(
        "Hurtownia Kowalski sp. z o.o."
      );
    }
  });
});
