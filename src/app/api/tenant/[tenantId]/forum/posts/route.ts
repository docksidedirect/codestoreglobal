import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: NextRequest, context: { params: { tenantId: string } }) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });

    const { content, threadId } = await req.json();
    const post = await prisma.forumPost.create({
      data: { content, threadId, authorId: payload.userId as string },
      include: { author: { select: { firstName: true, lastName: true, avatarUrl: true, role: true } } },
    });
    await prisma.forumThread.update({ where: { id: threadId }, data: { postCount: { increment: 1 } } });
    return NextResponse.json({ success: true, post });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
