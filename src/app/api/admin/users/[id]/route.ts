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

// PATCH /api/admin/users/[id] — edit name/role or stop/activate (isActive)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const data: any = {};
  if (body.firstName !== undefined) data.firstName = String(body.firstName).trim();
  if (body.lastName !== undefined) data.lastName = String(body.lastName).trim();
  if (body.role !== undefined) {
    const allowed = ["SUPERADMIN", "TENANT_ADMIN", "MEMBER", "FREELANCER"];
    if (!allowed.includes(body.role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }
    data.role = body.role;
  }
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  const user = await prisma.user.update({ where: { id: params.id }, data });
  return NextResponse.json({ success: true, user: { id: user.id, isActive: user.isActive, role: user.role } });
}

// DELETE /api/admin/users/[id] — remove a user (never yourself via this route is NOT enforced client-side; guard here)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireSuperAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (admin.userId === params.id) {
    return NextResponse.json({ success: false, error: "You cannot delete your own account" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
