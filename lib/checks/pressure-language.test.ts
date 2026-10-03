import { describe, it, expect } from "vitest";
import {
  checkPressureLanguage,
  findPressureKeywordMatches,
  PRESSURE_LANGUAGE_CHECK_ID,
} from "./pressure-language";

describe("findPressureKeywordMatches", () => {
  it("finds English and Polish keywords, case-insensitively", () => {
    const matches = findPressureKeywordMatches(
      "URGENT: please pay TODAY. Pilne, zmiana rachunku bankowego."
    );
    const keywords = matches.map((m) => m.keyword);
    expect(keywords).toContain("urgent");
    expect(keywords).toContain("today");
    expect(keywords).toContain("pilne");
    expect(keywords).toContain("zmiana rachunku");
  });

  it("returns an empty array for neutral text", () => {
    expect(findPressureKeywordMatches("Please find attached invoice #123.")).toEqual([]);
  });
});

describe("checkPressureLanguage", () => {
  it("PASSes when there is no pressure language", () => {
    const result = checkPressureLanguage(
      "Invoice #123",
      "Please find attached our invoice for last month's delivery."
    );
    expect(result.id).toBe(PRESSURE_LANGUAGE_CHECK_ID);
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
  });

  it("WARNs on the SPEC.md account-change-attack phrasing (pilne, zmiana rachunku)", () => {
    const result = checkPressureLanguage(
      "Pilne: zmiana numeru konta",
      "Prosimy o dzisiejszą płatność, pilne. Nastąpiła zmiana rachunku bankowego, nowy numer konta poniżej. Poufne."
    );
    expect(result.status).toBe("WARN");
    expect(result.weight).toBeGreaterThan(0);
    expect(result.explanation).toMatch(/pilne/);
  });

  it("WARNs on English urgency language", () => {
    const result = checkPressureLanguage(
      "Urgent",
      "This is confidential, please action today: we have a new account for payments."
    );
    expect(result.status).toBe("WARN");
  });
});
