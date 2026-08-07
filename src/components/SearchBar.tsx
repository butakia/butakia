"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Star } from "lucide-react";
import { Title } from "@/lib/types";
import PosterPlaceholder from "./PosterPlaceholder";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Title[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onClickOutside = (e: Event) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, []);

  const q = query.trim();

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      {open ? (
        <div
          className="absolute right-0 top-1/2 z-50 flex w-[85vw] max-w-[320px] -translate-y-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/90 px-3 py-2 backdrop-blur-md transition-all duration-200 sm:w-[280px]"
        >
          <Search size={16} className="shrink-0 text-white/50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && close()}
            placeholder="Buscar títulos, actores, géneros..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            aria-label="Cerrar búsqueda"
            onClick={close}
            className="shrink-0 text-white/50 transition-colors hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          aria-label="Buscar"
          onClick={() => setOpen(true)}
          className="rounded-full p-2 text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <Search size={20} />
        </button>
      )}

      {open && q && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-96 w-80 max-w-[85vw] overflow-y-auto rounded-xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-2xl">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-white/50">
              Sin resultados para &quot;{query}&quot;.
            </p>
          ) : (
            <div className="divide-y divide-white/10">
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={`/titulo/${r.slug}`}
                  onClick={close}
                  className="flex items-center gap-3 p-3 transition-colors hover:bg-white/10"
                >
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded">
                    <PosterPlaceholder seed={r.poster || r.slug} title="" iconSize={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{r.title}</p>
                    <p className="flex items-center gap-2 text-xs text-white/50">
                      <span className="flex items-center gap-0.5">
                        <Star size={10} className="fill-accent text-accent" />
                        {r.rating.toFixed(1)}
                      </span>
                      <span>{r.year}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
