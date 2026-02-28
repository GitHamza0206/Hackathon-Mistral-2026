import { NextResponse } from "next/server";
import { buildSessionBootstrap } from "@/lib/prompt";
import { ensureSessionTranscript } from "@/lib/session-transcript";
import { getCandidateSession } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    console.info("[session-bootstrap] request:start", { sessionId });
    const session = await getCandidateSession(sessionId);

    if (!session || !session.agentId) {
      console.warn("[session-bootstrap] request:missing-session", {
        sessionId,
        found: Boolean(session),
        hasAgentId: Boolean(session?.agentId),
        status: session?.status,
      });
      return NextResponse.json({ error: "Candidate session not found." }, { status: 404 });
    }

    const hydratedSession = await ensureSessionTranscript(session);

    console.info("[session-bootstrap] request:success", {
      sessionId,
      status: hydratedSession.status,
      hasAgentId: Boolean(hydratedSession.agentId),
      transcriptCount: hydratedSession.transcript?.length ?? 0,
    });

    return NextResponse.json(buildSessionBootstrap(hydratedSession));
  } catch (error) {
    const { sessionId } = await context.params;
    console.error("[session-bootstrap] request:error", {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
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
