// Shared helper for checks #5 and #6: extracts the domain part of an
// email address, tolerating a display name like `Jan Kowalski <jan@x.pl>`.

/** Returns the lowercase domain of an email address, or null if none is found. */
export function extractEmailDomain(address: string): string | null {
  const match = address.match(/@([a-zA-Z0-9.-]+)/);
  return match ? match[1].toLowerCase() : null;
}
