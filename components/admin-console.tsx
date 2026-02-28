"use client";

import type React from "react";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileArrowUp,
  Files,
  ListChecks,
  Sparkle,
  SquaresFour,
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
import { cn } from "@/lib/utils";
import {
  splitFocusAreas,
  targetSeniorities,
  type CandidateSessionRecord,
  type CandidateSessionStatus,
  type JobDescriptionAutofill,
  type RoleTemplateRecord,
  type TargetSeniority,
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
  error?: string;
  fieldErrors?: Record<string, string>;
}

interface ExtractJobDescriptionResponse extends JobDescriptionAutofill {
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
};

const sampleJobDescription = {
  fileName: "sample-ai-engineer-jd.pdf",
  text: `
Acme AI is hiring a Senior AI Engineer to build and operate production-grade LLM features.

You will work on retrieval-augmented generation systems, prompt and tool orchestration,
evaluation pipelines, observability, and backend services that support AI product features.

We are looking for someone who has shipped AI systems in production, can debug model and
backend failures, and can make practical tradeoffs around quality, latency, and cost.
`.trim(),
  roleTitle: "Senior AI Engineer",
  companyName: "Acme AI",
  targetSeniority: "senior" as TargetSeniority,
  focusAreas: [
    "LLM systems",
    "RAG and retrieval",
    "Evaluation and observability",
    "Production debugging",
  ],
};

