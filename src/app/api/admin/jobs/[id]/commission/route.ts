import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// PATCH /api/admin/jobs/[id]/commission — mark commission invoiced/paid/waived
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    if (payload.role !== "SUPERADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { commissionStatus } = await request.json();
  const allowed = ["UNPAID", "INVOICED", "PAID", "WAIVED"];
  if (!allowed.includes(commissionStatus)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }

  const job = await prisma.jobListing.update({
    where: { id: params.id },
    data: { commissionStatus },
  });
  return NextResponse.json({ success: true, job: { id: job.id, commissionStatus: job.commissionStatus } });
}