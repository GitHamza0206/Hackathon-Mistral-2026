import type {
  CandidateSessionRecord,
  CandidateSubmissionInput,
  GitHubRepo,
  RoleTemplateRecord,
  SessionBootstrap,
  TranscriptEntry,
} from "@/lib/interviews";
import { clipText } from "@/lib/interviews";

export function buildRoleApplyIntro(role: RoleTemplateRecord) {
  const companyPrefix = role.companyName ? `${role.companyName} is hiring for` : "This interview is for";
  return `${companyPrefix} a ${role.roleTitle} role. Upload your CV, optionally add a cover letter, and share your public GitHub profile before the screening begins.`;
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
  const strategy = session.interviewStrategy;

  const base = [
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
  ];

  if (strategy) {
    const topicLines = strategy.keyTopics.map(
      (t) => `  - ${t.topic} (${t.depth}): ${t.reason}`,
    );

    base.push(
      "",
      "Pre-interview analysis (use this to guide your questions):",
      `- Candidate summary: ${strategy.candidateSummary}`,
      `- Estimated level: ${strategy.estimatedLevel}`,
      `- Recommended difficulty: ${strategy.recommendedDifficulty}`,
      `- Interview focus: ${strategy.interviewFocus}`,
      "",
      "Key topics to cover:",
      ...topicLines,
      "",
      "Suggested questions (adapt based on conversation flow):",
      ...strategy.specificQuestions.map((q) => `  - ${q}`),
      "",
      "CV claims to verify (probe these during the interview):",
      ...strategy.cvClaimsToVerify.map((c) => `  - ${c}`),
    );

    if (strategy.githubInsights.length > 0) {
      base.push(
        "",
        "GitHub insights:",
        ...strategy.githubInsights.map((g) => `  - ${g}`),
      );
    }
  } else {
    base.push(
      "",
      "Candidate-submitted materials:",
      `- Candidate name: ${candidate.candidateName}`,
      candidate.candidateEmail ? `- Candidate email: ${candidate.candidateEmail}` : undefined,
      `- GitHub profile URL: ${candidate.githubUrl}`,
      candidate.extraNote ? `- Candidate note: ${candidate.extraNote}` : undefined,
      `- CV text:\n${clipText(candidate.cvText, 5500)}`,
      candidate.coverLetterText
        ? `- Cover letter text:\n${clipText(candidate.coverLetterText, 3500)}`
        : "- Cover letter: not provided",
    );
  }

  base.push(
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
  );

  return base.filter(Boolean).join("\n");
}

function formatGitHubRepos(repos: GitHubRepo[]): string {
  if (repos.length === 0) {
    return "No public repositories available.";
  }

  return repos
    .map(
      (r) =>
        `- ${r.name}${r.description ? `: ${r.description}` : ""} [${r.language ?? "unknown"}] (${r.stars} stars, ${r.forks} forks)`,
    )
    .join("\n");
}

export function buildPreprocessingPrompt(
  session: CandidateSessionRecord,
  repos: GitHubRepo[],
): string {
  const role = session.roleSnapshot;
  const candidate = session.candidateProfile;

  return [
    "You are an expert technical recruiter preparing an interviewer brief.",
    "Analyze the following candidate materials against the job requirement and produce a structured interview strategy.",
    "",
    "Role requirement:",
    `- Role title: ${role.roleTitle}`,
    `- Target seniority: ${role.targetSeniority}`,
    `- Focus areas: ${role.focusAreas.join(", ")}`,
    role.companyName ? `- Company: ${role.companyName}` : undefined,
    role.adminNotes ? `- Internal hiring notes: ${role.adminNotes}` : undefined,
    `- Job description:\n${clipText(role.jobDescriptionText, 7000)}`,
    "",
    "Candidate materials:",
    `- Candidate name: ${candidate.candidateName}`,
    `- CV text:\n${clipText(candidate.cvText, 5500)}`,
    candidate.coverLetterText
      ? `- Cover letter text:\n${clipText(candidate.coverLetterText, 3500)}`
      : "- Cover letter: not provided",
    "",
    "GitHub repositories:",
    formatGitHubRepos(repos),
    "",
    "Produce a JSON object with the following fields:",
    "- candidateSummary (string): 2-3 sentence overview of the candidate's profile and fit.",
    "- estimatedLevel (string): your estimate of the candidate's level, e.g. \"junior\", \"mid\", \"mid-to-senior\", \"senior\", \"staff+\".",
    "- keyTopics (array of objects): 4-6 topics to focus on during the interview. Each object has:",
    "  - topic (string): e.g. \"RAG pipeline design\"",
    "  - reason (string): why this topic matters for this candidate and role",
    '  - depth ("surface" | "moderate" | "deep"): surface = basic familiarity check, moderate = working knowledge with examples, deep = architecture decisions and tradeoffs',
    "- specificQuestions (array of strings): 5-8 tailored interview questions based on the candidate's background and the role requirements.",
    "- cvClaimsToVerify (array of strings): claims from the CV that seem vague, inflated, or need probing during the interview.",
    "- githubInsights (array of strings): observations from the candidate's GitHub repos that are relevant to the role. If no repos are available, return an empty array.",
    '- recommendedDifficulty (string): one of "junior", "mid", "senior", "staff+" — the difficulty level the interview should target.',
    "- interviewFocus (string): a brief paragraph describing the overall interview approach and what the interviewer should prioritize.",
    "",
    "Return valid JSON only.",
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
    session.candidateProfile.coverLetterText
      ? `- Cover letter text:\n${clipText(session.candidateProfile.coverLetterText, 3000)}`
      : "- Cover letter: not provided",
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
