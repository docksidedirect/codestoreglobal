import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    const userId = payload.userId as string;
    const tenantId = params.tenantId;

    // Look up user to check tenant access
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, tenantId: true },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Allow SUPERADMIN or matching tenant member
    if (user.role !== "SUPERADMIN" && user.tenantId !== tenantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [analytics, recentCourses, recentProducts, recentJobs, totalMembers, activeJobs] = await Promise.all([
      prisma.platformTransaction.aggregate({
        where: { tenantId },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.course.findMany({
        where: { tenantId, isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, price: true, moduleCount: true },
      }),
      prisma.product.findMany({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, price: true, category: true },
      }),
      prisma.jobListing.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, budgetMin: true, budgetMax: true },
      }),
      prisma.user.count({ where: { tenantId } }),
      prisma.jobListing.count({ where: { tenantId, status: "OPEN" } }),
    ]);

    return NextResponse.json({
      data: {
        analytics: {
          totalRevenue: Number(analytics._sum.amount ?? 0),
          totalSales: analytics._count.id,
          activeJobs,
          totalMembers,
        },
        recentCourses,
        recentProducts,
        recentJobs,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}