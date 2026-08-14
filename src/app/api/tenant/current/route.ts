import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ tenant: null }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) return NextResponse.json({ tenant: null }, { status: 404 });

    return NextResponse.json({ success: true, tenant: user.tenant });
  } catch {
    return NextResponse.json({ tenant: null }, { status: 401 });
  }
}