import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function requireSuperAdmin(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload.role === "SUPERADMIN" ? (payload as { userId: string }) : null;
  } catch {
    return null;
  }
}

// GET /api/admin/earnings — transactions, jobs money report, monthly totals
export async function GET(request: NextRequest) {
  if (!(await requireSuperAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const [rawTx, jobs, agg] = await Promise.all([
    prisma.platformTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.jobListing.findMany({
      where: { OR: [{ featured: true }, { commissionAmount: { not: null } }] },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, status: true,
        featured: true, featuredUntil: true, featuredFee: true,
        commissionAmount: true, commissionStatus: true,
        tenant: { select: { name: true } },
      },
    }),
    prisma.platformTransaction.aggregate({
      _sum: { amount: true, platformFee: true },
      _count: true,
    }),
  ]);

  // Monthly totals (last 6 months) from the ledger
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  const recent = await prisma.platformTransaction.findMany({
    where: { createdAt: { gte: since } },
    select: { amount: true, platformFee: true, status: true, createdAt: true },
  });
  const months: Record<string, { gross: number; fees: number; count: number }> = {};
  for (const t of recent) {
    const key = t.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!months[key]) months[key] = { gross: 0, fees: 0, count: 0 };
    months[key].gross += Number(t.amount);
    months[key].fees += Number(t.platformFee);
    months[key].count += 1;
  }

  // tenantId/userId are plain columns (no relations) — resolve names in one batch
  const tenantIds = [...new Set(rawTx.map((t) => t.tenantId).filter(Boolean))] as string[];
  const userIds = [...new Set(rawTx.map((t) => t.userId).filter(Boolean))] as string[];
  const [tenantRows, userRows] = await Promise.all([
    tenantIds.length ? prisma.tenant.findMany({ where: { id: { in: tenantIds } }, select: { id: true, name: true } }) : [],
    userIds.length ? prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } }) : [],
  ]);
  const tenantName = Object.fromEntries(tenantRows.map((t) => [t.id, t.name]));
  const userEmail = Object.fromEntries(userRows.map((u) => [u.id, u.email]));
  const transactions = rawTx.map((t) => ({
    ...t,
    tenant: { name: t.tenantId ? tenantName[t.tenantId] || null : null },
    user: { email: t.userId ? userEmail[t.userId] || null : null },
  }));

  const pendingFees = jobs
    .filter((j) => j.commissionAmount != null && j.commissionStatus === "UNPAID")
    .reduce((s, j) => s + Number(j.commissionAmount), 0);
  const featuredOwed = jobs
    .filter((j) => j.featured && j.featuredFee != null)
    .reduce((s, j) => s + Number(j.featuredFee), 0);

  return NextResponse.json({
    success: true,
    transactions,
    jobs,
    totals: {
      gross: Number(agg._sum.amount ?? 0),
      platformFees: Number(agg._sum.platformFee ?? 0),
      transactionCount: agg._count,
      pendingJobCommission: Number(pendingFees.toFixed(2)),
      featuredFeesRecorded: Number(featuredOwed.toFixed(2)),
    },
    months,
  });
}