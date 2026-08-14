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

  // Skip middleware for static files and API routes that don't need protection
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // Skip files with extensions (images, manifest, etc.)
  ) {
    return NextResponse.next();
  }

  // Handle i18n routing first
  const response = intlMiddleware(request);

  // Check if this is a protected route
  const isPublic = PUBLIC_PATHS.some((path) => pathname.includes(path));
  const isProtected = !isPublic && (
    pathname.includes("/dashboard") ||
    pathname.includes("/admin") ||
    pathname.includes("/settings")
  );

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
  matcher: ["/((?!_next|.*\\..*).*)"],
};