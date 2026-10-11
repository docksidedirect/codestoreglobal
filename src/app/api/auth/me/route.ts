import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, user: null },
      { status: 401 }
    );
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        avatarUrl: true,
        // Workspace routes are keyed by slug, not by the cuid in tenantId.
        // Without this, post-login redirects land on /{locale}/{cuid}/dashboard,
        // which renders an empty workspace because the underlying APIs match on
        // slug. Same trap for /products, /settings/members and /courses.
        tenant: { select: { slug: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 401 }
      );
    }

    const { tenant, ...rest } = user;
    return NextResponse.json({
      success: true,
      user: { ...rest, tenantSlug: tenant?.slug ?? null },
    });
  } catch {
    return NextResponse.json(
      { success: false, user: null },
      { status: 401 }
    );
  }
}