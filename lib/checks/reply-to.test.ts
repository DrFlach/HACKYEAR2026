import { describe, it, expect } from "vitest";
import { checkReplyToMismatch, REPLY_TO_CHECK_ID } from "./reply-to";

describe("checkReplyToMismatch", () => {
  it("PASSes when Reply-To is not set", () => {
    const result = checkReplyToMismatch("biuro@hurtowniakowalski.pl");
    expect(result.id).toBe(REPLY_TO_CHECK_ID);
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
  });

  it("PASSes when Reply-To matches the From domain", () => {
    const result = checkReplyToMismatch(
      "biuro@hurtowniakowalski.pl",
      "ksiegowosc@hurtowniakowalski.pl"
    );
    expect(result.status).toBe("PASS");
  });

  it("FAILs when Reply-To is a different domain (SPEC.md account-change attack)", () => {
    const result = checkReplyToMismatch(
      "biuro@hurtowniakowalski.pl",
      "scammer123@gmail.com"
    );
    expect(result.status).toBe("FAIL");
    expect(result.weight).toBeGreaterThan(0);
    expect(result.explanation).toMatch(/gmail\.com/);
    expect(result.explanation).toMatch(/hurtowniakowalski\.pl/);
  });

  it("WARNs when a domain cannot be parsed from either address", () => {
    const result = checkReplyToMismatch("not-an-email", "also-not-an-email");
    expect(result.status).toBe("WARN");
  });
});
