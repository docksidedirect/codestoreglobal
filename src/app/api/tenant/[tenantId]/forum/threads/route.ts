import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "devnexus-super-secret-key-change-in-production");

export async function GET(req: NextRequest, context: { params: { tenantId: string } }) {
  try {
    const token = req.cookies.get("devnexus_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const threads = await prisma.forumThread.findMany({
      where: { tenantId: context.params.tenantId, ...(categoryId ? { categoryId } : {}) },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      include: {
        author: { select: { firstName: true, lastName: true, avatarUrl: true } },
        category: { select: { name: true, color: true } },
        _count: { select: { posts: true, votes: true } },
      },
    });
    return NextResponse.json({ threads });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest, context: { params: { tenantId: string } }) {
  try {
    const token = req.cookies.get("devnexus_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });

    const { title, slug, content, categoryId } = await req.json();
    const thread = await prisma.forumThread.create({
      data: { title, slug, content, categoryId, tenantId: context.params.tenantId, authorId: payload.userId as string },
    });
    return NextResponse.json({ success: true, thread });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
