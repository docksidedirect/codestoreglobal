import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { ProductCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    const sellerId = payload.userId as string;

    const body = await request.json();
    const { name, description, shortDesc, price, category, tenantId, downloadUrl, demoUrl, imageUrls } = body;

    if (!name?.trim() || !description?.trim() || !price || !category || !tenantId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      );
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid price" },
        { status: 400 }
      );
    }

    let slug = slugify(name);
    const existing = await prisma.product.findFirst({
      where: { tenantId, slug },
    });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description.trim(),
        shortDesc: shortDesc?.trim() || null,
        price: priceNum,
        currency: "USD",
        category: category as ProductCategory,
        tenantId,
        sellerId,
        downloadUrl: downloadUrl?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        imageUrls: imageUrls || [],
      },
    });

    return NextResponse.json(
      { success: true, product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[PRODUCT_CREATE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}

// ... existing code ends with the POST catch block };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Dynamic filtering block
    const whereClause: any = {
      isActive: true, // adjust to match your model's column naming conventions (e.g. isPublished)
    };

    if (category) {
      whereClause.category = category as ProductCategory;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDesc: true,
        price: true,
        category: true,
        tenantId: true,
        // ✅ CRUCIAL FIX: Return image references to the global storefront feed grid
        imageUrls: true, 
      },
    });

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error: any) {
    console.error("[PRODUCTS_FETCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}
