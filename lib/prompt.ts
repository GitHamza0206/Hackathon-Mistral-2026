import type {
  CandidateSessionRecord,
  CandidateSubmissionInput,
  GitHubRepo,
  RoleTemplateRecord,
  SessionBootstrap,
  TranscriptEntry,
} from "@/lib/interviews";
import { clipText, extractCandidateFeedback } from "@/lib/interviews";

export function buildRoleApplyIntro(role: RoleTemplateRecord) {
  const companyPrefix = role.companyName ? `${role.companyName} is hiring for` : "This interview is for";
  return `${companyPrefix} a ${role.roleTitle} role. Upload your CV, optionally add a cover letter, and share your public GitHub profile before the screening begins.`;
}

export function buildSessionIntro(session: CandidateSessionRecord) {
  return `You are interviewing for ${session.roleSnapshot.roleTitle}. Expect about ${session.roleSnapshot.durationMinutes} minutes focused on ${session.roleSnapshot.focusAreas.join(", ")}.`;
}

export function buildSessionBootstrap(
  session: CandidateSessionRecord,
): SessionBootstrap {
  return {
    sessionId: session.id,
    candidateName: session.candidateProfile.candidateName,
    roleTitle: session.roleSnapshot.roleTitle,
    durationMinutes: session.roleSnapshot.durationMinutes,
    agentId: session.agentId ?? "",
    status: session.status,
    intro: buildSessionIntro(session),
    conversationId: session.conversationId,
    transcript: session.transcript ?? [],
    sessionStartedAt: session.sessionStartedAt,
    sessionEndedAt: session.sessionEndedAt,
    candidateFeedback:
      ["scored", "rejected", "under_review", "next_round"].includes(session.status) && session.scorecard
        ? extractCandidateFeedback(session.scorecard)
        : undefined,
  };
}

interface TechnicalQuestionExample {
  title: string;
  keywords: string[];
  broadQuestion: string;
  sampleFollowUpQuestion: string;
}

const preferredTechnicalQuestionExamples: TechnicalQuestionExample[] = [
  {
    title: "LLM feature launch",
    keywords: ["llm", "prompt", "ai", "agent", "inference"],
    broadQuestion:
      "Tell me about a production LLM feature you shipped. What was the problem and how did you approach building it?",
    sampleFollowUpQuestion:
      "What was the hardest tradeoff you made in that system?",
  },
  {
    title: "RAG system design",
    keywords: ["rag", "retrieval", "search", "embedding", "vector"],
    broadQuestion:
      "Walk me through how you would design a RAG system for a real product. Where do you start?",
    sampleFollowUpQuestion:
      "How would you check whether retrieval quality is actually good enough?",
  },
  {
    title: "Tool use and orchestration",
    keywords: ["tool", "orchestration", "workflow", "function", "agentic"],
    broadQuestion:
      "Tell me about a workflow where an AI system had to use tools or call external APIs. How did you structure it?",
    sampleFollowUpQuestion:
      "What did the deterministic application layer own in that workflow?",
  },
  {
    title: "Debugging and reliability",
    keywords: ["debug", "incident", "reliability", "observability", "latency"],
    broadQuestion:
      "Walk me through a difficult production incident involving an AI or backend system. What happened?",
    sampleFollowUpQuestion:
      "How did you isolate the root cause?",
  },
  {
    title: "System design and scaling",
    keywords: ["scale", "system", "distributed", "backend", "architecture"],
    broadQuestion:
      "If the system you built suddenly had ten times more users, where would you start looking for problems?",
    sampleFollowUpQuestion:
      "What would you fix first, and why?",
  },
  {
    title: "Evaluation strategy",
    keywords: ["evaluation", "eval", "quality", "benchmark", "testing"],
    broadQuestion:
      "How do you think about evaluating whether an AI feature is ready for production?",
    sampleFollowUpQuestion:
      "Which signal would you trust most first?",
  },
];

const defaultCoverageAreas = [
  "LLM engineering fundamentals and production tradeoffs",
  "RAG, evaluation, and retrieval design",
  "Tool use and orchestration",
  "Debugging and incident handling",
  "System design and scaling decisions",
  "Communication and reasoning clarity",
];

