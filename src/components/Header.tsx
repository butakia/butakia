"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Circle, Upload, Menu, X } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import { useAuth } from "./AuthProvider";
import { useSiteSettings } from "./SiteSettingsProvider";
import { useLocale } from "./LocaleProvider";
import { useFakeVisitorCount } from "@/lib/use-fake-visitor-count";
import type { DictionaryKey } from "@/lib/i18n/dictionaries";

const LINK_KEYS: { key: DictionaryKey; href: string }[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.movies", href: "/explorar?tipo=movie" },
  { key: "nav.series", href: "/explorar?tipo=series" },
  { key: "nav.books", href: "/libros" },
  { key: "nav.franchises", href: "/franquicias" },
  { key: "nav.contributors", href: "/colaboradores" },
  { key: "nav.forum", href: "/foro" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.help", href: "/ayuda" },
];

// El logo ya enlaza al inicio, así que en el menú de escritorio omitimos "Inicio"
// para ganar espacio — en el menú móvil sí se muestra explícito.
const DESKTOP_LINK_KEYS = LINK_KEYS.filter((l) => l.key !== "nav.home");

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuth();
  const isLoggedIn = Boolean(user);
  const { fakeVisitorsEnabled, fakeVisitorsMin, fakeVisitorsMax } = useSiteSettings();
  const visitorCount = useFakeVisitorCount(fakeVisitorsMin, fakeVisitorsMax);
  const { t } = useLocale();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-colors duration-300 md:px-10 ${
        scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex min-w-0 items-center gap-5 2xl:gap-8">
        <Logo />
        <nav className="hidden min-w-0 items-center gap-2.5 text-sm text-muted xl:flex 2xl:gap-5">
          {DESKTOP_LINK_KEYS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`whitespace-nowrap transition-colors hover:text-foreground ${
                pathname === link.href ? "font-semibold text-foreground" : ""
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href="/subir"
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-accent/50 px-3.5 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 sm:flex"
        >
          <Upload size={15} className="shrink-0" />
          {t("nav.upload")}
        </Link>
        <SearchBar />
        <NotificationBell isLoggedIn={isLoggedIn} />
        <UserMenu />

        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-white/10 xl:hidden"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="absolute inset-x-0 top-full flex flex-col border-b border-border bg-background/98 p-4 backdrop-blur-md transition-all duration-150 xl:hidden">
          {LINK_KEYS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`rounded-lg px-3 py-3 text-sm ${
                pathname === link.href ? "font-semibold text-foreground" : "text-muted"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
          <Link
            href="/subir"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-accent/50 px-3.5 py-2.5 text-sm font-semibold text-accent"
          >
            <Upload size={15} />
            {t("nav.uploadContent")}
          </Link>
          {fakeVisitorsEnabled && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Circle size={8} className="fill-green-500 text-green-500 animate-pulse" />
              <span className="font-semibold text-foreground">{visitorCount}</span> {t("nav.visitorsNow")}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
