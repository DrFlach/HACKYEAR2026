// Read-only listing of the in-memory audit store, for the Dashboard and
// Audit log screens. A separate route (rather than those pages importing
// lib/store directly) because in Next.js dev, Server Components and
// Route Handlers can end up in different module graphs -- a
// directly-imported module-level singleton isn't reliably shared between
// them. Going through HTTP, like every other screen already does, sidesteps
// that entirely.

import { NextResponse } from "next/server";
import { listAuditEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ entries: listAuditEntries() });
}
