import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 1. Check env vars
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "JWT_SECRET missing in environment" },
        { status: 500 }
      );
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL missing in environment" },
        { status: 500 }
      );
    }

    // 2. Parse body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // 3. Test DB connection with a lightweight query
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
    } catch (dbErr: any) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          detail: dbErr.message,
          code: dbErr.code,
          meta: dbErr.meta,
        },
        { status: 500 }
      );
    }

    // 4. Find user
    let user: any;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (findErr: any) {
      return NextResponse.json(
        {
          error: "User lookup failed",
          detail: findErr.message,
          code: findErr.code,
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials", hint: "User not found" },
        { status: 401 }
      );
    }

    // 5. Inspect user object for password field
    const userKeys = Object.keys(user);
    const passwordField =
      user.password !== undefined
        ? "password"
        : user.passwordHash !== undefined
        ? "passwordHash"
        : user.hashedPassword !== undefined
        ? "hashedPassword"
        : null;

    if (!passwordField) {
      return NextResponse.json(
        {
          error: "Password field not found on user model",
          availableFields: userKeys,
        },
        { status: 500 }
      );
    }

    // 6. Compare password
    let valid = false;
    try {
      valid = await bcrypt.compare(password, user[passwordField]);
    } catch (bcryptErr: any) {
      return NextResponse.json(
        {
          error: "Password comparison failed",
          detail: bcryptErr.message,
        },
        { status: 500 }
      );
    }

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials", hint: "Wrong password" },
        { status: 401 }
      );
    }

    // 7. Create token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(secret));

    // 8. Return success
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (unexpected: any) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        message: unexpected.message,
        stack: unexpected.stack,
      },
      { status: 500 }
    );
  }
}