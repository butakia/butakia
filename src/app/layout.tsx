import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RouteLoadingOverlay from "@/components/RouteLoadingOverlay";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { LocaleProvider } from "@/components/LocaleProvider";
import AdPopupLoader from "@/components/ads/AdPopupLoader";
import VisitTracker from "@/components/VisitTracker";
import { SITE_URL } from "@/lib/constants";
import { getCurrentUser, getActiveProfile } from "@/lib/dal";
import { getSiteSettings } from "@/lib/data";
import { LOCALE_COOKIE, LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${settings.siteName} — Ver Películas y Series Online Gratis`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription,
    keywords: [
      "ver películas online gratis",
      "ver series online gratis",
      "películas en español latino",
      "series en español latino",
      settings.siteName.toLowerCase(),
    ],
    openGraph: {
      siteName: settings.siteName,
      type: "website",
      locale: "es_LA",
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: settings.faviconUrl
      ? { icon: settings.faviconUrl, shortcut: settings.faviconUrl, apple: settings.faviconUrl }
      : undefined,
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Butakia",
  url: SITE_URL,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, activeProfile, settings, cookieStore] = await Promise.all([
    getCurrentUser(),
    getActiveProfile(),
    getSiteSettings(),
    cookies(),
  ]);
  // Independent from premiumEnabled — disabling the Premium *tier* shouldn't also
  // silently kill ad revenue from everyone else; they're unrelated levers.
  const showAds = settings.adsEnabled && !user?.isPremium;

  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = (LOCALES as readonly string[]).includes(cookieLocale ?? "")
    ? (cookieLocale as Locale)
    : DEFAULT_LOCALE;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={
        {
          ...(settings.accentColor !== "#e50914" ? { "--accent": settings.accentColor } : {}),
          ...(settings.secondaryColor !== "#161616" ? { "--accent-hover": settings.secondaryColor } : {}),
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AuthProvider
          user={
            user
              ? {
                  id: user.id,
                  name: user.name,
                  role: user.role as "user" | "admin",
                  isPremium: user.isPremium,
                  activeProfile: activeProfile
                    ? { id: activeProfile.id, name: activeProfile.name, avatarSeed: activeProfile.avatarSeed }
                    : null,
                }
              : null
          }
        >
          <SiteSettingsProvider
            settings={{
              fakeVisitorsEnabled: settings.fakeVisitorsEnabled,
              fakeVisitorsMin: settings.fakeVisitorsMin,
              fakeVisitorsMax: settings.fakeVisitorsMax,
              logoUrl: settings.logoUrl,
              siteName: settings.siteName,
              socialFacebook: settings.socialFacebook,
              socialInstagram: settings.socialInstagram,
              socialTwitter: settings.socialTwitter,
              socialYoutube: settings.socialYoutube,
              socialTiktok: settings.socialTiktok,
              socialWhatsapp: settings.socialWhatsapp,
              footerText: settings.footerText,
              contactEmail: settings.contactEmail,
              contactPhone: settings.contactPhone,
              bannerUrl: settings.bannerUrl,
              bannerLink: settings.bannerLink,
              bannerEnabled: settings.bannerEnabled,
            }}
          >
            <LocaleProvider locale={locale}>
              <RouteLoadingOverlay />
              <AdPopupLoader showAds={showAds} />
              <VisitTracker />
              {children}
            </LocaleProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
