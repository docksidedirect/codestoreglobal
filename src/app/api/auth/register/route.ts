import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await req.json();
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        email, passwordHash: await bcrypt.hash(password, 12),
        firstName, lastName, role: "MEMBER",
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
