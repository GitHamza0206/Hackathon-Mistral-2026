import { NextResponse } from "next/server";
import {
  preferSavedTranscript,
  validateCandidateSessionSyncInput,
} from "@/lib/interviews";
import { getCandidateSession, updateCandidateSession } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await getCandidateSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Candidate session not found." }, { status: 404 });
  }

  const payload = validateCandidateSessionSyncInput(await request.json());

  if (!payload.data) {
    return NextResponse.json(
      { error: "Invalid session sync payload.", fieldErrors: payload.errors },
      { status: 400 },
    );
  }

  const updated =
    (await updateCandidateSession(sessionId, (current) => {
      const isTerminalStatus =
        current.status === "completed" || current.status === "scored" || current.status === "rejected" || current.status === "under_review" || current.status === "next_round" || current.status === "failed";

      return {
        ...current,
        status: isTerminalStatus ? current.status : "in_progress",
        sessionStartedAt:
          current.sessionStartedAt ?? payload.data?.sessionStartedAt ?? new Date().toISOString(),
        sessionEndedAt: isTerminalStatus ? current.sessionEndedAt : undefined,
        conversationId: payload.data?.conversationId ?? current.conversationId,
        transcript: preferSavedTranscript(current.transcript, payload.data?.transcript),
        error: isTerminalStatus ? current.error : undefined,
      };
    })) ?? session;

  return NextResponse.json({
    ok: true,
    status: updated.status,
    conversationId: updated.conversationId,
    transcriptCount: updated.transcript?.length ?? 0,
    sessionStartedAt: updated.sessionStartedAt,
  });
}
