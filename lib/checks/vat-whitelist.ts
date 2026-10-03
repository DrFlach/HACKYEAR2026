// Check #3 (SPEC.md): VAT white list -- is this account assigned to this NIP?
//
// Real endpoint: GET https://wl-api.mf.gov.pl/api/check/nip/{nip}/bank-account/{account}?date=YYYY-MM-DD
// Response shape: result.accountAssigned = "TAK" | "NIE", result.requestId.
// 4-second timeout; on error/timeout -> UNAVAILABLE (never PASS -- an
// outage must never be mistaken for a clean result).
//
// Mock mode (default ON for the demo) answers from /data/whitelist-mock.json
// instead of calling the real API, keyed by "{nip}_{account}".

import type { CheckResult } from "./types";
import { WEIGHTS } from "./types";
import { normalizeNip } from "./nip";
import { normalizeAccount } from "./account";
import whitelistMock from "@/data/whitelist-mock.json";

export const VAT_WHITELIST_CHECK_ID = "vat-whitelist";

interface WhitelistMockEntry {
  nip: string;
  account: string;
  accountAssigned: "TAK" | "NIE";
  requestId: string;
}

const MOCK_ENTRIES = whitelistMock.entries as Record<string, WhitelistMockEntry>;

export interface VatWhitelistOptions {
  /** Default true: answer from /data/whitelist-mock.json instead of calling the real API. */
  mock?: boolean;
  /** Simulates an outage regardless of mock/live mode (used by the "Service outage" demo scenario). */
  forceUnavailable?: boolean;
  /** YYYY-MM-DD, forwarded to the real API; ignored by the mock. Defaults to today. */
  date?: string;
  /** Defaults to 4000ms per SPEC.md. */
  timeoutMs?: number;
}

interface WhitelistApiResult {
  accountAssigned: "TAK" | "NIE";
  requestId: string;
}

function queryMock(nip: string, account: string): WhitelistApiResult | null {
  const entry = MOCK_ENTRIES[`${nip}_${account}`];
  return entry ? { accountAssigned: entry.accountAssigned, requestId: entry.requestId } : null;
}

async function queryLive(
  nip: string,
  account: string,
  date: string,
  timeoutMs: number
): Promise<WhitelistApiResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = `https://wl-api.mf.gov.pl/api/check/nip/${nip}/bank-account/${account}?date=${date}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`white list API responded with ${res.status}`);
    const data = await res.json();
    return {
      accountAssigned: data.result.accountAssigned,
      requestId: data.result.requestId,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkVatWhitelist(
  nip: string,
  account: string,
  options: VatWhitelistOptions = {}
): Promise<CheckResult> {
  const title = "VAT white list";
  const normalizedNip = normalizeNip(nip);
  const normalizedAccount = normalizeAccount(account);
  const mock = options.mock ?? true;
  const date = options.date ?? new Date().toISOString().slice(0, 10);
  const timeoutMs = options.timeoutMs ?? 4000;

  if (options.forceUnavailable) {
    return {
      id: VAT_WHITELIST_CHECK_ID,
      title,
      status: "UNAVAILABLE",
      explanation:
        "The Ministry of Finance white list service is unavailable right now. Confirm the account by phone before paying.",
      weight: WEIGHTS.vatWhitelist.unavailable,
    };
  }

  try {
    const result = mock
      ? queryMock(normalizedNip, normalizedAccount)
      : await queryLive(normalizedNip, normalizedAccount, date, timeoutMs);

    if (!result) {
      // Mock mode has no fixture for this exact pair. We deliberately do
      // NOT guess PASS or FAIL here -- an unknown answer must surface as
      // UNAVAILABLE, same as a real outage (SPEC.md: "if a source is
      // unavailable, the result is UNVERIFIED, never 'safe'").
      return {
        id: VAT_WHITELIST_CHECK_ID,
        title,
        status: "UNAVAILABLE",
        explanation: `No white list data for NIP ${normalizedNip} / this account (mock mode has no fixture for this pair).`,
        weight: WEIGHTS.vatWhitelist.unavailable,
      };
    }

    if (result.accountAssigned === "TAK") {
      return {
        id: VAT_WHITELIST_CHECK_ID,
        title,
        status: "PASS",
        explanation: `The white list confirms this account is assigned to NIP ${normalizedNip}.`,
        weight: 0,
        requestId: result.requestId,
      };
    }

    return {
      id: VAT_WHITELIST_CHECK_ID,
      title,
      status: "FAIL",
      explanation: `The white list says this account is NOT assigned to NIP ${normalizedNip}.`,
      weight: WEIGHTS.vatWhitelist.fail,
      requestId: result.requestId,
    };
  } catch (err) {
    return {
      id: VAT_WHITELIST_CHECK_ID,
      title,
      status: "UNAVAILABLE",
      explanation: `Could not reach the white list service (${
        err instanceof Error ? err.message : "unknown error"
      }). Confirm the account by phone before paying.`,
      weight: WEIGHTS.vatWhitelist.unavailable,
    };
  }
}
