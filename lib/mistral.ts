import { Mistral } from "@mistralai/mistralai";
import { getMistralModel, getRequiredEnv, usesBedrock } from "@/lib/env";
import { bedrockChat } from "@/lib/bedrock";
import type { Scorecard, TargetSeniority, TranscriptEntry } from "@/lib/interviews";
import { buildMistralScoringPrompt } from "@/lib/prompt";

const recommendationValues = new Set<Scorecard["overallRecommendation"]>([
  "strong_no",
  "no",
  "mixed",
  "yes",
  "strong_yes",
]);

const seniorityValues = new Set<TargetSeniority>(["junior", "mid", "senior", "staff+"]);

function getClient() {
  return new Mistral({ apiKey: getRequiredEnv("MISTRAL_API_KEY") });
}

export async function scoreCandidateSession(transcript: TranscriptEntry[]) {
  const systemContent = "You are a rigorous AI engineering interviewer. Return valid JSON only.";
  const userContent = buildMistralScoringPrompt(transcript);

  let raw: string;

  if (usesBedrock()) {
    raw = await bedrockChat({
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      jsonResponse: true,
    });
  } else {
    const response = await getClient().chat.complete({
      model: getMistralModel(),
      responseFormat: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
    });
    raw = extractText(response.choices[0]?.message?.content);
  }

  const parsed = JSON.parse(raw);
  return normalizeScorecard(parsed);
}

function extractText(content: unknown) {
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

  throw new Error("Mistral returned an empty response.");
}

function normalizeScorecard(value: unknown): Scorecard {
  if (!value || typeof value !== "object") {
    throw new Error("Mistral returned an invalid scorecard payload.");
  }

  const raw = value as Record<string, unknown>;

  return {
    overallRecommendation: recommendationValues.has(
      raw.overallRecommendation as Scorecard["overallRecommendation"],
    )
      ? (raw.overallRecommendation as Scorecard["overallRecommendation"])
      : "mixed",
    seniorityEstimate: seniorityValues.has(raw.seniorityEstimate as TargetSeniority)
      ? (raw.seniorityEstimate as TargetSeniority)
      : "mid",
    overallScore: normalizeScore(raw.overallScore),
    technicalDepthScore: normalizeScore(raw.technicalDepthScore),
    llmProductEngineeringScore: normalizeScore(raw.llmProductEngineeringScore),
    codingAndDebuggingScore: normalizeScore(raw.codingAndDebuggingScore),
    systemDesignScore: normalizeScore(raw.systemDesignScore),
    communicationScore: normalizeScore(raw.communicationScore),
    strengths: normalizeStringList(raw.strengths, 4),
    concerns: normalizeStringList(raw.concerns, 4),
    followUpQuestions: normalizeStringList(raw.followUpQuestions, 5),
    summary:
      typeof raw.summary === "string" && raw.summary.trim()
        ? raw.summary.trim()
        : "The interview completed, but the summary output was incomplete.",
  };
}

function normalizeScore(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function normalizeStringList(value: unknown, limit: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}
