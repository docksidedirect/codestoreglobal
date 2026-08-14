import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { locales } from "./i18n/request";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/test-db",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ⬇️ CRITICAL: Skip ALL API routes completely
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle i18n routing
  const response = intlMiddleware(request);

  // Protect dashboard/admin routes
  const isPublic = PUBLIC_PATHS.some((path) => pathname.includes(path));
  const isProtected =
    !isPublic &&
    (pathname.includes("/dashboard") ||
      pathname.includes("/admin") ||
      pathname.includes("/settings"));

  if (isProtected) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/en/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    } catch {
      return NextResponse.redirect(new URL("/en/login", request.url));
    }
  }

  return response;
}

export const config = {
  // ⬇️ CRITICAL: Add "api" to the exclusion list
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};