export const targetSeniorities = ["junior", "mid", "senior", "staff+"] as const;

export type TargetSeniority = (typeof targetSeniorities)[number];

export type RoleTemplateStatus = "active" | "archived";

export type CandidateSessionStatus =
  | "profile_submitted"
  | "agent_ready"
  | "in_progress"
  | "completed"
  | "scored"
  | "failed";

export interface RoleTemplateInput {
  roleTitle: string;
  targetSeniority: TargetSeniority;
  durationMinutes: number;
  focusAreas: string[];
  companyName?: string;
  adminNotes?: string;
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
  extraNote?: string;
}

export interface CandidateProfileRecord extends CandidateSubmissionInput {
  cvFileName: string;
  cvText: string;
  coverLetterFileName?: string;
  coverLetterText?: string;
}

export interface CandidateSessionRoleSnapshot {
  roleTitle: string;
  targetSeniority: TargetSeniority;
  durationMinutes: number;
  focusAreas: string[];
  companyName?: string;
  adminNotes?: string;
  jobDescriptionText: string;
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

export interface CandidateSessionRecord {
  id: string;
  roleId: string;
  createdAt: string;
  status: CandidateSessionStatus;
  roleSnapshot: CandidateSessionRoleSnapshot;
  candidateProfile: CandidateProfileRecord;
  agentId?: string;
  conversationId?: string;
  transcript?: TranscriptEntry[];
  scorecard?: Scorecard;
  error?: string;
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

export interface SessionBootstrap {
  sessionId: string;
  candidateName: string;
  roleTitle: string;
  durationMinutes: number;
  agentId: string;
  status: CandidateSessionStatus;
  intro: string;
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

  if (!Number.isFinite(durationMinutes) || durationMinutes < 10 || durationMinutes > 90) {
    errors.durationMinutes = "Choose an interview duration between 10 and 90 minutes.";
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

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      candidateName,
      candidateEmail,
      githubUrl,
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

export function createRoleSnapshot(role: RoleTemplateRecord): CandidateSessionRoleSnapshot {
  return {
    roleTitle: role.roleTitle,
    targetSeniority: role.targetSeniority,
    durationMinutes: role.durationMinutes,
    focusAreas: role.focusAreas,
    companyName: role.companyName,
    adminNotes: role.adminNotes,
    jobDescriptionText: role.jobDescriptionText,
  };
}

export function clipText(text: string, maxChars: number) {
  return text.length > maxChars ? `${text.slice(0, maxChars)}...` : text;
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

function readValue(value: unknown, key: string) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
}