type NavView = "interviews" | "candidates";
type CandidatesView = "table" | "kanban";
type OcrStatus = "idle" | "processing" | "success" | "sample" | "error";
type OcrField = "roleTitle" | "companyName" | "targetSeniority" | "focusAreas";
type AutofillSource = "ocr" | "sample";

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
  const [autofillSource, setAutofillSource] = useState<AutofillSource | null>(null);

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
    setAutofillSource(null);
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
    source,
    fileName,
    text,
    roleTitle,
    companyName,
    targetSeniority,
    focusAreas,
    warnings,
  }: {
    source: AutofillSource;
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
    setAutofillSource(source);
    setJobDescriptionText(text);
    setJobDescriptionFileName(fileName);
    setOcrWarnings(warnings ?? []);
    setOcrError("");
    setOcrStatus(source === "ocr" ? "success" : "sample");
  };

  const handleUseSample = () => {
    setCreatedUrl(null);
    setSubmitError("");
    clearFieldError("jobDescriptionPdf");
    setJobDescriptionPdf(null);

    applyAutofill({
      source: "sample",
      fileName: sampleJobDescription.fileName,
      text: sampleJobDescription.text,
      roleTitle: sampleJobDescription.roleTitle,
      companyName: sampleJobDescription.companyName,
      targetSeniority: sampleJobDescription.targetSeniority,
      focusAreas: sampleJobDescription.focusAreas,
      warnings: [
        "Sample fallback loaded. Replace it with a real job description before production use.",
      ],
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
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
        source: "ocr",
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
      setAutofillSource(null);
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
                  Create interview links and review candidate activity.
                </CardDescription>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Active templates" value={String(recentRoles.length)} />
              <MetricCard label="Candidate sessions" value={String(recentSessions.length)} />
              <MetricCard
                label="Scored interviews"
                value={String(recentSessions.filter((session) => session.status === "scored").length)}
              />
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
              <TabsTrigger value="interviews" className="min-w-36">
                <Sparkle className="size-4" weight="duotone" />
                Interviews
              </TabsTrigger>
              <TabsTrigger value="candidates" className="min-w-36">
                <Files className="size-4" weight="duotone" />
                Candidates
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

                  <Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
                    Create interview
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <InterviewLinksTable roles={recentRoles} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="mt-0">
            <Card className="border-border/70 bg-card/88">
              <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <Badge variant="subtle">Candidate pipeline</Badge>
                  <CardTitle>Review live interview activity</CardTitle>
                  <CardDescription>
                    Switch between the table and kanban views without leaving the shared tab system.
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

              <CardContent>
                {candidatesView === "table" ? (
                  <CandidatesTable sessions={recentSessions} />
                ) : (
                  <CandidatesKanban sessions={recentSessions} />
                )}
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
                    {jobDescriptionFileName ? "Replace PDF" : "Upload PDF"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleUseSample}>
                    Use sample
                  </Button>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  PDF only. If OCR fails, use the sample fallback to keep testing the flow.
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
                        : ocrStatus === "sample"
                          ? "Sample loaded"
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

              {ocrStatus === "sample" ? (
                <div className="grid gap-3 rounded-[calc(var(--radius)+0.25rem)] border border-amber-200/80 bg-amber-50/80 p-4">
                  <p className="text-sm font-medium text-amber-700">Sample loaded</p>
                  {ocrWarnings.length > 0 ? (
                    <ul className="grid gap-2 text-sm leading-6 text-amber-700/80">
                      {ocrWarnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  ) : null}
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
              <form className="grid gap-5" onSubmit={handleCreate}>
                <Field
                  label="Role title"
                  error={errors.roleTitle}
                  badge={
                    ocrFields.has("roleTitle")
                      ? autofillSource === "sample"
                        ? "Sample"
                        : "OCR"
                      : undefined
                  }
                >
                  <Input
                    value={form.roleTitle}
                    onChange={(event) => updateFormValue("roleTitle", event.target.value)}
                    placeholder="Filled by OCR or sample"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Target seniority"
                    error={errors.targetSeniority}
                    badge={
                      ocrFields.has("targetSeniority")
                        ? autofillSource === "sample"
                          ? "Sample"
                          : "OCR"
                        : undefined
                    }
                  >
                    <select
                      className="flex h-12 w-full rounded-[calc(var(--radius)+0.15rem)] border border-input bg-input/50 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow,transform] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 focus-visible:-translate-y-px"
                      value={form.targetSeniority}
                      onChange={(event) =>
                        updateFormValue("targetSeniority", event.target.value as TargetSeniority)
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
                      min={10}
                      max={90}
                      value={form.durationMinutes}
                      placeholder="25"
                      onChange={(event) => updateFormValue("durationMinutes", event.target.value)}
                    />
                  </Field>
                </div>

                <Field
                  label="Company name"
                  badge={
                    ocrFields.has("companyName")
                      ? autofillSource === "sample"
                        ? "Sample"
                        : "OCR"
                      : undefined
                  }
                >
                  <Input
                    value={form.companyName}
                    onChange={(event) => updateFormValue("companyName", event.target.value)}
                    placeholder="Filled by OCR or sample"
                  />
                </Field>

                <Field
                  label="Focus areas"
                  error={errors.focusAreas}
                  badge={
                    ocrFields.has("focusAreas")
                      ? autofillSource === "sample"
                        ? "Sample"
                        : "OCR"
                      : undefined
                  }
                >
                  <Textarea
                    value={form.focusAreas}
                    onChange={(event) => updateFormValue("focusAreas", event.target.value)}
                    placeholder={"Filled by OCR or sample\nThen refine manually if needed"}
                    rows={5}
                  />
                </Field>

                <Field label="Admin notes">
                  <Textarea
                    value={form.adminNotes}
                    onChange={(event) => updateFormValue("adminNotes", event.target.value)}
                    placeholder="Optional hiring notes."
                    rows={4}
                  />
                </Field>

                {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

                <DialogFooter>
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
            </div>
          </div>
        </div>
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

const KANBAN_COLUMNS: { status: CandidateSessionStatus; label: string }[] = [
  { status: "profile_submitted", label: "Applied" },
  { status: "agent_ready", label: "Ready" },
  { status: "in_progress", label: "In progress" },
  { status: "completed", label: "Completed" },
  { status: "scored", label: "Scored" },
  { status: "failed", label: "Failed" },
];

function formatStatus(status: CandidateSessionStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function StatusBadge({ status }: { status: CandidateSessionStatus }) {
  const styles: Record<CandidateSessionStatus, string> = {
    profile_submitted: "border-amber-200/80 bg-amber-50 text-amber-700",
    agent_ready: "border-sky-200/80 bg-sky-50 text-sky-700",
    in_progress: "border-primary/20 bg-primary/10 text-primary",
    completed: "border-border bg-muted/70 text-muted-foreground",
    scored: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    failed: "border-destructive/20 bg-destructive/8 text-destructive",
  };

  return <Badge className={styles[status]}>{formatStatus(status)}</Badge>;
}

function CandidatesTable({ sessions }: { sessions: CandidateSessionRecord[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No candidates yet.</p>;
  }

  return (
    <div className="overflow-auto rounded-[calc(var(--radius)+0.2rem)] border border-border/70 bg-background/70">
      <Table>
        <TableHeader>
          <TableRow className="border-border/80">
            <TableHead className="font-semibold text-foreground">Candidate</TableHead>
            <TableHead className="font-semibold text-foreground">Interview</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Score</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Review</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id} className="border-border/70">
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
                {typeof session.scorecard?.overallScore === "number" ? (
                  <span className="font-mono text-sm text-foreground">
                    {session.scorecard.overallScore.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/sessions/${session.id}`}>Open</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CandidatesKanban({ sessions }: { sessions: CandidateSessionRecord[] }) {
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
                className="rounded-[calc(var(--radius)+0.1rem)] border border-border/70 bg-card/90 p-4 shadow-[0_18px_40px_rgba(99,102,241,0.08)]"
              >
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

                <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                  <Link href={`/admin/sessions/${session.id}`}>Open</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function InterviewLinksTable({ roles }: { roles: RoleTemplateRecord[] }) {
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
                  {new Date(role.createdAt).toLocaleString()}
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
                  <Button asChild size="sm">
                    <Link href={role.candidateApplyUrl} target="_blank" rel="noopener noreferrer">
                      Open
                    </Link>
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
