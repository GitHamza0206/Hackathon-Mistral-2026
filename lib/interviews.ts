export const targetSeniorities = ["junior", "mid", "senior", "staff+"] as const;

export type TargetSeniority = (typeof targetSeniorities)[number];

export type RoleTemplateStatus = "active" | "archived";

export type CandidateSessionStatus =
  | "profile_submitted"
  | "agent_ready"
  | "in_progress"
  | "completed"
  | "scored"
  | "rejected"
  | "under_review"
  | "next_round"
  | "failed";

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  url: string;
}

export interface InterviewTopic {
  topic: string;
  reason: string;
  depth: "surface" | "moderate" | "deep";
}

export interface InterviewStrategy {
  candidateSummary: string;
  estimatedLevel: string;
  keyTopics: InterviewTopic[];
  specificQuestions: string[];
  cvClaimsToVerify: string[];
  githubInsights: string[];
  recommendedDifficulty: string;
  interviewFocus: string;
}

export interface RoleTemplateInput {
  roleTitle: string;
  targetSeniority: TargetSeniority;
  durationMinutes: number;
  focusAreas: string[];
  companyName?: string;
  adminNotes?: string;
  rejectThreshold?: number;
  advanceThreshold?: number;
}

export interface RoleTemplateRecord extends RoleTemplateInput {
  id: string;
  createdAt: string;
  status: RoleTemplateStatus;
  jobDescriptionFileName: string;
  jobDescriptionText: string;
  candidateApplyUrl: string;
}

export interface CandidateSubmissionInput {
  candidateName: string;
  candidateEmail?: string;
  githubUrl: string;
  personalWebsiteUrl?: string;
  extraNote?: string;
}

export interface CandidateProfileRecord extends CandidateSubmissionInput {
  cvFileName: string;
  cvText: string;
  coverLetterFileName?: string;
  coverLetterText?: string;
  githubRepos?: GitHubRepo[];
  personalWebsiteText?: string;
}

export interface CandidateSessionRoleSnapshot {
  roleTitle: string;
  targetSeniority: TargetSeniority;
  durationMinutes: number;
  focusAreas: string[];
  companyName?: string;
  adminNotes?: string;
  jobDescriptionText: string;
  rejectThreshold?: number;
  advanceThreshold?: number;
}

export interface TranscriptEntry {
  speaker: "agent" | "candidate";
  text: string;
  timestamp?: string;
}

export interface Scorecard {
  overallRecommendation: "strong_no" | "no" | "mixed" | "yes" | "strong_yes";
  seniorityEstimate: TargetSeniority;
  overallScore: number;
  technicalDepthScore: number;
  llmProductEngineeringScore: number;
  codingAndDebuggingScore: number;
  systemDesignScore: number;
  communicationScore: number;
  strengths: string[];
  concerns: string[];
  followUpQuestions: string[];
  summary: string;
}

export interface CandidateFeedback {
  strengths: string[];
  concerns: string[];
  summary: string;
}

export interface CandidateExperienceFeedback {
  rating: number;
  comment?: string;
  submittedAt: string;
}

export interface PlatformCounters {
  rolesCreated: number;
  sessionsCreated: number;
  interviewsConducted: number;
  totalInterviewSeconds: number;
  uniqueGithubUrls: string[];
}

export function createEmptyPlatformCounters(): PlatformCounters {
  return {
    rolesCreated: 0,
    sessionsCreated: 0,
    interviewsConducted: 0,
    totalInterviewSeconds: 0,
    uniqueGithubUrls: [],
  };
}

export function extractCandidateFeedback(scorecard: Scorecard): CandidateFeedback {
  return {
    strengths: scorecard.strengths,
    concerns: scorecard.concerns,
    summary: scorecard.summary,
  };
}

export interface CandidateSessionRecord {
  id: string;
  roleId: string;
  createdAt: string;
  status: CandidateSessionStatus;
  sessionStartedAt?: string;
  sessionEndedAt?: string;
  roleSnapshot: CandidateSessionRoleSnapshot;
  candidateProfile: CandidateProfileRecord;
  agentId?: string;
  conversationId?: string;
  transcript?: TranscriptEntry[];
  scorecard?: Scorecard;
  interviewStrategy?: InterviewStrategy;
  error?: string;
  candidateExperienceFeedback?: CandidateExperienceFeedback;
}

export interface RoleBootstrap {
  id: string;
  roleTitle: string;
  targetSeniority: TargetSeniority;
  durationMinutes: number;
  focusAreas: string[];
  companyName?: string;
  intro: string;
}

export interface JobDescriptionAutofill {
  jobDescriptionFileName: string;
  jobDescriptionText: string;
  roleTitle?: string;
  companyName?: string;
  targetSeniority?: TargetSeniority;
  focusAreas: string[];
  warnings: string[];
}

