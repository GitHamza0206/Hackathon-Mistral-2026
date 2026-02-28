import { NextResponse } from "next/server";
import { attachAdminSession, isValidAdminPasscode } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { passcode?: string };

  if (!body.passcode || !isValidAdminPasscode(body.passcode)) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  return attachAdminSession(NextResponse.json({ ok: true }));
}
