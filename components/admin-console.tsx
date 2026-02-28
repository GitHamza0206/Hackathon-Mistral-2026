"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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

  const candidateMetrics = useMemo(() => {
    const scored = recentSessions.filter((session) => session.status === "scored").length;
    const inProgress = recentSessions.filter((session) =>
      ["profile_submitted", "agent_ready", "in_progress"].includes(session.status),
    ).length;

    return {
      total: recentSessions.length,
      scored,
      inProgress,
    };
  }, [recentSessions]);

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

  if (!isAuthed) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden">
            <CardHeader className="gap-4">
              <Badge variant="orange" className="w-fit">
                Admin workspace
              </Badge>
              <div className="space-y-3">
                <CardTitle className="max-w-xl text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
                  Manage interviewer flows and candidate outcomes from one console.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base">
                  The redesign introduces a persistent left navigation with two core views:
                  interviewer workflows and candidate results.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <WorkspaceMetric label="Interviews" value="Role templates" />
              <WorkspaceMetric label="Candidates" value="Scored sessions" />
              <WorkspaceMetric label="Mode" value="Light CERNO" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unlock workspace</CardTitle>
              <CardDescription>
                The shared passcode protects interviewer setup, candidate records, transcripts, and
                scorecards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleLogin}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">Admin passcode</label>
                  <Input
                    type="password"
                    value={passcode}
                    onChange={(event) => setPasscode(event.target.value)}
                    placeholder="Enter the shared passcode"
                    autoComplete="current-password"
                  />
                </div>

                {authError ? <p className="text-sm text-destructive">{authError}</p> : null}

                <Button type="submit" disabled={authLoading}>
                  {authLoading ? "Checking..." : "Enter workspace"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 lg:block">
        <Card className="flex h-full flex-col">
          <CardHeader className="gap-4 border-b border-border/70">
            <div className="space-y-2">
              <Badge variant="orange" className="w-fit">
                Hiring workspace
              </Badge>
              <CardTitle className="text-2xl font-extrabold tracking-[-0.04em]">
                CERNO screener
              </CardTitle>
              <CardDescription>
                Interviewer tools on one side. Candidate outcomes on the other.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-6 py-6">
            <nav className="grid gap-2">
              <SidebarLink href="#interviews" label="Interviews" description="Interviewer section" />
              <SidebarLink href="#candidates" label="Candidates" description="Interview outcomes" />
            </nav>

            <div className="grid gap-3">
              <SidebarStat label="Templates" value={String(recentRoles.length)} />
              <SidebarStat label="Candidates" value={String(candidateMetrics.total)} />
              <SidebarStat label="Scored" value={String(candidateMetrics.scored)} />
            </div>

            <div className="mt-auto rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Current direction
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Light-first workspace, shadcn components, CERNO indigo-violet accents.
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="orange">Interviewer workspace</Badge>
                <Badge variant="subtle">Authenticated</Badge>
              </div>
              <div className="space-y-3">
                <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
                  Build interviews on the left. Review candidate outcomes on the right.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base">
                  This admin surface is now organized around two core jobs: publishing reusable
                  interviewer flows and tracking which candidates actually completed them.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <WorkspaceMetric label="Published interviews" value={String(recentRoles.length)} />
            <WorkspaceMetric label="Candidate runs" value={String(candidateMetrics.total)} />
            <WorkspaceMetric label="Active now" value={String(candidateMetrics.inProgress)} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]" id="interviews">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Interviews</CardTitle>
                  <CardDescription>
                    Create and publish the interviewer flow for a new role.
                  </CardDescription>
                </div>
                <Badge variant="orange">Interviewer section</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={handleCreate}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Role title" error={errors.roleTitle}>
                    <Input
                      value={form.roleTitle}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, roleTitle: event.target.value }))
                      }
                      placeholder="Senior AI Engineer"
                    />
                  </Field>

                  <Field label="Target seniority" error={errors.targetSeniority}>
                    <select
                      className="flex h-12 w-full rounded-[calc(var(--radius)+0.15rem)] border border-input bg-input/50 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow,transform] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 focus-visible:-translate-y-px"
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
                  </Field>

                  <Field label="Interview length (minutes)" error={errors.durationMinutes}>
                    <Input
                      type="number"
                      min={10}
                      max={90}
                      value={form.durationMinutes}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, durationMinutes: event.target.value }))
                      }
                    />
                  </Field>

                  <Field label="Company name">
                    <Input
                      value={form.companyName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, companyName: event.target.value }))
                      }
                      placeholder="Acme AI"
                    />
                  </Field>
                </div>

                <Field label="Focus areas" error={errors.focusAreas}>
                  <Textarea
                    rows={4}
                    value={form.focusAreas}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, focusAreas: event.target.value }))
                    }
                    placeholder={"LLM systems\nRAG evals\nDebugging\nSystem design"}
                  />
                </Field>

                <Field label="Internal hiring notes">
                  <Textarea
                    rows={5}
                    value={form.adminNotes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, adminNotes: event.target.value }))
                    }
                    placeholder="Optional notes for the screener, such as must-have experience or areas to probe."
                  />
                </Field>

                <Field label="Job description PDF" error={errors.jobDescriptionPdf}>
                  <Input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        jobDescriptionPdf: event.target.files?.[0] ?? null,
                      }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload the company requirement once. Candidates do not upload this file.
                  </p>
                </Field>

                {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating interview..." : "Create interview link"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setForm(defaultForm)}
                    disabled={submitting}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest interview link</CardTitle>
                <CardDescription>
                  The most recent interviewer flow generated from this workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {created ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="orange">{created.status}</Badge>
                      <code>{created.roleId}</code>
                    </div>
                    <div className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-muted/30 p-4 font-mono text-sm text-foreground">
                      {created.candidateApplyUrl}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigator.clipboard.writeText(created.candidateApplyUrl)}
                      >
                        Copy apply URL
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={created.candidateApplyUrl}>Open candidate page</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    Create an interview to generate a reusable candidate application link.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Published interviews</CardTitle>
                <CardDescription>
                  Reusable interviewer templates already available to candidates.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {recentRoles.length > 0 ? (
                  recentRoles.map((role) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-muted/25 p-4"
                      key={role.id}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{role.roleTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {role.companyName ? `${role.companyName} · ` : ""}
                          {role.targetSeniority}
                        </p>
                      </div>
                      <Badge variant="subtle">{role.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    No interview templates stored yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="candidates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Candidates</CardTitle>
                  <CardDescription>
                    Candidates who entered or completed an interview flow.
                  </CardDescription>
                </div>
                <Badge variant="subtle">Interview outcomes</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border border-border/70">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Interview</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="text-right">Review</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">
                                {session.candidateProfile.candidateName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.candidateProfile.githubUrl.replace("https://github.com/", "@")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">
                                {session.roleSnapshot.roleTitle}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.roleSnapshot.targetSeniority}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={session.status === "scored" ? "orange" : "subtle"}>
                              {formatStatus(session.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(session.createdAt)}
                          </TableCell>
                          <TableCell>
                            {typeof session.scorecard?.overallScore === "number" ? (
                              <span className="font-mono text-sm text-foreground">
                                {session.scorecard.overallScore.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Pending</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/admin/sessions/${session.id}`}>Open</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  No candidates have started an interview yet.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function WorkspaceMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{label}</p>
        <p className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function SidebarLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <a
      className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-muted/20 px-4 py-3 transition-colors hover:bg-accent hover:text-accent-foreground"
      href={href}
    >
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </a>
  );
}

function SidebarStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{label}</p>
      <p className="mt-2 text-xl font-bold tracking-[-0.03em] text-foreground">{value}</p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatStatus(status: CandidateSessionRecord["status"]) {
  return status.replace(/_/g, " ");
}
