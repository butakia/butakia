"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Layers } from "lucide-react";
import { Season } from "@/lib/types";
import { addSeasonAction, addEpisodeAction, deleteEpisodeAction } from "@/lib/actions";

const inputCls =
  "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function SeasonsManager({
  titleId,
  seasons,
}: {
  titleId: string;
  seasons: Season[];
}) {
  const [isPending, startTransition] = useTransition();
  const [newSeasonNumber, setNewSeasonNumber] = useState(String(seasons.length + 1));
  const [episodeForms, setEpisodeForms] = useState<
    Record<string, { number: string; title: string; playerLink: string; description: string; thumbnail: string }>
  >({});

  const getEpisodeForm = (seasonId: string) =>
    episodeForms[seasonId] ?? { number: "1", title: "", playerLink: "", description: "", thumbnail: "" };

  const setEpisodeForm = (
    seasonId: string,
    patch: Partial<{ number: string; title: string; playerLink: string; description: string; thumbnail: string }>
  ) => {
    setEpisodeForms((prev) => ({ ...prev, [seasonId]: { ...getEpisodeForm(seasonId), ...patch } }));
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Layers size={18} className="text-accent" />
        <h2 className="font-bold text-white">Temporadas y Capítulos</h2>
      </div>

      <div className="flex flex-col gap-6">
        {seasons.map((season) => {
          const form = getEpisodeForm(season.id);
          return (
            <div key={season.id} className="rounded-lg border border-white/10 p-4">
              <h3 className="mb-3 font-semibold text-white">
                Temporada {season.number}
                {season.name && season.name.trim() !== `Temporada ${season.number}` ? ` — ${season.name}` : ""}
              </h3>

              <div className="flex flex-col gap-2">
                {season.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {ep.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ep.thumbnail}
                          alt=""
                          className="h-8 w-14 shrink-0 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-white/80">
                          E{ep.number} — {ep.title}
                        </span>
                        {ep.description && (
                          <p className="truncate text-xs text-white/40">{ep.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => deleteEpisodeAction(ep.id))}
                      aria-label="Eliminar episodio"
                      className="text-white/40 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {season.episodes.length === 0 && (
                  <p className="text-xs text-white/40">Sin episodios todavía.</p>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-2">
                <input
                  value={form.number}
                  onChange={(e) => setEpisodeForm(season.id, { number: e.target.value })}
                  placeholder="N°"
                  className={`${inputCls} w-16`}
                />
                <input
                  value={form.title}
                  onChange={(e) => setEpisodeForm(season.id, { title: e.target.value })}
                  placeholder="Título del episodio"
                  className={`${inputCls} flex-1 min-w-[140px]`}
                />
                <input
                  value={form.playerLink}
                  onChange={(e) => setEpisodeForm(season.id, { playerLink: e.target.value })}
                  placeholder="Enlace del reproductor"
                  className={`${inputCls} flex-1 min-w-[160px]`}
                />
                <input
                  value={form.thumbnail}
                  onChange={(e) => setEpisodeForm(season.id, { thumbnail: e.target.value })}
                  placeholder="URL de miniatura (imagen)"
                  className={`${inputCls} flex-1 min-w-[160px]`}
                />
                <input
                  value={form.description}
                  onChange={(e) => setEpisodeForm(season.id, { description: e.target.value })}
                  placeholder="Descripción del episodio"
                  className={`${inputCls} flex-1 min-w-[220px]`}
                />
                <button
                  type="button"
                  disabled={isPending || !form.title}
                  onClick={() =>
                    startTransition(async () => {
                      await addEpisodeAction(season.id, {
                        number: Number(form.number) || season.episodes.length + 1,
                        title: form.title,
                        playerLink: form.playerLink || undefined,
                        thumbnail: form.thumbnail || undefined,
                        description: form.description || undefined,
                      });
                      setEpisodeForm(season.id, {
                        number: "",
                        title: "",
                        playerLink: "",
                        thumbnail: "",
                        description: "",
                      });
                    })
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                >
                  <Plus size={14} />
                  Agregar episodio
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <input
          value={newSeasonNumber}
          onChange={(e) => setNewSeasonNumber(e.target.value)}
          placeholder="N° temporada"
          className={`${inputCls} w-28`}
        />
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await addSeasonAction(titleId, Number(newSeasonNumber) || seasons.length + 1);
              setNewSeasonNumber(String(seasons.length + 2));
            })
          }
          className="flex items-center gap-1.5 rounded-lg border border-accent/50 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/10"
        >
          <Plus size={14} />
          Agregar temporada
        </button>
      </div>
    </div>
  );
}
