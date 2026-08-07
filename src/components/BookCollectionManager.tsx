"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Trash2, Check, Plus, Library } from "lucide-react";
import { createCollectionAction, deleteCollectionAction, toggleBookInCollectionAction } from "@/lib/books-actions";
import { Book } from "@/lib/types";

interface CollectionData {
  id: string;
  name: string;
  bookIds: string[];
}

export default function BookCollectionManager({
  collections,
  favoriteBooks,
}: {
  collections: CollectionData[];
  favoriteBooks: Book[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await createCollectionAction(name);
      setName("");
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar esta colección?")) return;
    startTransition(async () => {
      await deleteCollectionAction(id);
      router.refresh();
    });
  };

  const handleToggleBook = (collectionId: string, bookId: string) => {
    startTransition(async () => {
      await toggleBookInCollectionAction(collectionId, bookId);
      router.refresh();
    });
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la colección (ej. Ciencia ficción favorita)"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <FolderPlus size={16} />
          Crear
        </button>
      </form>

      {collections.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/40">
          Aún no tienes colecciones. Crea una para organizar tus libros favoritos.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {collections.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="flex items-center gap-2 text-left font-semibold text-white"
                >
                  <Library size={16} className="text-accent" />
                  {c.name}
                  <span className="text-xs font-normal text-white/40">{c.bookIds.length} libros</span>
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  aria-label="Eliminar colección"
                  className="text-white/40 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {expanded === c.id && (
                <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                  {favoriteBooks.length === 0 && (
                    <p className="text-xs text-white/40">
                      Agrega libros a Mi Lista primero para poder añadirlos a una colección.
                    </p>
                  )}
                  {favoriteBooks.map((b) => {
                    const inCollection = c.bookIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        onClick={() => handleToggleBook(c.id, b.id)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                          inCollection ? "bg-accent/15 text-accent" : "text-white/70 hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate">{b.title}</span>
                        {inCollection ? <Check size={15} /> : <Plus size={15} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
