import { NextResponse } from "next/server";
import { fetchConversationTranscript } from "@/lib/elevenlabs";
import { scoreCandidateSession } from "@/lib/mistral";
import {
  preferSavedTranscript,
  validateCandidateSessionCompletionInput,
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

  const payload = validateCandidateSessionCompletionInput(await request.json());

  if (!payload.data) {
    return NextResponse.json(
      { error: "Invalid completion payload.", fieldErrors: payload.errors },
      { status: 400 },
    );
  }

  try {
    const localTranscript = preferSavedTranscript(session.transcript, payload.data.transcript);
    let transcript = localTranscript;
    const sessionEndedAt = payload.data.sessionEndedAt ?? new Date().toISOString();

    if (payload.data.conversationId) {
      try {
        const remoteTranscript = await fetchConversationTranscript(payload.data.conversationId);
        transcript = preferSavedTranscript(localTranscript, remoteTranscript);
      } catch {
        transcript = localTranscript;
      }
    }

    transcript = preferSavedTranscript(session.transcript, transcript);

    const completedSession =
      (await updateCandidateSession(sessionId, (current) => ({
        ...current,
        status: "completed",
        sessionStartedAt: current.sessionStartedAt ?? current.createdAt,
        sessionEndedAt,
        conversationId: payload.data?.conversationId ?? current.conversationId,
        transcript: preferSavedTranscript(current.transcript, transcript),
        error: undefined,
      }))) ?? session;

    const scorecard = await scoreCandidateSession(completedSession, transcript);

    await updateCandidateSession(sessionId, (current) => ({
      ...current,
      status: "scored",
      sessionStartedAt: current.sessionStartedAt ?? current.createdAt,
      sessionEndedAt,
      conversationId: payload.data?.conversationId ?? current.conversationId,
      transcript: preferSavedTranscript(current.transcript, transcript),
      scorecard,
      error: undefined,
    }));

    return NextResponse.json({ ok: true, status: "scored" });
  } catch (error) {
    await updateCandidateSession(sessionId, (current) => ({
      ...current,
      status: "failed",
      sessionStartedAt: current.sessionStartedAt ?? current.createdAt,
      sessionEndedAt: payload.data?.sessionEndedAt ?? current.sessionEndedAt,
      conversationId: payload.data?.conversationId ?? current.conversationId,
      transcript: preferSavedTranscript(current.transcript, payload.data?.transcript),
      error: error instanceof Error ? error.message : "Scoring failed.",
    }));

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to complete and score the session.",
      },
      { status: 500 },
    );
  }
}
