import { NextResponse } from "next/server";
import { buildSessionBootstrap } from "@/lib/prompt";
import { getCandidateSession } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await getCandidateSession(sessionId);

  if (!session || !session.agentId) {
    return NextResponse.json({ error: "Candidate session not found." }, { status: 404 });
  }

  return NextResponse.json(buildSessionBootstrap(session));
}
