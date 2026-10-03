// Check #5 (SPEC.md): compare the From domain to the supplier's known
// domains.
//   - Exact match -> PASS.
//   - Look-alike -> FAIL.
//   - Unknown -> WARN.

import type { CheckResult, Supplier } from "./types";
import { WEIGHTS } from "./types";
import { extractEmailDomain } from "./email-domain";
import { levenshteinDistance } from "./levenshtein";

export const SENDER_DOMAIN_CHECK_ID = "sender-domain";

// Common look-alike character substitutions used in phishing domains
// (SPEC.md: "homoglyphs like rn->m, 0->o, 1->l").
const HOMOGLYPH_SUBSTITUTIONS: Array<[RegExp, string]> = [
  [/rn/g, "m"],
  [/vv/g, "w"],
  [/0/g, "o"],
  [/1/g, "l"],
];

function normalizeHomoglyphs(domain: string): string {
  return HOMOGLYPH_SUBSTITUTIONS.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    domain
  );
}

function splitLabelAndTld(domain: string): { label: string; tld: string } {
  const lastDot = domain.lastIndexOf(".");
  if (lastDot === -1) return { label: domain, tld: "" };
  return { label: domain.slice(0, lastDot), tld: domain.slice(lastDot + 1) };
}

function sortedChars(s: string): string {
  return s.split("").sort().join("");
}

export interface DomainLookalikeResult {
  isLookalike: boolean;
  reason?: string;
}

/**
 * Checks whether `candidate` is a look-alike of `known`, per SPEC.md's
 * rules. Each rule below is independent and individually explainable:
 *  1. Small edit distance -- a typo, or one extra/missing/swapped letter.
 *  2. Homoglyph substitution -- 0/o, 1/l, rn/m, vv/w look the same at a
 *     glance.
 *  3. An inserted/removed hyphen around an otherwise identical label.
 *  4. The same label registered under a different top-level domain.
 *  5. The exact same letters, just rearranged -- e.g. the two halves of
 *     a compound company name swapped, like "kowalski-hurtownia" vs.
 *     "hurtowniakowalski". A classic typosquatting trick that plain edit
 *     distance misses (swapping two whole words edits far more than 2
 *     characters), so it gets its own rule.
 */
export function detectDomainLookalike(
  candidate: string,
  known: string
): DomainLookalikeResult {
  if (candidate === known) return { isLookalike: false };

  if (levenshteinDistance(candidate, known) <= 2) {
    return {
      isLookalike: true,
      reason: "differs by only a couple of characters from the known domain",
    };
  }

  const normalizedCandidate = normalizeHomoglyphs(candidate);
  if (
    normalizedCandidate === known ||
    levenshteinDistance(normalizedCandidate, known) <= 2
  ) {
    return {
      isLookalike: true,
      reason:
        "uses look-alike characters (e.g. 0/o, 1/l, rn/m) to imitate the known domain",
    };
  }

  const { label: candidateLabel, tld: candidateTld } =
    splitLabelAndTld(candidate);
  const { label: knownLabel, tld: knownTld } = splitLabelAndTld(known);
  const candidateCore = candidateLabel.replace(/-/g, "");
  const knownCore = knownLabel.replace(/-/g, "");

  if (
    candidateCore === knownCore &&
    candidateTld === knownTld &&
    candidateLabel !== knownLabel
  ) {
    return {
      isLookalike: true,
      reason: "adds or removes a hyphen in an otherwise identical domain",
    };
  }

  if (candidateCore === knownCore && candidateTld !== knownTld) {
    return {
      isLookalike: true,
      reason: `the same name registered under a different top-level domain (.${candidateTld} instead of .${knownTld})`,
    };
  }

  if (
    candidateCore !== knownCore &&
    candidateCore.length === knownCore.length &&
    sortedChars(candidateCore) === sortedChars(knownCore)
  ) {
    return {
      isLookalike: true,
      reason: "uses the exact same letters as the known domain, just rearranged",
    };
  }

  return { isLookalike: false };
}

export function checkSenderDomain(
  fromAddress: string,
  supplier: Supplier | undefined
): CheckResult {
  const title = "Sender domain";
  const domain = extractEmailDomain(fromAddress);

  if (!domain) {
    return {
      id: SENDER_DOMAIN_CHECK_ID,
      title,
      status: "WARN",
      explanation: `Could not read a domain from the From address "${fromAddress}".`,
      weight: WEIGHTS.senderDomain.warn,
    };
  }

  if (!supplier || supplier.domains.length === 0) {
    return {
      id: SENDER_DOMAIN_CHECK_ID,
      title,
      status: "WARN",
      explanation: `"${domain}" is not on file for this supplier -- there are no known domains to compare against.`,
      weight: WEIGHTS.senderDomain.warn,
    };
  }

  if (supplier.domains.includes(domain)) {
    return {
      id: SENDER_DOMAIN_CHECK_ID,
      title,
      status: "PASS",
      explanation: `"${domain}" matches a known domain for ${supplier.name}.`,
      weight: 0,
    };
  }

  for (const known of supplier.domains) {
    const lookalike = detectDomainLookalike(domain, known);
    if (lookalike.isLookalike) {
      return {
        id: SENDER_DOMAIN_CHECK_ID,
        title,
        status: "FAIL",
        explanation: `"${domain}" looks like a fake version of the known domain "${known}" -- it ${lookalike.reason}.`,
        weight: WEIGHTS.senderDomain.fail,
      };
    }
  }

  return {
    id: SENDER_DOMAIN_CHECK_ID,
    title,
    status: "WARN",
    explanation: `"${domain}" does not match any known domain for ${supplier.name} (${supplier.domains.join(", ")}), and is not an obvious look-alike either.`,
    weight: WEIGHTS.senderDomain.warn,
  };
}
