"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Title } from "@/lib/types";
import { GENRE_OPTIONS, GENRE_LABEL_ES } from "@/lib/genres";
import TitleCard from "./TitleCard";
import BlurSelect from "./BlurSelect";

type TypeFilter = "all" | "movie" | "series";
type SortOption = "recent" | "popular" | "rating" | "az";

const SORT_LABEL: Record<SortOption, string> = {
  recent: "Más recientes",
  popular: "Más vistas",
  rating: "Mejor calificadas",
  az: "A-Z",
};

export default function ExplorerClient({
  titles,
  franchises,
}: {
  titles: Title[];
  franchises: string[];
}) {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("tipo");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>(
    initialType === "movie" || initialType === "series" ? initialType : "all"
  );
  const [genre, setGenre] = useState<string>("");
  const [franchise, setFranchise] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = titles;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.director?.toLowerCase().includes(q) ||
          t.cast?.some((c) => c.toLowerCase().includes(q))
      );
    }
    if (type !== "all") result = result.filter((t) => t.type === type);
    if (genre) result = result.filter((t) => t.genres.includes(genre));
    if (franchise) result = result.filter((t) => t.franchise === franchise);

    const sorted = [...result];
    if (sort === "popular") sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else sorted.sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));

    return sorted;
  }, [titles, query, type, genre, franchise, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, director o actor..."
            className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/70 hover:bg-white/10 md:hidden"
          >
            <SlidersHorizontal size={14} />
            Filtros
          </button>

          <div className={`${showFilters ? "flex" : "hidden"} w-full flex-wrap gap-2 md:flex`}>
            {(["all", "movie", "series"] as TypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  type === t
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/15 text-white/60 hover:bg-white/5"
                }`}
              >
                {t === "all" ? "Todo" : t === "movie" ? "Películas" : "Series"}
              </button>
            ))}

            <div className="w-44">
              <BlurSelect
                options={GENRE_OPTIONS.map((g) => ({ value: g, label: GENRE_LABEL_ES[g] ?? g }))}
                value={genre}
                onChange={setGenre}
                placeholder="Todos los géneros"
                allowEmpty
                emptyLabel="Todos los géneros"
              />
            </div>

            {franchises.length > 0 && (
              <div className="w-48">
                <BlurSelect
                  options={franchises.map((f) => ({ value: f, label: f }))}
                  value={franchise}
                  onChange={setFranchise}
                  placeholder="Todas las franquicias"
                  allowEmpty
                  emptyLabel="Todas las franquicias"
                />
              </div>
            )}

            <div className="ml-auto w-44">
              <BlurSelect
                options={(Object.keys(SORT_LABEL) as SortOption[]).map((s) => ({
                  value: s,
                  label: SORT_LABEL[s],
                }))}
                value={sort}
                onChange={(v) => setSort(v as SortOption)}
                placeholder="Ordenar por"
              />
            </div>
          </div>
        </div>
      </div>

      <p className="mb-4 mt-6 text-sm text-white/40">
        {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
          No encontramos nada con esos filtros. Prueba con otra búsqueda.
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filtered.map((t) => (
            <TitleCard key={t.id} item={t} />
          ))}
        </div>
      )}
    </div>
  );
}
