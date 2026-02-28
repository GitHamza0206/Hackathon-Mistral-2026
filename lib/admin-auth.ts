import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRequiredEnv } from "@/lib/env";

export const adminCookieName = "hr_screener_admin";

function buildSessionValue(passcode: string) {
  return createHash("sha256").update(`hr-screener:${passcode}`).digest("hex");
}

export function isValidAdminPasscode(passcode: string) {
  const expected = getRequiredEnv("ADMIN_PASSCODE");
  return passcode === expected;
}

export function hasAdminSessionValue(value?: string | null) {
  if (!value) {
    return false;
  }

  const actual = Buffer.from(value);
  const expected = Buffer.from(buildSessionValue(getRequiredEnv("ADMIN_PASSCODE")));

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return hasAdminSessionValue(cookieStore.get(adminCookieName)?.value);
}

export function isAdminRequest(request: NextRequest) {
  return hasAdminSessionValue(request.cookies.get(adminCookieName)?.value);
}

export function attachAdminSession(response: NextResponse) {
  response.cookies.set({
    name: adminCookieName,
    value: buildSessionValue(getRequiredEnv("ADMIN_PASSCODE")),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
