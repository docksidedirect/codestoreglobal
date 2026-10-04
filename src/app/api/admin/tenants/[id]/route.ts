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

// PATCH /api/admin/tenants/[id] — edit name, plan, or change status
// status values: ACTIVE (approve / reactivate), SUSPENDED (stop), REJECTED, PENDING_APPROVAL
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const data: any = {};
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.subscriptionTier !== undefined) data.subscriptionTier = body.subscriptionTier;
  if (body.status !== undefined) {
    const allowed = ["PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "REJECTED"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
    if (body.status === "ACTIVE") data.isVerified = true;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
  }

  const tenant = await prisma.tenant.update({ where: { id: params.id }, data });
  return NextResponse.json({ success: true, tenant });
}

// DELETE /api/admin/tenants/[id] — remove workspace and everything in it (cascades)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  await prisma.tenant.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
