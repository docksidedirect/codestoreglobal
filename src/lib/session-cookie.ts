import type { NextRequest, NextResponse } from "next/server";

/**
 * Session cookie options that work on localhost, on a self-hosted domain, and on
 * production — instead of only on codestoreglobal.com.
 *
 * The bug this replaces: login, logout and both OAuth callbacks hardcoded
 * `domain: ".codestoreglobal.com"`. A browser on localhost:3000 refuses to store
 * a cookie for an unrelated domain, so the token was never saved, the middleware
 * found no cookie, and every /dashboard, /admin and /settings route bounced back
 * to /en/login. That made local development and any self-hosted deployment
 * impossible to sign into.
 *
 * Same approach the invite-accept route already used correctly.
 */
export const SESSION_COOKIE = "token";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** True only for the real production hosts, where the shared parent domain is needed. */
export function isProductionHost(request: NextRequest): boolean {
  const host = request.headers.get("host") || "";
  return host.includes("codestoreglobal.com");
}

/**
 * Cookie options for setting or clearing the session.
 *
 * - `domain` is only set in production, where a cookie must be shared across
 *   subdomains. On localhost or a self-hosted domain we omit it, so the cookie
 *   is host-only and the browser will actually accept it.
 * - `secure` follows the actual protocol: requiring it over plain HTTP means the
 *   browser drops the cookie and the user is stuck in a login loop.
 */
export function sessionCookieOptions(request: NextRequest) {
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.nextUrl.protocol ? request.nextUrl.protocol.replace(":", "") : "http");
  const secure = proto === "https";

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    ...(isProductionHost(request) ? { domain: ".codestoreglobal.com" } : {}),
  };
}

/** Options for clearing the cookie. Must mirror the ones it was set with. */
export function clearSessionCookieOptions(request: NextRequest) {
  return { ...sessionCookieOptions(request), maxAge: 0 };
}

/** Convenience: set the session cookie with the correct options for this request. */
export function setSessionCookie(
  response: NextResponse,
  token: string,
  request: NextRequest
) {
  response.cookies.set(SESSION_COOKIE, token, {
    ...sessionCookieOptions(request),
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
