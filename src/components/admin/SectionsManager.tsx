"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { HomeSection, FranchiseDef } from "@/lib/types";
import { createSectionAction, updateSectionAction, deleteSectionAction } from "@/lib/actions";
import { GENRE_OPTIONS, GENRE_LABEL_ES } from "@/lib/genres";

const inputCls =
  "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

type SectionType = "manual" | "genre" | "newest" | "similar" | "franchise";

const TYPE_LABEL: Record<SectionType, string> = {
  genre: "Por género",
  manual: "Manual (slugs)",
  newest: "Novedades",
  similar: "Porque viste...",
  franchise: "Franquicia (de culto)",
};

export default function SectionsManager({
  sections,
  allTitles,
  franchiseOptions = [],
}: {
  sections: HomeSection[];
  allTitles: { slug: string; title: string }[];
  franchiseOptions?: FranchiseDef[];
}) {
  const [isPending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<SectionType>("genre");
  const [newGenre, setNewGenre] = useState<string>(GENRE_OPTIONS[0]);
  const [newSlugs, setNewSlugs] = useState("");
  const [newBaseSlug, setNewBaseSlug] = useState(allTitles[0]?.slug ?? "");
  const [newFranchise, setNewFranchise] = useState<string>(franchiseOptions[0]?.name ?? "");

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      await createSectionAction({
        title: newTitle,
        type: newType,
        genre: newType === "genre" ? newGenre : undefined,
        baseTitleSlug: newType === "similar" ? newBaseSlug : undefined,
        franchise: newType === "franchise" ? newFranchise : undefined,
        titleSlugs:
          newType === "manual"
            ? newSlugs.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        order: sections.length,
        active: true,
      });
      setNewTitle("");
      setNewSlugs("");
    });
  };

  const toggleActive = (s: HomeSection) => {
    startTransition(() =>
      updateSectionAction(s.id, {
        title: s.title,
        type: s.type,
        genre: s.genre,
        baseTitleSlug: s.baseTitleSlug,
        franchise: s.franchise,
        titleSlugs: s.titleSlugs,
        order: s.order,
        active: !s.active,
      })
    );
  };

  const changeOrder = (s: HomeSection, order: number) => {
    startTransition(() =>
      updateSectionAction(s.id, {
        title: s.title,
        type: s.type,
        genre: s.genre,
        baseTitleSlug: s.baseTitleSlug,
        franchise: s.franchise,
        titleSlugs: s.titleSlugs,
        order,
        active: s.active,
      })
    );
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        {sections.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 border-b border-white/5 bg-white/[0.02] p-3 last:border-b-0"
          >
            <GripVertical size={16} className="shrink-0 text-white/30" />
            <input
              type="number"
              value={s.order}
              onChange={(e) => changeOrder(s, Number(e.target.value) || 0)}
              className={`${inputCls} w-16 text-center`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{s.title}</p>
              <p className="text-xs text-white/40">
                {s.type === "genre"
                  ? `Género: ${GENRE_LABEL_ES[s.genre ?? ""] ?? s.genre}`
                  : s.type === "newest"
                    ? "Novedades (más recientes)"
                    : s.type === "similar"
                      ? `Porque viste: ${s.baseTitleSlug ?? "?"}`
                      : s.type === "franchise"
                        ? `Franquicia: ${s.franchise ?? "?"}`
                        : `Manual: ${s.titleSlugs.length || "auto"} títulos`}
              </p>
            </div>
            <button
              onClick={() => toggleActive(s)}
              disabled={isPending}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                s.active ? "bg-accent/15 text-accent" : "bg-white/10 text-white/40"
              }`}
            >
              {s.active ? "Activa" : "Oculta"}
            </button>
            <button
              onClick={() => startTransition(() => deleteSectionAction(s.id))}
              disabled={isPending}
              aria-label="Eliminar sección"
              className="text-white/40 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="p-6 text-center text-sm text-white/40">Sin secciones todavía.</p>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 text-sm font-semibold text-white/70">Nueva sección</h3>
        <div className="flex flex-wrap items-end gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título de la fila"
            className={`${inputCls} flex-1 min-w-[160px]`}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as SectionType)}
            className={inputCls}
          >
            {(Object.keys(TYPE_LABEL) as SectionType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          {newType === "genre" && (
            <select value={newGenre} onChange={(e) => setNewGenre(e.target.value)} className={inputCls}>
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {GENRE_LABEL_ES[g] ?? g}
                </option>
              ))}
            </select>
          )}
          {newType === "manual" && (
            <input
              value={newSlugs}
              onChange={(e) => setNewSlugs(e.target.value)}
              placeholder="slug-1, slug-2, ..."
              className={`${inputCls} flex-1 min-w-[160px]`}
            />
          )}
          {newType === "similar" && (
            <select
              value={newBaseSlug}
              onChange={(e) => setNewBaseSlug(e.target.value)}
              className={inputCls}
            >
              {allTitles.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
          {newType === "franchise" && (
            <select
              value={newFranchise}
              onChange={(e) => setNewFranchise(e.target.value)}
              className={inputCls}
            >
              {franchiseOptions.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending || !newTitle.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Plus size={15} />
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
