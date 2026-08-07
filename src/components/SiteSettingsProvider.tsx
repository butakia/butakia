"use client";

import { createContext, useContext } from "react";

export interface PublicSiteSettings {
  fakeVisitorsEnabled: boolean;
  fakeVisitorsMin: number;
  fakeVisitorsMax: number;
  logoUrl?: string;
  siteName: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialTiktok?: string;
  socialWhatsapp?: string;
  footerText?: string;
  contactEmail?: string;
  contactPhone?: string;
  bannerUrl?: string;
  bannerLink?: string;
  bannerEnabled: boolean;
}

const SiteSettingsContext = createContext<PublicSiteSettings>({
  fakeVisitorsEnabled: false,
  fakeVisitorsMin: 20,
  fakeVisitorsMax: 50,
  siteName: "Butakia",
  bannerEnabled: false,
});

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: PublicSiteSettings;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): PublicSiteSettings {
  return useContext(SiteSettingsContext);
}
