import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    const userId = payload.userId as string;

    // Verify user belongs to this tenant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, role: true },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "SUPERADMIN" && user.tenantId !== params.tenantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const room = await prisma.chatRoom.findFirst({
      where: { tenantId: params.tenantId },
    });

    if (!room) return NextResponse.json({ messages: [] });

    const messages = await prisma.chatMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { sender: { select: { firstName: true, lastName: true } } },
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    const userId = payload.userId as string;

    // Verify user belongs to this tenant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, role: true },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "SUPERADMIN" && user.tenantId !== params.tenantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { content, roomId } = await req.json();

    const msg = await prisma.chatMessage.create({
      data: {
        content,
        roomId: roomId || "demo-general-room",
        senderId: userId,
      },
      include: { sender: { select: { firstName: true, lastName: true } } },
    });

    return NextResponse.json({ message: msg });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}