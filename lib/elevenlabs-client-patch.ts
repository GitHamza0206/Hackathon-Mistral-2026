import { Conversation } from "@elevenlabs/client";

type ConversationInstance = Awaited<ReturnType<typeof Conversation.startSession>>;
type ConversationErrorPayload = {
  code?: number;
  debug_message?: string;
  details?: Record<string, unknown>;
  error_type?: string;
  message?: string;
  reason?: string;
};

let patched = false;

export function patchElevenLabsClient() {
  if (patched) {
    return;
  }

  const originalStartSession = Conversation.startSession.bind(Conversation);

  Conversation.startSession = async function patchedStartSession(...args) {
    const session = await originalStartSession(...args);
    patchConversationInstance(session);
    return session;
  };

  patched = true;
}

function patchConversationInstance(session: ConversationInstance) {
  const target = session as ConversationInstance & {
    handleErrorEvent?: (event: unknown) => void;
    options?: {
      onError?: (message: string, context?: Record<string, unknown>) => void;
    };
  };

  if (typeof target.handleErrorEvent !== "function") {
    return;
  }

  const originalHandleErrorEvent = target.handleErrorEvent.bind(target);

  target.handleErrorEvent = (event: unknown) => {
    const payload = readErrorPayload(event);

    if (!payload) {
      target.options?.onError?.("Server error: Unknown error", {
        code: "malformed_error_event",
        rawEvent: summarizeUnknownEvent(event),
      });
      return;
    }

    originalHandleErrorEvent({
      type: "error",
      error_event: {
        code: payload.code ?? 1011,
        message: payload.message,
        reason: payload.reason,
        error_type: payload.error_type,
        debug_message: payload.debug_message,
        details: payload.details,
      },
    });
  };
}

function readErrorPayload(event: unknown): ConversationErrorPayload | null {
  if (!event || typeof event !== "object") {
    return null;
  }

  if ("error_event" in event) {
    const errorEvent = (event as { error_event?: unknown }).error_event;
    return isObject(errorEvent) ? (errorEvent as ConversationErrorPayload) : null;
  }

  if ("error" in event) {
    const directError = (event as { error?: unknown }).error;
    return isObject(directError) ? (directError as ConversationErrorPayload) : null;
  }

  return isObject(event) ? (event as ConversationErrorPayload) : null;
}

function summarizeUnknownEvent(event: unknown) {
  if (!event || typeof event !== "object") {
    return String(event ?? "");
  }

  const record = event as Record<string, unknown>;

  return {
    keys: Object.keys(record).slice(0, 8),
    type: typeof record.type === "string" ? record.type : undefined,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
