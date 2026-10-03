import { describe, it, expect } from "vitest";
import { buildHighlightSegments } from "./highlight";

describe("buildHighlightSegments", () => {
  it("returns a single non-highlighted segment for plain text", () => {
    expect(buildHighlightSegments("Please find attached invoice #123.")).toEqual([
      { text: "Please find attached invoice #123.", highlighted: false },
    ]);
  });

  it("highlights a single keyword in the middle of the text", () => {
    const segments = buildHighlightSegments("This is urgent, please pay now.");
    expect(segments).toEqual([
      { text: "This is ", highlighted: false },
      { text: "urgent", highlighted: true },
      { text: ", please pay now.", highlighted: false },
    ]);
  });

  it("merges adjacent/overlapping keyword matches into one segment", () => {
    // "pilne" is immediately followed by text containing "zmiana rachunku".
    const segments = buildHighlightSegments("pilne, zmiana rachunku bankowego");
    const highlighted = segments.filter((s) => s.highlighted).map((s) => s.text);
    expect(highlighted).toContain("pilne");
    expect(highlighted).toContain("zmiana rachunku");
  });

  it("reconstructs the original text when segments are joined", () => {
    const text = "UWAGA: zmiana rachunku bankowego, to pilne, prosimy o płatność dzisiaj.";
    const segments = buildHighlightSegments(text);
    expect(segments.map((s) => s.text).join("")).toBe(text);
  });
});
