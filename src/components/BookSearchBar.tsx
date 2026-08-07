"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Book } from "@/lib/types";
import BookCard from "./BookCard";

export default function BookSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const q = query.trim();

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search/books?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-3 sm:max-w-lg">
        <Search size={17} className="shrink-0 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, autor, editorial, ISBN, etiqueta..."
          className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        {query && (
          <button aria-label="Limpiar búsqueda" onClick={() => setQuery("")} className="shrink-0 text-white/40 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {q && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-white/50">
            {loading ? "Buscando..." : `${results.length} resultado(s) para "${query}"`}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {results.map((b) => (
              <BookCard key={b.id} item={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
