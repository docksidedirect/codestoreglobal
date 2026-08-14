import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest, context: { params: { tenantId: string; threadId: string } }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });

    const thread = await prisma.forumThread.findUnique({
      where: { id: context.params.threadId },
      include: {
        author: { select: { firstName: true, lastName: true, avatarUrl: true, role: true } },
        category: { select: { name: true, color: true } },
        posts: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { firstName: true, lastName: true, avatarUrl: true, role: true } },
            _count: { select: { votes: true } },
          },
        },
        _count: { select: { posts: true, votes: true } },
      },
    });

    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.forumThread.update({ where: { id: context.params.threadId }, data: { viewCount: { increment: 1 } } });
    return NextResponse.json({ thread });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
