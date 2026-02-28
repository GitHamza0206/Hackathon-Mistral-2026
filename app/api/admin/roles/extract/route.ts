import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  extractJobDescriptionAutofill,
  toJobDescriptionAutofill,
} from "@/lib/job-description";
import { parseUploadedPdf } from "@/lib/pdf";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const jobDescriptionPdf = formData.get("jobDescriptionPdf");

  if (!(jobDescriptionPdf instanceof File)) {
    return NextResponse.json(
      {
        error: "Job description PDF is required.",
        fieldErrors: { jobDescriptionPdf: "Upload the company job description as a PDF." },
      },
      { status: 400 },
    );
  }

  try {
    const parsedPdf = await parseUploadedPdf(jobDescriptionPdf, "Job description PDF");
    const autofill = await extractJobDescriptionAutofill(parsedPdf.text);

    return NextResponse.json(
      toJobDescriptionAutofill(parsedPdf.fileName, parsedPdf.text, autofill),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to extract job description details.",
      },
      { status: 500 },
    );
  }
}
