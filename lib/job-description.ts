import { Mistral } from "@mistralai/mistralai";
import { getMistralModel, getRequiredEnv } from "@/lib/env";
import {
  splitFocusAreas,
  targetSeniorities,
  type JobDescriptionAutofill,
  type TargetSeniority,
} from "@/lib/interviews";

interface JobDescriptionAutofillFields {
  roleTitle?: string;
  companyName?: string;
  targetSeniority?: TargetSeniority;
  focusAreas: string[];
  warnings: string[];
}

function getClient() {
  return new Mistral({ apiKey: getRequiredEnv("MISTRAL_API_KEY") });
}

export async function extractJobDescriptionAutofill(
  jobDescriptionText: string,
): Promise<JobDescriptionAutofillFields> {
  const response = await getClient().chat.complete({
    model: getMistralModel(),
    responseFormat: { type: "json_object" },
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You extract structured hiring data from job descriptions. Return valid JSON only and never invent missing details.",
      },
      {
        role: "user",
        content: [
          "Extract only information explicitly supported by this job description.",
          "Return JSON with keys: roleTitle, companyName, targetSeniority, focusAreas, warnings.",
          `targetSeniority must be one of: ${targetSeniorities.join(", ")}. Omit or set null when ambiguous.`,
          "focusAreas should be 3 to 6 concise strings when grounded in the document, otherwise an empty array.",
          "Do not infer interview duration or internal notes.",
          "Use warnings to explain ambiguity or missing confidence rather than guessing.",
          "",
          "Job description:",
          jobDescriptionText,
        ].join("\n"),
      },
    ],
  });

  const parsed = JSON.parse(extractText(response.choices[0]?.message?.content));
  return normalizeJobDescriptionAutofill(parsed);
}

export function toJobDescriptionAutofill(
  fileName: string,
  jobDescriptionText: string,
  value: JobDescriptionAutofillFields,
): JobDescriptionAutofill {
  return {
    jobDescriptionFileName: fileName,
    jobDescriptionText,
    roleTitle: value.roleTitle,
    companyName: value.companyName,
    targetSeniority: value.targetSeniority,
    focusAreas: value.focusAreas,
    warnings: value.warnings,
  };
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

function normalizeJobDescriptionAutofill(value: unknown): JobDescriptionAutofillFields {
  if (!value || typeof value !== "object") {
    return {
      focusAreas: [],
      warnings: ["Structured extraction returned an invalid payload."],
    };
  }

  const raw = value as Record<string, unknown>;

  return {
    roleTitle: normalizeOptionalString(raw.roleTitle, 120),
    companyName: normalizeOptionalString(raw.companyName, 120),
    targetSeniority: normalizeTargetSeniority(raw.targetSeniority),
    focusAreas: normalizeFocusAreas(raw.focusAreas),
    warnings: normalizeWarnings(raw.warnings),
  };
}

function normalizeOptionalString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function normalizeTargetSeniority(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return targetSeniorities.includes(normalized as TargetSeniority)
    ? (normalized as TargetSeniority)
    : undefined;
}

function normalizeFocusAreas(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return splitFocusAreas(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .join("\n"),
  ).slice(0, 6);
}

function normalizeWarnings(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}
