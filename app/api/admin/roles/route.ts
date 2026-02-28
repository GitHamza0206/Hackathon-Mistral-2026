import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAppBaseUrl } from "@/lib/env";
import {
  createRoleId,
  splitFocusAreas,
  validateRoleTemplateInput,
  type RoleTemplateRecord,
} from "@/lib/interviews";
import { hasReadablePdfText, parseUploadedPdf } from "@/lib/pdf";
import { saveRoleTemplate } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const jobDescriptionPdf = formData.get("jobDescriptionPdf");
  const submittedJobDescriptionText = String(formData.get("jobDescriptionText") ?? "").trim();
  const submittedJobDescriptionFileName = String(formData.get("jobDescriptionFileName") ?? "").trim();
  const payload = validateRoleTemplateInput({
    roleTitle: formData.get("roleTitle"),
    targetSeniority: formData.get("targetSeniority"),
    durationMinutes: formData.get("durationMinutes"),
    focusAreas: splitFocusAreas(String(formData.get("focusAreas") ?? "")),
    companyName: formData.get("companyName"),
    adminNotes: formData.get("adminNotes"),
  });

  if (
    !(jobDescriptionPdf instanceof File) &&
    !(hasReadablePdfText(submittedJobDescriptionText) && submittedJobDescriptionFileName)
  ) {
    return NextResponse.json(
      {
        error: "Job description PDF is required.",
        fieldErrors: { jobDescriptionPdf: "Upload the company job description as a PDF." },
      },
      { status: 400 },
    );
  }

  if (!payload.data) {
    return NextResponse.json(
      {
        error: "Invalid role configuration.",
        fieldErrors: payload.errors,
      },
      { status: 400 },
    );
  }

  try {
    const parsedPdf =
      hasReadablePdfText(submittedJobDescriptionText) && submittedJobDescriptionFileName
        ? {
            fileName: submittedJobDescriptionFileName,
            text: submittedJobDescriptionText,
          }
        : jobDescriptionPdf instanceof File
          ? await parseUploadedPdf(jobDescriptionPdf, "Job description PDF")
          : null;

    if (!parsedPdf) {
      return NextResponse.json(
        {
          error: "Job description PDF is required.",
          fieldErrors: { jobDescriptionPdf: "Upload the company job description as a PDF." },
        },
        { status: 400 },
      );
    }

    const roleId = createRoleId();
    const candidateApplyUrl = `${getAppBaseUrl(request.nextUrl.origin)}/apply/${roleId}`;
    const record: RoleTemplateRecord = {
      ...payload.data,
      id: roleId,
      createdAt: new Date().toISOString(),
      status: "active",
      jobDescriptionFileName: parsedPdf.fileName,
      jobDescriptionText: parsedPdf.text,
      candidateApplyUrl,
    };

    await saveRoleTemplate(record);

    return NextResponse.json({
      roleId,
      candidateApplyUrl,
      status: record.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the role template.",
      },
      { status: 500 },
    );
  }
}
