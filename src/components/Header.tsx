"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, Menu, X } from "lucide-react";
import Logo from "./Logo";
import BookHeaderSearch from "./BookHeaderSearch";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import { useAuth } from "./AuthProvider";

const CATEGORIES = [
  { label: "Inicio", href: "" },
  { label: "Cuentos", href: "/genero/Cuentos" },
  { label: "Novela", href: "/genero/Novela" },
  { label: "Poesía", href: "/genero/Poesía" },
  { label: "Ensayo", href: "/genero/Ensayo" },
  { label: "Terror", href: "/genero/Terror" },
  { label: "Ciencia Ficción", href: "/genero/Ciencia Ficción" },
  { label: "Dominio Público", href: "/genero/Dominio Público" },
  { label: "Foro", href: "/foro" },
];

export default function Header({ tagline = "Libros" }: { tagline?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuth();
  const isLoggedIn = Boolean(user);

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
      <div className="flex items-center gap-8">
        <Logo subtitle={tagline} />
        <nav className="hidden items-center gap-5 text-sm text-muted lg:flex">
          {CATEGORIES.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`whitespace-nowrap transition-colors hover:text-foreground ${
                pathname === link.href ? "font-semibold text-foreground" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4">
        <Link
          href="/publicar"
          className="hidden items-center gap-1.5 rounded-full border border-accent/50 px-3.5 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 sm:flex"
        >
          <PenLine size={15} />
          Publicar
        </Link>
        <BookHeaderSearch />
        <NotificationBell isLoggedIn={isLoggedIn} />
        <UserMenu />

        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-white/10 lg:hidden"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="absolute inset-x-0 top-full flex flex-col border-b border-border bg-background/98 p-4 backdrop-blur-md transition-all duration-150 lg:hidden">
          {CATEGORIES.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`rounded-lg px-3 py-3 text-sm ${
                pathname === link.href ? "font-semibold text-foreground" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/publicar"
            className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-accent/50 px-3.5 py-2.5 text-sm font-semibold text-accent"
          >
            <PenLine size={15} />
            Publicar libro
          </Link>
        </nav>
      )}
    </header>
  );
}
