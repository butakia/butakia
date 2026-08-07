"use client";

import { useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Trash2, AlertTriangle, EyeOff } from "lucide-react";
import { resolveBookReportAction, deleteBookReportAction, unpublishBookAction } from "@/lib/books-actions";

const REASON_LABEL: Record<string, string> = {
  not_author: "No es el autor",
  copyright: "Violación de copyright",
  illegal: "Contenido ilegal",
  spam: "Spam",
  duplicate: "Duplicado",
  offensive: "Contenido ofensivo",
};

interface BookReportItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  reason: string;
  message?: string;
  status: string;
  createdAt: string;
}

export default function AdminBookReportsList({ reports }: { reports: BookReportItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
        No hay reportes de libros. 🎉
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((r) => (
        <div
          key={r.id}
          className={`rounded-xl border p-4 ${
            r.status === "resolved" ? "border-white/5 bg-white/[0.02] opacity-60" : "border-red-500/20 bg-red-500/5"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className={r.status === "open" ? "text-red-400" : "text-white/30"} />
                <Link href={`/libros/${r.bookSlug}`} className="font-semibold text-white hover:underline">
                  {r.bookTitle}
                </Link>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/60">
                  {REASON_LABEL[r.reason] ?? r.reason}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    r.status === "open" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/40"
                  }`}
                >
                  {r.status === "open" ? "Abierto" : "Resuelto"}
                </span>
              </div>
              {r.message && <p className="mt-1.5 text-sm text-white/60">{r.message}</p>}
              <p className="mt-1 text-xs text-white/40">{new Date(r.createdAt).toLocaleString("es-ES")}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                disabled={isPending}
                onClick={() => startTransition(() => unpublishBookAction(r.bookId))}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
              >
                <EyeOff size={14} />
                Despublicar
              </button>
              {r.status === "open" && (
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => resolveBookReportAction(r.id))}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  Marcar resuelto
                </button>
              )}
              <button
                disabled={isPending}
                onClick={() => startTransition(() => deleteBookReportAction(r.id))}
                aria-label="Eliminar reporte"
                className="text-white/40 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
