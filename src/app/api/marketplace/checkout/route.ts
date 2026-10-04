import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import paypal from "@paypal/checkout-server-sdk";
import { paypalClient } from "@/lib/paypal";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const PLATFORM_FEE_PCT = 10; // platform commission on every sale

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as { userId: string };
  } catch {
    return null;
  }
}

// POST /api/marketplace/checkout — create PayPal order + record pending transaction
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Please sign in to buy" }, { status: 401 });
  }

  const { productId } = await request.json();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { tenant: { select: { id: true, name: true } } },
  });
  if (!product || !product.isActive) {
    return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
  }
  if (product.tenantId && product.sellerId === auth.userId) {
    return NextResponse.json({ success: false, error: "You cannot buy your own product" }, { status: 400 });
  }

  const price = Number(product.price);
  const platformFee = Number(((price * PLATFORM_FEE_PCT) / 100).toFixed(2));
  const sellerPayout = Number((price - platformFee).toFixed(2));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  // 1. Create PayPal order
  const ppReq = new paypal.orders.OrdersCreateRequest();
  ppReq.prefer("return=representation");
  ppReq.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: product.id,
        description: `CODESTORE GLOBAL — ${product.name}`,
        amount: { currency_code: product.currency, value: price.toFixed(2) },
      },
    ],
    application_context: {
      brand_name: "CODESTORE GLOBAL",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `${appUrl}/api/marketplace/complete`,
      cancel_url: `${appUrl}/api/marketplace/cancel`,
    },
  });

  let ppOrder;
  try {
    ppOrder = await paypalClient().execute(ppReq);
  } catch (e: any) {
    console.error("[PAYPAL_CREATE_ERROR]", e?.message || e);
    return NextResponse.json({ success: false, error: "Could not create PayPal order" }, { status: 502 });
  }

  const approveLink = ppOrder.result.links?.find((l: any) => l.rel === "approve")?.href;
  if (!approveLink) {
    return NextResponse.json({ success: false, error: "PayPal returned no approval link" }, { status: 502 });
  }

  // 2. Record pending platform transaction (paypalOrderId is unique — one ledger row per order)
  await prisma.platformTransaction.create({
    data: {
      paypalOrderId: ppOrder.result.id,
      amount: price,
      platformFee,
      sellerPayout,
      currency: product.currency,
      status: "PENDING",
      type: "PRODUCT_SALE",
      tenantId: product.tenantId,
      userId: auth.userId,
      metadata: { productId: product.id, productSlug: product.slug, productName: product.name, sellerId: product.sellerId },
    },
  });

  return NextResponse.json({ success: true, paypalUrl: approveLink });
}