import { type NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { updateCandidateSession } from "@/lib/storage";
import type { CandidateSessionStatus } from "@/lib/interviews";

const allowedStatuses: CandidateSessionStatus[] = ["rejected", "next_round", "under_review"];

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    sessionIds?: string[];
    targetStatus?: CandidateSessionStatus;
  };

  if (!body.targetStatus || !allowedStatuses.includes(body.targetStatus)) {
    return NextResponse.json({ error: "Invalid target status." }, { status: 400 });
  }

  if (!Array.isArray(body.sessionIds) || body.sessionIds.length === 0 || body.sessionIds.length > 50) {
    return NextResponse.json({ error: "Provide 1-50 session IDs." }, { status: 400 });
  }

  const targetStatus = body.targetStatus;
  const results = await Promise.allSettled(
    body.sessionIds.map((id) =>
      updateCandidateSession(id, (record) => ({ ...record, status: targetStatus })),
    ),
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ ok: true, succeeded, failed });
}
