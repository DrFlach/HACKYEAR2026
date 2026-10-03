import { describe, it, expect } from "vitest";
import { levenshteinDistance } from "./levenshtein";

describe("levenshteinDistance", () => {
  it("is 0 for identical strings", () => {
    expect(levenshteinDistance("hurtowniakowalski.pl", "hurtowniakowalski.pl")).toBe(0);
  });

  it("is 1 for a single substitution", () => {
    expect(levenshteinDistance("cat", "cot")).toBe(1);
  });

  it("is 1 for a single insertion", () => {
    expect(levenshteinDistance("cat", "cats")).toBe(1);
  });

  it("counts multiple edits", () => {
    expect(levenshteinDistance("kitten", "sitting")).toBe(3);
  });
});
