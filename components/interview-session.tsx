"use client";

import { useConversation } from "@elevenlabs/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CandidateFeedback, SessionBootstrap, TranscriptEntry } from "@/lib/interviews";

interface InterviewSessionProps {
  sessionId: string;
}

interface ConversationMessage {
  event_id?: number;
  message?: string;
  role?: "agent" | "user";
  source?: "ai" | "user";
}

interface ConversationErrorContext {
  code?: number | string;
  debugMessage?: string;
  details?: Record<string, unknown>;
  errorType?: string;
  rawEvent?: unknown;
}

type TimerUrgency = "normal" | "warning" | "danger";

interface SessionTimer {
  label: string;
  value: string;
  urgency: TimerUrgency;
  remainingSeconds: number;
}

type SessionPhase =
  | "ready"
  | "connecting"
  | "active"
  | "winding_down"
  | "overtime"
  | "processing"
  | "feedback"
  | "failed";

export function InterviewSession({ sessionId }: InterviewSessionProps) {
  const [bootstrap, setBootstrap] = useState<SessionBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [candidateFeedback, setCandidateFeedback] = useState<CandidateFeedback | null>(null);
  const conversationIdRef = useRef("");
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const completionSentRef = useRef(false);
  const lastSyncedSignatureRef = useRef("");
  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

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
    onError: (message: string, context?: ConversationErrorContext) => {
      setError(formatConversationError(message, context));
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
          setConversationId(body.conversationId ?? "");
          conversationIdRef.current = body.conversationId ?? "";
          setTranscript(body.transcript ?? []);
          transcriptRef.current = body.transcript ?? [];
          lastSyncedSignatureRef.current = buildSyncSignature(
            body.conversationId ?? "",
            body.transcript ?? [],
            body.sessionStartedAt,
          );

          if (body.candidateFeedback) {
            setCandidateFeedback(body.candidateFeedback);
          }
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
    if (!bootstrap || starting || conversation.status !== "disconnected") {
      return;
    }

    try {
      setStarting(true);
      setError("");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!bootstrap.agentId) {
        throw new Error("Unable to start the interview session.");
      }

      const id = await conversation.startSession({
        agentId: bootstrap.agentId,
        connectionType: "websocket",
      });

      setConversationId(id);
      conversationIdRef.current = id;

      const fallbackStartedAt = new Date().toISOString();

      setBootstrap((current) =>
        current
          ? {
              ...current,
              status: "in_progress",
              sessionStartedAt: current.sessionStartedAt ?? fallbackStartedAt,
              sessionEndedAt: undefined,
            }
          : current,
      );

      try {
        const response = await fetch(`/api/sessions/${sessionId}/start`, {
          method: "POST",
        });
        const body = (await response.json()) as {
          error?: string;
          sessionStartedAt?: string;
          status?: SessionBootstrap["status"];
        };

        if (!response.ok) {
          throw new Error(body.error ?? "Unable to start the session timer.");
        }

        setBootstrap((current) =>
          current
            ? {
                ...current,
                status: body.status ?? current.status,
                sessionStartedAt: body.sessionStartedAt ?? current.sessionStartedAt,
                sessionEndedAt: undefined,
              }
            : current,
        );
      } catch (timerError) {
        setError(
          timerError instanceof Error
            ? `Interview started, but timer sync failed: ${timerError.message}`
            : "Interview started, but timer sync failed.",
        );
      }
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Unable to start the interview session.",
      );
    } finally {
      setStarting(false);
    }
  }

  const syncSessionProgress = useCallback(
    async (options?: { keepalive?: boolean }) => {
      if (!bootstrap) {
        return;
      }

      const activeConversationId = conversationIdRef.current || conversationId;
      const currentTranscript = transcriptRef.current;

      if (!activeConversationId && currentTranscript.length === 0) {
        return;
      }

      const signature = buildSyncSignature(
        activeConversationId,
        currentTranscript,
        bootstrap.sessionStartedAt,
      );

      if (signature === lastSyncedSignatureRef.current) {
        return;
      }

      try {
        const response = await fetch(`/api/sessions/${sessionId}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: activeConversationId || undefined,
            transcript: currentTranscript,
            sessionStartedAt: bootstrap.sessionStartedAt,
          }),
          keepalive: options?.keepalive ?? false,
        });

        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Unable to sync the interview transcript.");
        }

        lastSyncedSignatureRef.current = signature;
      } catch (syncError) {
        console.warn("Interview sync failed:", syncError);
      }
    },
    [bootstrap, conversationId, sessionId],
  );

  async function stopInterview() {
    const stoppedAt = new Date().toISOString();

    setBootstrap((current) =>
      current
        ? {
            ...current,
            status: "completed",
            sessionEndedAt: current.sessionEndedAt ?? stoppedAt,
          }
        : current,
    );

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

      const body = (await response.json()) as {
        error?: string;
        ok?: boolean;
        status?: string;
        candidateFeedback?: CandidateFeedback;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to finalize the interview.");
      }

      if (body.status && body.status !== "completed" && body.status !== "failed") {
        setBootstrap((current) =>
          current ? { ...current, status: body.status as SessionBootstrap["status"] } : current,
        );
      }

      if (body.candidateFeedback) {
        setCandidateFeedback(body.candidateFeedback);
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

  const isScoredStatus = bootstrap?.status === "scored" || bootstrap?.status === "rejected" || bootstrap?.status === "under_review" || bootstrap?.status === "next_round";
  const completed =
    bootstrap?.status === "completed" || isScoredStatus || finalizing;
  const timer = bootstrap ? buildSessionTimer(bootstrap, now, conversation.status === "connected") : null;
  const phase = deriveSessionPhase(
    bootstrap,
    conversation.status,
    finalizing,
    candidateFeedback,
    timer,
  );

  useEffect(() => {
    if (!bootstrap) {
      return;
    }

    const isTerminalStatus =
      bootstrap.status === "completed" || bootstrap.status === "scored" || bootstrap.status === "rejected" || bootstrap.status === "under_review" || bootstrap.status === "next_round" || bootstrap.status === "failed";

    if (isTerminalStatus) {
      return;
    }

    const hasSyncableState = Boolean(conversationIdRef.current || conversationId) || transcript.length > 0;

    if (!hasSyncableState) {
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      void syncSessionProgress();
    }, 800);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [bootstrap, conversationId, syncSessionProgress, transcript]);

  useEffect(() => {
    if (!bootstrap) {
      return;
    }

    const flushProgress = () => {
      void syncSessionProgress({ keepalive: true });
    };

    window.addEventListener("pagehide", flushProgress);

    return () => {
      window.removeEventListener("pagehide", flushProgress);
    };
  }, [bootstrap, syncSessionProgress]);

  return (
    <main className="candidate-shell">
      <div className="candidate-card">
        <p className="eyebrow">Live interview</p>
        <h1>AI engineer screening session</h1>

        {phase !== "ready" && (
          <p className="phase-label">
            {phase === "connecting" && "Connecting..."}
            {phase === "active" && "Interview in progress"}
            {phase === "winding_down" && "Wrapping up"}
            {phase === "overtime" && "Over planned time"}
            {phase === "processing" && "Processing results..."}
            {phase === "feedback" && "Feedback ready"}
            {phase === "failed" && "Session encountered an error"}
          </p>
        )}

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
              <div className={timer?.urgency === "danger" ? "timer-danger" : timer?.urgency === "warning" ? "timer-warning" : ""}>
                <span>{timer?.label ?? "Duration"}</span>
                <strong>{timer?.value ?? `${bootstrap.durationMinutes} min`}</strong>
              </div>
            </div>

            <p className="section-copy">{bootstrap.intro}</p>

            {(phase === "ready" || phase === "active" || phase === "winding_down" || phase === "overtime") && (
              <div className="session-notice">
                <p className="section-label">How this session works</p>
                <p className="section-copy">
                  The session will not close automatically when time runs out.
                  You decide when to end the interview by clicking &ldquo;End session.&rdquo;
                  However, only the discussion within the planned {bootstrap.durationMinutes}-minute
                  window counts toward your evaluation.
                </p>
              </div>
            )}

            {phase !== "processing" && phase !== "feedback" && (
              <div className="candidate-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={startInterview}
                  disabled={!bootstrap.agentId || completed || starting || conversation.status !== "disconnected"}
                >
                  {starting || conversation.status === "connecting"
                    ? "Connecting..."
                    : conversation.status === "connected"
                      ? "Live now"
                      : "Start interview"}
                </button>
                <button
                  className={phase === "winding_down" || phase === "overtime"
                    ? "primary-button end-session-urgent"
                    : "secondary-button"}
                  type="button"
                  onClick={stopInterview}
                  disabled={conversation.status !== "connected"}
                >
                  End session
                </button>
              </div>
            )}

            {phase !== "processing" && phase !== "feedback" && (
              <div className="status-grid">
                <div className="status-box">
                  <span>Connection</span>
                  <strong>
                    <span className={`connection-dot ${conversation.status}`} />
                    {conversation.status}
                  </strong>
                </div>
                <div className="status-box">
                  <span>Mode</span>
                  <strong>
                    {conversation.isSpeaking ? (
                      <>
                        <span className="speaking-indicator" aria-hidden="true">
                          <span className="speaking-bar" />
                          <span className="speaking-bar" />
                          <span className="speaking-bar" />
                          <span className="speaking-bar" />
                          <span className="speaking-bar" />
                        </span>
                        {" "}Agent speaking
                      </>
                    ) : (
                      "Listening"
                    )}
                  </strong>
                </div>
                <div className="status-box">
                  <span>Conversation ID</span>
                  <strong>{conversationId || "Pending"}</strong>
                </div>
              </div>
            )}

            {(phase === "active" || phase === "winding_down" || phase === "overtime") && (
              <section className="transcript-panel">
                <div className="panel-heading">
                  <div>
                    <p className="section-label">Interview privacy</p>
                    <h2>No live transcript on screen</h2>
                  </div>
                </div>

                <p className="section-copy">
                  Your answers stay off-screen during the interview. We still capture the transcript in
                  the background so the hiring team can review the completed session afterward.
                </p>
              </section>
            )}

            {phase === "processing" && (
              <section className="feedback-panel">
                <div className="panel-heading">
                  <div>
                    <p className="section-label">Session complete</p>
                    <h2>Processing your interview</h2>
                  </div>
                </div>
                <p className="section-copy">
                  Your responses are being reviewed. This usually takes a moment.
                  Please stay on this page to receive your feedback.
                </p>
                <div className="processing-indicator">
                  <div className="processing-dot" />
                  <div className="processing-dot" />
                  <div className="processing-dot" />
                </div>
              </section>
            )}

            {phase === "feedback" && candidateFeedback && (
              <section className="feedback-panel">
                <div className="panel-heading">
                  <div>
                    <p className="section-label">Interview feedback</p>
                    <h2>Your session summary</h2>
                  </div>
                </div>
                <p className="summary-copy">{candidateFeedback.summary}</p>
                <div className="feedback-section">
                  <p className="section-label">What went well</p>
                  <ul className="feedback-list">
                    {candidateFeedback.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="feedback-section">
                  <p className="section-label">Areas to consider</p>
                  <ul className="feedback-list">
                    {candidateFeedback.concerns.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <p className="fine-print">
                  This is a high-level summary. The full evaluation has been sent to the hiring team.
                </p>
              </section>
            )}

            {phase !== "processing" && phase !== "feedback" && (
              <p className="fine-print">
                When the session ends, the transcript is sent to the hiring side for evaluation.
              </p>
            )}
          </>
        ) : null}

        <Link className="ghost-link" href="/">
          Back to landing
        </Link>
      </div>
    </main>
  );
}

function deriveSessionPhase(
  bootstrap: SessionBootstrap | null,
  connectionStatus: string,
  finalizing: boolean,
  candidateFeedback: CandidateFeedback | null,
  timer: SessionTimer | null,
): SessionPhase {
  if (!bootstrap) return "ready";
  if (candidateFeedback) return "feedback";
  if (bootstrap.status === "scored" || bootstrap.status === "rejected" || bootstrap.status === "under_review" || bootstrap.status === "next_round") return "feedback";
  if (finalizing) return "processing";
  if (bootstrap.status === "completed") return "processing";
  if (bootstrap.status === "failed") return "failed";
  if (connectionStatus === "connecting") return "connecting";
  if (connectionStatus === "connected") {
    if (timer && timer.remainingSeconds <= 0) return "overtime";
    if (timer && timer.urgency !== "normal") return "winding_down";
    return "active";
  }
  return "ready";
}

function mapMessageToTranscript(message: ConversationMessage): TranscriptEntry | null {
  const text = message.message?.trim();

  if (!text) {
    return null;
  }

  const speaker = message.role === "user" || message.source === "user" ? "candidate" : "agent";

  return {
    speaker,
    text,
    timestamp: new Date().toISOString(),
  };
}

function buildSyncSignature(
  conversationId: string,
  transcript: TranscriptEntry[],
  sessionStartedAt?: string,
) {
  const lastEntry = transcript.at(-1);

  return JSON.stringify({
    conversationId,
    transcriptLength: transcript.length,
    lastSpeaker: lastEntry?.speaker ?? "",
    lastText: lastEntry?.text ?? "",
    sessionStartedAt: sessionStartedAt ?? "",
  });
}

function buildSessionTimer(
  bootstrap: SessionBootstrap,
  now: number,
  isConnected: boolean,
): SessionTimer {
  const plannedDurationSeconds = bootstrap.durationMinutes * 60;
  const startedAtMs = bootstrap.sessionStartedAt ? Date.parse(bootstrap.sessionStartedAt) : Number.NaN;
  const endedAtMs = bootstrap.sessionEndedAt ? Date.parse(bootstrap.sessionEndedAt) : Number.NaN;
  const hasStarted = Number.isFinite(startedAtMs);
  const hasEnded = Number.isFinite(endedAtMs);

  if (!hasStarted) {
    return {
      label: "Duration",
      value: `${bootstrap.durationMinutes}:00 target`,
      urgency: "normal",
      remainingSeconds: plannedDurationSeconds,
    };
  }

  const effectiveNow = hasEnded ? endedAtMs : now;
  const elapsedSeconds = Math.max(0, Math.floor((effectiveNow - startedAtMs) / 1000));
  const remainingSeconds = Math.max(0, plannedDurationSeconds - elapsedSeconds);

  let urgency: TimerUrgency = "normal";
  if (remainingSeconds <= 0) {
    urgency = "danger";
  } else if (remainingSeconds < 300) {
    urgency = remainingSeconds < 120 ? "danger" : "warning";
  }

  if (hasEnded || !isConnected) {
    return {
      label: "Elapsed",
      value: formatTimerValue(elapsedSeconds),
      urgency: "normal",
      remainingSeconds,
    };
  }

  return {
    label: "Time left",
    value: formatTimerValue(remainingSeconds),
    urgency,
    remainingSeconds,
  };
}

function formatTimerValue(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatConversationError(message: string, context?: ConversationErrorContext) {
  const cleanMessage = message.trim();

  if (cleanMessage && cleanMessage !== "Server error: Unknown error") {
    return cleanMessage;
  }

  if (typeof context?.details?.message === "string" && context.details.message.trim()) {
    return context.details.message.trim();
  }

  if (typeof context?.rawEvent === "string" && context.rawEvent.trim()) {
    return context.rawEvent.trim();
  }

  return "The voice session failed. Please try starting the interview again.";
}
