"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import {
  splitFocusAreas,
  targetSeniorities,
  type CandidateSessionRecord,
  type RoleTemplateRecord,
} from "@/lib/interviews";

interface AdminConsoleProps {
  isAuthenticated: boolean;
  recentRoles: RoleTemplateRecord[];
  recentSessions: CandidateSessionRecord[];
}

interface CreateRoleResponse {
  roleId: string;
  candidateApplyUrl: string;
  status: string;
}

const defaultForm = {
  roleTitle: "Senior AI Engineer",
  targetSeniority: "senior",
  durationMinutes: "25",
  focusAreas: "LLM systems\nRAG and evals\nProduction debugging\nSystem design",
  companyName: "",
  adminNotes: "",
  jobDescriptionPdf: null as File | null,
};

export function AdminConsole({
  isAuthenticated,
  recentRoles,
  recentSessions,
}: AdminConsoleProps) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(isAuthenticated);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreateRoleResponse | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "Authentication failed.");
      }

      setIsAuthed(true);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setErrors({});

    try {
      const payload = new FormData();
      payload.set("roleTitle", form.roleTitle.trim());
      payload.set("targetSeniority", form.targetSeniority);
      payload.set("durationMinutes", form.durationMinutes);
      payload.set("focusAreas", splitFocusAreas(form.focusAreas).join("\n"));
      payload.set("companyName", form.companyName.trim());
      payload.set("adminNotes", form.adminNotes.trim());

      if (form.jobDescriptionPdf) {
        payload.set("jobDescriptionPdf", form.jobDescriptionPdf);
      }

      const response = await fetch("/api/admin/roles", {
        method: "POST",
        body: payload,
      });

      const body = (await response.json()) as CreateRoleResponse & {
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok) {
        setErrors(body.fieldErrors ?? {});
        throw new Error(body.error ?? "Unable to create the role template.");
      }

      setCreated(body);
      setForm(defaultForm);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create the role template.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-block">
        <div className="hero-copy">
          <p className="eyebrow">Admin control room</p>
          <h1>Publish a role-aware AI engineer screener.</h1>
          <p className="lede">
            Upload the hiring requirement once, generate a reusable candidate link, and let each
            applicant bring their own CV, optional cover letter, and public GitHub profile into the voice
            interview.
          </p>
        </div>

        <div className="hero-badges">
          <span>Role templates</span>
          <span>PDF ingestion</span>
          <span>Candidate-specific sessions</span>
        </div>
      </section>

      {!isAuthed ? (
        <section className="panel auth-panel">
          <div>
            <p className="section-label">Admin auth</p>
            <h2>Unlock the hiring workspace.</h2>
            <p className="section-copy">
              The shared passcode protects role templates, candidate sessions, transcripts, and
              scorecards.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="field">
              <span>Admin passcode</span>
              <input
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                placeholder="Enter the shared passcode"
                autoComplete="current-password"
              />
            </label>

            {authError ? <p className="error-text">{authError}</p> : null}

            <button className="primary-button" type="submit" disabled={authLoading}>
              {authLoading ? "Checking..." : "Enter workspace"}
            </button>
          </form>
        </section>
      ) : (
        <div className="dashboard-grid">
          <section className="panel form-panel">
            <div className="panel-heading">
              <div>
                <p className="section-label">Create role template</p>
                <h2>Upload the hiring requirement.</h2>
              </div>
              <span className="status-pill">Authenticated</span>
            </div>

            <form className="setup-form" onSubmit={handleCreate}>
              <div className="field-grid">
                <label className="field">
                  <span>Role title</span>
                  <input
                    value={form.roleTitle}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, roleTitle: event.target.value }))
                    }
                    placeholder="Senior AI Engineer"
                  />
                  {errors.roleTitle ? <small>{errors.roleTitle}</small> : null}
                </label>

                <label className="field">
                  <span>Target seniority</span>
                  <select
                    value={form.targetSeniority}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, targetSeniority: event.target.value }))
                    }
                  >
                    {targetSeniorities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.targetSeniority ? <small>{errors.targetSeniority}</small> : null}
                </label>

                <label className="field">
                  <span>Interview length (minutes)</span>
                  <input
                    type="number"
                    min={10}
                    max={90}
                    value={form.durationMinutes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, durationMinutes: event.target.value }))
                    }
                  />
                  {errors.durationMinutes ? <small>{errors.durationMinutes}</small> : null}
                </label>

                <label className="field">
                  <span>Company name</span>
                  <input
                    value={form.companyName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, companyName: event.target.value }))
                    }
                    placeholder="Acme AI"
                  />
                </label>
              </div>

              <label className="field">
                <span>Focus areas</span>
                <textarea
                  value={form.focusAreas}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, focusAreas: event.target.value }))
                  }
                  rows={4}
                  placeholder={"LLM systems\nRAG evals\nDebugging\nSystem design"}
                />
                {errors.focusAreas ? <small>{errors.focusAreas}</small> : null}
              </label>

              <label className="field">
                <span>Internal hiring notes</span>
                <textarea
                  value={form.adminNotes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, adminNotes: event.target.value }))
                  }
                  rows={5}
                  placeholder="Optional notes for the screener, such as must-have experience or areas to probe."
                />
              </label>

              <label className="field">
                <span>Job description PDF</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      jobDescriptionPdf: event.target.files?.[0] ?? null,
                    }))
                  }
                />
                <p className="fine-print">
                  Upload the company requirement as a PDF. The candidate will not upload this.
                </p>
                {errors.jobDescriptionPdf ? <small>{errors.jobDescriptionPdf}</small> : null}
              </label>

              {submitError ? <p className="error-text">{submitError}</p> : null}

              <button className="primary-button" type="submit" disabled={submitting}>
                {submitting ? "Creating role..." : "Create reusable role link"}
              </button>
            </form>
          </section>

          <aside className="stack-column">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">Candidate link</p>
                  <h2>Reusable apply URL</h2>
                </div>
              </div>

              {created ? (
                <div className="launch-card">
                  <div className="launch-meta">
                    <span className="status-pill">{created.status}</span>
                    <code>{created.roleId}</code>
                  </div>
                  <p className="launch-link">{created.candidateApplyUrl}</p>
                  <div className="action-row">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => navigator.clipboard.writeText(created.candidateApplyUrl)}
                    >
                      Copy apply URL
                    </button>
                    <Link className="secondary-button" href={created.candidateApplyUrl}>
                      Open candidate page
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="section-copy">
                  Create a role template to generate a reusable candidate apply link.
                </p>
              )}
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">Recent roles</p>
                  <h2>Published templates</h2>
                </div>
              </div>

              <div className="recent-list">
                {recentRoles.length > 0 ? (
                  recentRoles.map((role) => (
                    <article className="recent-card" key={role.id}>
                      <div>
                        <strong>{role.roleTitle}</strong>
                        <p>
                          {role.companyName ? `${role.companyName} · ` : ""}
                          {role.targetSeniority}
                        </p>
                      </div>
                      <span className="status-pill subtle">{role.status}</span>
                    </article>
                  ))
                ) : (
                  <p className="section-copy">No role templates stored yet.</p>
                )}
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="section-label">Recent sessions</p>
                  <h2>Candidate interviews</h2>
                </div>
              </div>

              <div className="recent-list">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => (
                    <Link
                      className="recent-card"
                      href={`/admin/sessions/${session.id}`}
                      key={session.id}
                    >
                      <div>
                        <strong>{session.candidateProfile.candidateName}</strong>
                        <p>{session.roleSnapshot.roleTitle}</p>
                      </div>
                      <span className="status-pill subtle">{session.status}</span>
                    </Link>
                  ))
                ) : (
                  <p className="section-copy">No candidate sessions yet.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      )}
    </main>
  );
}
