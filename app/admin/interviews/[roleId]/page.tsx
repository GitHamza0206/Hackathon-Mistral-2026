import Link from "next/link";
import { notFound } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { getRoleTemplate, listCandidateSessionsByRole } from "@/lib/storage";
import type { CandidateSessionRecord } from "@/lib/interviews";

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

        {sessions.length > 0 ? (
          <section className="results-panel transcript-review">
            <p className="section-label">Candidate sessions ({sessions.length})</p>
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

        <Link className="ghost-link" href="/">
          Back to admin home
        </Link>
      </section>
    </main>
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
