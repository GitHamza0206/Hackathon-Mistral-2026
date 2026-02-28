import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type * as ElevenLabs from "@elevenlabs/elevenlabs-js/api";
import { getRequiredEnv } from "@/lib/env";
import type { CandidateSessionRecord, TranscriptEntry } from "@/lib/interviews";
import { buildCandidateAgentPrompt } from "@/lib/prompt";

function getClient() {
  return new ElevenLabsClient({
    apiKey: getRequiredEnv("ELEVENLABS_API_KEY"),
  });
}

export async function createCandidateSessionAgent(session: CandidateSessionRecord) {
  const response = await getClient().conversationalAi.agents.create({
    name: `${session.roleSnapshot.roleTitle} screener - ${session.candidateProfile.candidateName}`,
    tags: ["hr-screener", session.roleSnapshot.targetSeniority, "role-template"],
    conversationConfig: {
      agent: {
        language: "en",
        firstMessage: `Hi ${session.candidateProfile.candidateName}, thanks for joining. Please start by summarizing the most relevant recent work you have done for a ${session.roleSnapshot.roleTitle} role.`,
        prompt: {
          prompt: buildCandidateAgentPrompt(session),
          temperature: 0.3,
          maxTokens: 500,
        },
      },
    },
    platformSettings: {
      auth: {
        enableAuth: false,
      },
    },
  });

  return response.agentId;
}

export async function fetchConversationTranscript(conversationId: string) {
  const response = await getClient().conversationalAi.conversations.get(conversationId);
  return normalizeTranscript(response);
}

function normalizeTranscript(response: ElevenLabs.GetConversationResponseModel): TranscriptEntry[] {
  return response.transcript.reduce<TranscriptEntry[]>((items, entry) => {
    const text = entry.message?.trim();

    if (!text) {
      return items;
    }

    items.push({
      speaker: entry.role === "user" ? "candidate" : "agent",
      text,
      timestamp: `${entry.timeInCallSecs}s`,
    });

    return items;
  }, []);
}
