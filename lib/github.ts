import { getOptionalEnv, isGitHubEnrichmentEnabled } from "@/lib/env";
import type { GitHubRepo } from "@/lib/interviews";

interface GitHubApiRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
}

function extractUsername(profileUrl: string): string | null {
  try {
    const url = new URL(profileUrl);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    return path && !path.includes("/") ? path : null;
  } catch {
    return null;
  }
}

export async function fetchGitHubRepos(profileUrl: string): Promise<GitHubRepo[]> {
  if (!isGitHubEnrichmentEnabled()) {
    return [];
  }

  const username = extractUsername(profileUrl);

  if (!username) {
    return [];
  }

  try {
    const token = getOptionalEnv("GITHUB_TOKEN") ?? getOptionalEnv("GITHUB_API_TOKEN");
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=10&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "hr-screener-app",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      const message = await readGitHubErrorMessage(response);
      const remaining = response.headers.get("x-ratelimit-remaining");
      const reset = response.headers.get("x-ratelimit-reset");

      if (response.status === 403 && remaining === "0") {
        console.warn(
          `GitHub API rate limit exceeded for user ${username}. ` +
            `Set GITHUB_TOKEN or GITHUB_API_TOKEN to raise the limit. ` +
            `${formatRateLimitReset(reset)}`,
        );
        return [];
      }

      console.warn(
        `GitHub API returned ${response.status} for user ${username}${
          message ? `: ${message}` : ""
        }`,
      );
      return [];
    }

    const data: GitHubApiRepo[] = await response.json();

    return data.map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at,
      url: repo.html_url,
    }));
  } catch (error) {
    console.warn("Failed to fetch GitHub repos:", error);
    return [];
  }
}

async function readGitHubErrorMessage(response: Response): Promise<string | null> {
  try {
    const payload = (await response.json()) as { message?: unknown };
    return typeof payload.message === "string" ? payload.message : null;
  } catch {
    return null;
  }
}

function formatRateLimitReset(reset: string | null): string {
  if (!reset) {
    return "";
  }

  const timestamp = Number(reset);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return `Limit resets at ${new Date(timestamp * 1000).toISOString()}.`;
}
