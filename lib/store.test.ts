import { describe, it, expect, beforeEach } from "vitest";
import {
  addAuditEntry,
  getAuditEntry,
  setOutcome,
  listAuditEntries,
  getWhitelistMode,
  setWhitelistMode,
  type AuditEntry,
} from "./store";

function makeEntry(overrides: Partial<AuditEntry> = {}): AuditEntry {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    email: { from: "biuro@example.pl" },
    invoice: {
      supplierNip: "2046483277",
      account: "40495009592248961325478503",
      amount: 1000,
      currency: "PLN",
    },
    supplier: null,
    checks: [],
    verdict: "GREEN",
    verdictLabel: "Safe to pay",
    riskScore: 0,
    outcome: null,
    ...overrides,
  };
}

describe("audit entry store", () => {
  it("round-trips an entry by id", () => {
    const entry = addAuditEntry(makeEntry({ id: "test-1" }));
    expect(getAuditEntry("test-1")).toEqual(entry);
  });

  it("returns undefined for an unknown id", () => {
    expect(getAuditEntry("does-not-exist")).toBeUndefined();
  });

  it("setOutcome updates an existing entry and returns it", () => {
    addAuditEntry(makeEntry({ id: "test-2" }));
    const updated = setOutcome("test-2", {
      type: "rejected_as_fraud",
      recordedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(updated?.outcome).toEqual({
      type: "rejected_as_fraud",
      recordedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(getAuditEntry("test-2")?.outcome?.type).toBe("rejected_as_fraud");
  });

  it("setOutcome returns undefined for an unknown id", () => {
    expect(
      setOutcome("nope", { type: "rejected_as_fraud", recordedAt: "now" })
    ).toBeUndefined();
  });

  it("listAuditEntries returns newest first", () => {
    addAuditEntry(makeEntry({ id: "old", timestamp: "2026-01-01T00:00:00.000Z" }));
    addAuditEntry(makeEntry({ id: "new", timestamp: "2026-06-01T00:00:00.000Z" }));
    const ids = listAuditEntries().map((e) => e.id);
    expect(ids.indexOf("new")).toBeLessThan(ids.indexOf("old"));
  });
});

describe("white list mode toggle", () => {
  beforeEach(() => {
    setWhitelistMode("mock");
  });

  it("defaults to mock", () => {
    expect(getWhitelistMode()).toBe("mock");
  });

  it("can be switched to live and back", () => {
    expect(setWhitelistMode("live")).toBe("live");
    expect(getWhitelistMode()).toBe("live");
    expect(setWhitelistMode("mock")).toBe("mock");
    expect(getWhitelistMode()).toBe("mock");
  });
});
