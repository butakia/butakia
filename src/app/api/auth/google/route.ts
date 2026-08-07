import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/auth/google/callback`;
  const authUrl = getGoogleAuthUrl(redirectUri, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
