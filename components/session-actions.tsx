"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { CandidateSessionStatus } from "@/lib/interviews";

interface SessionActionsProps {
  sessionId: string;
  currentStatus: CandidateSessionStatus;
}

export function SessionActions({ sessionId, currentStatus }: SessionActionsProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const showActions = [
    "scored",
    "under_review",
    "next_round",
    "rejected",
  ].includes(currentStatus);

  if (!showActions) return null;

  const isAdvanced = currentStatus === "next_round";
  const isRejected = currentStatus === "rejected";

  async function updateStatus(targetStatus: CandidateSessionStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="session-actions">
      <p className="section-label">Decision</p>
      <div className="session-actions-buttons">
        <Button
          variant={isRejected ? "default" : "outline"}
          size="sm"
          disabled={updating || isRejected}
          onClick={() => updateStatus("rejected")}
          className="gap-1.5"
          style={isRejected ? { background: "var(--danger)", borderColor: "var(--danger)" } : {}}
        >
          <XCircle weight="duotone" className="size-4" />
          {isRejected ? "Rejected" : "Reject"}
        </Button>
        <Button
          variant={isAdvanced ? "default" : "outline"}
          size="sm"
          disabled={updating || isAdvanced}
          onClick={() => updateStatus("next_round")}
          className="gap-1.5"
          style={isAdvanced ? { background: "#22c55e", borderColor: "#22c55e" } : {}}
        >
          <CheckCircle weight="duotone" className="size-4" />
          {isAdvanced ? "Advanced" : "Advance to next round"}
        </Button>
      </div>
    </div>
  );
}
