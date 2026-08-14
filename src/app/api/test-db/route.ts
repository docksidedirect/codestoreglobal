import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.user.count();
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, role: true, passwordHash: true },
    });

    return NextResponse.json({
      dbConnected: true,
      userCount: count,
      sampleUser: user
        ? { email: user.email, hasPasswordHash: !!user.passwordHash }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        dbConnected: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}