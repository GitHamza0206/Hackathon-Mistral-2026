"use client";

import { useEffect, useState } from "react";
import {
  Microphone,
  Browser,
  SpeakerHigh,
  CheckCircle,
  XCircle,
  Circle,
} from "@phosphor-icons/react";

type CheckStatus = "pending" | "testing" | "passed" | "failed";

interface PreInterviewChecklistProps {
  onAllPassed: (allPassed: boolean) => void;
}

export function PreInterviewChecklist({ onAllPassed }: PreInterviewChecklistProps) {
  const [micStatus, setMicStatus] = useState<CheckStatus>("pending");
  const [micError, setMicError] = useState("");
  const [browserStatus, setBrowserStatus] = useState<CheckStatus>("pending");
  const [browserError, setBrowserError] = useState("");
  const [quietStatus, setQuietStatus] = useState<CheckStatus>("pending");

  useEffect(() => {
    // Browser compatibility check
    const hasMicApi = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
    const hasAudioContext = typeof AudioContext !== "undefined" || typeof (window as unknown as Record<string, unknown>).webkitAudioContext !== "undefined";
    const hasWebSocket = typeof WebSocket !== "undefined";

    if (hasMicApi && hasAudioContext && hasWebSocket) {
      setBrowserStatus("passed");
    } else {
      setBrowserStatus("failed");
      const missing: string[] = [];
      if (!hasMicApi) missing.push("microphone API");
      if (!hasAudioContext) missing.push("audio context");
      if (!hasWebSocket) missing.push("WebSocket");
      setBrowserError(`Missing: ${missing.join(", ")}`);
    }

    // Microphone check
    setMicStatus("testing");
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMicStatus("passed");
        stream.getTracks().forEach((t) => t.stop());
      })
      .catch(() => {
        setMicStatus("failed");
        setMicError("Microphone access denied");
      });
  }, []);

  useEffect(() => {
    onAllPassed(micStatus === "passed" && browserStatus === "passed" && quietStatus === "passed");
  }, [micStatus, browserStatus, quietStatus, onAllPassed]);

  return (
    <div className="pre-checklist">
      <p className="section-label">Before you begin</p>
      <div className="checklist-items">
        <ChecklistItem
          icon={<Microphone weight="duotone" />}
          label="Microphone"
          description={
            micStatus === "testing"
              ? "Testing..."
              : micStatus === "passed"
                ? "Working"
                : micError || "Not available"
          }
          status={micStatus}
        />
        <ChecklistItem
          icon={<Browser weight="duotone" />}
          label="Browser"
          description={browserStatus === "passed" ? "Compatible" : browserError || "Not fully supported"}
          status={browserStatus}
        />
        <ChecklistItem
          icon={<SpeakerHigh weight="duotone" />}
          label="Quiet environment"
          description="Make sure you're in a quiet space with headphones"
          status={quietStatus}
          action={
            quietStatus === "pending" ? (
              <button
                className="secondary-button"
                type="button"
                onClick={() => setQuietStatus("passed")}
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.78rem", marginTop: "0.35rem" }}
              >
                I&apos;m ready
              </button>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}

function ChecklistItem({
  icon,
  label,
  description,
  status,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  status: CheckStatus;
  action?: React.ReactNode;
}) {
  return (
    <div className="checklist-item">
      <div className="checklist-icon">{icon}</div>
      <div className="checklist-content">
        <div className="checklist-label">{label}</div>
        <div className="checklist-description">{description}</div>
        {action}
      </div>
      <div className="checklist-status">
        {status === "passed" && <CheckCircle weight="duotone" className="checklist-pass" />}
        {status === "failed" && <XCircle weight="duotone" className="checklist-fail" />}
        {(status === "pending" || status === "testing") && <Circle weight="duotone" className="checklist-pending" />}
      </div>
    </div>
  );
}
