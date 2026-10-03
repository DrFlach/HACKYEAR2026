import { describe, it, expect } from "vitest";
import { isValidNip, normalizeNip, checkNipChecksum } from "./nip";

describe("isValidNip", () => {
  it("accepts a known valid NIP", () => {
    expect(isValidNip("2046483277")).toBe(true);
  });

  it("rejects a NIP with a wrong check digit", () => {
    expect(isValidNip("2046483270")).toBe(false);
  });

  it("rejects a NIP shorter or longer than 10 digits", () => {
    expect(isValidNip("123456789")).toBe(false);
    expect(isValidNip("12345678901")).toBe(false);
  });

  it("rejects non-digit characters", () => {
    expect(isValidNip("20464832AB")).toBe(false);
  });

  it("normalizes dashes and spaces before validating", () => {
    expect(isValidNip("204-648-32-77")).toBe(true);
    expect(normalizeNip("204-648-32-77")).toBe("2046483277");
  });
});

describe("checkNipChecksum", () => {
  it("returns PASS with weight 0 for a valid NIP", () => {
    const result = checkNipChecksum("2046483277");
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
    expect(result.id).toBe("nip-checksum");
  });

  it("returns FAIL with positive weight for an invalid NIP", () => {
    const result = checkNipChecksum("2046483270");
    expect(result.status).toBe("FAIL");
    expect(result.weight).toBeGreaterThan(0);
    expect(result.explanation).toMatch(/checksum/i);
  });
});
