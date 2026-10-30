import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function decode(dataUrl: string) {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(dataUrl.trim());
  if (!m) return null;
  const mime = m[1].toLowerCase();
  if (!ALLOWED.has(mime)) return null;
  const buf = Buffer.from(m[2], "base64");
  if (!buf.length || buf.length > MAX_BYTES) return null;
  return { mime, buf };
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || ""),
        { clockTolerance: 60 },
      );
    } catch {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const dataUrl = body?.dataUrl;
    if (typeof dataUrl !== "string") {
      return NextResponse.json({ success: false, error: "dataUrl is required" }, { status: 400 });
    }

    const decoded = decode(dataUrl);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid image, unsupported type, or larger than 3 MB" },
        { status: 400 },
      );
    }

    const row = await prisma.productImage.create({
      data: { mime: decoded.mime, size: decoded.buf.length, data: decoded.buf },
      select: { id: true },
    });

    return NextResponse.json({ success: true, url: `/api/images/${row.id}` });
  } catch (error) {
    console.error("image upload failed", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}