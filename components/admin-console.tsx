"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileArrowUp,
  Files,
  ListChecks,
  Sparkle,
  SquaresFour,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionBar } from "@/components/bulk-action-bar";
import { cn } from "@/lib/utils";
import {
  splitFocusAreas,
  targetSeniorities,
  type CandidateSessionRecord,
  type CandidateSessionStatus,
  type PlatformCounters,
  type RoleTemplateRecord,
  type TargetSeniority,
} from "@/lib/interviews";

interface AdminConsoleProps {
  isAuthenticated: boolean;
  recentRoles: RoleTemplateRecord[];
  recentSessions: CandidateSessionRecord[];
  counters: PlatformCounters | null;
}

interface CreateRoleResponse {
  roleId: string;
  candidateApplyUrl: string;
  status: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

interface ExtractJobDescriptionResponse {
  jobDescriptionFileName: string;
  jobDescriptionText: string;
  roleTitle?: string;
  companyName?: string;
  targetSeniority?: TargetSeniority;
  focusAreas: string[];
  warnings: string[];
  error?: string;
  fieldErrors?: Record<string, string>;
}

const defaultForm = {
  roleTitle: "",
  targetSeniority: "" as TargetSeniority | "",
  durationMinutes: "",
  focusAreas: "",
  companyName: "",
  adminNotes: "",
  rejectThreshold: "40",
  advanceThreshold: "90",
};

type NavView = "interviews" | "candidates";
type CandidatesView = "table" | "kanban";
type CreateMode = "upload" | "blank" | null;
type OcrStatus = "idle" | "processing" | "success" | "error";
type OcrField = "roleTitle" | "companyName" | "targetSeniority" | "focusAreas";
const ocrManagedFields: OcrField[] = [
  "roleTitle",
  "companyName",
  "targetSeniority",
  "focusAreas",
];

export function AdminConsole({
  isAuthenticated,
  recentRoles,
  recentSessions,
  counters,
}: AdminConsoleProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const extractionRequestIdRef = useRef(0);
  const [isAuthed, setIsAuthed] = useState(isAuthenticated);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [activeView, setActiveView] = useState<NavView>("interviews");
  const [candidatesView, setCandidatesView] = useState<CandidatesView>("table");
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [jobDescriptionPdf, setJobDescriptionPdf] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [jobDescriptionFileName, setJobDescriptionFileName] = useState("");
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("idle");
  const [ocrError, setOcrError] = useState("");
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);
  const [ocrFields, setOcrFields] = useState<Set<OcrField>>(new Set());
  const [visibleRoles, setVisibleRoles] = useState(recentRoles);
  const [visibleSessions, setVisibleSessions] = useState(recentSessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CandidateSessionStatus | "all">("all");
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [lastVisited] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem("admin_last_visited");
    return stored ? Number(stored) : 0;
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("admin_last_visited", String(Date.now()));
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const newSessionsCount = visibleSessions.filter((s) => {
    const ts = s.sessionEndedAt ?? s.sessionStartedAt ?? s.createdAt;
    return ts && Date.parse(ts) > lastVisited;
  }).length;

  const newScoredCount = visibleSessions.filter((s) => {
    const isScoredStatus = ["scored", "under_review", "next_round", "rejected"].includes(s.status);
    if (!isScoredStatus || !s.scorecard) return false;
    const ts = s.sessionEndedAt ?? s.createdAt;
    return ts && Date.parse(ts) > lastVisited;
  }).length;

  const handleDeleteRole = async (roleId: string) => {
    setVisibleRoles((current) => current.filter((r) => r.id !== roleId));
    await fetch(`/api/admin/roles/${roleId}`, { method: "DELETE" });
  };

  const handleDeleteSession = async (sessionId: string) => {
    setVisibleSessions((current) => current.filter((s) => s.id !== sessionId));
    await fetch(`/api/admin/sessions/${sessionId}`, { method: "DELETE" });
  };

  const toggleSessionSelection = (id: string) => {
    setSelectedSessionIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSessions = (sessionIds: string[]) => {
    setSelectedSessionIds((current) => {
      const allSelected = sessionIds.every((id) => current.has(id));
      if (allSelected) return new Set();
      return new Set(sessionIds);
    });
  };

  const handleBulkStatusChange = async (targetStatus: CandidateSessionStatus) => {
    setBulkProcessing(true);
    try {
      await fetch("/api/admin/sessions/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionIds: [...selectedSessionIds],
          targetStatus,
        }),
      });
      setVisibleSessions((current) =>
        current.map((s) =>
          selectedSessionIds.has(s.id) ? { ...s, status: targetStatus } : s,
        ),
      );
      setSelectedSessionIds(new Set());
    } finally {
      setBulkProcessing(false);
    }
  };

  const filteredSessions = visibleSessions.filter((session) => {
    const matchesSearch =
      searchQuery === "" ||
      session.candidateProfile.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.roleSnapshot.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.candidateProfile.githubUrl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearFieldError = (field: string) => {
    setErrors((current) => {
      if (!(field in current)) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const clearOcrState = () => {
    setJobDescriptionPdf(null);
    setJobDescriptionText("");
    setJobDescriptionFileName("");
    setOcrStatus("idle");
    setOcrError("");
    setOcrWarnings([]);
    setOcrFields(new Set());
    extractionRequestIdRef.current += 1;

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const resetRoleSetup = () => {
    setForm(defaultForm);
    setErrors({});
    setSubmitError("");
    setCreatedUrl(null);
    setCreateMode(null);
    clearOcrState();
  };

  const markFieldAsManual = (field: OcrField) => {
    setOcrFields((current) => {
      if (!current.has(field)) {
        return current;
      }

      const next = new Set(current);
      next.delete(field);
      return next;
    });
  };

  const updateFormValue = <K extends keyof typeof defaultForm>(
    field: K,
    value: (typeof defaultForm)[K],
  ) => {
    setCreatedUrl(null);
    clearFieldError(field);

    if (ocrManagedFields.includes(field as OcrField)) {
      markFieldAsManual(field as OcrField);
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

  const openJobDescriptionPicker = () => {
    inputRef.current?.click();
  };

  const applyAutofill = ({
    fileName,
    text,
    roleTitle,
    companyName,
    targetSeniority,
    focusAreas,
    warnings,
  }: {
    fileName: string;
    text: string;
    roleTitle?: string;
    companyName?: string;
    targetSeniority?: TargetSeniority;
    focusAreas: string[];
    warnings?: string[];
  }) => {
    const previousOcrFields = new Set(ocrFields);
    const nextOcrFields = new Set<OcrField>();

    setForm((current) => {
      const next = { ...current };

      const applyValue = (
        field: OcrField,
        incomingValue: string | TargetSeniority | undefined,
        fallbackValue: string,
      ) => {
        const normalizedValue =
          typeof incomingValue === "string" ? incomingValue.trim() : incomingValue;

        if (normalizedValue) {
          next[field] = normalizedValue as never;
          nextOcrFields.add(field);
          return;
        }

        if (previousOcrFields.has(field)) {
          next[field] = fallbackValue as never;
        }
      };

      applyValue("roleTitle", roleTitle, defaultForm.roleTitle);
      applyValue("companyName", companyName, defaultForm.companyName);
      applyValue("targetSeniority", targetSeniority, defaultForm.targetSeniority);

      if (focusAreas.length > 0) {
        next.focusAreas = focusAreas.join("\n");
        nextOcrFields.add("focusAreas");
      } else if (previousOcrFields.has("focusAreas")) {
        next.focusAreas = defaultForm.focusAreas;
      }

      return next;
    });

    setOcrFields(nextOcrFields);
    setJobDescriptionText(text);
    setJobDescriptionFileName(fileName);
    setOcrWarnings(warnings ?? []);
    setOcrError("");
    setOcrStatus("success");
  };

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
      router.refresh();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleJobDescriptionFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextFile = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!nextFile) {
      return;
    }

    setCreatedUrl(null);
    setSubmitError("");
    clearFieldError("jobDescriptionPdf");
    setCreateMode("upload");
    setJobDescriptionPdf(nextFile);
    setJobDescriptionFileName(nextFile.name);
    setJobDescriptionText("");
    setOcrWarnings([]);
    setOcrError("");
    setOcrStatus("processing");

    const requestId = extractionRequestIdRef.current + 1;
    extractionRequestIdRef.current = requestId;

    try {
      const payload = new FormData();
      payload.set("jobDescriptionPdf", nextFile);

      const response = await fetch("/api/admin/roles/extract", {
        method: "POST",
        body: payload,
      });

      const body = (await response.json()) as ExtractJobDescriptionResponse;

      if (requestId !== extractionRequestIdRef.current) {
        return;
      }

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to extract the job description.");
      }

      applyAutofill({
        fileName: body.jobDescriptionFileName,
        text: body.jobDescriptionText,
        roleTitle: body.roleTitle,
        companyName: body.companyName,
        targetSeniority: body.targetSeniority,
        focusAreas: body.focusAreas,
        warnings: body.warnings,
      });
    } catch (error) {
      if (requestId !== extractionRequestIdRef.current) {
        return;
      }

      setJobDescriptionText("");
      setOcrFields(new Set());
      setOcrWarnings([]);
      setOcrStatus("error");
      setOcrError(
        error instanceof Error ? error.message : "Unable to extract the job description.",
      );
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
      payload.set("rejectThreshold", form.rejectThreshold);
      payload.set("advanceThreshold", form.advanceThreshold);

      if (jobDescriptionPdf) {
        payload.set("jobDescriptionPdf", jobDescriptionPdf);
      }

      if (jobDescriptionText) {
        payload.set("jobDescriptionText", jobDescriptionText);
      }

      if (jobDescriptionFileName) {
        payload.set("jobDescriptionFileName", jobDescriptionFileName);
      }

      const response = await fetch("/api/admin/roles", {
        method: "POST",
        body: payload,
      });

      const body = (await response.json()) as CreateRoleResponse;

      if (!response.ok) {
        setErrors(body.fieldErrors ?? {});
        throw new Error(body.error ?? "Unable to create the role template.");
      }

      setCreatedUrl(body.candidateApplyUrl);
      setForm(defaultForm);
      clearOcrState();
      setActiveView("interviews");
      router.refresh();
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
      <main className="flex min-h-screen w-full items-center justify-center bg-background px-4">
        <form className="grid w-full max-w-sm gap-4 text-foreground" onSubmit={handleLogin}>
          <h1 className="text-lg font-semibold">Admin</h1>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Passcode</label>
            <Input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              autoComplete="current-password"
            />
          </div>
          {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
          <Button type="submit" disabled={authLoading}>
            {authLoading ? "Checking..." : "Sign in"}
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            resetRoleSetup();
          }
          setIsCreateDialogOpen(open);
        }}
      >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-border/70 bg-card/90">
          <CardHeader className="relative gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="relative space-y-2">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Interviews
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm">
                  Create interview links and review stored candidate interviews.
                </CardDescription>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Active templates" value={String(recentRoles.length)} />
              <MetricCard
                label="Active candidates"
                value={String(recentSessions.filter((s) => !["rejected", "completed", "failed"].includes(s.status)).length)}
              />
              <MetricCard
                label="Scored interviews"
                value={String(recentSessions.filter((session) => ["scored", "rejected", "under_review", "next_round"].includes(session.status)).length)}
              />
              <MetricCard label="Unique candidates" value={String(counters?.uniqueGithubUrls.length ?? 0)} />
              <MetricCard label="Interview hours" value={formatInterviewHours(counters?.totalInterviewSeconds ?? 0)} />
              <MetricCard label="Total interviews" value={String(counters?.interviewsConducted ?? 0)} />
            </div>
          </CardHeader>
        </Card>

        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as NavView)}
          className="gap-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="interviews" className="min-w-36 relative">
                <Sparkle className="size-4" weight="duotone" />
                Interviews
                {newSessionsCount > 0 && (
                  <span className="notification-badge">{newSessionsCount}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="candidates" className="min-w-36 relative">
                <Files className="size-4" weight="duotone" />
                Candidates
                {newScoredCount > 0 && (
                  <span className="notification-badge">{newScoredCount}</span>
                )}
              </TabsTrigger>
            </TabsList>
            <p className="text-sm text-muted-foreground">Create links and review candidates.</p>
          </div>

          <TabsContent value="interviews" className="mt-0">
            <Card className="border-border/70 bg-card/88">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge variant="subtle">Published links</Badge>
                    <CardTitle>Interview links</CardTitle>
                    <CardDescription>
                      Reopen or copy previously generated candidate interview links.
                    </CardDescription>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      resetRoleSetup();
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    Create interview
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <InterviewLinksTable roles={visibleRoles} onDelete={handleDeleteRole} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="mt-0">
            <Card className="border-border/70 bg-card/88">
              <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <Badge variant="subtle">Candidate archive</Badge>
                  <CardTitle>Review interviews, transcripts, and scores</CardTitle>
                  <CardDescription>
                    Each completed interview stays available here for admin review.
                  </CardDescription>
                </div>

                <Tabs
                  value={candidatesView}
                  onValueChange={(value) => setCandidatesView(value as CandidatesView)}
                  className="gap-3"
                >
                  <TabsList className="bg-background/80">
                    <TabsTrigger value="table">
                      <ListChecks className="size-4" weight="duotone" />
                      Table
                    </TabsTrigger>
                    <TabsTrigger value="kanban">
                      <SquaresFour className="size-4" weight="duotone" />
                      Kanban
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
                <Input
                  type="search"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <select
                  className="flex h-10 rounded-[calc(var(--radius)+0.15rem)] border border-input bg-input/50 px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as CandidateSessionStatus | "all")}
                >
                  <option value="all">All statuses</option>
                  {KANBAN_COLUMNS.map(({ status, label }) => (
                    <option key={status} value={status}>{label}</option>
                  ))}
                </select>
              </div>

              <CardContent>
                {candidatesView === "table" ? (
                  <CandidatesTable
                    sessions={filteredSessions}
                    onDelete={handleDeleteSession}
                    selectedIds={selectedSessionIds}
                    onToggle={toggleSessionSelection}
                    onToggleAll={toggleAllSessions}
                  />
                ) : (
                  <CandidatesKanban
                    sessions={filteredSessions}
                    onDelete={handleDeleteSession}
                    selectedIds={selectedSessionIds}
                    onToggle={toggleSessionSelection}
                  />
                )}
                <BulkActionBar
                  selectedCount={selectedSessionIds.size}
                  onReject={() => handleBulkStatusChange("rejected")}
                  onAdvance={() => handleBulkStatusChange("next_round")}
                  onClearSelection={() => setSelectedSessionIds(new Set())}
                  processing={bulkProcessing}
                />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
      <DialogContent className="p-0">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleJobDescriptionFileChange}
        />

        {createMode === null ? (
          <div className="grid gap-6 p-6">
            <DialogHeader>
              <DialogTitle>Create interview</DialogTitle>
              <DialogDescription>Choose how you want to start.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                className="rounded-[calc(var(--radius)+0.35rem)] border border-border/70 bg-background p-5 text-left transition-colors hover:bg-muted/30"
                onClick={() => {
                  resetRoleSetup();
                  requestAnimationFrame(() => {
                    openJobDescriptionPicker();
                  });
                }}
              >
                <p className="text-sm font-medium text-foreground">Upload PDF</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Extract the role fields from a job description.
                </p>
              </button>

              <button
                type="button"
                className="rounded-[calc(var(--radius)+0.35rem)] border border-border/70 bg-background p-5 text-left transition-colors hover:bg-muted/30"
                onClick={() => {
                  resetRoleSetup();
                  setJobDescriptionFileName("manual-job-description.txt");
                  setCreateMode("blank");
                }}
              >
                <p className="text-sm font-medium text-foreground">Start from blank</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Fill the role manually and paste the job description yourself.
                </p>
              </button>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        ) : createMode === "upload" ? (
          <div className="grid max-h-[88vh] gap-0 overflow-y-auto lg:grid-cols-[0.88fr_1.12fr]">
            <div className="border-b border-border/70 bg-muted/20 p-6 lg:border-b-0 lg:border-r">
              <DialogHeader>
                <DialogTitle>Create interview</DialogTitle>
                <DialogDescription>
                  Upload a job description PDF, review the extracted fields, then publish the link.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-5">
                <div className="rounded-[calc(var(--radius)+0.4rem)] border border-dashed border-border bg-background/70 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" onClick={openJobDescriptionPicker}>
                      <FileArrowUp className="size-4" weight="duotone" />
                      {jobDescriptionFileName ? "Replace PDF" : "Choose a different PDF"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        resetRoleSetup();
                        setJobDescriptionFileName("manual-job-description.txt");
                        setCreateMode("blank");
                      }}
                    >
                      Start from blank
                    </Button>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    PDF only. OCR fills the role fields automatically.
                  </p>

                  {errors.jobDescriptionPdf ? (
                    <p className="mt-3 text-sm text-destructive">{errors.jobDescriptionPdf}</p>
                  ) : null}
                </div>

                <div className="grid gap-3 rounded-[calc(var(--radius)+0.25rem)] border border-border/70 bg-background/70 p-4">
                  <StatusRow
                    label="Status"
                    value={
                      ocrStatus === "idle"
                        ? "Waiting for a PDF"
                        : ocrStatus === "processing"
                          ? "Processing with OCR..."
                          : ocrStatus === "success"
                            ? "Ready"
                            : "Failed"
                    }
                  />
                  <StatusRow
                    label="File"
                    value={jobDescriptionFileName || "No PDF selected"}
                    mono={Boolean(jobDescriptionFileName)}
                  />
                  <StatusRow
                    label="Autofill"
                    value={
                      ocrFields.size > 0
                        ? `${ocrFields.size} field${ocrFields.size > 1 ? "s" : ""}`
                        : "No fields yet"
                    }
                  />
                </div>

                {ocrStatus === "processing" ? (
                  <div className="rounded-[calc(var(--radius)+0.25rem)] border border-primary/20 bg-primary/8 p-4">
                    <p className="text-sm font-medium text-primary">Processing</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The PDF is being parsed and mapped into the role fields.
                    </p>
                  </div>
                ) : null}

                {ocrStatus === "success" ? (
                  <div className="grid gap-3 rounded-[calc(var(--radius)+0.25rem)] border border-primary/20 bg-primary/8 p-4">
                    <p className="text-sm font-medium text-primary">OCR complete</p>
                    {ocrWarnings.length > 0 ? (
                      <div className="grid gap-2 rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-background/80 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <WarningCircle className="size-4 text-primary" weight="duotone" />
                          Warnings
                        </div>
                        <ul className="grid gap-2 text-sm leading-6 text-muted-foreground">
                          {ocrWarnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {ocrStatus === "error" ? (
                  <div className="rounded-[calc(var(--radius)+0.25rem)] border border-destructive/20 bg-destructive/8 p-4">
                    <p className="text-sm font-medium text-destructive">OCR failed</p>
                    <p className="mt-1 text-sm text-muted-foreground">{ocrError}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="p-6">
              <DialogHeader>
                <DialogTitle>Role details</DialogTitle>
                <DialogDescription>
                  Review the extracted fields and create the candidate link.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-6">
                <RoleForm
                  form={form}
                  errors={errors}
                  ocrFields={ocrFields}
                  submitting={submitting}
                  submitError={submitError}
                  createdUrl={createdUrl}
                  onSubmit={handleCreate}
                  onBack={() => {
                    resetRoleSetup();
                    setCreateMode(null);
                  }}
                  onUpdateFormValue={updateFormValue}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Create interview</DialogTitle>
              <DialogDescription>
                Fill the role manually and paste the job description.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-6">
              <RoleForm
                form={form}
                errors={errors}
                ocrFields={ocrFields}
                submitting={submitting}
                submitError={submitError}
                createdUrl={createdUrl}
                onSubmit={handleCreate}
                onBack={() => {
                  resetRoleSetup();
                  setCreateMode(null);
                }}
                onUpdateFormValue={updateFormValue}
                jobDescriptionText={jobDescriptionText}
                onJobDescriptionTextChange={(value) => {
                  setJobDescriptionText(value);
                  setJobDescriptionFileName("manual-job-description.txt");
                  clearFieldError("jobDescriptionText");
                }}
              />
            </div>
          </div>
        )}
      </DialogContent>
      </Dialog>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[calc(var(--radius)+0.2rem)] border border-border/70 bg-background/70 px-4 py-3 backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-medium text-foreground">{value}</p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm text-foreground", mono ? "font-mono" : "")}>{value}</span>
    </div>
  );
}

function Field({
  label,
  error,
  badge,
  children,
}: {
  label: string;
  error?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {badge ? (
          <Badge variant="subtle" className="px-2 py-0.5 tracking-[0.12em]">
            {badge}
          </Badge>
        ) : null}
      </div>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function RoleForm({
  form,
  errors,
  ocrFields,
  submitting,
  submitError,
  createdUrl,
  onSubmit,
  onBack,
  onUpdateFormValue,
  jobDescriptionText,
  onJobDescriptionTextChange,
}: {
  form: typeof defaultForm;
  errors: Record<string, string>;
  ocrFields: Set<OcrField>;
  submitting: boolean;
  submitError: string;
  createdUrl: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  onBack: () => void;
  onUpdateFormValue: <K extends keyof typeof defaultForm>(
    field: K,
    value: (typeof defaultForm)[K],
  ) => void;
  jobDescriptionText?: string;
  onJobDescriptionTextChange?: (value: string) => void;
}) {
  return (
    <>
      <form className="grid gap-5" onSubmit={onSubmit}>
        {onJobDescriptionTextChange ? (
          <Field label="Job description" error={errors.jobDescriptionText}>
            <Textarea
              value={jobDescriptionText ?? ""}
              onChange={(event) => onJobDescriptionTextChange(event.target.value)}
              placeholder="Paste the job description here."
              rows={8}
            />
          </Field>
        ) : null}

        <Field label="Role title" error={errors.roleTitle} badge={ocrFields.has("roleTitle") ? "OCR" : undefined}>
          <Input
            value={form.roleTitle}
            onChange={(event) => onUpdateFormValue("roleTitle", event.target.value)}
            placeholder={onJobDescriptionTextChange ? "Role title" : "Filled by OCR"}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Target seniority"
            error={errors.targetSeniority}
            badge={ocrFields.has("targetSeniority") ? "OCR" : undefined}
          >
            <select
              className="flex h-12 w-full rounded-[calc(var(--radius)+0.15rem)] border border-input bg-input/50 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow,transform] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 focus-visible:-translate-y-px"
              value={form.targetSeniority}
              onChange={(event) =>
                onUpdateFormValue("targetSeniority", event.target.value as TargetSeniority)
              }
            >
              <option value="">Select seniority</option>
              {targetSeniorities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Duration (min)" error={errors.durationMinutes}>
            <Input
              type="number"
              min={1}
              max={90}
              value={form.durationMinutes}
              placeholder="25"
              onChange={(event) => onUpdateFormValue("durationMinutes", event.target.value)}
            />
          </Field>
        </div>

        <Field label="Company name" badge={ocrFields.has("companyName") ? "OCR" : undefined}>
          <Input
            value={form.companyName}
            onChange={(event) => onUpdateFormValue("companyName", event.target.value)}
            placeholder="Company name"
          />
        </Field>

        <Field label="Focus areas" error={errors.focusAreas} badge={ocrFields.has("focusAreas") ? "OCR" : undefined}>
          <Textarea
            value={form.focusAreas}
            onChange={(event) => onUpdateFormValue("focusAreas", event.target.value)}
            placeholder={onJobDescriptionTextChange ? "Add focus areas" : "Filled by OCR\nThen refine manually if needed"}
            rows={5}
          />
        </Field>

        <Field label="Admin notes">
          <Textarea
            value={form.adminNotes}
            onChange={(event) => onUpdateFormValue("adminNotes", event.target.value)}
            placeholder="Optional hiring notes."
            rows={4}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Reject below (score)" error={errors.rejectThreshold}>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.rejectThreshold}
              placeholder="40"
              onChange={(event) => onUpdateFormValue("rejectThreshold", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Candidates scoring below this are automatically rejected.
            </p>
          </Field>

          <Field label="Auto-advance above (score)" error={errors.advanceThreshold}>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.advanceThreshold}
              placeholder="90"
              onChange={(event) => onUpdateFormValue("advanceThreshold", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Candidates scoring above this advance directly to the next round.
            </p>
          </Field>
        </div>

        <p className="text-xs text-muted-foreground">
          Candidates scoring between the two thresholds land in &ldquo;Under review&rdquo; for manual decision.
        </p>

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

        <DialogFooter>
          <Button type="button" variant="secondary" disabled={submitting} onClick={onBack}>
            Back
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create interview"}
          </Button>
        </DialogFooter>
      </form>

      {createdUrl ? (
        <div className="rounded-[calc(var(--radius)+0.35rem)] border border-primary/20 bg-primary/8 p-4">
          <p className="text-sm font-medium text-primary">Candidate interview link</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Input readOnly value={createdUrl} className="font-mono text-xs sm:text-sm" />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(createdUrl)}
              >
                Copy
              </Button>
              <Button asChild>
                <Link href={createdUrl} target="_blank" rel="noopener noreferrer">
                  Open
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const KANBAN_COLUMNS: { status: CandidateSessionStatus; label: string }[] = [
  { status: "profile_submitted", label: "Applied" },
  { status: "agent_ready", label: "Ready" },
  { status: "in_progress", label: "In progress" },
  { status: "completed", label: "Completed" },
  { status: "under_review", label: "Under review" },
  { status: "next_round", label: "Next round" },
  { status: "rejected", label: "Rejected" },
  { status: "failed", label: "Failed" },
];

function formatStatus(status: CandidateSessionStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatInterviewHours(totalSeconds: number): string {
  if (totalSeconds === 0) return "0";
  const hours = totalSeconds / 3600;
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

function formatTimestamp(value: string) {
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

function StatusBadge({ status }: { status: CandidateSessionStatus }) {
  const styles: Record<CandidateSessionStatus, string> = {
    profile_submitted: "border-amber-200/80 bg-amber-50 text-amber-700",
    agent_ready: "border-sky-200/80 bg-sky-50 text-sky-700",
    in_progress: "border-primary/20 bg-primary/10 text-primary",
    completed: "border-border bg-muted/70 text-muted-foreground",
    scored: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    under_review: "border-amber-200/80 bg-amber-50 text-amber-700",
    next_round: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    rejected: "border-destructive/20 bg-destructive/8 text-destructive",
    failed: "border-destructive/20 bg-destructive/8 text-destructive",
  };

  return <Badge className={styles[status]}>{formatStatus(status)}</Badge>;
}

function CandidatesTable({
  sessions,
  onDelete,
  selectedIds,
  onToggle,
  onToggleAll,
}: {
  sessions: CandidateSessionRecord[];
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
}) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No candidates yet.</p>;
  }

  const allIds = sessions.map((s) => s.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

  return (
    <div className="overflow-auto rounded-[calc(var(--radius)+0.2rem)] border border-border/70 bg-background/70">
      <Table>
        <TableHeader>
          <TableRow className="border-border/80">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => onToggleAll(allIds)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="font-semibold text-foreground">Candidate</TableHead>
            <TableHead className="font-semibold text-foreground">Interview</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Last activity</TableHead>
            <TableHead className="font-semibold text-foreground">Transcript</TableHead>
            <TableHead className="font-semibold text-foreground">Score</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow
              key={session.id}
              className={cn(
                "border-border/70",
                session.status === "next_round" && "bg-emerald-50/50 border-l-2 border-l-emerald-400",
                selectedIds.has(session.id) && "bg-primary/5",
              )}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(session.id)}
                  onCheckedChange={() => onToggle(session.id)}
                  aria-label={`Select ${session.candidateProfile.candidateName}`}
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">
                    {session.candidateProfile.candidateName}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {session.candidateProfile.githubUrl.replace("https://github.com/", "@")}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium text-foreground">{session.roleSnapshot.roleTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {session.roleSnapshot.targetSeniority}
                </p>
              </TableCell>
              <TableCell>
                <StatusBadge status={session.status} />
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-foreground">
                  {formatTimestamp(
                    session.sessionEndedAt ?? session.sessionStartedAt ?? session.createdAt,
                  )}
                </span>
              </TableCell>
              <TableCell>
                {session.transcript && session.transcript.length > 0 ? (
                  <span className="font-mono text-sm text-foreground">
                    {session.transcript.length} lines
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Pending</span>
                )}
              </TableCell>
              <TableCell>
                {typeof session.scorecard?.overallScore === "number" ? (
                  <div>
                    <span className="font-mono text-sm text-foreground">
                      {session.scorecard.overallScore.toFixed(1)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {session.scorecard.overallRecommendation.replace(/_/g, " ")}
                    </p>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/sessions/${session.id}`}>Review</Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(session.id)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CandidatesKanban({
  sessions,
  onDelete,
  selectedIds,
  onToggle,
}: {
  sessions: CandidateSessionRecord[];
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const byStatus = KANBAN_COLUMNS.reduce(
    (acc, { status }) => {
      acc[status] = sessions.filter((session) => session.status === status);
      return acc;
    },
    {} as Record<CandidateSessionStatus, CandidateSessionRecord[]>,
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {KANBAN_COLUMNS.map(({ status, label }) => (
        <div
          key={status}
          className="min-w-[280px] shrink-0 rounded-[calc(var(--radius)+0.25rem)] border border-border/70 bg-background/70"
        >
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <span className="rounded-full border border-border bg-muted/70 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {byStatus[status]?.length ?? 0}
            </span>
          </div>

          <div className="flex flex-col gap-3 p-3">
            {(byStatus[status] ?? []).map((session) => (
              <div
                key={session.id}
                className={cn(
                  "relative rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-card/90 p-4 shadow-[0_18px_40px_rgba(99,102,241,0.08)]",
                  session.status === "next_round" && "border-emerald-300 bg-emerald-50/40",
                  selectedIds.has(session.id) && "ring-2 ring-primary/30",
                )}
              >
                <div className="absolute top-3 right-3">
                  <Checkbox
                    checked={selectedIds.has(session.id)}
                    onCheckedChange={() => onToggle(session.id)}
                    aria-label={`Select ${session.candidateProfile.candidateName}`}
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {session.candidateProfile.candidateName}
                  </p>
                  <p className="text-sm text-muted-foreground">{session.roleSnapshot.roleTitle}</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusBadge status={session.status} />
                  {typeof session.scorecard?.overallScore === "number" ? (
                    <span className="font-mono text-sm text-foreground">
                      {session.scorecard.overallScore.toFixed(1)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                  <p className="font-mono">
                    {formatTimestamp(
                      session.sessionEndedAt ?? session.sessionStartedAt ?? session.createdAt,
                    )}
                  </p>
                  <p>
                    {session.transcript && session.transcript.length > 0
                      ? `${session.transcript.length} transcript lines saved`
                      : "Transcript pending"}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <Link href={`/admin/sessions/${session.id}`}>Review</Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(session.id)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function InterviewLinksTable({ roles, onDelete }: { roles: RoleTemplateRecord[]; onDelete: (id: string) => void }) {
  if (roles.length === 0) {
    return <p className="text-sm text-muted-foreground">No interview links created yet.</p>;
  }

  return (
    <div className="overflow-auto rounded-[calc(var(--radius)+0.2rem)] border border-border/70 bg-background/70">
      <Table>
        <TableHeader>
          <TableRow className="border-border/80">
            <TableHead className="font-semibold text-foreground">Interview</TableHead>
            <TableHead className="font-semibold text-foreground">Company</TableHead>
            <TableHead className="font-semibold text-foreground">Created</TableHead>
            <TableHead className="font-semibold text-foreground">Link</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id} className="border-border/70">
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{role.roleTitle}</p>
                  <p className="text-xs text-muted-foreground">{role.targetSeniority}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-foreground">{role.companyName || "-"}</span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-foreground">
                  {formatTimestamp(role.createdAt)}
                </span>
              </TableCell>
              <TableCell className="max-w-[360px]">
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {role.candidateApplyUrl}
                </p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(role.candidateApplyUrl)}
                  >
                    Copy
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/interviews/${role.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={role.candidateApplyUrl} target="_blank" rel="noopener noreferrer">
                      Open
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(role.id)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
