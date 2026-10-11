import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Resolves the URL segment to a canonical Tenant id and checks access.
 *
 * The segment is a slug ("devnexus-demo"), but every column here is a cuid, so
 * the raw segment must never reach a `where` clause. Previously this compared
 * `user.tenantId !== tenantId` (cuid vs slug) and returned 401 for every valid
 * workspace, which made the members page look empty.
 */
async function requireTenantMember(request: NextRequest, segment: string) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });

    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ id: segment }, { slug: segment }] },
      select: { id: true },
    });
    if (!tenant) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, tenantId: true, role: true },
    });
    if (!user) return null;
    if (user.role !== "SUPERADMIN" && user.tenantId !== tenant.id) return null;

    // Callers must use `tenantId`, never `params.tenantId`.
    return { ...user, tenantId: tenant.id };
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
      where: { tenantId: me.tenantId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, avatarUrl: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.tenantInvite.findMany({
      where: { tenantId: me.tenantId },
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
  if (existingUser && existingUser.tenantId === me.tenantId) {
    return NextResponse.json({ success: false, error: "This email is already a member" }, { status: 409 });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // @@unique([tenantId, email]) — regenerate instead of failing
  const invite = await prisma.tenantInvite.upsert({
    where: { tenantId_email: { tenantId: me.tenantId, email: cleanEmail } },
    update: { token, expiresAt, usedAt: null, invitedBy: me.id },
    create: { email: cleanEmail, token, expiresAt, tenantId: me.tenantId, invitedBy: me.id },
  });

  return NextResponse.json({ success: true, invite }, { status: 201 });
}
