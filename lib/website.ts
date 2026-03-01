
const MAX_WEBSITE_TEXT_CHARS = 3000;
const FETCH_TIMEOUT_MS = 8000;

export async function fetchWebsiteText(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "hr-screener-app/1.0",
        Accept: "text/html, text/plain, */*",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[website] fetch returned ${response.status} for ${url}`);
      return "";
    }

    const contentType = response.headers.get("content-type") ?? "";
    const raw = await response.text();

    if (contentType.includes("text/plain")) {
      return clipWebsiteText(raw);
    }

    return clipWebsiteText(stripHtml(raw));
  } catch (error) {
    console.warn("[website] failed to fetch content:", error);
    return "";
  }
}

function stripHtml(html: string): string {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function clipWebsiteText(text: string): string {
  if (text.length <= MAX_WEBSITE_TEXT_CHARS) {
    return text;
  }
  return text.slice(0, MAX_WEBSITE_TEXT_CHARS) + "...";
}
