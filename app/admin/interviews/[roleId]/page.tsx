import Link from "next/link";
import { notFound } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { getRoleTemplate, listCandidateSessionsByRole } from "@/lib/storage";
import { ScoreDistributionChart } from "@/components/score-distribution-chart";
import { SessionTimeline } from "@/components/session-timeline";
import { InterviewSessionsList } from "@/components/interview-sessions-list";

interface AdminInterviewPageProps {
  params: Promise<{ roleId: string }>;
}

export default async function AdminInterviewPage({ params }: AdminInterviewPageProps) {
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

  const { roleId } = await params;
  const role = await getRoleTemplate(roleId);

  if (!role) {
    notFound();
  }

  const sessions = await listCandidateSessionsByRole(roleId);
  const rejectThreshold = role.rejectThreshold ?? 40;
  const advanceThreshold = role.advanceThreshold ?? 90;

  const scoredSessions = sessions.filter(
    (s) => s.scorecard && typeof s.scorecard.overallScore === "number",
  );
  const avgScore =
    scoredSessions.length > 0
      ? scoredSessions.reduce((sum, s) => sum + s.scorecard!.overallScore, 0) / scoredSessions.length
      : null;

  return (
    <main className="results-shell">
      <section className="results-card">
        <div className="panel-heading">
          <div>
            <p className="section-label">Interview template</p>
            <h1>{role.roleTitle}</h1>
          </div>
          <span className="status-pill">{role.status}</span>
        </div>

        <div className="results-grid">
          <section className="results-panel">
            <p className="section-label">Role configuration</p>
            <dl className="detail-list">
              <div>
                <dt>Role title</dt>
                <dd>{role.roleTitle}</dd>
              </div>
              <div>
                <dt>Target seniority</dt>
                <dd>{role.targetSeniority}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{role.companyName ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{role.durationMinutes} minutes</dd>
              </div>
              <div>
                <dt>Focus areas</dt>
                <dd>{role.focusAreas.join(", ")}</dd>
              </div>
              <div>
                <dt>Thresholds</dt>
                <dd>
                  Reject &lt; {rejectThreshold} &middot; Review{" "}
                  {rejectThreshold}&ndash;{advanceThreshold - 1} &middot; Advance &ge;{" "}
                  {advanceThreshold}
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatTimestamp(role.createdAt)}</dd>
              </div>
              <div>
                <dt>Candidate apply URL</dt>
                <dd>
                  <code className="section-copy">{role.candidateApplyUrl}</code>
                </dd>
              </div>
            </dl>
          </section>

          <section className="results-panel">
            <p className="section-label">Internal hiring notes</p>
            {role.adminNotes ? (
              <p className="section-copy">{role.adminNotes}</p>
            ) : (
              <p className="section-copy">No admin notes provided.</p>
            )}

            <div style={{ marginTop: "1.5rem" }}>
              <p className="section-label">Interview metrics</p>
              <dl className="detail-list">
                <div>
                  <dt>Total candidates</dt>
                  <dd>{sessions.length}</dd>
                </div>
                <div>
                  <dt>Scored</dt>
                  <dd>{scoredSessions.length}</dd>
                </div>
                {avgScore !== null ? (
                  <div>
                    <dt>Avg score</dt>
                    <dd>{avgScore.toFixed(1)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Advancing</dt>
                  <dd>{sessions.filter((s) => s.status === "next_round").length}</dd>
                </div>
              </dl>

              {scoredSessions.length >= 2 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <p className="section-label">Score distribution</p>
                  <ScoreDistributionChart
                    sessions={sessions}
                    rejectThreshold={rejectThreshold}
                    advanceThreshold={advanceThreshold}
                  />
                </div>
              )}

              {sessions.filter((s) => s.sessionStartedAt).length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <p className="section-label">Session timeline</p>
                  <SessionTimeline sessions={sessions} />
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="results-panel transcript-review">
          <p className="section-label">Job description</p>
          <p className="fine-print">{role.jobDescriptionFileName}</p>
          <div className="formatted-snapshot">
            <p style={{ whiteSpace: "pre-wrap" }}>{role.jobDescriptionText}</p>
          </div>
        </section>

        <InterviewSessionsList
          sessions={sessions}
          rejectThreshold={rejectThreshold}
          advanceThreshold={advanceThreshold}
        />

        <Link className="ghost-link" href="/">
          Back to admin home
        </Link>
      </section>
    </main>
  );
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
