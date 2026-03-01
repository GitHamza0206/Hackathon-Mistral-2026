import { NextResponse } from "next/server";
import { getCandidateSession, updateCandidateSession } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function POST(_: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await getCandidateSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Candidate session not found." }, { status: 404 });
  }

  const startedAt = session.sessionStartedAt ?? new Date().toISOString();

  const updated =
    (await updateCandidateSession(sessionId, (current) => ({
      ...current,
      status:
        ["completed", "scored", "rejected", "under_review", "next_round"].includes(current.status) ? current.status : "in_progress",
      sessionStartedAt: current.sessionStartedAt ?? startedAt,
      sessionEndedAt:
        ["completed", "scored", "rejected", "under_review", "next_round"].includes(current.status) ? current.sessionEndedAt : undefined,
      error: undefined,
    }))) ?? session;

  return NextResponse.json({
    ok: true,
    status: updated.status,
    sessionStartedAt: updated.sessionStartedAt ?? startedAt,
  });
}