function buildSessionCorpus(session: CandidateSessionRecord): string {
  const role = session.roleSnapshot;
  const candidate = session.candidateProfile;
  return [
    role.roleTitle,
    role.targetSeniority,
    role.focusAreas.join(" "),
    role.adminNotes ?? "",
    role.jobDescriptionText,
    candidate.cvText,
    candidate.coverLetterText ?? "",
    candidate.extraNote ?? "",
    candidate.githubUrl,
    candidate.personalWebsiteText ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function selectPatternsForBudget(
  budget: number,
  session: CandidateSessionRecord,
): TechnicalQuestionExample[] {
  const adminNotes = session.roleSnapshot.adminNotes?.toLowerCase() ?? "";
  const limit = Math.min(budget + 1, 3);

  if (adminNotes) {
    const matching = preferredTechnicalQuestionExamples.filter((example) =>
      example.keywords.some((keyword) => adminNotes.includes(keyword)),
    );
    if (matching.length > 0) {
      return matching.slice(0, limit);
    }
  }

  const corpus = buildSessionCorpus(session);
  const scored = preferredTechnicalQuestionExamples.map((example) => ({
    example,
    score: example.keywords.filter((k) => corpus.includes(k)).length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(limit, 2)).map((s) => s.example);
}

function selectCoverageForBudget(
  budget: number,
  session: CandidateSessionRecord,
): string[] {
  const adminNotes = session.roleSnapshot.adminNotes?.toLowerCase() ?? "";
  const limit = Math.min(budget + 1, 3);

  if (adminNotes) {
    const matching = defaultCoverageAreas.filter((area) => {
      const areaLower = area.toLowerCase();
      const noteWords = adminNotes.split(/\s+/).filter((w) => w.length > 3);
      return noteWords.some((word) => areaLower.includes(word));
    });
    if (matching.length > 0) {
      return matching.slice(0, limit);
    }
  }

  return defaultCoverageAreas.slice(0, Math.max(limit, 2));
}

function buildInterviewAgentIdentity(session: CandidateSessionRecord) {
  const companyName = session.roleSnapshot.companyName?.trim();
  return companyName ? `an AI interview agent for ${companyName}` : "an AI interview agent";
}

function pickOpeningTechnicalQuestion(session: CandidateSessionRecord) {
  const adminNotes = session.roleSnapshot.adminNotes?.toLowerCase() ?? "";

  if (adminNotes) {
    const adminMatch = preferredTechnicalQuestionExamples.find((example) =>
      example.keywords.some((keyword) => adminNotes.includes(keyword)),
    );
    if (adminMatch) {
      return adminMatch.broadQuestion;
    }
  }

  const corpus = buildSessionCorpus(session);
  const match =
    preferredTechnicalQuestionExamples.find((example) =>
      example.keywords.some((keyword) => corpus.includes(keyword)),
    ) ?? preferredTechnicalQuestionExamples[0];

  return match.broadQuestion;
}

export function buildCandidateAgentFirstMessage(session: CandidateSessionRecord) {
  const identity = buildInterviewAgentIdentity(session);
  const openingQuestion = pickOpeningTechnicalQuestion(session);

  return [
    `Hi ${session.candidateProfile.candidateName}.`,
    `I am ${identity}.`,
    `I will be conducting the interview for the ${session.roleSnapshot.roleTitle} position.`,
    "Thank you for taking the time to be here today.",
    "We are going to start now.",
    "...",
    openingQuestion,
  ].join(" ");
}

export function buildCandidateAgentPrompt(session: CandidateSessionRecord) {
  const role = session.roleSnapshot;
  const candidate = session.candidateProfile;
  const identity = buildInterviewAgentIdentity(session);
  const strategy = session.interviewStrategy;
  const durationMinutes = role.durationMinutes;
  const technicalQuestionBudget = Math.max(1, Math.floor((durationMinutes - 3) / 10));

  const base: (string | undefined)[] = [
    "You are a candidate-facing AI engineer screener conducting a live technical interview.",
  ];

  // === ADMIN NOTES: HIGHEST PRIORITY, FIRST POSITION ===
  if (role.adminNotes) {
    base.push(
      "",
      "=== CRITICAL: HIRING MANAGER DIRECTIVES (OVERRIDE ALL DEFAULTS) ===",
      "The hiring manager has provided the following directives. These OVERRIDE all default question patterns, coverage areas, and topic selections below. You MUST follow these instructions even if they contradict other parts of this prompt:",
      "",
      role.adminNotes,
      "",
      "If these directives specify which topics to focus on, ONLY ask about those topics.",
      "If these directives say to avoid certain topics, you MUST NOT ask about them under any circumstances.",
      "=== END HIRING MANAGER DIRECTIVES ===",
    );
  }

  // === TOPIC BUDGET: SECOND PRIORITY ===
  base.push(
    "",
    "=== STRICT TOPIC BUDGET ===",
    `Total interview duration: ${durationMinutes} minutes.`,
    `You have a HARD LIMIT of exactly ${technicalQuestionBudget} technical topic${technicalQuestionBudget > 1 ? "s" : ""}.`,
    "For each topic: ask exactly 1 opening question, then at most 2 follow-ups (3 questions per topic maximum).",
    `After completing topic ${technicalQuestionBudget}, you MUST IMMEDIATELY wind down. No exceptions.`,
    "DO NOT ask about additional topics beyond this budget, even if time seems to remain.",
    "=== END BUDGET ===",
  );

  // === PRIMARY OBJECTIVE ===
  base.push(
    "",
    "Primary objective:",
    "- Evaluate the candidate against the hiring requirement supplied by the company.",
    "- Tailor your questions to both the job requirement and the candidate's submitted materials.",
  );

  // === ROLE REQUIREMENT (admin notes removed — already at top) ===
  base.push(
    "",
    "Role requirement:",
    `- Role title: ${role.roleTitle}`,
    `- Target seniority: ${role.targetSeniority}`,
    `- Focus areas: ${role.focusAreas.join(", ")}`,
    role.companyName ? `- Company: ${role.companyName}` : undefined,
    `- Job description:\n${clipText(role.jobDescriptionText, 7000)}`,
  );

  // === STRATEGY OR CANDIDATE MATERIALS ===
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
      "Suggested questioning style:",
      "- Each topic should start with one broad opening question.",
      "- Wait for the candidate's answer before asking any follow-up.",
      "- Ask only one follow-up at a time.",
      "- Adapt each follow-up to what the candidate actually said.",
      "- Continue with additional follow-ups only when the previous answer justifies it.",
      ...strategy.specificQuestions.map((q) => `  - Topic anchor: ${q}`),
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
      candidate.personalWebsiteText
        ? `- Personal website content:\n${clipText(candidate.personalWebsiteText, 3000)}`
        : undefined,
    );
  }

  // === OPENING SCRIPT + PACING + BEHAVIOR ===
  base.push(
    "",
    "Opening script:",
    `- Introduce yourself as ${identity}.`,
    `- State that you will conduct the interview for the ${role.roleTitle} position.`,
    "- Thank the candidate for taking the time to be there.",
    "- Say that the interview is going to start now.",
    "- Leave a brief pause after the introduction before the first technical question.",
    "- Do not begin by asking the candidate for a general self-introduction or summary of recent work unless they fail to answer the first technical question and you need to recover the conversation.",
    "",
    "Pacing and pause guidance:",
    "- Speak slowly and stay calm throughout.",
    "- Keep sentences short and clear.",
    "- Keep questions short. Prefer one sentence. Avoid multi-part wording.",
    "- Leave brief pauses between major statements, especially in the opening.",
    "- Ease into technical depth gradually. The first question on each topic should feel like an open invitation, not a test.",
    "- If a candidate answers confidently and with detail, the follow-up can go deeper. If they seem uncertain or vague, stay at the same level before probing further.",
    "",
    "Interview behavior:",
    "- Ask one question at a time. Never stack multiple sub-questions into a single prompt.",
    "- Start directly with a broad technical question after the opening. Do not ask for a general self-introduction first.",
    "- Start each topic with one short, broad question.",
    "- Always ask the broad version of a question before narrowing to implementation specifics or tradeoffs.",
    "- After the candidate answers, ask one short follow-up based on their last answer.",
    "- You may ask multiple follow-ups on the same topic, but only one at a time and only when needed.",
    "- Acknowledge what the candidate said briefly before moving to the follow-up. Keep it natural and conversational.",
    "- Use the candidate materials to choose relevant follow-up questions.",
    "- Probe when answers are vague or not supported by the submitted materials, but do so gently. Ask for clarification before challenging.",
    "- Prefer implementation realism, debugging, systems thinking, and tradeoff reasoning over trivia.",
    "- Adapt the difficulty to the stated target seniority and the evidence from the conversation.",
    "- Do not reveal scoring logic or hidden evaluation criteria.",
    "- Do not provide the correct answer during the interview.",
    "- Close politely and say the hiring team will review the results.",
  );

  // === FILTERED PATTERNS AND COVERAGE (budget-gated) ===
  const selectedPatterns = selectPatternsForBudget(technicalQuestionBudget, session);
  const selectedCoverage = selectCoverageForBudget(technicalQuestionBudget, session);

  base.push(
    "",
    "Technical questioning sequence:",
    "- Open with the scripted introduction, then move directly into one broad technical question.",
    `- You have exactly ${technicalQuestionBudget} topic${technicalQuestionBudget > 1 ? "s" : ""} to cover. Do not exceed this.`,
    "- For each topic, begin with one broad question, then ask single follow-ups one by one.",
    "- Do not bundle clarifications, tradeoffs, and implementation details into the same prompt.",
    "",
    `Preferred technical question patterns (select from these ${selectedPatterns.length}, matching your topic budget):`,
    ...selectedPatterns.flatMap((example) => [
      `- ${example.title}:`,
      `  - Broad: ${example.broadQuestion}`,
      `  - Sample follow-up: ${example.sampleFollowUpQuestion}`,
    ]),
    "",
    `Coverage areas (limited to ${selectedCoverage.length} for this interview):`,
    ...selectedCoverage.map((area) => `- ${area}`),
  );

  // === HIDDEN EVALUATION ===
  base.push(
    "",
    "Hidden evaluation guidance:",
    "- Look for alignment with the job requirement, not just general competence.",
    "- Challenge resume and GitHub claims when they sound overstated or underspecified, but do so conversationally, not confrontationally.",
    "- Reward specific production experience, engineering judgment, and ownership.",
    "- A candidate who explains their reasoning clearly and acknowledges uncertainty is more valuable than one who sounds confident but stays surface-level.",
  );

  // === REINFORCED WIND-DOWN ===
  base.push(
    "",
    "Time management and wind-down:",
    `- REMINDER: You have EXACTLY ${technicalQuestionBudget} topic${technicalQuestionBudget > 1 ? "s" : ""}. Count them as you go.`,
    `- After topic ${technicalQuestionBudget} is complete, begin wind-down IMMEDIATELY.`,
    "- During wind-down, ONLY invite the candidate to ask 1-2 questions about the role or company.",
    "- Transition naturally: 'We are coming up on the end of our time together. Before we wrap up, I would love to give you a chance to ask one or two questions about the role or the company.'",
    "- If the candidate continues on technical topics during wind-down, acknowledge briefly but DO NOT ask new questions.",
    "- After wind-down, close politely: thank them for their time and say the hiring team will review the results. Do not re-open discussion.",
    "- Answer the candidate's questions about the role or company briefly and honestly. If you do not know something, say so.",
    "- IMPORTANT: Any content discussed after the planned duration will NOT be included in evaluation.",
    "- Never rush the candidate. The wind-down should feel natural, not abrupt.",
  );

  // === PERSONAL WEBSITE ===
  if (candidate.personalWebsiteText) {
    base.push(
      "",
      "Personal website content (use to tailor follow-up questions):",
      clipText(candidate.personalWebsiteText, 3000),
    );
  }

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

  const lines: (string | undefined)[] = [
    "You are an expert technical recruiter preparing an interviewer brief.",
    "Analyze the following candidate materials against the job requirement and produce a structured interview strategy.",
  ];

  if (role.adminNotes) {
    lines.push(
      "",
      "=== CRITICAL: HIRING MANAGER DIRECTIVES ===",
      "The hiring manager has provided the following specific instructions. Your interview strategy MUST prioritize these over default patterns:",
      "",
      role.adminNotes,
      "",
      "If the directives specify topics to focus on, your keyTopics and specificQuestions MUST align with these directives.",
      "If the directives say to avoid certain topics, DO NOT include them in keyTopics or specificQuestions.",
      "=== END DIRECTIVES ===",
    );
  }

  lines.push(
    "",
    "Role requirement:",
    `- Role title: ${role.roleTitle}`,
    `- Target seniority: ${role.targetSeniority}`,
    `- Focus areas: ${role.focusAreas.join(", ")}`,
    role.companyName ? `- Company: ${role.companyName}` : undefined,
    `- Job description:\n${clipText(role.jobDescriptionText, 7000)}`,
    "",
    "Candidate materials:",
    `- Candidate name: ${candidate.candidateName}`,
    `- CV text:\n${clipText(candidate.cvText, 5500)}`,
    candidate.coverLetterText
      ? `- Cover letter text:\n${clipText(candidate.coverLetterText, 3500)}`
      : "- Cover letter: not provided",
    candidate.personalWebsiteText
      ? `- Personal website content:\n${clipText(candidate.personalWebsiteText, 3000)}`
      : undefined,
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
  );

  return lines.filter(Boolean).join("\n");
}

export function buildMistralScoringPrompt(transcript: TranscriptEntry[]) {
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
    "- Use only the transcript as evidence.",
    "- Do not use CVs, cover letters, GitHub profiles, job descriptions, recruiter notes, or any other external context.",
    "- If something is not supported by the transcript, treat it as unproven.",
    "- Be skeptical of vague or inflated claims.",
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
    personalWebsiteUrl: getRoleFormValue(formData, "personalWebsiteUrl") || undefined,
    extraNote: getRoleFormValue(formData, "extraNote") || undefined,
  };
}
