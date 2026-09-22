"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2, Search, Star } from "lucide-react";
import { Book } from "@/lib/types";
import PosterPlaceholder from "@/components/PosterPlaceholder";
import { deleteBookAction } from "@/lib/books-actions";

export default function AdminBooksTable({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const filtered = books.filter((b) => b.title.toLowerCase().includes(query.trim().toLowerCase()));

  const handleDelete = (slug: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}" de la biblioteca?`)) return;
    setDeletingSlug(slug);
    startTransition(async () => {
      await deleteBookAction(slug);
      setDeletingSlug(null);
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 sm:max-w-sm">
        <Search size={16} className="text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar libro..."
          className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
        {filtered.map((b) => (
          <div
            key={b.id}
            className={`flex items-center gap-4 border-b border-white/5 bg-white/[0.02] p-3 last:border-b-0 hover:bg-white/5 ${
              isPending && deletingSlug === b.slug ? "opacity-40" : ""
            }`}
          >
            <div className="h-16 w-11 shrink-0 overflow-hidden rounded">
              <PosterPlaceholder seed={b.cover} title="" iconSize={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{b.title}</p>
              <p className="flex items-center gap-2 text-xs text-white/40">
                <span>{b.authorName}</span>
                <span className="capitalize">{b.status}</span>
                {b.rating > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Star size={11} className="fill-accent text-accent" />
                    {b.rating.toFixed(1)}
                  </span>
                )}
                <span>{b.readCount.toLocaleString("es-ES")} lecturas</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/admin/libros/${b.slug}/editar`}
                aria-label="Editar"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Pencil size={16} />
              </Link>
              <button
                aria-label="Eliminar"
                disabled={isPending}
                onClick={() => handleDelete(b.slug, b.title)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-white/40">Sin resultados.</p>}
      </div>
    </div>
  );
}
