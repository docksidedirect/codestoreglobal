import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "devnexus-super-secret-key-change-in-production");

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("devnexus_session")?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    if (!payload.tenantId) return NextResponse.json({ success: false }, { status: 400 });

    const tenant = await prisma.tenant.findUnique({ where: { id: payload.tenantId as string } });
    if (!tenant) return NextResponse.json({ success: false }, { status: 404 });
    return NextResponse.json({ success: true, tenant });
  } catch {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
