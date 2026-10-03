// Loads the seeded suppliers and provides lookup by NIP.
// This is the "in-memory store" half that's just static JSON (SPEC.md:
// "Data: JSON seed files in /data + in-memory store. No database.") --
// the mutable half (audit entries) lives in ./store.ts.

import suppliersData from "@/data/suppliers.json";
import type { Supplier } from "./checks/types";
import { normalizeNip } from "./checks/nip";

export const suppliers: Supplier[] = suppliersData as Supplier[];

/** Finds a supplier by NIP, tolerating dashes/spaces in either value. */
export function findSupplierByNip(nip: string): Supplier | undefined {
  const normalized = normalizeNip(nip);
  return suppliers.find((s) => normalizeNip(s.nip) === normalized);
}
