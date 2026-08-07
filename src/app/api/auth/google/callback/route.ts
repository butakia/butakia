import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { exchangeGoogleCode, fetchGoogleUserInfo, isGoogleOAuthConfigured } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const searchParams = request.nextUrl.searchParams;

  const loginError = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${reason}`);

  if (!isGoogleOAuthConfigured()) {
    return loginError("google_not_configured");
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("google_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return loginError("google_auth_failed");
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const tokens = await exchangeGoogleCode(code, redirectUri);
    const profile = await fetchGoogleUserInfo(tokens.access_token);

    if (!profile.email || !profile.email_verified) {
      return loginError("google_email_unverified");
    }

    const email = profile.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { googleId: profile.sub } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.sub, avatarUrl: user.avatarUrl ?? profile.picture ?? null },
        });
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || email.split("@")[0],
          googleId: profile.sub,
          avatarUrl: profile.picture ?? null,
          role: "user",
        },
      });
      await prisma.contributor.create({
        data: {
          name: user.name,
          avatarSeed: user.id,
          avatarUrl: profile.picture ?? null,
          uploads: 0,
          joinedAt: new Date().toISOString().slice(0, 10),
          userId: user.id,
        },
      });
    }

    await createSession(user.id, user.role as "user" | "admin");

    const response = NextResponse.redirect(
      `${origin}${user.role === "admin" ? "/admin" : "/"}`
    );
    response.cookies.delete("google_oauth_state");
    return response;
  } catch {
    return loginError("google_auth_failed");
  }
}
