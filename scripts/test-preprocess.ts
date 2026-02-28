/**
 * Test the preprocessing pipeline with real PDFs.
 *
 * Usage:
 *   npx tsx scripts/test-preprocess.ts <cv.pdf> <jd.pdf> [github_url]
 *
 * Example:
 *   npx tsx scripts/test-preprocess.ts ./my-cv.pdf ./job-description.pdf https://github.com/octocat
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs";
import * as path from "path";
import { fetchGitHubRepos } from "../lib/github";
import { generateInterviewStrategy } from "../lib/preprocess";
import { parseUploadedPdf } from "../lib/pdf";
import type { CandidateSessionRecord } from "../lib/interviews";

const [cvPath, jdPath, githubUrl] = process.argv.slice(2);

if (!cvPath || !jdPath) {
  console.error("Usage: npx tsx scripts/test-preprocess.ts <cv.pdf> <jd.pdf> [github_url]");
  process.exit(1);
}

function fileFromPath(filePath: string): File {
  const resolved = path.resolve(filePath);
  const buffer = fs.readFileSync(resolved);
  const name = path.basename(resolved);
  return new File([buffer], name, { type: "application/pdf" });
}

async function main() {
  console.log("--- Parsing CV PDF ---");
  const cv = await parseUploadedPdf(fileFromPath(cvPath), "CV PDF");
  console.log(`CV parsed: ${cv.text.length} chars\n`);

  console.log("--- Parsing JD PDF ---");
  const jd = await parseUploadedPdf(fileFromPath(jdPath), "JD PDF");
  console.log(`JD parsed: ${jd.text.length} chars\n`);

  let repos: Awaited<ReturnType<typeof fetchGitHubRepos>> = [];
  if (githubUrl) {
    console.log("--- Fetching GitHub repos ---");
    repos = await fetchGitHubRepos(githubUrl);
    console.log(`Found ${repos.length} repos`);
    repos.forEach((r) => console.log(`  ${r.name} [${r.language}] — ${r.stars} stars`));
    console.log();
  } else {
    console.log("--- No GitHub URL provided, skipping repo fetch ---\n");
  }

  const session: CandidateSessionRecord = {
    id: "test_session",
    roleId: "test_role",
    createdAt: new Date().toISOString(),
    status: "profile_submitted",
    roleSnapshot: {
      roleTitle: "AI Engineer",
      targetSeniority: "senior",
      durationMinutes: 45,
      focusAreas: ["LLM engineering", "system design", "RAG"],
      jobDescriptionText: jd.text,
    },
    candidateProfile: {
      candidateName: "Test Candidate",
      githubUrl: githubUrl || "https://github.com/unknown",
      cvFileName: cv.fileName,
      cvText: cv.text,
    },
  };

  console.log("--- Generating interview strategy (calling Mistral) ---\n");
  const strategy = await generateInterviewStrategy(session, repos);
  console.log(JSON.stringify(strategy, null, 2));
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
