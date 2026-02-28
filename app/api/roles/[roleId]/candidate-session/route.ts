import { NextRequest, NextResponse } from "next/server";
import { createCandidateSessionAgent } from "@/lib/elevenlabs";
import { getAppBaseUrl } from "@/lib/env";
import { fetchGitHubRepos } from "@/lib/github";
import {
  createCandidateSessionId,
  createRoleSnapshot,
  validateCandidateSubmissionInput,
  type CandidateProfileRecord,
  type CandidateSessionRecord,
} from "@/lib/interviews";
import { parseUploadedPdf } from "@/lib/pdf";
import { generateInterviewStrategy } from "@/lib/preprocess";
import { buildCandidateSubmissionFromForm } from "@/lib/prompt";
import { getRoleTemplate, saveCandidateSession, updateCandidateSession } from "@/lib/storage";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ roleId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const startedAt = Date.now();
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
  const cvFile = normalizeOptionalPdfField(cvPdf);
  const coverLetterFile = normalizeOptionalPdfField(coverLetterPdf);

  if (!cvFile) {
    fieldErrors.cvPdf = "Upload your CV as a PDF.";
  }

  if (hasProvidedValue(coverLetterPdf) && !coverLetterFile) {
    fieldErrors.coverLetterPdf = "If provided, the cover letter must be a PDF.";
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
    const cvStartedAt = Date.now();
    const cvParsed = await parseUploadedPdf(cvFile as File, "CV PDF");
    logStepDuration("CV OCR", cvStartedAt);

    const coverLetterStartedAt = Date.now();
    const coverLetterParsed = coverLetterFile
      ? await parseUploadedPdf(coverLetterFile, "Cover letter PDF")
      : null;
    if (coverLetterFile) {
      logStepDuration("Cover letter OCR", coverLetterStartedAt);
    }

    const githubStartedAt = Date.now();
    const repos = await fetchGitHubRepos(payload.data.githubUrl);
    logStepDuration("GitHub enrichment", githubStartedAt);

    const candidateProfile: CandidateProfileRecord = {
      ...payload.data,
      cvFileName: cvParsed.fileName,
      cvText: cvParsed.text,
      coverLetterFileName: coverLetterParsed?.fileName,
      coverLetterText: coverLetterParsed?.text,
      githubRepos: repos.length > 0 ? repos : undefined,
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

    const saveStartedAt = Date.now();
    await saveCandidateSession(baseSession);
    logStepDuration("Initial session save", saveStartedAt);

    let enrichedSession = baseSession;
    try {
      const strategyStartedAt = Date.now();
      const strategy = await generateInterviewStrategy(baseSession, repos);
      logStepDuration("Interview preprocessing", strategyStartedAt);
      enrichedSession = { ...baseSession, interviewStrategy: strategy };

      const strategySaveStartedAt = Date.now();
      await updateCandidateSession(sessionId, (current) => ({
        ...current,
        interviewStrategy: strategy,
      }));
      logStepDuration("Strategy save", strategySaveStartedAt);
    } catch (error) {
      console.warn("Preprocessing failed, continuing without interview strategy:", error);
    }

    const agentStartedAt = Date.now();
    const agentId = await createCandidateSessionAgent(enrichedSession);
    logStepDuration("ElevenLabs agent creation", agentStartedAt);

    const finalSaveStartedAt = Date.now();
    await updateCandidateSession(sessionId, (current) => ({
      ...current,
      status: "agent_ready",
      agentId,
      error: undefined,
    }));
    logStepDuration("Final session update", finalSaveStartedAt);
    logStepDuration("Candidate session creation total", startedAt);

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
  } finally {
    logStepDuration("Candidate session request lifetime", startedAt);
  }
}

function normalizeOptionalPdfField(value: FormDataEntryValue | null) {
  if (value instanceof File) {
    return value.size > 0 ? value : null;
  }

  return null;
}

function hasProvidedValue(value: FormDataEntryValue | null) {
  if (value instanceof File) {
    return value.size > 0;
  }

  return typeof value === "string" ? value.trim().length > 0 : false;
}

function logStepDuration(label: string, startedAt: number) {
  console.info(`[candidate-session] ${label}: ${Date.now() - startedAt}ms`);
}
