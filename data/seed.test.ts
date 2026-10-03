import { describe, it, expect } from "vitest";
import suppliers from "./suppliers.json";
import whitelistMock from "./whitelist-mock.json";
import { isValidNip } from "@/lib/checks/nip";
import { isValidPolishAccount } from "@/lib/checks/account";

// Guards the seed data itself: every fake NIP and IBAN under /data must be
// checksum-valid, or the checks that read them (#1 and #2 in SPEC.md) would
// never have anything real to pass.
describe("seed data: suppliers.json", () => {
  it("has exactly 4 suppliers", () => {
    expect(suppliers).toHaveLength(4);
  });

  it.each(suppliers)("$name: NIP $nip is checksum-valid", (supplier) => {
    expect(isValidNip(supplier.nip)).toBe(true);
  });

  it.each(suppliers)("$name: has at least one known account", (supplier) => {
    expect(supplier.knownAccounts.length).toBeGreaterThan(0);
  });

  it.each(suppliers)(
    "$name: every known account is checksum-valid",
    (supplier) => {
      for (const account of supplier.knownAccounts) {
        expect(isValidPolishAccount(account)).toBe(true);
      }
    }
  );

  it.each(suppliers)(
    "$name: has between 5 and 15 payment history entries",
    (supplier) => {
      expect(supplier.paymentHistory.length).toBeGreaterThanOrEqual(5);
      expect(supplier.paymentHistory.length).toBeLessThanOrEqual(15);
    }
  );

  it.each(suppliers)(
    "$name: every past payment used one of its known accounts",
    (supplier) => {
      for (const payment of supplier.paymentHistory) {
        expect(supplier.knownAccounts).toContain(payment.account);
      }
    }
  );
});

describe("seed data: whitelist-mock.json", () => {
  const entries = Object.values(whitelistMock.entries);

  it("has at least one entry per seeded supplier", () => {
    expect(entries.length).toBeGreaterThanOrEqual(suppliers.length);
  });

  it.each(entries)(
    "$scenario",
    (entry) => {
      expect(isValidNip(entry.nip)).toBe(true);
      expect(isValidPolishAccount(entry.account)).toBe(true);
      expect(["TAK", "NIE"]).toContain(entry.accountAssigned);
    }
  );

  it("is keyed consistently as \"{nip}_{account}\"", () => {
    for (const [key, entry] of Object.entries(whitelistMock.entries)) {
      expect(key).toBe(`${entry.nip}_${entry.account}`);
    }
  });

  it("includes the account-change-attack mule account marked NIE", () => {
    const kowalski = suppliers.find((s) => s.id === "hurtownia-kowalski")!;
    const mule = entries.find(
      (e) => e.nip === kowalski.nip && e.accountAssigned === "NIE"
    );
    expect(mule).toBeDefined();
    // The mule account must be format-valid but NOT one of Kowalski's own
    // known accounts — otherwise the attack scenario wouldn't be realistic.
    expect(kowalski.knownAccounts).not.toContain(mule?.account);
  });
});
