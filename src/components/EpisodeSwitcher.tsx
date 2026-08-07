"use client";

import { Play, Check, Layers } from "lucide-react";
import { Season, Episode } from "@/lib/types";
import BlurSelect from "./BlurSelect";
import PosterPlaceholder from "./PosterPlaceholder";

export default function EpisodeSwitcher({
  seasons,
  activeSeasonId,
  activeEpisodeId,
  onSelect,
  onSeasonChange,
}: {
  seasons: Season[];
  activeSeasonId: string;
  activeEpisodeId: string;
  onSelect: (season: Season, episode: Episode) => void;
  onSeasonChange?: (seasonId: string) => void;
}) {
  const currentSeason = seasons.find((s) => s.id === activeSeasonId) ?? seasons[0];

  if (!seasons.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-accent" />
          <h3 className="font-bold text-white">Episodios</h3>
        </div>

        {seasons.length > 1 && (
          <div className="w-full sm:w-56">
            <BlurSelect
              options={seasons.map((s) => {
                const isRedundantName = !s.name || s.name.trim() === `Temporada ${s.number}`;
                return {
                  value: s.id,
                  label: `Temporada ${s.number}${isRedundantName ? "" : ` — ${s.name}`}`,
                };
              })}
              value={currentSeason?.id ?? ""}
              onChange={(id) => onSeasonChange?.(id)}
            />
          </div>
        )}
      </div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
        {currentSeason?.episodes.map((ep) => {
          const isActive = currentSeason.id === activeSeasonId && ep.id === activeEpisodeId;
          return (
            <button
              key={ep.id}
              onClick={() => onSelect(currentSeason, ep)}
              className={`group relative w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border text-left transition-colors ${
                isActive
                  ? "border-accent/60 bg-accent/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface">
                {ep.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ep.thumbnail} alt={ep.title} className="h-full w-full object-cover" />
                ) : (
                  <PosterPlaceholder seed={ep.id} title={ep.title} className="rounded-none" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                  {isActive ? (
                    <Check size={22} className="text-accent" />
                  ) : (
                    <Play size={22} className="fill-white text-white" />
                  )}
                </div>
                <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  E{ep.number}
                </span>
                {isActive && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                    <Play size={10} className="fill-white text-white" />
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className={`truncate text-sm font-semibold ${isActive ? "text-accent" : "text-white/85"}`}>
                  {ep.title}
                </p>
                {ep.description ? (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/45">{ep.description}</p>
                ) : ep.duration ? (
                  <p className="mt-0.5 text-xs text-white/40">{ep.duration}</p>
                ) : null}
              </div>
            </button>
          );
        })}
        {!currentSeason?.episodes.length && (
          <p className="p-3 text-center text-xs text-white/40">
            Esta temporada aún no tiene episodios cargados.
          </p>
        )}
      </div>
    </div>
  );
}
