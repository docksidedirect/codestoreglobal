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
    const instructorId = payload.userId as string;

    const body = await request.json();
    const { title, description, price, difficulty, tenantId } = body;

    if (!title?.trim() || !description?.trim() || !tenantId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const priceNum = price ? parseFloat(price) : 0;
    let slug = slugify(title);
    const existing = await prisma.course.findFirst({ where: { tenantId, slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        slug,
        description: description.trim(),
        price: priceNum,
        currency: "USD",
        difficulty: difficulty || "BEGINNER",
        tenantId,
        instructorId,
      },
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: any) {
    console.error("[COURSE_CREATE_ERROR]", error);
    return NextResponse.json({ success: false, error: "Server error", detail: error.message }, { status: 500 });
  }
}
