import { PDFParse } from "pdf-parse";

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

  const data = new Uint8Array(await file.arrayBuffer());
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    const text = result.text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

    if (text.length < minTextLength) {
      throw new Error(`${label} did not contain enough readable text.`);
    }

    return {
      fileName: file.name,
      text,
    };
  } finally {
    await parser.destroy();
  }
}