export interface SessionBootstrap {
  sessionId: string;
  candidateName: string;
  roleTitle: string;
  durationMinutes: number;
  agentId: string;
  status: CandidateSessionStatus;
  intro: string;
  conversationId?: string;
  transcript?: TranscriptEntry[];
  sessionStartedAt?: string;
  sessionEndedAt?: string;
  candidateFeedback?: CandidateFeedback;
}

export interface CandidateSessionSyncInput {
  conversationId?: string;
  transcript?: TranscriptEntry[];
  sessionStartedAt?: string;
}

export interface CandidateSessionCompletionInput {
  conversationId?: string;
  transcript?: TranscriptEntry[];
  sessionEndedAt?: string;
}

export interface ValidationResult<T> {
  data?: T;
  errors?: Record<string, string>;
}

export function createRoleId() {
  return `role_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

export function createCandidateSessionId() {
  return `sess_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

export function splitFocusAreas(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function validateRoleTemplateInput(payload: unknown): ValidationResult<RoleTemplateInput> {
  if (!payload || typeof payload !== "object") {
    return { errors: { form: "Invalid request body." } };
  }

  const roleTitle = readString(payload, "roleTitle");
  const targetSeniority = readString(payload, "targetSeniority");
  const companyName = readOptionalString(payload, "companyName");
  const adminNotes = readOptionalString(payload, "adminNotes");
  const focusAreasRaw = readValue(payload, "focusAreas");
  const durationMinutesRaw = readValue(payload, "durationMinutes");
  const errors: Record<string, string> = {};

  if (!roleTitle || roleTitle.length < 2) {
    errors.roleTitle = "Add the target role title.";
  }

  if (!targetSeniorities.includes(targetSeniority as TargetSeniority)) {
    errors.targetSeniority = "Choose a valid target seniority.";
  }

  const focusAreas = Array.isArray(focusAreasRaw)
    ? focusAreasRaw
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (focusAreas.length === 0) {
    errors.focusAreas = "Add at least one focus area.";
  }

  const durationMinutes =
    typeof durationMinutesRaw === "number" ? durationMinutesRaw : Number(durationMinutesRaw);

  if (!Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 90) {
    errors.durationMinutes = "Choose an interview duration between 1 and 90 minutes.";
  }

  const rejectThresholdRaw = readValue(payload, "rejectThreshold");
  const advanceThresholdRaw = readValue(payload, "advanceThreshold");
  const rejectThreshold =
    rejectThresholdRaw != null ? Number(rejectThresholdRaw) : undefined;
  const advanceThreshold =
    advanceThresholdRaw != null ? Number(advanceThresholdRaw) : undefined;

  if (rejectThreshold != null && (!Number.isFinite(rejectThreshold) || rejectThreshold < 0 || rejectThreshold > 100)) {
    errors.rejectThreshold = "Reject threshold must be between 0 and 100.";
  }

  if (advanceThreshold != null && (!Number.isFinite(advanceThreshold) || advanceThreshold < 0 || advanceThreshold > 100)) {
    errors.advanceThreshold = "Advance threshold must be between 0 and 100.";
  }

  if (
    rejectThreshold != null &&
    advanceThreshold != null &&
    Number.isFinite(rejectThreshold) &&
    Number.isFinite(advanceThreshold) &&
    rejectThreshold >= advanceThreshold
  ) {
    errors.rejectThreshold = "Reject threshold must be lower than the advance threshold.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      roleTitle,
      targetSeniority: targetSeniority as TargetSeniority,
      durationMinutes,
      focusAreas: focusAreas.slice(0, 8),
      companyName,
      adminNotes,
      rejectThreshold: rejectThreshold ?? 40,
      advanceThreshold: advanceThreshold ?? 90,
    },
  };
}

export function validateCandidateSubmissionInput(
  payload: unknown,
): ValidationResult<CandidateSubmissionInput> {
  if (!payload || typeof payload !== "object") {
    return { errors: { form: "Invalid request body." } };
  }

  const candidateName = readString(payload, "candidateName");
  const candidateEmail = readOptionalString(payload, "candidateEmail");
  const githubUrl = readString(payload, "githubUrl");
  const personalWebsiteUrl = readOptionalString(payload, "personalWebsiteUrl");
  const extraNote = readOptionalString(payload, "extraNote");
  const errors: Record<string, string> = {};

  if (!candidateName || candidateName.length < 2) {
    errors.candidateName = "Add your full name.";
  }

  if (candidateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
    errors.candidateEmail = "Use a valid email address.";
  }

  if (!isValidGithubProfileUrl(githubUrl)) {
    errors.githubUrl = "Paste a valid public GitHub profile URL.";
  }

  if (personalWebsiteUrl) {
    try {
      const parsed = new URL(personalWebsiteUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        errors.personalWebsiteUrl = "Use an http or https URL for your personal website.";
      }
    } catch {
      errors.personalWebsiteUrl = "Use a valid URL for your personal website.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      candidateName,
      candidateEmail,
      githubUrl,
      personalWebsiteUrl,
      extraNote,
    },
  };
}

export function validateCandidateSessionCompletionInput(
  payload: unknown,
): ValidationResult<CandidateSessionCompletionInput> {
  if (!payload || typeof payload !== "object") {
    return { errors: { form: "Invalid request body." } };
  }

  const conversationId = readOptionalString(payload, "conversationId");
  const sessionEndedAt = readOptionalString(payload, "sessionEndedAt");
  const transcriptRaw = readValue(payload, "transcript");
  const transcript =
    Array.isArray(transcriptRaw) && transcriptRaw.every(isTranscriptEntry)
      ? transcriptRaw
      : undefined;

  if (!conversationId && (!transcript || transcript.length === 0)) {
    return {
      errors: {
        form: "A conversation ID or transcript fallback is required.",
      },
    };
  }

  return {
    data: {
      conversationId,
      sessionEndedAt,
      transcript,
    },
  };
}

export function validateCandidateSessionSyncInput(
  payload: unknown,
): ValidationResult<CandidateSessionSyncInput> {
  if (!payload || typeof payload !== "object") {
    return { errors: { form: "Invalid request body." } };
  }

  const conversationId = readOptionalString(payload, "conversationId");
  const sessionStartedAt = readOptionalString(payload, "sessionStartedAt");
  const transcriptRaw = readValue(payload, "transcript");
  const transcript =
    Array.isArray(transcriptRaw) && transcriptRaw.every(isTranscriptEntry)
      ? transcriptRaw
      : undefined;

  if (!conversationId && !sessionStartedAt && (!transcript || transcript.length === 0)) {
    return {
      errors: {
        form: "Conversation metadata or transcript content is required.",
      },
    };
  }

  return {
    data: {
      conversationId,
      sessionStartedAt,
      transcript,
    },
  };
}

export function createRoleSnapshot(role: RoleTemplateRecord): CandidateSessionRoleSnapshot {
  return {
    roleTitle: role.roleTitle,
    targetSeniority: role.targetSeniority,
    durationMinutes: role.durationMinutes,
    focusAreas: role.focusAreas,
    companyName: role.companyName,
    adminNotes: role.adminNotes,
    jobDescriptionText: role.jobDescriptionText,
    rejectThreshold: role.rejectThreshold,
    advanceThreshold: role.advanceThreshold,
  };
}

export function resolvePostScoringStatus(
  score: number,
  rejectThreshold: number | undefined,
  advanceThreshold: number | undefined,
): CandidateSessionStatus {
  const reject = rejectThreshold ?? 40;
  const advance = advanceThreshold ?? 90;
  if (score < reject) return "rejected";
  if (score >= advance) return "next_round";
  return "under_review";
}

export function clipText(text: string, maxChars: number) {
  return text.length > maxChars ? `${text.slice(0, maxChars)}...` : text;
}

export function preferSavedTranscript(
  current: TranscriptEntry[] | undefined,
  incoming: TranscriptEntry[] | undefined,
) {
  const existingTranscript = current ?? [];
  const nextTranscript = incoming ?? [];

  if (nextTranscript.length === 0) {
    return existingTranscript;
  }

  if (nextTranscript.length < existingTranscript.length) {
    return existingTranscript;
  }

  return nextTranscript;
}

export function isValidGithubProfileUrl(value: string) {
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");

    return (
      (url.hostname === "github.com" || url.hostname === "www.github.com") &&
      Boolean(path) &&
      !path.includes("/")
    );
  } catch {
    return false;
  }
}

