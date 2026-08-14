import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { locales, defaultLocale } from "@/i18n/request";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "devnexus-super-secret-key-change-in-production"
);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as { userId: string; email: string; role: string; tenantId?: string };
  } catch {
    return null;
  }
}

const PUBLIC_PATHS = ["/courses", "/marketplace", "/login", "/register", "/forgot-password"];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  const locale = pathname.split("/")[1];
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  const token = request.cookies.get("devnexus_session")?.value;
  const user = token ? await verifyToken(token) : null;

  const tenantMatch = pathWithoutLocale.match(/^\/([^/]+)(?:\/|$)/);
  const tenantId = tenantMatch && !tenantMatch[1].startsWith("(") ? tenantMatch[1] : null;

  if (tenantId && !isPublicPath(pathWithoutLocale)) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    if (user.role !== "SUPERADMIN" && user.tenantId !== tenantId) {
      return NextResponse.redirect(
        new URL(`/${locale}/${user.tenantId || ""}/dashboard`, request.url)
      );
    }
  }

  if (user && (pathWithoutLocale === "/login" || pathWithoutLocale === "/register")) {
    if (user.role === "SUPERADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    }
    if (user.tenantId) {
      return NextResponse.redirect(
        new URL(`/${locale}/${user.tenantId}/dashboard`, request.url)
      );
    }
  }

  if (pathWithoutLocale.startsWith("/admin") || pathWithoutLocale.startsWith("/approvals")) {
    if (!user || user.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
