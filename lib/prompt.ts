import type {
  CandidateSessionRecord,
  CandidateSubmissionInput,
  RoleTemplateRecord,
  SessionBootstrap,
  TranscriptEntry,
} from "@/lib/interviews";
import { clipText } from "@/lib/interviews";

export function buildRoleApplyIntro(role: RoleTemplateRecord) {
  const companyPrefix = role.companyName ? `${role.companyName} is hiring for` : "This interview is for";
  return `${companyPrefix} a ${role.roleTitle} role. Upload your CV, cover letter, and public GitHub profile before the screening begins.`;
}

export function buildSessionIntro(session: CandidateSessionRecord) {
  return `You are interviewing for ${session.roleSnapshot.roleTitle}. Expect about ${session.roleSnapshot.durationMinutes} minutes focused on ${session.roleSnapshot.focusAreas.join(", ")}.`;
}

export function buildSessionBootstrap(session: CandidateSessionRecord): SessionBootstrap {
  return {
    sessionId: session.id,
    candidateName: session.candidateProfile.candidateName,
    roleTitle: session.roleSnapshot.roleTitle,
    durationMinutes: session.roleSnapshot.durationMinutes,
    agentId: session.agentId ?? "",
    status: session.status,
    intro: buildSessionIntro(session),
  };
}

export function buildCandidateAgentPrompt(session: CandidateSessionRecord) {
  const role = session.roleSnapshot;
  const candidate = session.candidateProfile;

  return [
    "You are a candidate-facing AI engineer screener conducting a live technical interview.",
    "",
    "Primary objective:",
    "- Evaluate the candidate against the hiring requirement supplied by the company.",
    "- Tailor your questions to both the job requirement and the candidate's submitted materials.",
    "",
    "Role requirement:",
    `- Role title: ${role.roleTitle}`,
    `- Target seniority: ${role.targetSeniority}`,
    `- Focus areas: ${role.focusAreas.join(", ")}`,
    role.companyName ? `- Company: ${role.companyName}` : undefined,
    role.adminNotes ? `- Internal hiring notes: ${role.adminNotes}` : undefined,
    `- Job description:\n${clipText(role.jobDescriptionText, 7000)}`,
    "",
    "Candidate-submitted materials:",
    `- Candidate name: ${candidate.candidateName}`,
    candidate.candidateEmail ? `- Candidate email: ${candidate.candidateEmail}` : undefined,
    `- GitHub profile URL: ${candidate.githubUrl}`,
    candidate.extraNote ? `- Candidate note: ${candidate.extraNote}` : undefined,
    `- CV text:\n${clipText(candidate.cvText, 5500)}`,
    `- Cover letter text:\n${clipText(candidate.coverLetterText, 3500)}`,
    "",
    "Interview behavior:",
    "- Ask one question at a time.",
    "- Use the candidate materials to choose relevant follow-up questions.",
    "- Probe when answers are vague or not supported by the submitted materials.",
    "- Prefer implementation realism, debugging, systems thinking, and tradeoff reasoning over trivia.",
    "- Adapt the difficulty to the stated target seniority and the evidence from the conversation.",
    "- Do not reveal scoring logic or hidden evaluation criteria.",
    "- Do not provide the correct answer during the interview.",
    "- Close politely and say the hiring team will review the results.",
    "",
    "Coverage areas:",
    "- LLM engineering fundamentals and production tradeoffs",
    "- RAG, evaluation, and retrieval design",
    "- Tool use and orchestration",
    "- Debugging and incident handling",
    "- System design and scaling decisions",
    "- Communication and reasoning clarity",
    "",
    "Hidden evaluation guidance:",
    "- Look for alignment with the job requirement, not just general competence.",
    "- Challenge resume and GitHub claims when they sound overstated or underspecified.",
    "- Reward specific production experience, engineering judgment, and ownership.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildMistralScoringPrompt(
  session: CandidateSessionRecord,
  transcript: TranscriptEntry[],
) {
  const transcriptText = transcript
    .map((entry, index) => `${index + 1}. ${entry.speaker.toUpperCase()}: ${entry.text}`)
    .join("\n");

  return [
    "You are evaluating an AI engineering screening interview.",
    "",
    "Return JSON only with this shape:",
    "{",
    '  "overallRecommendation": "strong_no|no|mixed|yes|strong_yes",',
    '  "seniorityEstimate": "junior|mid|senior|staff+",',
    '  "overallScore": 0,',
    '  "technicalDepthScore": 0,',
    '  "llmProductEngineeringScore": 0,',
    '  "codingAndDebuggingScore": 0,',
    '  "systemDesignScore": 0,',
    '  "communicationScore": 0,',
    '  "strengths": ["..."],',
    '  "concerns": ["..."],',
    '  "followUpQuestions": ["..."],',
    '  "summary": "..."',
    "}",
    "",
    "Scoring rubric:",
    "- Score from 0 to 100.",
    "- Judge the candidate against the hiring requirement, not in isolation.",
    "- Use the candidate materials only as context; the transcript is the primary evidence.",
    "- Be skeptical of vague or inflated claims.",
    "",
    "Role requirement:",
    `- Role title: ${session.roleSnapshot.roleTitle}`,
    `- Target seniority: ${session.roleSnapshot.targetSeniority}`,
    `- Focus areas: ${session.roleSnapshot.focusAreas.join(", ")}`,
    session.roleSnapshot.companyName ? `- Company: ${session.roleSnapshot.companyName}` : undefined,
    session.roleSnapshot.adminNotes ? `- Internal hiring notes: ${session.roleSnapshot.adminNotes}` : undefined,
    `- Job description:\n${clipText(session.roleSnapshot.jobDescriptionText, 6500)}`,
    "",
    "Candidate profile:",
    `- Name: ${session.candidateProfile.candidateName}`,
    `- GitHub profile URL: ${session.candidateProfile.githubUrl}`,
    session.candidateProfile.extraNote
      ? `- Candidate note: ${session.candidateProfile.extraNote}`
      : undefined,
    `- CV text:\n${clipText(session.candidateProfile.cvText, 4500)}`,
    `- Cover letter text:\n${clipText(session.candidateProfile.coverLetterText, 3000)}`,
    "",
    "Transcript:",
    transcriptText || "No transcript available.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function getRoleFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function buildCandidateSubmissionFromForm(formData: FormData): CandidateSubmissionInput {
  return {
    candidateName: getRoleFormValue(formData, "candidateName"),
    candidateEmail: getRoleFormValue(formData, "candidateEmail") || undefined,
    githubUrl: getRoleFormValue(formData, "githubUrl"),
    extraNote: getRoleFormValue(formData, "extraNote") || undefined,
  };
}
