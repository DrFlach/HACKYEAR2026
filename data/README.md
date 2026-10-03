# /data seed files

Static seed data for the demo. No database — these JSON files are read at
request time (directly, or via a tiny in-memory store loaded from them).

## suppliers.json

Array of 4 known suppliers:

- `id` — slug used to reference the supplier elsewhere.
- `name` — display name.
- `nip` — 10-digit Polish tax ID. Fake but checksum-valid (see check #1 in
  SPEC.md: weights 6,5,7,2,3,4,5,6,7 over digits 1-9, sum mod 11 = digit 10).
- `knownAccounts` — bank accounts (26-digit Polish NRB, no "PL" prefix,
  no spaces) this supplier has been paid into before. Fake but
  checksum-valid (IBAN mod-97 with the "PL" prefix, check #2 in SPEC.md).
- `domains` — email domain(s) this supplier is known to send invoices from.
- `verifiedPhone` — phone number for the accountant to call back on,
  independent of whatever number/contact appears in an email (this is the
  number shown in the RED action protocol).
- `paymentHistory` — 5-15 past payments, each `{ date, amount, currency,
  account }`. Every entry uses one of `knownAccounts`, by construction,
  so the "payment history" check (#4) has something to compare a new
  invoice's account against.

All NIPs and IBANs were generated with a throwaway script and are verified
by `/lib/checks/nip.test.ts`, `/lib/checks/account.test.ts`, and
`/data/seed.test.ts` (run with `npm test`). They are not real companies.

## whitelist-mock.json

Mock answers for the Ministry of Finance VAT white list API
(`GET /api/check/nip/{nip}/bank-account/{account}`), used when mock mode is
ON (the default for the demo — see check #3 in SPEC.md). Real responses put
the answer in `result.accountAssigned` ("TAK"/"NIE") and `result.requestId`;
this mock mirrors that shape.

`entries` is keyed by `"{nip}_{account}"` for O(1) lookup. Each entry also
carries a `scenario` field (ignored by the app) documenting which demo
scenario it supports — see SPEC.md's 3 demo scenarios:

1. **Legit invoice** — Kowalski's NIP + known account → `TAK`.
2. **Account change attack** — Kowalski's NIP + a *different*,
   checksum-valid "mule" account (`69244915051998392161174484`, not stored
   on any supplier) → `NIE`. The mule account is intentionally
   format-valid: real fraudsters use real bank accounts, they just aren't
   the supplier's.
3. **Service outage** — reuses the legit pair; the app's mock/live toggle
   forces an `UNAVAILABLE` result for this scenario, not this file.

The other three suppliers each get one `TAK` entry for their own known
account, so the "New check" form works offline for any seeded supplier, not
just the one used in the headline demo scenarios.
