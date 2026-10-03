import { describe, it, expect } from "vitest";
import { parseRawEmail, extractNip, extractAccount } from "./email-parsing";

describe("parseRawEmail", () => {
  it("splits recognized headers from the body", () => {
    const raw = [
      "From: biuro@hurtowniakowalski.pl",
      "Reply-To: scammer@gmail.com",
      "Subject: Faktura 123",
      "",
      "Dzień dobry,",
      "W załączeniu faktura.",
    ].join("\n");

    const parsed = parseRawEmail(raw);
    expect(parsed.from).toBe("biuro@hurtowniakowalski.pl");
    expect(parsed.replyTo).toBe("scammer@gmail.com");
    expect(parsed.subject).toBe("Faktura 123");
    expect(parsed.body).toBe("Dzień dobry,\nW załączeniu faktura.");
  });

  it("treats the whole input as the body when no headers are recognized", () => {
    const parsed = parseRawEmail("Just a plain pasted paragraph, no headers.");
    expect(parsed.from).toBeUndefined();
    expect(parsed.body).toBe("Just a plain pasted paragraph, no headers.");
  });
});

describe("extractNip", () => {
  it("finds a standalone 10-digit NIP", () => {
    expect(extractNip("Nasz NIP: 2046483277, prosimy o kontakt.")).toBe("2046483277");
  });

  it("returns null when there is no 10-digit run", () => {
    expect(extractNip("No tax id here.")).toBeNull();
  });

  it("does not match a substring of a longer digit run", () => {
    expect(extractNip("Account: 40495009592248961325478503")).toBeNull();
  });
});

describe("extractAccount", () => {
  it("finds a standalone 26-digit account", () => {
    expect(extractAccount("Konto: 40495009592248961325478503 dziekujemy")).toBe(
      "40495009592248961325478503"
    );
  });

  it("finds a PL-prefixed 26-digit account", () => {
    expect(extractAccount("IBAN: PL40495009592248961325478503")).toBe(
      "PL40495009592248961325478503"
    );
  });

  it("returns null when there is no 26-digit run", () => {
    expect(extractAccount("No account number here.")).toBeNull();
  });
});
