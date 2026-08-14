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

    const jobs = await prisma.jobListing.findMany({
      where: { tenantId: context.params.tenantId }, orderBy: { createdAt: "desc" },
      include: { postedBy: { select: { firstName: true, lastName: true } } },
    });
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
