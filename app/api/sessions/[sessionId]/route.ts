import { NextResponse } from "next/server";
import { createConversationSignedUrl } from "@/lib/elevenlabs";
import { buildSessionBootstrap } from "@/lib/prompt";
import { ensureSessionTranscript } from "@/lib/session-transcript";
import { getCandidateSession } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const session = await getCandidateSession(sessionId);

    if (!session || !session.agentId) {
      return NextResponse.json({ error: "Candidate session not found." }, { status: 404 });
    }

    const [hydratedSession, signedUrl] = await Promise.all([
      ensureSessionTranscript(session),
      createConversationSignedUrl(session.agentId),
    ]);

    return NextResponse.json(buildSessionBootstrap(hydratedSession, { signedUrl }));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the interview session.",
      },
      { status: 500 },
    );
  }
}
