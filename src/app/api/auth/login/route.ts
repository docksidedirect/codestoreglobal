import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session-cookie";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      // The slug is what workspace routes are keyed by; tenantId is a cuid and
      // produces URLs that render empty workspaces.
      include: { tenant: { select: { slug: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        // The slug the client must use in workspace URLs.
        tenantSlug: user.tenant?.slug ?? null,
        avatarUrl: user.avatarUrl,
      },
    });

    // Domain and Secure are derived from the request, so this works on
    // localhost, on a self-hosted domain, and in production. Hardcoding
    // domain: ".codestoreglobal.com" meant the browser rejected the cookie
    // everywhere else, and every protected route redirected back to /login.
    setSessionCookie(response, token, request);

    return response;
  } catch (error: any) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}