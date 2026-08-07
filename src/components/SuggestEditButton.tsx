"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, X, CheckCircle2 } from "lucide-react";
import { Title } from "@/lib/types";
import { submitEditSuggestionAction } from "@/lib/actions";
import { GENRE_OPTIONS, GENRE_LABEL_ES } from "@/lib/genres";
import TagInput from "@/components/TagInput";

export default function SuggestEditButton({
  item,
  isLoggedIn,
}: {
  item: Title;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [synopsis, setSynopsis] = useState(item.synopsis);
  const [director, setDirector] = useState(item.director ?? "");
  const [cast, setCast] = useState<string[]>(item.cast ?? []);
  const [genres, setGenres] = useState<string[]>(item.genres);
  const [playerLink, setPlayerLink] = useState(item.source?.value ?? "");
  const [isPending, startTransition] = useTransition();

  const toggleGenre = (g: string) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => setSent(false), 200);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      await submitEditSuggestionAction(item.id, {
        synopsis,
        director: director || undefined,
        cast,
        genres,
        playerLink: playerLink || undefined,
      });
      setSent(true);
    });
  };

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-all duration-200 hover:scale-105 hover:border-accent/50 hover:text-accent"
      >
        <Pencil size={16} />
        Sugerir edición
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-all duration-200 hover:scale-105 hover:border-accent/50 hover:text-accent"
      >
        <Pencil size={16} />
        Sugerir edición
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6"
          >
            <button
              aria-label="Cerrar"
              onClick={close}
              className="absolute right-3 top-3 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 size={40} className="text-accent" />
                <h3 className="font-bold text-white">¡Gracias por tu ayuda!</h3>
                <p className="text-sm text-white/60">
                  Tu sugerencia quedará pendiente de aprobación por un administrador.
                </p>
              </div>
            ) : (
              <>
                <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
                  <Pencil size={18} className="text-accent" />
                  Sugerir edición para &quot;{item.title}&quot;
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Sinopsis</label>
                    <textarea
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">Director</label>
                    <input
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">
                      Actores (escribe y presiona Enter)
                    </label>
                    <TagInput value={cast} onChange={setCast} placeholder="Nombre del actor..." />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/50">
                      Enlace del reproductor (si está caído)
                    </label>
                    <input
                      value={playerLink}
                      onChange={(e) => setPlayerLink(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs text-white/50">Géneros</label>
                    <div className="flex flex-wrap gap-1.5">
                      {GENRE_OPTIONS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGenre(g)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            genres.includes(g)
                              ? "border-accent bg-accent/15 text-accent"
                              : "border-white/15 text-white/50 hover:bg-white/5"
                          }`}
                        >
                          {GENRE_LABEL_ES[g] ?? g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="mt-5 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isPending ? "Enviando..." : "Enviar sugerencia"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
