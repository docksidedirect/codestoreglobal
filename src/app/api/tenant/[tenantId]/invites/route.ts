import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function requireTenantMember(request: NextRequest, tenantId: string) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, tenantId: true },
    });
    if (!user || user.tenantId !== tenantId) return null;
    return user;
  } catch {
    return null;
  }
}

// GET /api/tenant/[tenantId]/invites — members + invite list
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const me = await requireTenantMember(request, params.tenantId);
  if (!me) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const [members, invites] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId: params.tenantId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, avatarUrl: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.tenantInvite.findMany({
      where: { tenantId: params.tenantId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  const invitesWithStatus = invites.map((inv) => ({
    ...inv,
    status: inv.usedAt ? "ACCEPTED" : inv.expiresAt < now ? "EXPIRED" : "PENDING",
  }));

  return NextResponse.json({ success: true, members, invites: invitesWithStatus });
}

// POST /api/tenant/[tenantId]/invites — create (or regenerate) an invite
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const me = await requireTenantMember(request, params.tenantId);
  if (!me) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();
  const cleanEmail = String(email || "").toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ success: false, error: "Valid email required" }, { status: 400 });
  }

  // Already a member of this tenant?
  const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existingUser && existingUser.tenantId === params.tenantId) {
    return NextResponse.json({ success: false, error: "This email is already a member" }, { status: 409 });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // @@unique([tenantId, email]) — regenerate instead of failing
  const invite = await prisma.tenantInvite.upsert({
    where: { tenantId_email: { tenantId: params.tenantId, email: cleanEmail } },
    update: { token, expiresAt, usedAt: null, invitedBy: me.id },
    create: { email: cleanEmail, token, expiresAt, tenantId: params.tenantId, invitedBy: me.id },
  });

  return NextResponse.json({ success: true, invite }, { status: 201 });
}
