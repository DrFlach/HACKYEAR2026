// SPEC.md Dashboard: "mock/live toggle for the white list."
// GET  -> current mode.
// POST -> set the mode ({ whitelistMode: "mock" | "live" }).

import { NextRequest, NextResponse } from "next/server";
import { getWhitelistMode, setWhitelistMode, type WhitelistMode } from "@/lib/store";

export const dynamic = "force-dynamic";

const VALID_MODES: WhitelistMode[] = ["mock", "live"];

export async function GET() {
  return NextResponse.json({ whitelistMode: getWhitelistMode() });
}

export async function POST(req: NextRequest) {
  let body: { whitelistMode?: WhitelistMode };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  if (!body.whitelistMode || !VALID_MODES.includes(body.whitelistMode)) {
    return NextResponse.json(
      { error: `whitelistMode must be one of: ${VALID_MODES.join(", ")}.` },
      { status: 400 }
    );
  }

  return NextResponse.json({ whitelistMode: setWhitelistMode(body.whitelistMode) });
}
