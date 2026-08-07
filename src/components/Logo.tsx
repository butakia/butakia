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
      className={`group flex items-center gap-2 transition-transform duration-200 hover:scale-[1.03] active:scale-95 ${className ?? ""}`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={siteName}
          className="h-9 w-9 shrink-0 rounded-lg object-cover shadow-[0_2px_10px_-2px_rgba(229,9,20,0.6)]"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-hover shadow-[0_2px_10px_-2px_rgba(229,9,20,0.6)]">
          <Armchair size={20} className="text-white" strokeWidth={2.5} />
        </span>
      )}
      {!iconOnly && (
        <span className="flex flex-col leading-none">
          {logoUrl ? (
            <span className="text-2xl font-black tracking-tight text-white">{siteName}</span>
          ) : (
            <span className="flex items-baseline text-2xl font-black tracking-tight">
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
