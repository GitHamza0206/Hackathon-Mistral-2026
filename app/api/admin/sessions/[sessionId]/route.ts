import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { deleteCandidateSession, getCandidateSession, updateCandidateSession } from "@/lib/storage";
import type { CandidateSessionStatus } from "@/lib/interviews";

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

const ALLOWED_STATUSES: CandidateSessionStatus[] = [
  "rejected",
  "next_round",
  "under_review",
];

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const body = await request.json();
  const targetStatus = body.status as CandidateSessionStatus;

  if (!targetStatus || !ALLOWED_STATUSES.includes(targetStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const updated = await updateCandidateSession(sessionId, (record) => ({
    ...record,
    status: targetStatus,
  }));

  if (!updated) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status: targetStatus });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { sessionId } = await context.params;
  await deleteCandidateSession(sessionId);

  return NextResponse.json({ ok: true });
}
