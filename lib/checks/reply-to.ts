// Check #6 (SPEC.md): Reply-To domain differs from From domain -> FAIL.
// A classic BEC trick: the visible "From" looks legitimate, but any
// reply actually goes to the attacker's mailbox.

import type { CheckResult } from "./types";
import { WEIGHTS } from "./types";
import { extractEmailDomain } from "./email-domain";

export const REPLY_TO_CHECK_ID = "reply-to-mismatch";

export function checkReplyToMismatch(
  fromAddress: string,
  replyToAddress?: string
): CheckResult {
  const title = "Reply-To mismatch";

  if (!replyToAddress || !replyToAddress.trim()) {
    return {
      id: REPLY_TO_CHECK_ID,
      title,
      status: "PASS",
      explanation: "No Reply-To address was set, so replies go back to the From address.",
      weight: 0,
    };
  }

  const fromDomain = extractEmailDomain(fromAddress);
  const replyToDomain = extractEmailDomain(replyToAddress);

  if (!fromDomain || !replyToDomain) {
    return {
      id: REPLY_TO_CHECK_ID,
      title,
      status: "WARN",
      explanation:
        "Could not read a domain from the From or Reply-To address, so the match could not be confirmed.",
      weight: WEIGHTS.replyTo.warnUnparseable,
    };
  }

  if (fromDomain === replyToDomain) {
    return {
      id: REPLY_TO_CHECK_ID,
      title,
      status: "PASS",
      explanation: `Reply-To domain "${replyToDomain}" matches the From domain.`,
      weight: 0,
    };
  }

  return {
    id: REPLY_TO_CHECK_ID,
    title,
    status: "FAIL",
    explanation: `Reply-To domain "${replyToDomain}" is different from the From domain "${fromDomain}" -- any reply would go somewhere other than where the email claims to be from.`,
    weight: WEIGHTS.replyTo.fail,
  };
}
