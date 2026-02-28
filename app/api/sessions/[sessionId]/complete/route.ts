import { NextResponse } from "next/server";
import { fetchConversationTranscript } from "@/lib/elevenlabs";
import { scoreCandidateSession } from "@/lib/mistral";
import { validateCandidateSessionCompletionInput } from "@/lib/interviews";
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
    let transcript = payload.data.transcript ?? [];

    if (payload.data.conversationId) {
      try {
        transcript = await fetchConversationTranscript(payload.data.conversationId);
      } catch {
        transcript = payload.data.transcript ?? [];
      }
    }

    const completedSession =
      (await updateCandidateSession(sessionId, (current) => ({
        ...current,
        status: "completed",
        conversationId: payload.data?.conversationId ?? current.conversationId,
        transcript,
        error: undefined,
      }))) ?? session;

    const scorecard = await scoreCandidateSession(completedSession, transcript);

    await updateCandidateSession(sessionId, (current) => ({
      ...current,
      status: "scored",
      conversationId: payload.data?.conversationId ?? current.conversationId,
      transcript,
      scorecard,
      error: undefined,
    }));

    return NextResponse.json({ ok: true, status: "scored" });
  } catch (error) {
    await updateCandidateSession(sessionId, (current) => ({
      ...current,
      status: "failed",
      conversationId: payload.data?.conversationId ?? current.conversationId,
      transcript: payload.data?.transcript ?? current.transcript,
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
