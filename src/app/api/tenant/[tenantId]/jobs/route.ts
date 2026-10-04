import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const FEATURED_FEE_USD = 19.0; // 7-day featured placement fee
const FEATURED_DURATION_DAYS = 7;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as { userId: string; role?: string };
  } catch {
    return null;
  }
}

// GET /api/tenant/[tenantId]/jobs — featured first, then newest
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const now = new Date();
    const jobs = await prisma.jobListing.findMany({
      where: { tenantId: params.tenantId },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { applications: true } } },
    });

    // Only surface featured jobs whose paid window is still active
    const sorted = jobs.sort((a, b) => {
      const aActive = a.featured && (!a.featuredUntil || a.featuredUntil > now) ? 1 : 0;
      const bActive = b.featured && (!b.featuredUntil || b.featuredUntil > now) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ success: true, jobs: sorted });
  } catch (error: any) {
    console.error("[JOBS_FETCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}

// POST /api/tenant/[tenantId]/jobs — create a real job listing
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { tenantId: true, role: true },
    });
    if (!user || user.tenantId !== params.tenantId) {
      return NextResponse.json(
        { success: false, error: "You are not a member of this tenant" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      requirements,
      budgetMin,
      budgetMax,
      location,
      isRemote,
      deadline,
      skills, // string[] e.g. ["Next.js", "Prisma"]
      featured, // boolean — 7-day featured placement ($19)
    } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      );
    }

    let slug = slugify(title);
    const existing = await prisma.jobListing.findFirst({
      where: { tenantId: params.tenantId, slug },
    });
    if (existing) slug = `${slug}-${Date.now()}`;

    const budgetMinNum = budgetMin ? parseFloat(budgetMin) : null;
    const budgetMaxNum = budgetMax ? parseFloat(budgetMax) : null;
    if (budgetMinNum !== null && (isNaN(budgetMinNum) || budgetMinNum < 0)) {
      return NextResponse.json({ success: false, error: "Invalid budget" }, { status: 400 });
    }

    const isFeatured = Boolean(featured);
    // Commission preview: platform takes commissionRate% of the max budget on completion
    const commissionAmount =
      budgetMaxNum !== null ? Number(((budgetMaxNum * 10) / 100).toFixed(2)) : null;

    const job = await prisma.jobListing.create({
      data: {
        title: title.trim(),
        slug,
        description: description.trim(),
        requirements: requirements?.trim() || null,
        budgetMin: budgetMinNum,
        budgetMax: budgetMaxNum,
        currency: "USD",
        location: location?.trim() || null,
        isRemote: Boolean(isRemote),
        deadline: deadline ? new Date(deadline) : null,
        skillsRequired: JSON.stringify(Array.isArray(skills) ? skills : []),
        status: "OPEN",
        featured: isFeatured,
        featuredUntil: isFeatured
          ? new Date(Date.now() + FEATURED_DURATION_DAYS * 24 * 60 * 60 * 1000)
          : null,
        featuredFee: isFeatured ? FEATURED_FEE_USD : null,
        commissionRate: 10.0,
        commissionAmount,
        tenantId: params.tenantId,
        postedById: auth.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        job,
        fees: isFeatured
          ? { featuredFee: FEATURED_FEE_USD, featuredDays: FEATURED_DURATION_DAYS, note: "Featured placement active — collect payment via PayPal manually or enable auto-billing later." }
          : null,
        commission: { rate: 10, amount: commissionAmount, status: "UNPAID" },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[JOB_CREATE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}
