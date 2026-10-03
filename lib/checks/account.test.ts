import { describe, it, expect } from "vitest";
import { isValidPolishAccount, normalizeAccount } from "./account";

describe("isValidPolishAccount", () => {
  it("accepts a known valid account without a PL prefix", () => {
    expect(isValidPolishAccount("40495009592248961325478503")).toBe(true);
  });

  it("accepts the same account with PL prefix and spaces", () => {
    expect(
      isValidPolishAccount("PL40 4950 0959 2248 9613 2547 8503")
    ).toBe(true);
  });

  it("rejects a tampered checksum", () => {
    expect(isValidPolishAccount("40495009592248961325478504")).toBe(false);
  });

  it("rejects the wrong number of digits", () => {
    expect(isValidPolishAccount("12345")).toBe(false);
    expect(isValidPolishAccount("404950095922489613254785030")).toBe(false);
  });

  it("normalizes spaces and the PL prefix before validating", () => {
    expect(normalizeAccount("PL 4049 5009 5922 4896 1325 4785 03")).toBe(
      "40495009592248961325478503"
    );
  });
});
