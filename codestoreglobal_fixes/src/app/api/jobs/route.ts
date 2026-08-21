import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    const posterId = payload.userId as string;

    const body = await request.json();
    const { title, description, requirements, budgetMin, budgetMax, tenantId } = body;

    if (!title?.trim() || !description?.trim() || !tenantId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let slug = slugify(title);
    const existing = await prisma.jobListing.findFirst({ where: { tenantId, slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const job = await prisma.jobListing.create({
      data: {
        title: title.trim(),
        slug,
        description: description.trim(),
        requirements: requirements?.trim() || "",
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        currency: "USD",
        status: "OPEN",
        tenantId,
        posterId,
      },
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: any) {
    console.error("[JOB_CREATE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error", detail: error.message }, { status: 500 });
  }
}
