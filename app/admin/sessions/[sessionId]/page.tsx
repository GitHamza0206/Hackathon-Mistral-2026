import Link from "next/link";
import { notFound } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { clipText } from "@/lib/interviews";
import { ensureSessionTranscript } from "@/lib/session-transcript";
import { getCandidateSession } from "@/lib/storage";

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

  return (
    <main className="results-shell">
      <section className="results-card">
        <div className="panel-heading">
          <div>
            <p className="section-label">Admin review</p>
            <h1>{hydratedSession.candidateProfile.candidateName}</h1>
          </div>
          <span className="status-pill">{hydratedSession.status}</span>
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
              <p className="section-label">Job description snapshot</p>
              <p>{clipText(hydratedSession.roleSnapshot.jobDescriptionText, 1800)}</p>
            </div>
            {hydratedSession.roleSnapshot.adminNotes ? (
              <div className="notes-panel">
                <p className="section-label">Internal hiring notes</p>
                <p>{hydratedSession.roleSnapshot.adminNotes}</p>
              </div>
            ) : null}
          </section>

          <section className="results-panel">
            <p className="section-label">Candidate profile</p>
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
                <dd>{hydratedSession.candidateProfile.githubUrl}</dd>
              </div>
              <div>
                <dt>CV file</dt>
                <dd>{hydratedSession.candidateProfile.cvFileName}</dd>
              </div>
              <div>
                <dt>Cover letter file</dt>
                <dd>{hydratedSession.candidateProfile.coverLetterFileName ?? "Not provided"}</dd>
              </div>
            </dl>
            {hydratedSession.candidateProfile.extraNote ? (
              <div className="notes-panel">
                <p className="section-label">Candidate note</p>
                <p>{hydratedSession.candidateProfile.extraNote}</p>
              </div>
            ) : null}
            <div className="notes-panel">
              <p className="section-label">CV text snapshot</p>
              <p>{clipText(hydratedSession.candidateProfile.cvText, 1500)}</p>
            </div>
            {hydratedSession.candidateProfile.coverLetterText ? (
              <div className="notes-panel">
                <p className="section-label">Cover letter snapshot</p>
                <p>{clipText(hydratedSession.candidateProfile.coverLetterText, 1100)}</p>
              </div>
            ) : null}
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
        </section>

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
