import { describe, it, expect } from "vitest";
import {
  checkSplitPaymentHint,
  SPLIT_PAYMENT_HINT_CHECK_ID,
} from "./split-payment-hint";

describe("checkSplitPaymentHint", () => {
  it("PASSes under the 15,000 PLN threshold even if the white list failed", () => {
    const result = checkSplitPaymentHint(14000, "PLN", "FAIL");
    expect(result.id).toBe(SPLIT_PAYMENT_HINT_CHECK_ID);
    expect(result.status).toBe("PASS");
    expect(result.weight).toBe(0);
  });

  it("PASSes over the threshold if the white list PASSed", () => {
    const result = checkSplitPaymentHint(20000, "PLN", "PASS");
    expect(result.status).toBe("PASS");
  });

  it("WARNs over 15,000 PLN when the white list did not PASS (FAIL)", () => {
    const result = checkSplitPaymentHint(15600, "PLN", "FAIL");
    expect(result.status).toBe("WARN");
    expect(result.weight).toBeGreaterThan(0);
  });

  it("WARNs over 15,000 PLN when the white list is UNAVAILABLE", () => {
    const result = checkSplitPaymentHint(15600, "PLN", "UNAVAILABLE");
    expect(result.status).toBe("WARN");
  });

  it("treats a missing currency as PLN", () => {
    const result = checkSplitPaymentHint(15600, undefined, "FAIL");
    expect(result.status).toBe("WARN");
  });

  it("does not apply to non-PLN currencies", () => {
    const result = checkSplitPaymentHint(20000, "EUR", "FAIL");
    expect(result.status).toBe("PASS");
  });

  it("is exactly at the boundary -> PASS (strictly greater than 15,000 triggers WARN)", () => {
    const result = checkSplitPaymentHint(15000, "PLN", "FAIL");
    expect(result.status).toBe("PASS");
  });
});
