"use client";

import { useState } from "react";
import Link from "next/link";
import { Scales } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CandidateComparisonDialog } from "@/components/candidate-comparison-dialog";
import type { CandidateSessionRecord } from "@/lib/interviews";

interface InterviewSessionsListProps {
  sessions: CandidateSessionRecord[];
  rejectThreshold: number;
  advanceThreshold: number;
}

export function InterviewSessionsList({
  sessions,
  rejectThreshold,
  advanceThreshold,
}: InterviewSessionsListProps) {
  const [compareOpen, setCompareOpen] = useState(false);

  const scoredCount = sessions.filter(
    (s) => s.scorecard && typeof s.scorecard.overallScore === "number",
  ).length;

  return (
    <>
      {sessions.length > 0 ? (
        <section className="results-panel transcript-review">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <p className="section-label">Candidate sessions ({sessions.length})</p>
            {scoredCount >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareOpen(true)}
                className="gap-1.5"
              >
                <Scales weight="duotone" className="size-4" />
                Compare candidates
              </Button>
            )}
          </div>
          <div className="transcript-list">
            {sessions.map((session) => (
              <CandidateSessionRow key={session.id} session={session} />
            ))}
          </div>
        </section>
      ) : (
        <section className="results-panel">
          <p className="section-label">Candidate sessions</p>
          <p className="section-copy">No candidates have applied yet.</p>
        </section>
      )}

      <CandidateComparisonDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        sessions={sessions}
        rejectThreshold={rejectThreshold}
        advanceThreshold={advanceThreshold}
      />
    </>
  );
}

function CandidateSessionRow({ session }: { session: CandidateSessionRecord }) {
  const hasScore = typeof session.scorecard?.overallScore === "number";
  const hasFeedback = Boolean(session.candidateExperienceFeedback);

  return (
    <article
      className="transcript-entry"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
        flexWrap: "wrap",
        borderLeft: session.status === "next_round" ? "3px solid #22c55e" : undefined,
        paddingLeft: session.status === "next_round" ? "1rem" : undefined,
      }}
    >
      <div style={{ flex: 1, minWidth: "200px" }}>
        <span style={{ fontWeight: 600 }}>{session.candidateProfile.candidateName}</span>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0.2rem 0" }}>
          {formatStatusLabel(session.status)}
          {hasScore ? ` — Score: ${session.scorecard!.overallScore}` : ""}
          {hasScore ? ` (${session.scorecard!.overallRecommendation.replace(/_/g, " ")})` : ""}
        </p>
        {hasFeedback ? (
          <p style={{ fontSize: "0.85rem", margin: "0.2rem 0" }}>
            <span style={{ color: "#f59e0b" }}>
              {"★".repeat(session.candidateExperienceFeedback!.rating)}
              {"☆".repeat(5 - session.candidateExperienceFeedback!.rating)}
            </span>
            {session.candidateExperienceFeedback!.comment ? (
              <span style={{ color: "var(--muted)", marginLeft: "0.5rem" }}>
                &ldquo;{session.candidateExperienceFeedback!.comment}&rdquo;
              </span>
            ) : null}
          </p>
        ) : null}
      </div>
      <Link
        href={`/admin/sessions/${session.id}`}
        style={{
          fontSize: "0.85rem",
          color: "var(--accent)",
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Review &rarr;
      </Link>
    </article>
  );
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
