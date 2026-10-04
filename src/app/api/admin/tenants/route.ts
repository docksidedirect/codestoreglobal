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

// GET /api/admin/tenants — all workspaces with counts
export async function GET(request: NextRequest) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { members: true, courses: true, products: true, jobListings: true } },
    },
  });
  const [totalUsers, revenueAgg] = await Promise.all([
    prisma.user.count(),
    prisma.platformTransaction.aggregate({ _sum: { amount: true } }),
  ]);

  return NextResponse.json({
    success: true,
    tenants,
    totalUsers,
    totalRevenue: Number(revenueAgg._sum.amount ?? 0),
  });
}

// POST /api/admin/tenants — create a workspace manually
// body: { name, subdomain?, subscriptionTier?, ownerEmail, ownerFirstName, ownerLastName }
// If the owner email is new, an owner account is created and the generated password is returned ONCE.
export async function POST(request: NextRequest) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const name = String(body.name || "").trim();
  const ownerEmail = String(body.ownerEmail || "").toLowerCase().trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ownerEmail)) {
    return NextResponse.json({ success: false, error: "Name and a valid owner email are required" }, { status: 400 });
  }

  const base = slugify(body.subdomain || name) || "workspace";
  let slug = base;
  while (await prisma.tenant.findUnique({ where: { slug } })) slug = `${base}-${crypto.randomBytes(2).toString("hex")}`;
  let subdomain = base;
  while (await prisma.tenant.findUnique({ where: { subdomain } })) subdomain = `${base}-${crypto.randomBytes(2).toString("hex")}`;

  // Find or create the owner
  let owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  let generatedPassword: string | null = null;
  if (!owner) {
    generatedPassword = genPassword();
    owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        passwordHash: await bcrypt.hash(generatedPassword, 12),
        firstName: String(body.ownerFirstName || "Owner").trim(),
        lastName: String(body.ownerLastName || "").trim(),
        role: "TENANT_ADMIN",
        emailVerified: true,
      },
    });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      subdomain,
      status: "ACTIVE",
      subscriptionTier: body.subscriptionTier || "FREE",
      ownerId: owner.id,
    },
  });

  // Owner joins their own workspace
  await prisma.user.update({ where: { id: owner.id }, data: { tenantId: tenant.id } });

  return NextResponse.json({ success: true, tenant, generatedPassword }, { status: 201 });
}