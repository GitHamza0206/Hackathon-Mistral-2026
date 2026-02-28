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

interface TechnicalQuestionExample {
  title: string;
  keywords: string[];
  question: string;
}

const preferredTechnicalQuestionExamples: TechnicalQuestionExample[] = [
  {
    title: "LLM feature launch",
    keywords: ["llm", "prompt", "ai", "agent", "inference"],
    question:
      "Tell me about a production LLM feature you shipped. What was the architecture, what tradeoffs did you make, and what broke once real users started using it?",
  },
  {
    title: "RAG system design",
    keywords: ["rag", "retrieval", "search", "embedding", "vector"],
    question:
      "Design a RAG system for a real product. How would you handle chunking, retrieval quality, evaluation, and failure cases when the retrieved context is incomplete or misleading?",
  },
  {
    title: "Tool use and orchestration",
    keywords: ["tool", "orchestration", "workflow", "function", "agentic"],
    question:
      "Describe a workflow where an AI system had to use tools or external APIs. How did you decide what the model should do versus what the deterministic application layer should do?",
  },
  {
    title: "Debugging and reliability",
    keywords: ["debug", "incident", "reliability", "observability", "latency"],
    question:
      "Walk me through a difficult production incident involving an AI or backend system. How did you isolate the root cause, and what did you change afterward to prevent the same issue?",
  },
  {
    title: "System design and scaling",
    keywords: ["scale", "system", "distributed", "backend", "architecture"],
    question:
      "If this product suddenly had ten times more users, which parts of the system would you inspect first, and what scaling or resilience changes would you make?",
  },
  {
    title: "Evaluation strategy",
    keywords: ["evaluation", "eval", "quality", "benchmark", "testing"],
    question:
      "How would you evaluate whether an AI feature is actually good enough for production? Walk me through the metrics, offline checks, and live signals you would trust.",
  },
];

function buildInterviewAgentIdentity(session: CandidateSessionRecord) {
  const companyName = session.roleSnapshot.companyName?.trim();
  return companyName ? `an AI interview agent for ${companyName}` : "an AI interview agent";
}

function pickOpeningTechnicalQuestion(session: CandidateSessionRecord) {
  const role = session.roleSnapshot;
  const candidate = session.candidateProfile;
  const corpus = [
    role.roleTitle,
    role.targetSeniority,
    role.focusAreas.join(" "),
    role.adminNotes ?? "",
    role.jobDescriptionText,
    candidate.cvText,
    candidate.coverLetterText ?? "",
    candidate.extraNote ?? "",
    candidate.githubUrl,
  ]
    .join(" ")
    .toLowerCase();

  const match =
    preferredTechnicalQuestionExamples.find((example) =>
      example.keywords.some((keyword) => corpus.includes(keyword)),
    ) ?? preferredTechnicalQuestionExamples[0];

  return match.question;
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
    candidate.coverLetterText
      ? `- Cover letter text:\n${clipText(candidate.coverLetterText, 3500)}`
      : "- Cover letter: not provided",
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
    "- Speak slowly.",
    "- Keep sentences short and clear.",
    "- Leave brief pauses between major statements, especially in the opening.",
    "- Sound calm, deliberate, and conversational.",
    "",
    "Interview behavior:",
    "- Ask one question at a time.",
    "- Start directly with a technical question after the opening.",
    "- Use the candidate materials to choose relevant follow-up questions.",
    "- Probe when answers are vague or not supported by the submitted materials.",
    "- Prefer implementation realism, debugging, systems thinking, and tradeoff reasoning over trivia.",
    "- Adapt the difficulty to the stated target seniority and the evidence from the conversation.",
    "- Use the preferred technical question examples as the default starting patterns, then adapt the order and follow-up depth to the role, job description, CV, cover letter, GitHub profile, and live conversation.",
    "- Do not reveal scoring logic or hidden evaluation criteria.",
    "- Do not provide the correct answer during the interview.",
    "- Close politely and say the hiring team will review the results.",
    "",
    "Technical questioning sequence:",
    "- Open with the scripted introduction, then move directly into one technical question.",
    "- Keep the first three questions technical unless the candidate is blocked and needs clarification.",
    "- After each answer, ask a sharper follow-up that tests implementation detail, debugging judgment, or production tradeoffs.",
    "- If one preferred example is not relevant, pick the closest alternative instead of switching to generic behavioral questions.",
    "",
    "Preferred technical question patterns/examples:",
    ...preferredTechnicalQuestionExamples.map(
      (example) => `- ${example.title}: ${example.question}`,
    ),
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
