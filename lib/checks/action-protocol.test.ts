import { describe, it, expect } from "vitest";
import { getActionProtocol } from "./action-protocol";

describe("getActionProtocol", () => {
  it("RED: tells the user not to pay, not to reply, to call the verified number, and to report it", () => {
    const steps = getActionProtocol("RED", { verifiedPhone: "+48 601 234 567" });
    expect(steps.join(" ")).toMatch(/do not pay/i);
    expect(steps.join(" ")).toMatch(/do not reply/i);
    expect(steps.join(" ")).toContain("+48 601 234 567");
    expect(steps.join(" ")).toMatch(/cert polska/i);
  });

  it("RED without a known supplier still tells the user to call their own records, not the email", () => {
    const steps = getActionProtocol("RED", null);
    expect(steps.join(" ")).toMatch(/supplier records/i);
    expect(steps.join(" ")).not.toContain("undefined");
  });

  it("AMBER: tells the user to confirm by phone and record who confirmed it", () => {
    const steps = getActionProtocol("AMBER", { verifiedPhone: "+48 601 234 567" });
    expect(steps.join(" ")).toMatch(/confirm/i);
    expect(steps.join(" ")).toMatch(/record/i);
  });

  it("GREEN: tells the user to proceed", () => {
    const steps = getActionProtocol("GREEN");
    expect(steps.join(" ")).toMatch(/proceed/i);
  });
});
