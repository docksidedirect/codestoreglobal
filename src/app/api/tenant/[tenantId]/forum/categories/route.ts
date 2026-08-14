import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest, context: { params: { tenantId: string } }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });

    const categories = await prisma.forumCategory.findMany({
      where: { tenantId: context.params.tenantId, isActive: true },
      orderBy: { orderIndex: "asc" },
      include: {
        _count: { select: { threads: true } },
        threads: { orderBy: { updatedAt: "desc" }, take: 1, select: { updatedAt: true } },
      },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest, context: { params: { tenantId: string } }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });

    const { name, slug, description, icon, color } = await req.json();
    const cat = await prisma.forumCategory.create({
      data: { name, slug, description, icon, color, tenantId: context.params.tenantId },
    });
    return NextResponse.json({ success: true, category: cat });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
