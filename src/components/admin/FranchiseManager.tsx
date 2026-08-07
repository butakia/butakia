"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Flame } from "lucide-react";
import { createFranchiseAction, updateFranchiseLogoAction, deleteFranchiseAction } from "@/lib/actions";
import { FranchiseDef } from "@/lib/types";
import ImageDropzone from "@/components/ImageDropzone";

export default function FranchiseManager({ franchises }: { franchises: FranchiseDef[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      await createFranchiseAction(newName);
      setNewName("");
      router.refresh();
    });
  };

  const handleLogoChange = (id: string, logoUrl: string | null) => {
    startTransition(async () => {
      await updateFranchiseLogoAction(id, logoUrl);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteFranchiseAction(id);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 text-sm font-semibold text-white/70">Nueva franquicia</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej. Star Wars"
            className="flex-1 min-w-[180px] rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending || !newName.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Plus size={15} />
            Crear
          </button>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Sube los logotipos con las mismas dimensiones (recomendado: 400×400px, PNG con fondo
          transparente) para que se vean parejos en la página de franquicias.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {franchises.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <ImageDropzone
              label=""
              aspect="aspect-square"
              initialUrl={f.logoUrl}
              onChange={(url) => handleLogoChange(f.id, url)}
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
                <Flame size={13} className="shrink-0 text-accent" />
                {f.name}
              </p>
              <button
                type="button"
                onClick={() => handleDelete(f.id)}
                disabled={isPending}
                className="mt-2 flex items-center gap-1 text-xs text-white/40 hover:text-red-400"
              >
                <Trash2 size={12} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {franchises.length === 0 && (
        <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/40">
          Aún no hay franquicias creadas.
        </p>
      )}
    </div>
  );
}
