"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Tag as TagIcon } from "lucide-react";
import { createTagAction, updateTagAction, deleteTagAction } from "@/lib/actions";
import { Tag } from "@/lib/types";

const PRESET_COLORS = ["#e50914", "#f5c518", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#f97316"];

export default function TagManager({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!newLabel.trim()) return;
    startTransition(async () => {
      await createTagAction(newLabel, newColor);
      setNewLabel("");
      router.refresh();
    });
  };

  const handleColorChange = (id: string, color: string) => {
    startTransition(async () => {
      await updateTagAction(id, { color });
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteTagAction(id);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 text-sm font-semibold text-white/70">Nueva etiqueta</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Ej. NUEVO, 4K, RECOMENDADO"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 min-w-[180px] rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                  newColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : ""
                }`}
                aria-label={c}
              />
            ))}
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-7 w-8 cursor-pointer rounded-md border border-white/15 bg-white/5"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending || !newLabel.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Plus size={15} />
            Crear
          </button>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Crea cualquier etiqueta que necesites (NUEVO, RECOMENDADO, MEJOR VALORADO, etc). Luego
          podrás asignarlas a cualquier libro desde su formulario de edición.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3"
          >
            <input
              type="color"
              value={tag.color}
              onChange={(e) => handleColorChange(tag.id, e.target.value)}
              className="h-6 w-6 cursor-pointer rounded-full border-none bg-transparent"
              title="Cambiar color"
            />
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-black tracking-wide text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.label}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(tag.id)}
              disabled={isPending}
              className="text-white/30 hover:text-red-400"
              aria-label={`Eliminar ${tag.label}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/40">
          <TagIcon size={20} className="text-white/20" />
          Aún no hay etiquetas creadas.
        </p>
      )}
    </div>
  );
}
