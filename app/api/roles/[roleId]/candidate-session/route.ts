import { NextRequest, NextResponse } from "next/server";
import { createCandidateSessionAgent } from "@/lib/elevenlabs";
import { getAppBaseUrl } from "@/lib/env";
import {
  createCandidateSessionId,
  createRoleSnapshot,
  validateCandidateSubmissionInput,
  type CandidateProfileRecord,
  type CandidateSessionRecord,
} from "@/lib/interviews";
import { parseUploadedPdf } from "@/lib/pdf";
import { buildCandidateSubmissionFromForm } from "@/lib/prompt";
import { getRoleTemplate, saveCandidateSession, updateCandidateSession } from "@/lib/storage";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ roleId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { roleId } = await context.params;
  const role = await getRoleTemplate(roleId);

  if (!role) {
    return NextResponse.json({ error: "Role template not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const payload = validateCandidateSubmissionInput(buildCandidateSubmissionFromForm(formData));
  const cvPdf = formData.get("cvPdf");
  const coverLetterPdf = formData.get("coverLetterPdf");
  const fieldErrors: Record<string, string> = {};

  if (!(cvPdf instanceof File)) {
    fieldErrors.cvPdf = "Upload your CV as a PDF.";
  }

  if (!(coverLetterPdf instanceof File)) {
    fieldErrors.coverLetterPdf = "Upload your cover letter as a PDF.";
  }

  if (!payload.data || Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        error: "Invalid candidate submission.",
        fieldErrors: {
          ...payload.errors,
          ...fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  try {
    const [cvParsed, coverLetterParsed] = await Promise.all([
      parseUploadedPdf(cvPdf as File, "CV PDF"),
      parseUploadedPdf(coverLetterPdf as File, "Cover letter PDF"),
    ]);

    const candidateProfile: CandidateProfileRecord = {
      ...payload.data,
      cvFileName: cvParsed.fileName,
      cvText: cvParsed.text,
      coverLetterFileName: coverLetterParsed.fileName,
      coverLetterText: coverLetterParsed.text,
    };

    const sessionId = createCandidateSessionId();
    const baseSession: CandidateSessionRecord = {
      id: sessionId,
      roleId: role.id,
      createdAt: new Date().toISOString(),
      status: "profile_submitted",
      roleSnapshot: createRoleSnapshot(role),
      candidateProfile,
    };

    await saveCandidateSession(baseSession);

    const agentId = await createCandidateSessionAgent(baseSession);

    await updateCandidateSession(sessionId, (current) => ({
      ...current,
      status: "agent_ready",
      agentId,
      error: undefined,
    }));

    return NextResponse.json({
      sessionId,
      agentId,
      sessionUrl: `${getAppBaseUrl(request.nextUrl.origin)}/session/${sessionId}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare the candidate session.",
      },
      { status: 500 },
    );
  }
}
