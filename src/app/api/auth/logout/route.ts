import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookieOptions, SESSION_COOKIE } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

// `request` is required now: the cookie has to be cleared with the same Domain
// and Secure attributes it was set with, or the browser keeps it and the user
// appears to stay logged in.
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", clearSessionCookieOptions(request));
  return response;
}
