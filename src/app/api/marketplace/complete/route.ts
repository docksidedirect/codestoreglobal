import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import paypal from "@paypal/checkout-server-sdk";
import { paypalClient } from "@/lib/paypal";

export const dynamic = "force-dynamic";

// GET /api/marketplace/complete?token=<paypalOrderId> — buyer returns from PayPal
export async function GET(request: NextRequest) {
  const orderId = new URL(request.url).searchParams.get("token");
  if (!orderId) return NextResponse.redirect(new URL("/en/marketplace", request.url));

  const tx = await prisma.platformTransaction.findUnique({ where: { paypalOrderId: orderId } });
  const meta = (tx?.metadata || {}) as any;
  const fallback = meta.productSlug ? `/en/marketplace/${meta.productSlug}` : "/en/marketplace";

  if (!tx) return NextResponse.redirect(new URL(fallback, request.url));
  if (tx.status === "COMPLETED") return NextResponse.redirect(new URL(`${fallback}?purchased=1`, request.url));

  try {
    const captureReq = new paypal.orders.OrdersCaptureRequest(orderId);
    captureReq.requestBody({} as any); // SDK types demand payment_source; PayPal accepts empty body
    const capture = await paypalClient().execute(captureReq);

    await prisma.platformTransaction.update({
      where: { id: tx.id },
      data: {
        status: "COMPLETED",
        paypalCaptureId: capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id || null,
      },
    });

    // Credit the sale
    if (meta.productId) {
      await prisma.product.update({
        where: { id: meta.productId },
        data: { salesCount: { increment: 1 } },
      });
    }

    return NextResponse.redirect(new URL(`${fallback}?purchased=1`, request.url));
  } catch (e: any) {
    console.error("[PAYPAL_CAPTURE_ERROR]", e?.message || e);
    await prisma.platformTransaction.update({ where: { id: tx.id }, data: { status: "FAILED" } });
    return NextResponse.redirect(new URL(`${fallback}?payment=failed`, request.url));
  }
}