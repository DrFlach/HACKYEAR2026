// Check #7 (SPEC.md): pressure/urgency and "we changed our bank account"
// language, in English and Polish.

import type { CheckResult } from "./types";
import { WEIGHTS } from "./types";

export const PRESSURE_LANGUAGE_CHECK_ID = "pressure-language";

// SPEC.md's example keyword list, English + Polish. Matching is a plain
// case-insensitive substring search -- simple, explainable, and good
// enough for a demo (not meant to be exhaustive NLP).
export const PRESSURE_KEYWORDS = [
  "urgent",
  "today",
  "new account",
  "changed bank",
  "confidential",
  "pilne",
  "zmiana rachunku",
  "nowy numer konta",
  "dzisiaj",
  "poufne",
];

export interface KeywordMatch {
  keyword: string;
  index: number;
}

/**
 * Finds every (case-insensitive) occurrence of a pressure keyword in
 * `text`, sorted by position. Exported separately from the check so the
 * Result screen can reuse it to highlight matches in the email body.
 */
export function findPressureKeywordMatches(text: string): KeywordMatch[] {
  const haystack = text.toLowerCase();
  const matches: KeywordMatch[] = [];

  for (const keyword of PRESSURE_KEYWORDS) {
    let fromIndex = 0;
    let index = haystack.indexOf(keyword, fromIndex);
    while (index !== -1) {
      matches.push({ keyword, index });
      fromIndex = index + keyword.length;
      index = haystack.indexOf(keyword, fromIndex);
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}

/**
 * Check #7: matches are a WARN, not a FAIL -- legitimate invoices are
 * sometimes urgent too, but it is a strong corroborating signal when
 * combined with the other checks.
 */
export function checkPressureLanguage(
  subject: string | undefined,
  body: string | undefined
): CheckResult {
  const title = "Pressure & change language";
  const text = `${subject ?? ""} ${body ?? ""}`;
  const matches = findPressureKeywordMatches(text);
  const uniqueKeywords = Array.from(new Set(matches.map((m) => m.keyword)));

  if (uniqueKeywords.length === 0) {
    return {
      id: PRESSURE_LANGUAGE_CHECK_ID,
      title,
      status: "PASS",
      explanation: "No urgency or bank-change language detected in the subject or body.",
      weight: 0,
    };
  }

  return {
    id: PRESSURE_LANGUAGE_CHECK_ID,
    title,
    status: "WARN",
    explanation: `Found pressure/urgency or bank-change language: ${uniqueKeywords
      .map((k) => `"${k}"`)
      .join(", ")}.`,
    weight: WEIGHTS.pressureLanguage.warn,
  };
}
