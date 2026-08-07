"use client";

import Link from "next/link";
import { Armchair } from "lucide-react";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function Logo({
  className,
  iconOnly,
  subtitle,
}: {
  className?: string;
  iconOnly?: boolean;
  subtitle?: string;
}) {
  const { logoUrl, siteName } = useSiteSettings();

  return (
    <Link
      href={subtitle ? "/libros" : "/"}
      aria-label={`Ir al inicio de ${siteName}`}
      className={`group flex min-w-0 items-center gap-1.5 transition-transform duration-200 hover:scale-[1.03] active:scale-95 sm:gap-2 ${className ?? ""}`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={siteName}
          className="h-8 w-8 shrink-0 rounded-lg object-cover shadow-[0_2px_10px_-2px_rgba(229,9,20,0.6)] sm:h-9 sm:w-9"
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover shadow-[0_2px_10px_-2px_rgba(229,9,20,0.6)] sm:h-9 sm:w-9">
          <Armchair size={18} className="text-white sm:hidden" strokeWidth={2.5} />
          <Armchair size={20} className="hidden text-white sm:block" strokeWidth={2.5} />
        </span>
      )}
      {!iconOnly && (
        <span className="flex min-w-0 flex-col leading-none">
          {logoUrl ? (
            <span className="truncate text-lg font-black tracking-tight text-white sm:text-2xl">{siteName}</span>
          ) : (
            <span className="flex items-baseline text-lg font-black tracking-tight sm:text-2xl">
              <span className="text-white">Buta</span>
              <span className="text-accent">kia</span>
            </span>
          )}
          {subtitle && (
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
