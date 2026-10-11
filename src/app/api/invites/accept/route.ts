import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// GET /api/invites/accept?token=xxx — public preview (tenant name, email, expiry)
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
  }

  const invite = await prisma.tenantInvite.findUnique({
    where: { token },
    include: { tenant: { select: { name: true } } },
  });
  if (!invite) {
    return NextResponse.json({ success: false, error: "Invalid invite link" }, { status: 404 });
  }
  if (invite.usedAt) {
    return NextResponse.json({ success: false, error: "This invite was already used" }, { status: 410 });
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ success: false, error: "This invite has expired" }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    email: invite.email,
    tenantName: invite.tenant.name,
    expiresAt: invite.expiresAt,
  });
}

// POST /api/invites/accept — create account from invite, log in
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, firstName, lastName, password } = body;

    if (!token || !firstName?.trim() || !lastName?.trim() || !password) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const invite = await prisma.tenantInvite.findUnique({
      where: { token },
      // slug is needed so the client can redirect to /{locale}/{slug}/dashboard.
      include: { tenant: { select: { slug: true } } },
    });
    if (!invite) {
      return NextResponse.json({ success: false, error: "Invalid invite link" }, { status: 404 });
    }
    if (invite.usedAt) {
      return NextResponse.json({ success: false, error: "This invite was already used" }, { status: 410 });
    }
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "This invite has expired" }, { status: 410 });
    }

    const existing = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists — please log in" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email: invite.email,
        passwordHash: await bcrypt.hash(String(password), 12),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: invite.role || "MEMBER",
        tenantId: invite.tenantId,
      },
    });

    await prisma.tenantInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    const jwt = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const res = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          tenantId: user.tenantId,
          tenantSlug: invite.tenant?.slug ?? null,
        },
      },
      { status: 201 }
    );
    const isProd = (request.headers.get("host") || "").includes("codestoreglobal.com");
    res.cookies.set("token", jwt, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      ...(isProd ? { domain: ".codestoreglobal.com" } : {}),
    });
    return res;
  } catch (error: any) {
    console.error("[INVITE_ACCEPT_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error", detail: error.message }, { status: 500 });
  }
}