function isTranscriptEntry(value: unknown): value is TranscriptEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const speaker = readValue(value, "speaker");
  const text = readValue(value, "text");
  const timestamp = readValue(value, "timestamp");

  return (
    (speaker === "agent" || speaker === "candidate") &&
    typeof text === "string" &&
    (timestamp === undefined || typeof timestamp === "string")
  );
}

function readString(value: unknown, key: string) {
  const item = readValue(value, key);
  return typeof item === "string" ? item.trim() : "";
}

function readOptionalString(value: unknown, key: string) {
  const item = readValue(value, key);
  return typeof item === "string" && item.trim() ? item.trim() : undefined;
}

export function validateCandidateExperienceFeedback(
  payload: unknown,
): ValidationResult<CandidateExperienceFeedback> {
  if (!payload || typeof payload !== "object") {
    return { errors: { form: "Invalid request body." } };
  }

  const ratingRaw = readValue(payload, "rating");
  const comment = readOptionalString(payload, "comment");
  const errors: Record<string, string> = {};

  const rating = typeof ratingRaw === "number" ? ratingRaw : Number(ratingRaw);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    errors.rating = "Rating must be between 1 and 5.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      rating,
      comment,
      submittedAt: new Date().toISOString(),
    },
  };
}

function readValue(value: unknown, key: string) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
}
