"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { AdSlot, AdPlacement, AD_PLACEMENT_LABEL, AdSizePreset, AD_SIZE_LABEL } from "@/lib/ads-types";
import {
  createAdSlotAction,
  updateAdSlotAction,
  deleteAdSlotAction,
  toggleAdSlotActiveAction,
} from "@/lib/ads-actions";

const inputCls =
  "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

const PLACEMENTS = Object.keys(AD_PLACEMENT_LABEL) as AdPlacement[];
const SIZE_PRESETS = Object.keys(AD_SIZE_LABEL) as AdSizePreset[];

interface FormState {
  name: string;
  iframeCode: string;
  placement: AdPlacement;
  sizePreset: AdSizePreset;
  active: boolean;
  order: number;
}

const EMPTY_FORM: FormState = {
  name: "",
  iframeCode: "",
  placement: "square",
  sizePreset: "responsive",
  active: true,
  order: 0,
};

export default function AdsManager({ ads }: { ads: AdSlot[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const startCreate = () => {
    setForm({ ...EMPTY_FORM, order: ads.length });
    setEditingId(null);
    setCreating(true);
    setError(null);
  };

  const startEdit = (ad: AdSlot) => {
    setForm({
      name: ad.name,
      iframeCode: ad.iframeCode,
      placement: ad.placement,
      sizePreset: ad.sizePreset,
      active: ad.active,
      order: ad.order,
    });
    setEditingId(ad.id);
    setCreating(false);
    setError(null);
  };

  const cancel = () => {
    setCreating(false);
    setEditingId(null);
    setError(null);
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = editingId
        ? await updateAdSlotAction(editingId, form)
        : await createAdSlotAction(form);
      if (result?.error) {
        setError(result.error);
        return;
      }
      cancel();
    });
  };

  const toggle = (ad: AdSlot) => {
    startTransition(() => toggleAdSlotActiveAction(ad.id, !ad.active));
  };

  const remove = (ad: AdSlot) => {
    if (!confirm(`¿Eliminar el anuncio "${ad.name}"?`)) return;
    startTransition(() => deleteAdSlotAction(ad.id));
  };

  const showForm = creating || editingId !== null;

  return (
    <div>
      {!showForm && (
        <button
          onClick={startCreate}
          className="mb-4 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Plus size={16} />
          Nuevo anuncio
        </button>
      )}

      {showForm && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-white">{editingId ? "Editar anuncio" : "Nuevo anuncio"}</p>
            <button onClick={cancel} className="text-white/50 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nombre interno (ej. Banner AdSense home)"
            className={inputCls}
          />

          <textarea
            value={form.iframeCode}
            onChange={(e) => setForm({ ...form, iframeCode: e.target.value })}
            placeholder="Pega aquí el código <iframe>...</iframe> que te dio la red de anuncios"
            rows={5}
            className={`${inputCls} font-mono text-xs`}
          />

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={form.placement}
              onChange={(e) => setForm({ ...form, placement: e.target.value as AdPlacement })}
              className={inputCls}
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {AD_PLACEMENT_LABEL[p]}
                </option>
              ))}
            </select>

            <select
              value={form.sizePreset}
              onChange={(e) => setForm({ ...form, sizePreset: e.target.value as AdSizePreset })}
              className={inputCls}
            >
              {SIZE_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {AD_SIZE_LABEL[s]}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Activo
            </label>

            <label className="flex items-center gap-2 text-sm text-white/70">
              Orden
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
                className={`${inputCls} w-20`}
              />
            </label>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={submit}
            disabled={isPending}
            className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {editingId ? "Guardar cambios" : "Crear anuncio"}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10">
        {ads.length === 0 ? (
          <p className="p-6 text-center text-sm text-white/40">Todavía no hay anuncios configurados.</p>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center gap-3 border-b border-white/5 bg-white/[0.02] p-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{ad.name}</p>
                <p className="text-xs text-white/40">
                  {AD_PLACEMENT_LABEL[ad.placement]} · {AD_SIZE_LABEL[ad.sizePreset]} · orden {ad.order}
                </p>
              </div>
              <button
                onClick={() => toggle(ad)}
                disabled={isPending}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  ad.active ? "bg-accent/15 text-accent" : "bg-white/10 text-white/40"
                }`}
              >
                {ad.active ? "Activo" : "Inactivo"}
              </button>
              <button
                onClick={() => startEdit(ad)}
                className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
                aria-label="Editar"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => remove(ad)}
                disabled={isPending}
                className="rounded-lg p-2 text-white/50 hover:bg-red-500/10 hover:text-red-400"
                aria-label="Eliminar"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
