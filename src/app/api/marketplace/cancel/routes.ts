import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/marketplace/cancel?token=<paypalOrderId>
export async function GET(request: NextRequest) {
  const orderId = new URL(request.url).searchParams.get("token");
  if (orderId) {
    const tx = await prisma.platformTransaction.findUnique({ where: { paypalOrderId: orderId } });
    if (tx && tx.status === "PENDING") {
      await prisma.platformTransaction.update({ where: { id: tx.id }, data: { status: "CANCELLED" } });
    }
    const meta = (tx?.metadata || {}) as any;
    const dest = meta.productSlug ? `/en/marketplace/${meta.productSlug}?payment=cancelled` : "/en/marketplace";
    return NextResponse.redirect(new URL(dest, request.url));
  }
  return NextResponse.redirect(new URL("/en/marketplace", request.url));
}