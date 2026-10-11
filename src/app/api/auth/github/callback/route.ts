import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session-cookie";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
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
    NextResponse.redirect(new URL(`/${locale}/login?error=github`, request.url));

  if (!code) return fail();

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) return fail();

    // 2. Fetch GitHub profile + verified email
    const ghHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "codestoreglobal",
    };
    const profileRes = await fetch("https://api.github.com/user", { headers: ghHeaders });
    const profile = await profileRes.json();

    const emailsRes = await fetch("https://api.github.com/user/emails", { headers: ghHeaders });
    const emails: { email: string; primary: boolean; verified: boolean }[] =
      await emailsRes.json();
    const primary =
      emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified);
    const email = (primary?.email || profile.email || "").toLowerCase();
    if (!email) return fail();

    // 3. Find existing user, or create one
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const nameParts = (profile.name || profile.login || "GitHub User").split(" ");
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
          firstName: nameParts[0] || "GitHub",
          lastName: nameParts.slice(1).join(" ") || "User",
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
    console.error("[GITHUB_AUTH_ERROR]", err);
    return fail();
  }
}