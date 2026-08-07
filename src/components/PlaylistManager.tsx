"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListMusic, Plus, Trash2, Pencil, X, Search, Check } from "lucide-react";
import { createPlaylistAction, updatePlaylistAction, deletePlaylistAction } from "@/lib/actions";
import { Playlist, Title } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

function PlaylistForm({
  allTitles,
  initial,
  onDone,
  onCancel,
}: {
  allTitles: Title[];
  initial?: Playlist;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [selected, setSelected] = useState<string[]>(initial?.titleIds ?? []);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTitles.slice(0, 30);
    return allTitles.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 30);
  }, [allTitles, query]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      if (initial) {
        await updatePlaylistAction(initial.id, { name, description, titleIds: selected });
      } else {
        await createPlaylistAction({ name, description, titleIds: selected });
      }
      router.refresh();
      onDone();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-accent/30 bg-white/[0.03] p-4"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de la lista (ej. Películas clásicas)"
        className={inputCls}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción breve (opcional)"
        className={inputCls}
      />

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar títulos para agregar..."
          className={`${inputCls} pl-9`}
        />
      </div>

      <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10">
        {filtered.map((t) => {
          const isSelected = selected.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-left text-sm last:border-b-0 ${
                isSelected ? "bg-accent/10 text-accent" : "text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="truncate">{t.title}</span>
              {isSelected && <Check size={14} className="shrink-0" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="p-3 text-center text-xs text-white/40">Sin resultados.</p>
        )}
      </div>

      <p className="text-xs text-white/40">{selected.length} título(s) seleccionado(s)</p>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {isPending ? "Guardando..." : initial ? "Guardar cambios" : "Crear lista"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function PlaylistManager({
  playlists,
  allTitles,
}: {
  playlists: Playlist[];
  allTitles: Title[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListMusic size={18} className="text-accent" />
          <h3 className="font-bold text-white">Mis listas de reproducción</h3>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25"
          >
            <Plus size={14} />
            Nueva lista
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-4">
          <PlaylistForm allTitles={allTitles} onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {playlists.map((p) =>
          editingId === p.id ? (
            <PlaylistForm
              key={p.id}
              allTitles={allTitles}
              initial={p}
              onDone={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3.5"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{p.name}</p>
                <p className="truncate text-xs text-white/40">
                  {p.titleIds.length} título{p.titleIds.length === 1 ? "" : "s"}
                  {p.description ? ` · ${p.description}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setEditingId(p.id)}
                  aria-label="Editar lista"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <Pencil size={14} />
                </button>
                <button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await deletePlaylistAction(p.id);
                      router.refresh();
                    })
                  }
                  aria-label="Eliminar lista"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:bg-red-500/10 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )
        )}
        {playlists.length === 0 && !creating && (
          <p className="rounded-lg border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/40">
            Aún no tienes listas. Crea una para agrupar tus recomendaciones (ej. &ldquo;Clásicas&rdquo;,
            &ldquo;Para maratonear&rdquo;).
          </p>
        )}
      </div>
    </div>
  );
}
