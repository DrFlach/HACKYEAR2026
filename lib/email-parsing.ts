// SPEC.md: "paste raw email text; the app auto-extracts NIP (10 digits)
// and Polish account number (26 digits, optional 'PL' prefix) with
// regex." Also does a best-effort split of a pasted raw email into
// From/Reply-To/Subject/Body if it looks like it has mail headers.

export interface ParsedEmail {
  from?: string;
  replyTo?: string;
  subject?: string;
  body: string;
}

const HEADER_LINE = /^(From|Reply-To|Subject):\s*(.*)$/i;

/**
 * Splits a pasted block of text into header fields + body, tolerating a
 * blank line between headers and body (or none at all). Lines that don't
 * look like a recognized header end the header section.
 */
export function parseRawEmail(raw: string): ParsedEmail {
  const lines = raw.split(/\r?\n/);
  const headers: Record<string, string> = {};
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      bodyStart = i + 1;
      continue;
    }
    const match = line.match(HEADER_LINE);
    if (!match) break;
    headers[match[1].toLowerCase()] = match[2].trim();
    bodyStart = i + 1;
  }

  const body = lines.slice(bodyStart).join("\n").trim();

  return {
    from: headers["from"],
    replyTo: headers["reply-to"],
    subject: headers["subject"],
    // No recognized headers at all -> treat the whole paste as the body.
    body: body || (Object.keys(headers).length === 0 ? raw.trim() : body),
  };
}

const NIP_PATTERN = /\b\d{10}\b/;
const ACCOUNT_PATTERN = /\bPL\d{26}\b|\b\d{26}\b/i;

/** Finds the first standalone 10-digit run, per SPEC.md's NIP auto-extract rule. */
export function extractNip(text: string): string | null {
  return text.match(NIP_PATTERN)?.[0] ?? null;
}

/** Finds the first standalone 26-digit run (optionally "PL"-prefixed). */
export function extractAccount(text: string): string | null {
  return text.match(ACCOUNT_PATTERN)?.[0] ?? null;
}
