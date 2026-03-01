import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { getBedrockMistralModel, getBedrockRegion } from "@/lib/env";

interface BedrockMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface BedrockChatOptions {
  messages: BedrockMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonResponse?: boolean;
}

interface MistralBedrockResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

function getClient() {
  return new BedrockRuntimeClient({ region: getBedrockRegion() });
}

export async function bedrockChat(options: BedrockChatOptions): Promise<string> {
  const { messages, temperature = 0.3, maxTokens = 4096, jsonResponse = false } = options;

  // Mistral on Bedrock uses the same message format but system goes in a separate field
  const systemMessages = messages.filter((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const body: Record<string, unknown> = {
    messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
    temperature,
    max_tokens: maxTokens,
  };

  if (systemMessages.length > 0) {
    body.system = systemMessages.map((m) => m.content).join("\n");
  }

  if (jsonResponse) {
    body.response_format = { type: "json_object" };
  }

  const command = new InvokeModelCommand({
    modelId: getBedrockMistralModel(),
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await getClient().send(command);
  const responseBody = JSON.parse(
    new TextDecoder().decode(response.body),
  ) as MistralBedrockResponse;

  const content = responseBody.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Bedrock returned an empty response.");
  }

  return content;
}
