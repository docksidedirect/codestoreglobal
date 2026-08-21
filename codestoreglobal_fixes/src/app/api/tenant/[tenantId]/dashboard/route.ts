import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: NextRequest, context: { params: { tenantId: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { tenantId } = context.params;
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        members: { select: { id: true, firstName: true, lastName: true, email: true, role: true, avatarUrl: true } },
        courses: { orderBy: { createdAt: "desc" }, take: 5 },
        products: { orderBy: { createdAt: "desc" }, take: 5 },
        jobListings: { orderBy: { createdAt: "desc" }, take: 5 },
        _count: { select: { members: true, courses: true, products: true, jobListings: true } },
      },
    });

    if (!tenant) return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });

    const totalRevenue = await prisma.platformTransaction.aggregate({
      where: { tenantId },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        analytics: {
          totalRevenue: Number(totalRevenue._sum.amount ?? 0),
          totalSales: 0,
          activeJobs: tenant._count.jobListings,
          totalMembers: tenant._count.members,
        },
        members: tenant.members,
        recentCourses: tenant.courses,
        recentProducts: tenant.products,
        recentJobs: tenant.jobListings,
      },
    });
  } catch (error: any) {
    console.error("[DASHBOARD_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
