import { Mistral } from "@mistralai/mistralai";
import { getMistralModel, getRequiredEnv } from "@/lib/env";
import type {
  CandidateSessionRecord,
  GitHubRepo,
  InterviewStrategy,
  InterviewTopic,
} from "@/lib/interviews";
import { buildPreprocessingPrompt } from "@/lib/prompt";

const depthValues = new Set<InterviewTopic["depth"]>(["surface", "moderate", "deep"]);

function getClient() {
  return new Mistral({ apiKey: getRequiredEnv("MISTRAL_API_KEY") });
}

export async function generateInterviewStrategy(
  session: CandidateSessionRecord,
  repos: GitHubRepo[],
): Promise<InterviewStrategy> {
  const response = await getClient().chat.complete({
    model: getMistralModel(),
    responseFormat: { type: "json_object" },
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical recruiter preparing an interviewer brief. Return valid JSON only.",
      },
      {
        role: "user",
        content: buildPreprocessingPrompt(session, repos),
      },
    ],
  });

  const raw = response.choices?.[0]?.message?.content;
  const parsed = JSON.parse(extractText(raw));

  return normalizeStrategy(parsed);
}

function extractText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((chunk) => {
        if (!chunk || typeof chunk !== "object") {
          return "";
        }

        const text = (chunk as { text?: string }).text;
        return typeof text === "string" ? text : "";
      })
      .join("");
  }

  throw new Error("Mistral returned an empty response during preprocessing.");
}

function normalizeStrategy(value: unknown): InterviewStrategy {
  if (!value || typeof value !== "object") {
    throw new Error("Mistral returned an invalid preprocessing payload.");
  }

  const raw = value as Record<string, unknown>;

  return {
    candidateSummary: normalizeString(raw.candidateSummary, "No summary available."),
    estimatedLevel: normalizeString(raw.estimatedLevel, "mid"),
    keyTopics: normalizeTopics(raw.keyTopics),
    specificQuestions: normalizeStringList(raw.specificQuestions, 8),
    cvClaimsToVerify: normalizeStringList(raw.cvClaimsToVerify, 6),
    githubInsights: normalizeStringList(raw.githubInsights, 6),
    recommendedDifficulty: normalizeString(raw.recommendedDifficulty, "mid"),
    interviewFocus: normalizeString(raw.interviewFocus, "General technical assessment."),
  };
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeStringList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeTopics(value: unknown): InterviewTopic[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      topic: normalizeString(item.topic, "General"),
      reason: normalizeString(item.reason, "Relevant to the role."),
      depth: depthValues.has(item.depth as InterviewTopic["depth"])
        ? (item.depth as InterviewTopic["depth"])
        : "moderate",
    }))
    .slice(0, 6);
}
