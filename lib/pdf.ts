import { Mistral } from "@mistralai/mistralai";
import { getMistralOcrModel, getRequiredEnv } from "@/lib/env";

const maxPdfSizeBytes = 10 * 1024 * 1024;
const minTextLength = 40;

export async function parseUploadedPdf(
  file: File,
  label: string,
): Promise<{ fileName: string; text: string }> {
  if (!file || file.size === 0) {
    throw new Error(`${label} is required.`);
  }

  const normalizedName = file.name?.toLowerCase() ?? "";

  if (file.type !== "application/pdf" && !normalizedName.endsWith(".pdf")) {
    throw new Error(`${label} must be a PDF file.`);
  }

  if (file.size > maxPdfSizeBytes) {
    throw new Error(`${label} must be 10 MB or smaller.`);
  }

  const client = new Mistral({ apiKey: getRequiredEnv("MISTRAL_API_KEY") });

  try {
    const content = Buffer.from(await file.arrayBuffer());
    const uploaded = await client.files.upload({
      purpose: "ocr",
      file: {
        fileName: file.name || "document.pdf",
        content,
      },
    });

    const result = await client.ocr.process({
      model: getMistralOcrModel(),
      document: {
        type: "file",
        fileId: uploaded.id,
      },
    });

    const text = result.pages
      .map((page) => page.markdown.trim())
      .filter(Boolean)
      .join("\n\n")
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (text.length < minTextLength) {
      throw new Error(`${label} did not contain enough readable text.`);
    }

    return {
      fileName: file.name,
      text,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? `${label} OCR failed: ${error.message}` : `${label} OCR failed.`,
    );
  }
}
