"use client";

import { useState } from "react";
import { Scales } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { CandidateSessionRecord } from "@/lib/interviews";

interface CandidateComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: CandidateSessionRecord[];
  rejectThreshold: number;
  advanceThreshold: number;
}

const DIMENSIONS = [
  { key: "technicalDepthScore" as const, label: "Technical depth" },
  { key: "llmProductEngineeringScore" as const, label: "LLM engineering" },
  { key: "codingAndDebuggingScore" as const, label: "Coding & debugging" },
  { key: "systemDesignScore" as const, label: "System design" },
  { key: "communicationScore" as const, label: "Communication" },
];

export function CandidateComparisonDialog({
  open,
  onOpenChange,
  sessions,
  rejectThreshold,
  advanceThreshold,
}: CandidateComparisonDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState(false);

  const scoredSessions = sessions.filter(
    (s) => s.scorecard && typeof s.scorecard.overallScore === "number",
  );

  const toggleId = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const selected = scoredSessions.filter((s) => selectedIds.has(s.id));

  function barColor(score: number) {
    if (score < rejectThreshold) return "var(--danger)";
    if (score >= advanceThreshold) return "#22c55e";
    return "var(--accent)";
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setComparing(false);
          setSelectedIds(new Set());
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scales weight="duotone" className="size-5" />
            {comparing ? "Candidate Comparison" : "Select Candidates to Compare"}
          </DialogTitle>
          <DialogDescription>
            {comparing
              ? `Comparing ${selected.length} candidates side by side`
              : "Choose 2-3 scored candidates to compare their scorecards"}
          </DialogDescription>
        </DialogHeader>

        {!comparing ? (
          <div className="space-y-3">
            {scoredSessions.map((session) => (
              <label
                key={session.id}
                className="flex items-center gap-3 rounded-lg border border-border/70 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <Checkbox
                  checked={selectedIds.has(session.id)}
                  onCheckedChange={() => toggleId(session.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{session.candidateProfile.candidateName}</p>
                  <p className="text-xs text-muted-foreground">
                    Score: {session.scorecard!.overallScore} — {session.scorecard!.overallRecommendation.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="font-mono text-lg font-bold" style={{ color: barColor(session.scorecard!.overallScore) }}>
                  {session.scorecard!.overallScore}
                </span>
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setComparing(true)}
                disabled={selectedIds.size < 2}
              >
                Compare ({selectedIds.size})
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="comparison-grid"
              style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0, 1fr))` }}
            >
              {selected.map((session) => (
                <div key={session.id} className="comparison-column">
                  <div>
                    <p className="font-semibold text-sm">{session.candidateProfile.candidateName}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: barColor(session.scorecard!.overallScore) }}
                      >
                        {session.scorecard!.overallScore}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.scorecard!.overallRecommendation.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Est. level: {session.scorecard!.seniorityEstimate}
                    </p>
                  </div>

                  <div className="space-y-3 mt-2">
                    {DIMENSIONS.map(({ key, label }) => {
                      const score = session.scorecard![key];
                      const pct = Math.max(0, Math.min(100, score));
                      return (
                        <div key={key} className="comparison-dimension">
                          <div className="flex justify-between items-baseline">
                            <span className="comparison-dimension-label">{label}</span>
                            <span className="text-xs font-bold">{score}</span>
                          </div>
                          <div className="comparison-score-track">
                            <div
                              className="comparison-score-fill"
                              style={{ width: `${pct}%`, background: barColor(score) }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Strengths</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5 pl-3">
                        {session.scorecard!.strengths.map((s) => (
                          <li key={s} className="list-disc">{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Concerns</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5 pl-3">
                        {session.scorecard!.concerns.map((c) => (
                          <li key={c} className="list-disc">{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setComparing(false)}>
                Back to selection
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
