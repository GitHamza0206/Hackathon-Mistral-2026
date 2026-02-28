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
  const username = extractUsername(profileUrl);

  if (!username) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=10&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "hr-screener-app",
        },
      },
    );

    if (!response.ok) {
      console.warn(`GitHub API returned ${response.status} for user ${username}`);
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
