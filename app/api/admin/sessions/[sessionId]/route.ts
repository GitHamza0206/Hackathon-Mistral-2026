import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteCandidateSession, getCandidateSession } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const session = await getCandidateSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Candidate session not found." }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { sessionId } = await context.params;
  await deleteCandidateSession(sessionId);

  return NextResponse.json({ ok: true });
}
