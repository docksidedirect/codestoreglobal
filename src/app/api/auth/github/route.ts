import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const REDIRECT_URI = "https://codestoreglobal.com/api/auth/github/callback";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  const state = Buffer.from(JSON.stringify({ locale })).toString("base64url");

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url.toString(), 302);
}