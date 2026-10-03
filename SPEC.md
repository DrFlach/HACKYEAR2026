# Before You Pay — Project Specification

## One-liner
A pre-transfer verification tool that stops invoice fraud (Business Email Compromise / "bank account change" scams) before a small business sends money. Built for HackYeah 2026, "Defence" open task.

## Problem
Polish SMEs regularly receive fake emails that look like they come from a real supplier: "we changed our bank account, please pay this invoice urgently". The accountant pays, the money is gone, and the bank can rarely recover it. A generic chatbot cannot help, because it does not know which bank account really belongs to the supplier.

## Users
- Primary: an accountant / office manager at a small company (5–50 employees) who pays supplier invoices.
- Secondary (pitch only): a bank (e.g. Pekao) embedding this check into corporate online banking right before the transfer is confirmed.

## Core value (why not just ChatGPT)
1. Authoritative data an LLM does not have: the official Polish VAT taxpayer white list (Biała lista, Ministry of Finance API) and the company's own payment history.
2. Deterministic, explainable checks — every flag has a concrete reason.
3. Fits the moment of decision (before paying), produces a clear action protocol.
4. Works when data is missing: if a source is unavailable, the result is UNVERIFIED, never "safe".
5. Audit log of every check and every human confirmation.

## Tech stack (keep it simple)
- Next.js (App Router) + TypeScript + Tailwind CSS. Single app, API routes for backend logic.
- Data: JSON seed files in `/data` + in-memory store. No database.
- No external LLM is required for the core flow. All checks are deterministic.
- Unit tests with Vitest for the check functions.
- All UI text in English.

## Main flow
1. User opens "New check" and either:
   - clicks one of the demo scenarios, or
   - pastes an email (From, Reply-To, Subject, Body) and fills invoice fields: supplier NIP, supplier name, bank account (IBAN/NRB), amount, currency, due date.
   - Optional: paste raw email text; the app auto-extracts NIP (10 digits) and Polish account number (26 digits, optional "PL" prefix) with regex.
2. User clicks "Verify before paying".
3. The app runs all checks and shows the Result screen.
4. User follows the action protocol and records an outcome: "Confirmed by phone with known contact", "Rejected as fraud", or "Paid anyway (override, reason required)".
5. Everything is stored in the Audit log.

## Checks (each returns: id, title, status PASS | WARN | FAIL | UNAVAILABLE, explanation, weight)
1. NIP checksum — weights 6,5,7,2,3,4,5,6,7; sum mod 11 must equal the 10th digit.
2. Account number format — 26 digits, IBAN mod-97 checksum valid (with PL prefix).
3. VAT white list — is this account assigned to this NIP?
   - Real endpoint: GET https://wl-api.mf.gov.pl/api/check/nip/{nip}/bank-account/{account}?date=YYYY-MM-DD
     Response contains result.accountAssigned = "TAK" (yes) or "NIE" (no), and result.requestId.
   - 4-second timeout. On error/timeout → UNAVAILABLE (not PASS).
   - Mock mode (default ON for demo): answers from `/data/whitelist-mock.json`.
   - Show the requestId in the UI as proof of the check (the white list returns it for this purpose).
4. Payment history — has the company paid this supplier before? Is this account the same as previously used?
   - New account for a known supplier → FAIL (strongest signal).
   - Unknown supplier → WARN.
5. Sender domain — compare the From domain to the supplier's known domains.
   - Exact match → PASS. Lookalike (Levenshtein distance ≤ 2, or homoglyphs like rn→m, 0→o, 1→l, extra hyphen, different TLD) → FAIL. Unknown → WARN.
6. Reply-To mismatch — Reply-To domain differs from From domain → FAIL.
7. Pressure & change language — keywords in English and Polish, e.g. "urgent", "today", "new account", "changed bank", "confidential", "pilne", "zmiana rachunku", "nowy numer konta", "dzisiaj", "poufne". Matches are highlighted in the email body → WARN.
8. Amount anomaly — amount > 2× the supplier's historical average → WARN.
9. Split payment hint — amount > 15,000 PLN and white list check not PASS → extra WARN explaining tax consequences of paying to a non-listed account.

## Verdict logic
- Any FAIL → RED "Do not pay".
- Any UNAVAILABLE on check 3 or 4 → at least AMBER "Unverified — confirm before paying". Never GREEN.
- Only WARNs → AMBER "Verify before paying".
- All PASS → GREEN "Safe to pay".
- Also show a 0–100 risk score (sum of weights), but the verdict is driven by the rules above.

## Action protocol (shown on Result screen, depends on verdict)
- RED: Do not pay. Do not reply to this email. Call the supplier using the phone number stored in your supplier records (shown in the app), NOT the number from the email. Report to your bank and to CERT Polska (incydent.cert.pl).
- AMBER: Call the known contact to confirm the account. Record who confirmed it.
- GREEN: Proceed. Check is logged.

## Screens
1. Dashboard — counts of checks by verdict, recent checks, "New check" button, mock/live toggle for the white list.
2. New check — form + 3 demo scenario buttons.
3. Result — big verdict banner (green/amber/red), risk score, list of checks with icons and explanations, the email body with highlighted suspicious words, side-by-side "Known account vs. account in this invoice", action protocol, outcome buttons.
4. Suppliers — table of known suppliers (name, NIP, known accounts, domains, verified phone, payment history).
5. Audit log — table of all checks with timestamp, verdict, outcome, white list requestId.

## Demo scenarios (must work offline)
1. "Legit invoice" — Hurtownia Kowalski, known domain, known account, normal amount → GREEN.
2. "Account change attack" — same supplier, From domain `kowalski-hurtownia.com` instead of `hurtowniakowalski.pl`, Reply-To to a Gmail address, new account not on the white list, text "pilne, zmiana rachunku", amount 3× normal → RED.
3. "Service outage" — same as legit, but white list forced to UNAVAILABLE → AMBER "Unverified".

## Seed data
- 4 suppliers with checksum-valid fake NIPs and checksum-valid fake Polish IBANs, domains, phone numbers, 5–15 past payments each.
- whitelist-mock.json consistent with the scenarios.

## Design
- Calm, trustworthy banking style. Light theme, dark navy + one accent colour, plenty of whitespace, rounded cards, clear typography (Inter).
- Verdict colours: green #16a34a, amber #d97706, red #dc2626. Never rely on colour only — always icon + text.
- Responsive, looks good on a laptop projector.

## Out of scope
Login, real email inbox integration, real bank integration, PDF OCR (optional stretch goal only).

## Rules for the coding agent
- Work in small steps. After each step, run the app / tests and make sure there are no errors.
- Keep check logic in `/lib/checks/*.ts` as pure functions with unit tests.
- Do not add libraries without a reason. Do not rewrite working code unless asked.
- Write short comments explaining non-obvious logic (the team must be able to explain the code to the jury).