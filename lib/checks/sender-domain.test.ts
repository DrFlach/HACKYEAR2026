import { describe, it, expect } from "vitest";
import {
  detectDomainLookalike,
  checkSenderDomain,
  SENDER_DOMAIN_CHECK_ID,
} from "./sender-domain";
import type { Supplier } from "./types";

const kowalski: Supplier = {
  id: "hurtownia-kowalski",
  name: "Hurtownia Kowalski sp. z o.o.",
  nip: "2046483277",
  knownAccounts: ["40495009592248961325478503"],
  domains: ["hurtowniakowalski.pl"],
  verifiedPhone: "+48 601 234 567",
  paymentHistory: [],
};

describe("detectDomainLookalike", () => {
  it("is not a lookalike when the domain matches exactly", () => {
    expect(detectDomainLookalike("hurtowniakowalski.pl", "hurtowniakowalski.pl").isLookalike).toBe(false);
  });

  it("flags a small edit distance (typo)", () => {
    const result = detectDomainLookalike("hurtowniakowalskie.pl", "hurtowniakowalski.pl");
    expect(result.isLookalike).toBe(true);
    expect(result.reason).toMatch(/characters/);
  });

  it("flags homoglyph substitution even when the raw edit distance is large", () => {
    // Abstract example chosen so digit-for-letter substitution (0->o, 1->l)
    // is the ONLY thing that makes these equal: raw edit distance is 6
    // (every character differs), well above the plain Levenshtein<=2 rule,
    // so this specifically exercises the homoglyph branch in isolation.
    const result = detectDomainLookalike("101001.pl", "lolool.pl");
    expect(result.isLookalike).toBe(true);
    expect(result.reason).toMatch(/look-alike characters/);
  });

  it("flags an inserted hyphen in an otherwise identical domain", () => {
    // Needs 3+ hyphens so the raw edit distance exceeds the Levenshtein<=2
    // rule and this specifically exercises the hyphen-insensitive branch
    // (a single inserted/removed hyphen is always caught by rule 1 first,
    // since that alone is only a 1-character edit).
    const result = detectDomainLookalike("a-b-c-d.pl", "abcd.pl");
    expect(result.isLookalike).toBe(true);
    expect(result.reason).toMatch(/hyphen/);
  });

  it("flags the same label under a different top-level domain", () => {
    const result = detectDomainLookalike("techsolutions.com", "techsolutions.pl");
    expect(result.isLookalike).toBe(true);
    expect(result.reason).toMatch(/top-level domain/);
  });

  it("flags the SPEC.md account-change-attack domain as a lookalike (rearranged letters)", () => {
    const result = detectDomainLookalike(
      "kowalski-hurtownia.com",
      "hurtowniakowalski.pl"
    );
    expect(result.isLookalike).toBe(true);
    expect(result.reason).toMatch(/rearranged/);
  });

  it("is not a lookalike for an unrelated domain", () => {
    expect(
      detectDomainLookalike("completelydifferent.net", "hurtowniakowalski.pl")
        .isLookalike
    ).toBe(false);
  });
});

describe("checkSenderDomain", () => {
  it("PASSes on an exact domain match", () => {
    const result = checkSenderDomain("biuro@hurtowniakowalski.pl", kowalski);
    expect(result.id).toBe(SENDER_DOMAIN_CHECK_ID);
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
  });

  it("FAILs on the SPEC.md account-change-attack domain kowalski-hurtownia.com vs hurtowniakowalski.pl", () => {
    const result = checkSenderDomain(
      "ksiegowosc@kowalski-hurtownia.com",
      kowalski
    );
    expect(result.status).toBe("FAIL");
    expect(result.weight).toBeGreaterThan(0);
    expect(result.explanation).toMatch(/kowalski-hurtownia\.com/);
    expect(result.explanation).toMatch(/hurtowniakowalski\.pl/);
  });

  it("WARNs when the supplier is unknown (undefined)", () => {
    const result = checkSenderDomain("someone@random-domain.pl", undefined);
    expect(result.status).toBe("WARN");
  });

  it("WARNs when the domain is unrelated to any known domain", () => {
    const result = checkSenderDomain("info@completelydifferent.net", kowalski);
    expect(result.status).toBe("WARN");
  });
});
