"use client";

import { useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Pencil } from "lucide-react";
import { EditSuggestion } from "@/lib/types";
import { approveEditSuggestionAction, rejectEditSuggestionAction } from "@/lib/actions";

export default function EditSuggestionsList({ suggestions }: { suggestions: EditSuggestion[] }) {
  const [isPending, startTransition] = useTransition();

  if (suggestions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
        No hay sugerencias pendientes. 🎉
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {suggestions.map((s) => (
        <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Pencil size={15} className="text-accent" />
                <Link href={`/titulo/${s.titleSlug}`} className="font-semibold text-white hover:underline">
                  {s.titleName}
                </Link>
              </div>
              <p className="mt-1 text-xs text-white/40">
                Sugerido por {s.submittedBy} · {s.createdAt}
              </p>

              <div className="mt-3 flex flex-col gap-1.5 text-sm">
                {s.changes.synopsis && (
                  <p>
                    <span className="text-white/40">Sinopsis: </span>
                    <span className="text-white/80">{s.changes.synopsis}</span>
                  </p>
                )}
                {s.changes.director && (
                  <p>
                    <span className="text-white/40">Director: </span>
                    <span className="text-white/80">{s.changes.director}</span>
                  </p>
                )}
                {s.changes.cast && s.changes.cast.length > 0 && (
                  <p>
                    <span className="text-white/40">Reparto: </span>
                    <span className="text-white/80">{s.changes.cast.join(", ")}</span>
                  </p>
                )}
                {s.changes.genres && s.changes.genres.length > 0 && (
                  <p>
                    <span className="text-white/40">Géneros: </span>
                    <span className="text-white/80">{s.changes.genres.join(", ")}</span>
                  </p>
                )}
                {s.changes.playerLink && (
                  <p>
                    <span className="text-white/40">Enlace: </span>
                    <span className="text-white/80">{s.changes.playerLink}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                disabled={isPending}
                onClick={() => startTransition(() => approveEditSuggestionAction(s.id))}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                Aprobar
              </button>
              <button
                disabled={isPending}
                onClick={() => startTransition(() => rejectEditSuggestionAction(s.id))}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/70 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <XCircle size={14} />
                Rechazar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
