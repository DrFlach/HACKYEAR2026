// SPEC.md "Demo scenarios (must work offline)": the 3 canonical examples
// shown as one-click buttons on the New Check screen. Each one is just the
// same shape of input the manual form produces, plus which white list
// mode to use.

import type { EmailInput, InvoiceInput } from "./checks/run-checks";
import type { VatWhitelistOptions } from "./checks/vat-whitelist";

export interface DemoScenario {
  id: string;
  label: string;
  description: string;
  email: EmailInput;
  invoice: InvoiceInput;
  whitelistOptions: VatWhitelistOptions;
}

// Hurtownia Kowalski's real data (see /data/suppliers.json): NIP
// 2046483277, known account ...478503, domain hurtowniakowalski.pl,
// historical average payment ~5,190 PLN.
const KOWALSKI_NIP = "2046483277";
const KOWALSKI_ACCOUNT = "40495009592248961325478503";
// A checksum-valid "mule" account that is NOT one of Kowalski's known
// accounts -- see /data/whitelist-mock.json, where it is marked NIE.
const MULE_ACCOUNT = "69244915051998392161174484";

const LEGIT_EMAIL: EmailInput = {
  from: "biuro@hurtowniakowalski.pl",
  subject: "Faktura VAT 2026/09/0114",
  body:
    "Dzień dobry,\n\nW załączeniu przesyłamy fakturę za wrześniową dostawę towaru. Termin płatności: 14 dni od daty wystawienia.\n\nZ poważaniem,\nDział księgowości\nHurtownia Kowalski",
};

const LEGIT_INVOICE: InvoiceInput = {
  supplierNip: KOWALSKI_NIP,
  supplierName: "Hurtownia Kowalski sp. z o.o.",
  account: KOWALSKI_ACCOUNT,
  amount: 5200,
  currency: "PLN",
  dueDate: "2026-10-18",
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "legit-invoice",
    label: "Legit invoice",
    description:
      "Hurtownia Kowalski, known domain, known account, normal amount.",
    email: LEGIT_EMAIL,
    invoice: LEGIT_INVOICE,
    whitelistOptions: { mock: true },
  },
  {
    id: "account-change-attack",
    label: "Account change attack",
    description:
      "Same supplier name, but a look-alike domain, a Gmail Reply-To, a brand-new account, pressure language, and 3x the normal amount.",
    email: {
      from: "ksiegowosc@kowalski-hurtownia.com",
      replyTo: "pay.urgent.2026@gmail.com",
      subject: "PILNE: zmiana rachunku bankowego",
      body:
        "Dzień dobry,\n\nUWAGA: zmiana rachunku bankowego. Nowy numer konta podany jest poniżej. To pilne, prosimy o płatność dzisiaj. To jest poufne, prosimy nie przekazywać dalej.\n\nNumer konta: PL69 2449 1505 1998 3921 6117 4484\n\nHurtownia Kowalski",
    },
    invoice: {
      supplierNip: KOWALSKI_NIP,
      supplierName: "Hurtownia Kowalski sp. z o.o.",
      account: MULE_ACCOUNT,
      amount: 15600, // ~3x the 5,190 PLN historical average
      currency: "PLN",
      dueDate: "2026-10-05",
    },
    whitelistOptions: { mock: true },
  },
  {
    id: "service-outage",
    label: "Service outage",
    description:
      "Same as the legit invoice, but the VAT white list service is forced UNAVAILABLE.",
    email: LEGIT_EMAIL,
    invoice: LEGIT_INVOICE,
    whitelistOptions: { forceUnavailable: true },
  },
];
