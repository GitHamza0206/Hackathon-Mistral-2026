"use client";

import type { Scorecard, TranscriptEntry } from "@/lib/interviews";

interface DownloadButtonsProps {
  candidateName: string;
  scorecard?: Scorecard;
  transcript?: TranscriptEntry[];
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DownloadButtons({ candidateName, scorecard, transcript }: DownloadButtonsProps) {
  const safeName = candidateName.replace(/\s+/g, "-").toLowerCase();

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
      {scorecard && (
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            downloadFile(
              JSON.stringify(scorecard, null, 2),
              `scorecard-${safeName}.json`,
              "application/json;charset=utf-8",
            );
          }}
        >
          Download scorecard (.json)
        </button>
      )}
      {transcript && transcript.length > 0 && (
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            const text = transcript
              .map((entry) => {
                const speaker = entry.speaker === "agent" ? "Interviewer" : "Candidate";
                return `[${speaker}] ${entry.text}`;
              })
              .join("\n\n");
            downloadFile(text, `transcript-${safeName}.txt`, "text/plain;charset=utf-8");
          }}
        >
          Download transcript (.txt)
        </button>
      )}
    </div>
  );
}
