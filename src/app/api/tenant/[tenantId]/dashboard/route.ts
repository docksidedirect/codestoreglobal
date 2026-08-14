import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "devnexus-super-secret-key-change-in-production");

export async function GET(req: NextRequest, { params }: { params: { tenantId: string } }) {
  try {
    const token = req.cookies.get("devnexus_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    const tenantId = params.tenantId;

    if (payload.role !== "SUPERADMIN" && payload.tenantId !== tenantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [analytics, recentCourses, recentProducts, recentJobs] = await Promise.all([
      prisma.platformTransaction.aggregate({
        where: { tenantId }, _sum: { amount: true }, _count: { id: true },
      }),
      prisma.course.findMany({ where: { tenantId, isPublished: true }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, price: true, moduleCount: true } }),
      prisma.product.findMany({ where: { tenantId, isActive: true }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, price: true, category: true } }),
      prisma.jobListing.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, status: true, budgetMin: true, budgetMax: true } }),
    ]);

    const totalMembers = await prisma.user.count({ where: { tenantId } });
    const activeJobs = await prisma.jobListing.count({ where: { tenantId, status: "OPEN" } });

    return NextResponse.json({
      data: {
        analytics: { totalRevenue: Number(analytics._sum.amount ?? 0), totalSales: analytics._count.id, activeJobs, totalMembers },
        recentCourses, recentProducts, recentJobs,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
