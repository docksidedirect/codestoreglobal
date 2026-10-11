import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session-cookie";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  let locale = "en";
  try {
    if (state)
      locale =
        JSON.parse(Buffer.from(state, "base64url").toString()).locale || "en";
  } catch {}

  const fail = () =>
    NextResponse.redirect(new URL(`/${locale}/login?error=google`, request.url));

  if (!code) return fail();

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: "https://codestoreglobal.com/api/auth/google/callback",
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) return fail();

    // 2. Fetch Google profile
    const profileRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const profile = await profileRes.json();
    const email = (profile.email || "").toLowerCase();
    if (!email || !profile.email_verified) return fail();

    // 3. Find existing user, or create one
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const nameParts = (profile.name || "Google User").split(" ");
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
          firstName: profile.given_name || nameParts[0] || "Google",
          lastName: profile.family_name || nameParts.slice(1).join(" ") || "User",
          role: "MEMBER",
        },
      });
    }

    // 4. Sign the same JWT your login route uses
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // 5. Set the session cookie + go home
    const response = NextResponse.redirect(new URL(`/${locale}`, request.url));
    setSessionCookie(response, token, request);
    return response;
  } catch (err) {
    console.error("[GOOGLE_AUTH_ERROR]", err);
    return fail();
  }
}