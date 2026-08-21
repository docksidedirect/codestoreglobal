import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as { userId: string; role: string };
  } catch { return null; }
}

export async function POST(request: NextRequest, context: { params: { tenantId: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { tenantId } = context.params;
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });

    if (tenant.ownerId !== user.userId && user.role !== "SUPERADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = "MEMBER" } = body;
    if (!email?.trim()) return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });

    const token = crypto.randomBytes(32).toString("hex");
    const invite = await prisma.tenantInvite.create({
      data: {
        email: email.toLowerCase().trim(),
        token,
        role,
        tenantId,
        invitedBy: user.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, invite });
  } catch (error: any) {
    console.error("[INVITE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error", detail: error.message }, { status: 500 });
  }
}
