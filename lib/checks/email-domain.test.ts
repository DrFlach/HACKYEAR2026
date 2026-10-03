import { describe, it, expect } from "vitest";
import { extractEmailDomain } from "./email-domain";

describe("extractEmailDomain", () => {
  it("extracts the domain from a plain address", () => {
    expect(extractEmailDomain("biuro@hurtowniakowalski.pl")).toBe(
      "hurtowniakowalski.pl"
    );
  });

  it("extracts the domain from an address with a display name", () => {
    expect(
      extractEmailDomain("Hurtownia Kowalski <biuro@hurtowniakowalski.pl>")
    ).toBe("hurtowniakowalski.pl");
  });

  it("lowercases the domain", () => {
    expect(extractEmailDomain("Biuro@HurtowniaKowalski.PL")).toBe(
      "hurtowniakowalski.pl"
    );
  });

  it("returns null when there is no @", () => {
    expect(extractEmailDomain("not-an-email")).toBeNull();
  });
});
