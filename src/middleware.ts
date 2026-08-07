import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, localeFromAcceptLanguage } from "@/lib/i18n/config";

// Runs on every request. If the visitor has never chosen a language (no cookie
// yet), infer one from their browser's Accept-Language header — this is the one
// signal every host gives us regardless of provider, unlike platform-specific
// geo headers (Vercel's `req.geo`, Cloudflare's `cf-ipcountry`) that would tie
// the feature to a specific deployment target.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const hasChosenLocale = request.cookies.has(LOCALE_COOKIE);

  if (!hasChosenLocale) {
    const detected = localeFromAcceptLanguage(request.headers.get("accept-language"));
    response.cookies.set(LOCALE_COOKIE, detected, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
