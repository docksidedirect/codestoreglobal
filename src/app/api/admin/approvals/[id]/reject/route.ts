import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/en/login", request.url));
    }

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    if (payload.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/en", request.url));
    }

    const { id } = context.params;
    await prisma.tenant.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return NextResponse.redirect(new URL("/en/admin", request.url));
  } catch {
    return NextResponse.redirect(new URL("/en/login", request.url));
  }
}
