"use client";

import { Lightbulb } from "@phosphor-icons/react";

interface InterviewPrepTipsProps {
  focusAreas: string[];
  roleTitle: string;
  durationMinutes: number;
}

const FOCUS_AREA_TIPS: Record<string, string[]> = {
  "system design": [
    "Be ready to discuss trade-offs between different architectural approaches",
    "Think about scalability, reliability, and maintainability",
  ],
  coding: [
    "Talk through your thought process as you solve problems",
    "Consider edge cases and error handling",
  ],
  debugging: [
    "Walk through your debugging methodology step by step",
    "Explain how you narrow down the root cause",
  ],
  llm: [
    "Be prepared to discuss prompt engineering strategies",
    "Consider evaluation methods for LLM-powered features",
  ],
  api: [
    "Think about API design principles and versioning",
    "Consider authentication, rate limiting, and error handling patterns",
  ],
  communication: [
    "Structure your answers clearly with context, approach, and outcome",
    "Ask clarifying questions when requirements are ambiguous",
  ],
  evaluation: [
    "Think about how you measure model quality and feature success",
    "Be ready to discuss metrics, baselines, and experiment design",
  ],
  "a/b test": [
    "Consider sample size, statistical significance, and rollout strategy",
    "Think about guardrail metrics beyond primary KPIs",
  ],
  observability: [
    "Be prepared to discuss logging, tracing, and alerting strategies",
    "Think about what signals matter most in production",
  ],
  mlops: [
    "Consider model versioning, deployment pipelines, and monitoring",
    "Think about how to detect and handle model drift",
  ],
  "pre-sales": [
    "Prepare to discuss how you translate technical capabilities into customer value",
    "Think about proof-of-concept design and success criteria",
  ],
  "machine learning": [
    "Be ready to discuss model selection trade-offs and training strategies",
    "Consider how you validate models before and after deployment",
  ],
  retrieval: [
    "Think about indexing strategies, relevance scoring, and latency trade-offs",
    "Consider how to evaluate retrieval quality",
  ],
  safety: [
    "Be prepared to discuss content moderation and PII handling",
    "Think about guardrails, fallbacks, and failure modes",
  ],
  product: [
    "Focus on user impact and measurable outcomes",
    "Think about how you prioritize features and handle trade-offs",
  ],
};

function getTipsForFocusAreas(focusAreas: string[], durationMinutes: number): string[] {
  const tips = new Set<string>();

  tips.add(`This interview is approximately ${durationMinutes} minutes. Pace yourself accordingly.`);
  tips.add("It's okay to think aloud — the interviewer wants to understand your reasoning.");

  for (const area of focusAreas) {
    const lower = area.toLowerCase();
    for (const [keyword, keywordTips] of Object.entries(FOCUS_AREA_TIPS)) {
      if (lower.includes(keyword)) {
        for (const tip of keywordTips) {
          tips.add(tip);
        }
      }
    }
  }

  return [...tips].slice(0, 5);
}

export function InterviewPrepTips({ focusAreas, roleTitle, durationMinutes }: InterviewPrepTipsProps) {
  const tips = getTipsForFocusAreas(focusAreas, durationMinutes);

  return (
    <div className="prep-tips">
      <div className="prep-tips-header">
        <Lightbulb weight="duotone" className="prep-tips-icon" />
        <p className="section-label" style={{ margin: 0 }}>Prep tips for {roleTitle}</p>
      </div>
      <ul className="prep-tips-list">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}
