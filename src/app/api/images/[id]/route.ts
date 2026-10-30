import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const row = await prisma.productImage
    .findUnique({ where: { id: params.id }, select: { mime: true, data: true } })
    .catch(() => null);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bytes = new Uint8Array(row.data);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}