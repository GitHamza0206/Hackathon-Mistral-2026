import Link from "next/link";
import { notFound } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { clipText } from "@/lib/interviews";
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

  return (
    <main className="results-shell">
      <section className="results-card">
        <div className="panel-heading">
          <div>
            <p className="section-label">Admin review</p>
            <h1>{session.candidateProfile.candidateName}</h1>
          </div>
          <span className="status-pill">{session.status}</span>
        </div>

        <div className="results-grid">
          <section className="results-panel">
            <p className="section-label">Role requirement</p>
            <dl className="detail-list">
              <div>
                <dt>Role</dt>
                <dd>{session.roleSnapshot.roleTitle}</dd>
              </div>
              <div>
                <dt>Target seniority</dt>
                <dd>{session.roleSnapshot.targetSeniority}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{session.roleSnapshot.companyName ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>Focus areas</dt>
                <dd>{session.roleSnapshot.focusAreas.join(", ")}</dd>
              </div>
              <div>
                <dt>Conversation ID</dt>
                <dd>{session.conversationId ?? "Pending"}</dd>
              </div>
            </dl>
            <div className="notes-panel">
              <p className="section-label">Job description snapshot</p>
              <p>{clipText(session.roleSnapshot.jobDescriptionText, 1800)}</p>
            </div>
            {session.roleSnapshot.adminNotes ? (
              <div className="notes-panel">
                <p className="section-label">Internal hiring notes</p>
                <p>{session.roleSnapshot.adminNotes}</p>
              </div>
            ) : null}
          </section>

          <section className="results-panel">
            <p className="section-label">Candidate profile</p>
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{session.candidateProfile.candidateName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{session.candidateProfile.candidateEmail ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>GitHub</dt>
                <dd>{session.candidateProfile.githubUrl}</dd>
              </div>
              <div>
                <dt>CV file</dt>
                <dd>{session.candidateProfile.cvFileName}</dd>
              </div>
              <div>
                <dt>Cover letter file</dt>
                <dd>{session.candidateProfile.coverLetterFileName ?? "Not provided"}</dd>
              </div>
            </dl>
            {session.candidateProfile.extraNote ? (
              <div className="notes-panel">
                <p className="section-label">Candidate note</p>
                <p>{session.candidateProfile.extraNote}</p>
              </div>
            ) : null}
            <div className="notes-panel">
              <p className="section-label">CV text snapshot</p>
              <p>{clipText(session.candidateProfile.cvText, 1500)}</p>
            </div>
            {session.candidateProfile.coverLetterText ? (
              <div className="notes-panel">
                <p className="section-label">Cover letter snapshot</p>
                <p>{clipText(session.candidateProfile.coverLetterText, 1100)}</p>
              </div>
            ) : null}
          </section>
        </div>

        <section className="results-panel transcript-review">
          <p className="section-label">Scorecard</p>
          {session.scorecard ? (
            <>
              <div className="score-hero">
                <strong>{session.scorecard.overallScore}</strong>
                <div>
                  <span>{session.scorecard.overallRecommendation.replace("_", " ")}</span>
                  <p>Estimated level: {session.scorecard.seniorityEstimate}</p>
                </div>
              </div>
              <div className="score-grid">
                <Metric label="Technical depth" value={session.scorecard.technicalDepthScore} />
                <Metric
                  label="LLM product engineering"
                  value={session.scorecard.llmProductEngineeringScore}
                />
                <Metric
                  label="Coding and debugging"
                  value={session.scorecard.codingAndDebuggingScore}
                />
                <Metric label="System design" value={session.scorecard.systemDesignScore} />
                <Metric label="Communication" value={session.scorecard.communicationScore} />
              </div>
              <p className="summary-copy">{session.scorecard.summary}</p>
              <ReviewList label="Strengths" items={session.scorecard.strengths} />
              <ReviewList label="Concerns" items={session.scorecard.concerns} />
              <ReviewList
                label="Follow-up questions"
                items={session.scorecard.followUpQuestions}
              />
            </>
          ) : (
            <p className="section-copy">
              Scorecard not available yet. {session.error ? `Latest error: ${session.error}` : ""}
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

          {session.transcript && session.transcript.length > 0 ? (
            <div className="transcript-list">
              {session.transcript.map((entry, index) => (
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
