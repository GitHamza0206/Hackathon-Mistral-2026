const kvKeys = ["KV_REST_API_URL", "KV_REST_API_TOKEN"] as const;

export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string) {
  const value = process.env[name];
  return value?.trim() || undefined;
}

export function hasKvConfig() {
  return kvKeys.every((key) => Boolean(process.env[key]));
}

export function getAppBaseUrl(origin?: string) {
  return getOptionalEnv("NEXT_PUBLIC_APP_URL") ?? origin ?? "http://localhost:3000";
}

export function getMistralModel() {
  return getOptionalEnv("MISTRAL_MODEL") ?? "mistral-large-latest";
}
