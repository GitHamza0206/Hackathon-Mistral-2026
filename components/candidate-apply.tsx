"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { RoleBootstrap } from "@/lib/interviews";

interface CandidateApplyProps {
  roleId: string;
}

export function CandidateApply({ roleId }: CandidateApplyProps) {
  const router = useRouter();
  const [bootstrap, setBootstrap] = useState<RoleBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      try {
        setLoading(true);
        const response = await fetch(`/api/roles/${roleId}`);
        const body = (await response.json()) as RoleBootstrap & { error?: string };

        if (!response.ok) {
          throw new Error(body.error ?? "Unable to load the role.");
        }

        if (!cancelled) {
          setBootstrap(body);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load the role.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRole();

    return () => {
      cancelled = true;
    };
  }, [roleId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    try {
      const response = await fetch(`/api/roles/${roleId}/candidate-session`, {
        method: "POST",
        body: formData,
      });

      const body = (await response.json()) as {
        sessionId?: string;
        sessionUrl?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok) {
        setFieldErrors(body.fieldErrors ?? {});
        throw new Error(body.error ?? "Unable to prepare your interview.");
      }

      startTransition(() => {
        router.push(body.sessionUrl ?? `/session/${body.sessionId}`);
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to prepare your interview.",
      );
    }
  };

  return (
    <main className="candidate-shell">
      <div className="candidate-card">
        <p className="eyebrow">Candidate application</p>
        <h1>Prepare your screening session</h1>

        {loading ? <p className="section-copy">Loading role setup...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        {bootstrap ? (
          <>
            <div className="candidate-summary">
              <div>
                <span>Role</span>
                <strong>{bootstrap.roleTitle}</strong>
              </div>
              <div>
                <span>Level</span>
                <strong>{bootstrap.targetSeniority}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{bootstrap.durationMinutes} min</strong>
              </div>
            </div>

            <p className="section-copy">{bootstrap.intro}</p>

            <form className="setup-form" onSubmit={handleSubmit}>
              <div className="field-grid">
                <label className="field">
                  <span>Your name</span>
                  <input name="candidateName" placeholder="Alex Morgan" />
                  {fieldErrors.candidateName ? <small>{fieldErrors.candidateName}</small> : null}
                </label>

                <label className="field">
                  <span>Email (optional)</span>
                  <input name="candidateEmail" type="email" placeholder="alex@example.com" />
                  {fieldErrors.candidateEmail ? (
                    <small>{fieldErrors.candidateEmail}</small>
                  ) : null}
                </label>
              </div>

              <label className="field">
                <span>Public GitHub profile URL</span>
                <input
                  name="githubUrl"
                  type="url"
                  placeholder="https://github.com/your-handle"
                />
                <p className="fine-print">
                  No GitHub login is required. Only your public profile link is used.
                </p>
                {fieldErrors.githubUrl ? <small>{fieldErrors.githubUrl}</small> : null}
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>CV PDF</span>
                  <input name="cvPdf" type="file" accept="application/pdf,.pdf" />
                  {fieldErrors.cvPdf ? <small>{fieldErrors.cvPdf}</small> : null}
                </label>

                <label className="field">
                  <span>Cover letter PDF</span>
                  <input name="coverLetterPdf" type="file" accept="application/pdf,.pdf" />
                  {fieldErrors.coverLetterPdf ? <small>{fieldErrors.coverLetterPdf}</small> : null}
                </label>
              </div>

              <label className="field">
                <span>Extra note (optional)</span>
                <textarea
                  name="extraNote"
                  rows={4}
                  placeholder="Anything you want the screener to keep in mind before the interview starts."
                />
              </label>

              <p className="fine-print">
                Your uploaded materials and interview transcript are used to tailor and evaluate the
                screening session.
              </p>

              <button className="primary-button" type="submit" disabled={isPending}>
                {isPending ? "Preparing your interview..." : "Prepare interview"}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </main>
  );
}
