"use client";

import { useState } from "react";
import { Sun, Moon, Coffee, ScrollText, BookOpen, Volume2, VolumeX, Bookmark, BookmarkCheck, Heart, SlidersHorizontal, X } from "lucide-react";
import { ReaderPreferenceInput } from "@/lib/books-actions";

export type ReaderPrefs = Required<
  Pick<
    ReaderPreferenceInput,
    "mode" | "theme" | "fontSize" | "lineHeight" | "fontFamily" | "textWidth" | "textAlign" | "soundEnabled"
  >
>;

const THEME_OPTIONS: { value: ReaderPrefs["theme"]; label: string; icon: typeof Sun }[] = [
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "sepia", label: "Sepia", icon: Coffee },
  { value: "light", label: "Claro", icon: Sun },
];

const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times" },
  { value: "monospace", label: "Monospace" },
];

export default function ReaderControls({
  prefs,
  onChange,
  onSaveBookmark,
  bookmarkSaved,
  favorited,
  onToggleFavorite,
}: {
  prefs: ReaderPrefs;
  onChange: (next: Partial<ReaderPrefs>) => void;
  onSaveBookmark?: () => void;
  bookmarkSaved?: boolean;
  favorited?: boolean;
  onToggleFavorite?: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-white/70 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ mode: "flip" })}
            className={`flex items-center gap-1 rounded-md px-2 py-1.5 ${prefs.mode === "flip" ? "bg-accent text-white" : "hover:bg-white/10"}`}
          >
            <BookOpen size={14} />
            Libro
          </button>
          <button
            type="button"
            onClick={() => onChange({ mode: "scroll" })}
            className={`flex items-center gap-1 rounded-md px-2 py-1.5 ${prefs.mode === "scroll" ? "bg-accent text-white" : "hover:bg-white/10"}`}
          >
            <ScrollText size={14} />
            Scroll
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="mr-0.5 text-white/50">Tema:</span>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange({ theme: t.value })}
                aria-label={t.label}
                title={t.label}
                className={`flex h-7 w-7 items-center justify-center rounded-md ${prefs.theme === t.value ? "bg-accent text-white" : "hover:bg-white/10"}`}
              >
                <t.icon size={14} />
              </button>
            ))}
          </div>
          <span className="h-5 w-px bg-white/15" />
          <button
            type="button"
            onClick={() => onChange({ soundEnabled: !prefs.soundEnabled })}
            aria-label={prefs.soundEnabled ? "Silenciar sonido de páginas" : "Activar sonido de páginas"}
            title={prefs.soundEnabled ? "Silenciar sonido de páginas" : "Activar sonido de páginas"}
            className={`flex h-7 w-7 items-center justify-center rounded-md ${prefs.soundEnabled ? "bg-accent text-white" : "hover:bg-white/10"}`}
          >
            {prefs.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
              title={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
              className={`flex h-7 w-7 items-center justify-center rounded-md ${favorited ? "bg-accent text-white" : "hover:bg-white/10"}`}
            >
              <Heart size={14} fill={favorited ? "currentColor" : "none"} />
            </button>
          )}
          {onSaveBookmark && (
            <>
              <span className="h-5 w-px bg-white/15" />
              <button
                type="button"
                onClick={onSaveBookmark}
                aria-label="Guardar progreso de lectura en esta página"
                title="Guardar progreso de lectura en esta página"
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 ${bookmarkSaved ? "bg-accent text-white" : "hover:bg-white/10"}`}
              >
                {bookmarkSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                <span>Guardar</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3">
        <div className="flex items-center gap-1.5">
          <span>Letra</span>
          <button
            type="button"
            onClick={() => onChange({ fontSize: Math.max(12, prefs.fontSize - 1) })}
            aria-label="Reducir tamaño de letra"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 font-bold text-white hover:bg-white/20"
          >
            A-
          </button>
          <span className="w-6 text-center">{prefs.fontSize}</span>
          <button
            type="button"
            onClick={() => onChange({ fontSize: Math.min(28, prefs.fontSize + 1) })}
            aria-label="Aumentar tamaño de letra"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 font-bold text-white hover:bg-white/20"
          >
            A+
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`ml-auto flex items-center gap-1.5 rounded-md px-2 py-1.5 ${showAdvanced ? "bg-accent text-white" : "hover:bg-white/10"}`}
        >
          <SlidersHorizontal size={14} />
          Opciones avanzadas
        </button>
      </div>

      {showAdvanced && (
        <div className="flex flex-col gap-3 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white/80">Visualización</span>
            <button type="button" onClick={() => setShowAdvanced(false)} aria-label="Cerrar" className="text-white/50 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span>Tipografía:</span>
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => onChange({ fontFamily: f.value })}
                style={{ fontFamily: f.value }}
                className={`rounded-md px-2 py-1 ${prefs.fontFamily === f.value ? "bg-accent text-white" : "hover:bg-white/10"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span>Ancho de página:</span>
            {(["narrow", "normal", "wide"] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onChange({ textWidth: w })}
                className={`rounded-md px-2 py-1 capitalize ${prefs.textWidth === w ? "bg-accent text-white" : "hover:bg-white/10"}`}
              >
                {w === "narrow" ? "Angosto" : w === "normal" ? "Normal" : "Ancho"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span>Alineación:</span>
            {(["left", "justify"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ textAlign: a })}
                className={`rounded-md px-2 py-1 capitalize ${prefs.textAlign === a ? "bg-accent text-white" : "hover:bg-white/10"}`}
              >
                {a === "left" ? "Izquierda" : "Justificado"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
