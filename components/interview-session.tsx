"use client";

import { useConversation } from "@elevenlabs/react";
import type { IncomingSocketEvent } from "@elevenlabs/client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SessionBootstrap, TranscriptEntry } from "@/lib/interviews";

interface InterviewSessionProps {
  sessionId: string;
}

export function InterviewSession({ sessionId }: InterviewSessionProps) {
  const [bootstrap, setBootstrap] = useState<SessionBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const conversationIdRef = useRef("");
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const completionSentRef = useRef(false);

  const conversation = useConversation({
    onMessage: (message) => {
      const entry = mapMessageToTranscript(message);

      if (!entry) {
        return;
      }

      setTranscript((current) => {
        const next = [...current, entry];
        transcriptRef.current = next;
        return next;
      });
    },
    onDisconnect: () => {
      void finalizeSession();
    },
    onError: (detail) => {
      setError(typeof detail === "string" && detail ? detail : "The voice session failed.");
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        setLoading(true);
        const response = await fetch(`/api/sessions/${sessionId}`);
        const body = (await response.json()) as SessionBootstrap & { error?: string };

        if (!response.ok) {
          throw new Error(body.error ?? "Unable to load the interview session.");
        }

        if (!cancelled) {
          setBootstrap(body);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load the interview session.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  async function startInterview() {
    if (!bootstrap) {
      return;
    }

    try {
      setError("");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      let id: string;

      try {
        id = await conversation.startSession({
          agentId: bootstrap.agentId,
          connectionType: "webrtc",
        });
      } catch (webrtcError) {
        const message =
          webrtcError instanceof Error ? webrtcError.message : String(webrtcError ?? "");

        if (!message.toLowerCase().includes("token")) {
          throw webrtcError;
        }

        id = await conversation.startSession({
          agentId: bootstrap.agentId,
          connectionType: "websocket",
        });
      }

      setConversationId(id);
      conversationIdRef.current = id;
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Unable to start the interview session.",
      );
    }
  }

  async function stopInterview() {
    await conversation.endSession();
    await finalizeSession();
  }

  async function finalizeSession() {
    if (completionSentRef.current || !bootstrap) {
      return;
    }

    const finalConversationId = conversationIdRef.current || conversationId;

    if (!finalConversationId && transcriptRef.current.length === 0) {
      return;
    }

    completionSentRef.current = true;
    setFinalizing(true);

    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: finalConversationId,
          transcript: transcriptRef.current,
          sessionEndedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Unable to finalize the interview.");
      }
    } catch (completionError) {
      completionSentRef.current = false;
      setError(
        completionError instanceof Error
          ? completionError.message
          : "Unable to finalize the interview.",
      );
    } finally {
      setFinalizing(false);
    }
  }

  const completed =
    bootstrap?.status === "completed" || bootstrap?.status === "scored" || finalizing;

  return (
    <main className="candidate-shell">
      <div className="candidate-card">
        <p className="eyebrow">Live interview</p>
        <h1>AI engineer screening session</h1>

        {loading ? <p className="section-copy">Loading interview setup...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {bootstrap ? (
          <>
            <div className="candidate-summary">
              <div>
                <span>Candidate</span>
                <strong>{bootstrap.candidateName}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{bootstrap.roleTitle}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{bootstrap.durationMinutes} min</strong>
              </div>
            </div>

            <p className="section-copy">{bootstrap.intro}</p>

            <div className="candidate-actions">
              <button
                className="primary-button"
                type="button"
                onClick={startInterview}
                disabled={!bootstrap.agentId || completed || conversation.status === "connected"}
              >
                {conversation.status === "connected" ? "Live now" : "Start interview"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={stopInterview}
                disabled={conversation.status !== "connected"}
              >
                End session
              </button>
            </div>

            <div className="status-grid">
              <div className="status-box">
                <span>Connection</span>
                <strong>{conversation.status}</strong>
              </div>
              <div className="status-box">
                <span>Mode</span>
                <strong>{conversation.isSpeaking ? "Agent speaking" : "Listening"}</strong>
              </div>
              <div className="status-box">
                <span>Conversation ID</span>
                <strong>{conversationId || "Pending"}</strong>
              </div>
            </div>

            <section className="transcript-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">Live transcript</p>
                  <h2>Conversation feed</h2>
                </div>
              </div>

              {transcript.length > 0 ? (
                <div className="transcript-list">
                  {transcript.map((entry, index) => (
                    <article className="transcript-entry" key={`${entry.speaker}-${index}`}>
                      <span>{entry.speaker === "agent" ? "Interviewer" : "Candidate"}</span>
                      <p>{entry.text}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="section-copy">
                  Transcript entries appear here once the interview starts.
                </p>
              )}
            </section>

            <p className="fine-print">
              When the session ends, the transcript is sent to the hiring side for evaluation.
            </p>
          </>
        ) : null}

        <Link className="ghost-link" href="/">
          Back to landing
        </Link>
      </div>
    </main>
  );
}

function mapMessageToTranscript(message: IncomingSocketEvent): TranscriptEntry | null {
  switch (message.type) {
    case "user_transcript":
      return {
        speaker: "candidate",
        text: message.user_transcription_event.user_transcript,
      };
    case "agent_response":
      return {
        speaker: "agent",
        text: message.agent_response_event.agent_response,
      };
    case "agent_response_correction":
      return {
        speaker: "agent",
        text: message.agent_response_correction_event.corrected_agent_response,
      };
    default:
      return null;
  }
}
