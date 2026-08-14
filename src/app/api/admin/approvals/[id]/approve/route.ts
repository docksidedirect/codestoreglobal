import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "devnexus-super-secret-key-change-in-production");

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("devnexus_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/en/login", req.url));
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    if (payload.role !== "SUPERADMIN") return NextResponse.redirect(new URL("/en", req.url));

    await prisma.tenant.update({
      where: { id: params.id }, data: { status: "ACTIVE", isVerified: true },
    });
    return NextResponse.redirect(new URL("/en/admin", req.url));
  } catch {
    return NextResponse.redirect(new URL("/en/login", req.url));
  }
}
