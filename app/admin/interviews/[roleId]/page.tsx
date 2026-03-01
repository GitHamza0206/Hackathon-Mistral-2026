import Link from "next/link";
import { notFound } from "next/navigation";
import { hasAdminSession } from "@/lib/admin-auth";
import { getRoleTemplate } from "@/lib/storage";

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

  const rejectThreshold = role.rejectThreshold ?? 40;
  const advanceThreshold = role.advanceThreshold ?? 90;

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
          </section>
        </div>

        <section className="results-panel transcript-review">
          <p className="section-label">Job description</p>
          <p className="fine-print">{role.jobDescriptionFileName}</p>
          <div className="formatted-snapshot">
            <p style={{ whiteSpace: "pre-wrap" }}>{role.jobDescriptionText}</p>
          </div>
        </section>

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
