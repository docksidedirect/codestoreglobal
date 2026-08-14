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

    const room = await prisma.chatRoom.findFirst({ where: { tenantId: context.params.tenantId } });
    if (!room) return NextResponse.json({ messages: [] });

    const messages = await prisma.chatMessage.findMany({
      where: { roomId: room.id }, orderBy: { createdAt: "asc" }, take: 100,
      include: { sender: { select: { firstName: true, lastName: true } } },
    });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest, context: { params: { tenantId: string } }) {
  try {
    const token = req.cookies.get("devnexus_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });

    const { content, roomId } = await req.json();
    const msg = await prisma.chatMessage.create({
      data: { content, roomId: roomId || "demo-general-room", senderId: payload.userId as string },
      include: { sender: { select: { firstName: true, lastName: true } } },
    });
    return NextResponse.json({ message: msg });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
