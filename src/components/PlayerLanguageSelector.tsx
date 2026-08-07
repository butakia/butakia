"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Play, Server as ServerIcon, Upload } from "lucide-react";
import { PlaybackLanguage, PlaybackServer } from "@/lib/types";

export default function PlayerLanguageSelector({
  languages,
  activeLanguageId,
  activeServerId,
  onSelect,
}: {
  languages: PlaybackLanguage[];
  activeLanguageId: string;
  activeServerId: string;
  onSelect: (languageId: string, server: PlaybackServer) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  // On mobile, showing all languages stacked full-width ate a lot of vertical space
  // before the player even started — collapsed by default there, showing only the
  // active language/server plus a toggle to reveal the rest. Desktop is unaffected
  // (row layout, not collapsed).
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: Event) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:gap-3"
    >
      {languages.map((lang) => {
        const isActive = lang.id === activeLanguageId;
        const isOpen = openId === lang.id;
        const isAvailable = lang.servers.length > 0;
        const hiddenOnMobile = !expanded && !isActive;
        return (
          <div key={lang.id} className={`relative w-full sm:w-auto ${hiddenOnMobile ? "hidden sm:block" : ""}`}>
            <button
              onClick={() => setOpenId(isOpen ? null : lang.id)}
              className={`flex min-h-[3rem] w-full items-center gap-2.5 rounded-xl border px-4 py-2.5 text-left backdrop-blur-md transition-all duration-200 active:scale-[0.98] sm:w-auto sm:hover:scale-[1.02] ${
                isActive
                  ? "border-accent/60 bg-accent/15 shadow-[0_0_0_1px_rgba(229,9,20,0.3),0_8px_24px_-8px_rgba(229,9,20,0.5)]"
                  : isAvailable
                    ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    : "border-white/5 bg-white/[0.02] opacity-60 hover:opacity-90"
              }`}
            >
              <span
                className={`flex h-6 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tracking-wide ${
                  isActive ? "bg-accent text-white" : "bg-white/10 text-white/70"
                }`}
              >
                {lang.flag}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-white">{lang.label}</span>
                {!isAvailable ? (
                  <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-accent/80">
                    <Upload size={9} />
                    Súbela tú
                  </span>
                ) : (
                  lang.badge && (
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wide ${
                        isActive ? "text-accent" : "text-white/50"
                      }`}
                    >
                      {lang.badge}
                    </span>
                  )
                )}
              </span>
              <ChevronDown
                size={16}
                className={`ml-1 shrink-0 text-white/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="relative z-50 mt-2 w-full animate-[fadeIn_0.15s_ease-out] overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-2xl sm:absolute sm:left-0 sm:top-[calc(100%+8px)] sm:mt-0 sm:w-72">
                {!isAvailable ? (
                  <div className="p-4">
                    <p className="text-sm text-white/70">
                      Esta película no se encuentra en este idioma.
                    </p>
                    <Link
                      href="/subir"
                      onClick={() => setOpenId(null)}
                      className="mt-3 flex min-h-[2.75rem] items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-white transition-transform active:scale-95 sm:hover:scale-105"
                    >
                      <Upload size={13} />
                      Súbela a Butakia y genera ingresos
                    </Link>
                  </div>
                ) : (
                  <div className="max-h-72 divide-y divide-white/10 overflow-y-auto">
                    {lang.servers.map((server) => {
                      const isServerActive = isActive && server.id === activeServerId;
                      return (
                        <div
                          key={server.id}
                          className="flex min-h-[3.25rem] items-center justify-between gap-3 p-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <ServerIcon size={15} className="shrink-0 text-white/40" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {server.name}
                              </p>
                              {server.quality && (
                                <p className="text-[11px] text-white/50">{server.quality}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              onSelect(lang.id, server);
                              setOpenId(null);
                            }}
                            className={`flex min-h-[2.25rem] shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-150 active:scale-95 sm:hover:scale-105 ${
                              isServerActive
                                ? "bg-accent text-white"
                                : "bg-white/10 text-white hover:bg-accent hover:text-white"
                            }`}
                          >
                            <Play size={11} className="fill-current" />
                            {isServerActive ? "Activo" : "Ver"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!expanded && languages.length > 1 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex min-h-[2.75rem] w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 active:scale-[0.98] sm:hidden"
        >
          Ver más idiomas y servidores
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}
