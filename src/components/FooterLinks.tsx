"use client";

import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import { useSiteSettings } from "./SiteSettingsProvider";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.4 3.6-6.4 3.6Z" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.6 5.82c-.9-.8-1.4-1.94-1.4-3.13h-3.14v13.44c0 1.53-1.24 2.77-2.77 2.77a2.77 2.77 0 0 1 0-5.54c.28 0 .55.04.8.12v-3.2a5.94 5.94 0 0 0-.8-.06 5.94 5.94 0 1 0 5.94 5.94V9.5a7.24 7.24 0 0 0 4.24 1.36V7.72c-1 0-1.98-.32-2.87-.9-.36-.24-.7-.52-1-.85z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.3-1.39a9.9 9.9 0 0 0 4.69 1.19h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.9-1.25-4.79-4.16-4.93-4.35-.15-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.13.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.05.17-.19.72-.83.91-1.12.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.13.07.71-.17 1.39Z" />
    </svg>
  );
}

export default function FooterLinks() {
  const { t } = useLocale();
  const settings = useSiteSettings();

  const socials = [
    { url: settings.socialFacebook, label: "Facebook", icon: <FacebookIcon /> },
    { url: settings.socialInstagram, label: "Instagram", icon: <InstagramIcon /> },
    { url: settings.socialTwitter, label: "X (Twitter)", icon: <XIcon /> },
    { url: settings.socialYoutube, label: "YouTube", icon: <YoutubeIcon /> },
    { url: settings.socialTiktok, label: "TikTok", icon: <TikTokIcon /> },
    { url: settings.socialWhatsapp, label: "WhatsApp", icon: <WhatsAppIcon /> },
  ].filter((s) => s.url);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/libros" className="hover:text-foreground">{t("footer.books")}</Link>
        <Link href="/blog" className="hover:text-foreground">{t("nav.blog")}</Link>
        <Link href="/premium" className="hover:text-foreground">{t("footer.premium")}</Link>
        <Link href="/contacto" className="hover:text-foreground">{t("footer.contact")}</Link>
        <Link href="/privacidad" className="hover:text-foreground">{t("footer.privacy")}</Link>
        <Link href="/terminos" className="hover:text-foreground">{t("footer.terms")}</Link>
        <Link href="/ayuda" className="hover:text-foreground">{t("footer.help")}</Link>
        <Link href="/creditos" className="hover:text-foreground">{t("footer.credits")}</Link>
        <LanguageSwitcher />
      </div>

      {(socials.length > 0 || settings.contactEmail || settings.contactPhone) && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted transition-colors hover:bg-accent hover:text-white"
            >
              {s.icon}
            </a>
          ))}
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
            >
              <Mail size={13} />
              {settings.contactEmail}
            </a>
          )}
          {settings.contactPhone && (
            <a
              href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
            >
              <Phone size={13} />
              {settings.contactPhone}
            </a>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-muted/70">
        {settings.footerText || `© ${new Date().getFullYear()} ${settings.siteName}. ${t("footer.rights")}`}
      </p>
    </>
  );
}
