import { NextResponse } from "next/server";
import { validateCandidateExperienceFeedback } from "@/lib/interviews";
import { getCandidateSession, updateCandidateSession } from "@/lib/storage";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const session = await getCandidateSession(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const allowedStatuses = ["scored", "rejected", "under_review", "next_round"];
  if (!allowedStatuses.includes(session.status)) {
    return NextResponse.json(
      { error: "Feedback can only be submitted after the interview is complete." },
      { status: 400 },
    );
  }

  if (session.candidateExperienceFeedback) {
    return NextResponse.json(
      { error: "Feedback has already been submitted." },
      { status: 409 },
    );
  }

  const payload = validateCandidateExperienceFeedback(await request.json());
  if (!payload.data) {
    return NextResponse.json(
      { error: "Invalid feedback.", fieldErrors: payload.errors },
      { status: 400 },
    );
  }

  await updateCandidateSession(sessionId, (current) => ({
    ...current,
    candidateExperienceFeedback: payload.data!,
  }));

  return NextResponse.json({ ok: true });
}
