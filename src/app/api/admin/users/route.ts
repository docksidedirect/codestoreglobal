import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function requireSuperAdmin(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    if (payload.role !== "SUPERADMIN") return null;
    return payload as { userId: string };
  } catch {
    return null;
  }
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function genPassword(): string {
  return crypto.randomBytes(6).toString("base64url"); // 8 chars
}

// GET /api/admin/users — all users with their workspace
export async function GET(request: NextRequest) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, firstName: true, lastName: true, email: true, role: true,
      isActive: true, emailVerified: true, createdAt: true, avatarUrl: true,
      tenant: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ success: true, users });
}

// POST /api/admin/users — create a user manually (generated password returned ONCE)
// body: { email, firstName, lastName, role, tenantId? }
export async function POST(request: NextRequest) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const email = String(body.email || "").toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !body.firstName?.trim()) {
    return NextResponse.json({ success: false, error: "Valid email and first name are required" }, { status: 400 });
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ success: false, error: "A user with this email already exists" }, { status: 409 });
  }
  if (body.tenantId && !(await prisma.tenant.findUnique({ where: { id: body.tenantId } }))) {
    return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 });
  }

  const generatedPassword = genPassword();
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(generatedPassword, 12),
      firstName: body.firstName.trim(),
      lastName: String(body.lastName || "").trim(),
      role: body.role || "MEMBER",
      tenantId: body.tenantId || null,
      isActive: true,
      emailVerified: true,
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, tenantId: true },
  });
  return NextResponse.json({ success: true, user, generatedPassword }, { status: 201 });
}
