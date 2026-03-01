import Link from "next/link";
import { notFound } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { ensureSessionTranscript } from "@/lib/session-transcript";
import { getCandidateSession } from "@/lib/storage";
import { DownloadButtons } from "@/components/download-buttons";
import { SessionActions } from "@/components/session-actions";

interface AdminSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function AdminSessionPage({ params }: AdminSessionPageProps) {
  const isAuthenticated = await hasAdminSession();

  if (!isAuthenticated) {
    return (
      <main className="results-shell">
        <section className="results-card">
          <p className="eyebrow">Admin access required</p>
          <h1>Enter through the main control room first.</h1>
          <Link className="primary-button" href="/">
            Go to admin home
          </Link>
        </section>
      </main>
    );
  }

  const { sessionId } = await params;
  const session = await getCandidateSession(sessionId);

  if (!session) {
    notFound();
  }

  const hydratedSession = await ensureSessionTranscript(session);

  const rejectThreshold = hydratedSession.roleSnapshot.rejectThreshold ?? 40;
  const advanceThreshold = hydratedSession.roleSnapshot.advanceThreshold ?? 90;

  return (
    <main className="results-shell">
      <section className="results-card">
        <div className="panel-heading">
          <div>
            <p className="section-label">Admin review</p>
            <h1>{hydratedSession.candidateProfile.candidateName}</h1>
          </div>
          <span className="status-pill">{formatStatusLabel(hydratedSession.status)}</span>
        </div>

        <div className="results-grid">
          <section className="results-panel">
            <p className="section-label">Role requirement</p>
            <dl className="detail-list">
              <div>
                <dt>Role</dt>
                <dd>{hydratedSession.roleSnapshot.roleTitle}</dd>
              </div>
              <div>
                <dt>Target seniority</dt>
                <dd>{hydratedSession.roleSnapshot.targetSeniority}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{hydratedSession.roleSnapshot.companyName ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>Focus areas</dt>
                <dd>{hydratedSession.roleSnapshot.focusAreas.join(", ")}</dd>
              </div>
              <div>
                <dt>Thresholds</dt>
                <dd>Reject &lt; {rejectThreshold} &middot; Review {rejectThreshold}&ndash;{advanceThreshold - 1} &middot; Advance &ge; {advanceThreshold}</dd>
              </div>
              <div>
                <dt>Conversation ID</dt>
                <dd>{hydratedSession.conversationId ?? "Pending"}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatTimestamp(hydratedSession.createdAt)}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>{formatTimestamp(hydratedSession.sessionStartedAt)}</dd>
              </div>
              <div>
                <dt>Ended</dt>
                <dd>{formatTimestamp(hydratedSession.sessionEndedAt)}</dd>
              </div>
              <div>
                <dt>Transcript entries</dt>
                <dd>{String(hydratedSession.transcript?.length ?? 0)}</dd>
              </div>
            </dl>

            <div className="notes-panel">
              <p className="section-label">Interview template</p>
              <p className="section-copy">
                <Link href={`/admin/interviews/${hydratedSession.roleId}`}>View interview template</Link>
              </p>
            </div>

            {hydratedSession.roleSnapshot.adminNotes ? (
              <div className="notes-panel">
                <p className="section-label">Internal hiring notes</p>
                <p>{hydratedSession.roleSnapshot.adminNotes}</p>
              </div>
            ) : null}

            {hydratedSession.candidateExperienceFeedback ? (
              <div className="notes-panel">
                <p className="section-label">Candidate experience feedback</p>
                <div style={{ display: "flex", gap: "0.3rem", alignItems: "center", margin: "0.5rem 0" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        fontSize: "1.2rem",
                        opacity: star <= hydratedSession.candidateExperienceFeedback!.rating ? 1 : 0.25,
                        color: "#f59e0b",
                      }}
                    >
                      &#9733;
                    </span>
                  ))}
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
                    ({hydratedSession.candidateExperienceFeedback.rating}/5)
                  </span>
                </div>
                {hydratedSession.candidateExperienceFeedback.comment ? (
                  <p className="section-copy">{hydratedSession.candidateExperienceFeedback.comment}</p>
                ) : null}
                <p className="fine-print" style={{ marginTop: "0.5rem" }}>
                  Submitted {formatTimestamp(hydratedSession.candidateExperienceFeedback.submittedAt)}
                </p>
              </div>
            ) : null}
          </section>

          <section className="results-panel">
            <p className="section-label">Candidate</p>
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{hydratedSession.candidateProfile.candidateName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{hydratedSession.candidateProfile.candidateEmail ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>GitHub</dt>
                <dd>
                  <a href={hydratedSession.candidateProfile.githubUrl} target="_blank" rel="noopener noreferrer">
                    {hydratedSession.candidateProfile.githubUrl}
                  </a>
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="results-panel transcript-review">
          <p className="section-label">Scorecard</p>
          {hydratedSession.scorecard ? (
            <>
              <div className="score-hero">
                <strong>{hydratedSession.scorecard.overallScore}</strong>
                <div>
                  <span>{hydratedSession.scorecard.overallRecommendation.replace("_", " ")}</span>
                  <p>Estimated level: {hydratedSession.scorecard.seniorityEstimate}</p>
                </div>
              </div>

              <ThresholdBar
                score={hydratedSession.scorecard.overallScore}
                rejectThreshold={rejectThreshold}
                advanceThreshold={advanceThreshold}
              />

              <div className="score-grid">
                <Metric label="Technical depth" value={hydratedSession.scorecard.technicalDepthScore} />
                <Metric
                  label="LLM product engineering"
                  value={hydratedSession.scorecard.llmProductEngineeringScore}
                />
                <Metric
                  label="Coding and debugging"
                  value={hydratedSession.scorecard.codingAndDebuggingScore}
                />
                <Metric label="System design" value={hydratedSession.scorecard.systemDesignScore} />
                <Metric label="Communication" value={hydratedSession.scorecard.communicationScore} />
              </div>
              <p className="summary-copy">{hydratedSession.scorecard.summary}</p>
              <ReviewList label="Strengths" items={hydratedSession.scorecard.strengths} />
              <ReviewList label="Concerns" items={hydratedSession.scorecard.concerns} />
              <ReviewList
                label="Follow-up questions"
                items={hydratedSession.scorecard.followUpQuestions}
              />
            </>
          ) : (
            <p className="section-copy">
              Scorecard not available yet. {hydratedSession.error ? `Latest error: ${hydratedSession.error}` : ""}
            </p>
          )}

          <DownloadButtons
            candidateName={hydratedSession.candidateProfile.candidateName}
            scorecard={hydratedSession.scorecard}
            transcript={hydratedSession.transcript}
          />
        </section>

        <SessionActions
          sessionId={hydratedSession.id}
          currentStatus={hydratedSession.status}
        />

        <section className="results-panel transcript-review">
          <div className="panel-heading">
            <div>
              <p className="section-label">Transcript</p>
              <h2>Conversation record</h2>
            </div>
            <Link className="secondary-button" href="/">
              Back to admin home
            </Link>
          </div>

          {hydratedSession.transcript && hydratedSession.transcript.length > 0 ? (
            <div className="transcript-list">
              {hydratedSession.transcript.map((entry, index) => (
                <article className="transcript-entry" key={`${entry.speaker}-${index}`}>
                  <span>{entry.speaker === "agent" ? "Interviewer" : "Candidate"}</span>
                  <p>{entry.text}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="section-copy">No transcript has been stored yet.</p>
          )}
        </section>
      </section>
    </main>
  );
}


function ThresholdBar({
  score,
  rejectThreshold,
  advanceThreshold,
}: {
  score: number;
  rejectThreshold: number;
  advanceThreshold: number;
}) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const scoreZone =
    clampedScore < rejectThreshold ? "reject" : clampedScore >= advanceThreshold ? "advance" : "review";

  return (
    <div className="threshold-bar-wrap">
      <div className="threshold-bar">
        <div className="threshold-bar-zones">
          <div
            className="threshold-zone threshold-zone-reject"
            style={{ width: `${rejectThreshold}%` }}
          />
          <div
            className="threshold-zone threshold-zone-review"
            style={{ width: `${advanceThreshold - rejectThreshold}%` }}
          />
          <div
            className="threshold-zone threshold-zone-advance"
            style={{ width: `${100 - advanceThreshold}%` }}
          />
        </div>
        <div
          className={`threshold-score-marker threshold-score-${scoreZone}`}
          style={{ left: `${clampedScore}%` }}
        >
          <span>{score}</span>
        </div>
      </div>
      <div className="threshold-labels">
        <span>Reject &lt; {rejectThreshold}</span>
        <span>Review</span>
        <span>Advance &ge; {advanceThreshold}</span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReviewList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="review-list">
      <p className="section-label">{label}</p>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="section-copy">No items available.</p>
      )}
    </div>
  );
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}
