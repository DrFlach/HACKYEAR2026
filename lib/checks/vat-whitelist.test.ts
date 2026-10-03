import { describe, it, expect, vi, afterEach } from "vitest";
import { checkVatWhitelist, VAT_WHITELIST_CHECK_ID } from "./vat-whitelist";

const KOWALSKI_NIP = "2046483277";
const KOWALSKI_ACCOUNT = "40495009592248961325478503"; // TAK in whitelist-mock.json
const MULE_ACCOUNT = "69244915051998392161174484"; // NIE in whitelist-mock.json

describe("checkVatWhitelist (mock mode)", () => {
  it("PASSes with weight 0 and a requestId when the account is TAK", async () => {
    const result = await checkVatWhitelist(KOWALSKI_NIP, KOWALSKI_ACCOUNT, { mock: true });
    expect(result.id).toBe(VAT_WHITELIST_CHECK_ID);
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
    expect(result.requestId).toBeTruthy();
  });

  it("FAILs when the account is NIE (account-change attack mule account)", async () => {
    const result = await checkVatWhitelist(KOWALSKI_NIP, MULE_ACCOUNT, { mock: true });
    expect(result.status).toBe("FAIL");
    expect(result.weight).toBeGreaterThan(0);
    expect(result.requestId).toBeTruthy();
  });

  it("is UNAVAILABLE (never PASS) for a pair with no mock fixture", async () => {
    const result = await checkVatWhitelist("1111111111", "11111111111111111111111111", {
      mock: true,
    });
    expect(result.status).toBe("UNAVAILABLE");
  });

  it("is UNAVAILABLE when forceUnavailable simulates an outage (Service outage demo scenario)", async () => {
    const result = await checkVatWhitelist(KOWALSKI_NIP, KOWALSKI_ACCOUNT, {
      mock: true,
      forceUnavailable: true,
    });
    expect(result.status).toBe("UNAVAILABLE");
    expect(result.requestId).toBeUndefined();
  });

  it("accepts a PL-prefixed, spaced account the same way", async () => {
    const result = await checkVatWhitelist(
      "204-648-32-77",
      "PL40 4950 0959 2248 9613 2547 8503",
      { mock: true }
    );
    expect(result.status).toBe("PASS");
  });
});

describe("checkVatWhitelist (live mode)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("PASSes when the live API returns TAK", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: { accountAssigned: "TAK", requestId: "LIVE-1" } }),
      })
    );
    const result = await checkVatWhitelist(KOWALSKI_NIP, KOWALSKI_ACCOUNT, { mock: false });
    expect(result.status).toBe("PASS");
    expect(result.requestId).toBe("LIVE-1");
  });

  it("FAILs when the live API returns NIE", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: { accountAssigned: "NIE", requestId: "LIVE-2" } }),
      })
    );
    const result = await checkVatWhitelist(KOWALSKI_NIP, MULE_ACCOUNT, { mock: false });
    expect(result.status).toBe("FAIL");
  });

  it("is UNAVAILABLE (not PASS) on a network error or timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down"))
    );
    const result = await checkVatWhitelist(KOWALSKI_NIP, KOWALSKI_ACCOUNT, { mock: false });
    expect(result.status).toBe("UNAVAILABLE");
  });

  it("is UNAVAILABLE on a non-OK HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    );
    const result = await checkVatWhitelist(KOWALSKI_NIP, KOWALSKI_ACCOUNT, { mock: false });
    expect(result.status).toBe("UNAVAILABLE");
  });
});
