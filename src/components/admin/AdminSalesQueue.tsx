"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, DollarSign, Send } from "lucide-react";
import { updateSaleValidationStatusAction, recordManualSaleAction, SaleValidationStatus } from "@/lib/books-actions";

const STATUS_OPTIONS: { value: SaleValidationStatus; label: string }[] = [
  { value: "pending", label: "Pendiente de validación" },
  { value: "in_review", label: "En revisión" },
  { value: "info_requested", label: "Información adicional requerida" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
  { value: "suspended", label: "Suspendido" },
];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-500",
  in_review: "bg-blue-500/15 text-blue-400",
  info_requested: "bg-orange-500/15 text-orange-400",
  approved: "bg-accent/15 text-accent",
  rejected: "bg-red-500/15 text-red-400",
  suspended: "bg-white/10 text-white/50",
};

interface SaleInfoItem {
  id: string;
  bookId: string;
  priceUsd: number | null;
  phoneNumber: string | null;
  validationStatus: string;
  adminObservations: { id: string; note: string; adminName: string; createdAt: string }[];
  book: { title: string; slug: string; authorName: string };
}

export default function AdminSalesQueue({ items }: { items: SaleInfoItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [buyerEmail, setBuyerEmail] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
        No hay solicitudes de venta.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((s) => (
        <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href={`/libros/${s.book.slug}`} className="font-semibold text-white hover:underline">
                {s.book.title}
              </Link>
              <p className="text-xs text-white/50">{s.book.authorName}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-white/70">
                <DollarSign size={13} className="text-accent" />
                {s.priceUsd?.toFixed(2) ?? "—"} USD
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_COLOR[s.validationStatus]}`}>
              {STATUS_OPTIONS.find((o) => o.value === s.validationStatus)?.label ?? s.validationStatus}
            </span>
          </div>

          {s.phoneNumber && (
            <a
              href={`https://wa.me/${s.phoneNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-500/30 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/10"
            >
              <MessageCircle size={13} />
              Contactar por WhatsApp ({s.phoneNumber})
            </a>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select
              defaultValue={s.validationStatus}
              disabled={isPending}
              onChange={(e) =>
                startTransition(() =>
                  updateSaleValidationStatusAction(s.id, e.target.value as SaleValidationStatus, notes[s.id])
                )
              }
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-accent focus:outline-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-zinc-900">
                  {o.label}
                </option>
              ))}
            </select>
            <input
              value={notes[s.id] ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
              placeholder="Observación (opcional, se guarda al cambiar el estado)"
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
            />
          </div>

          {s.adminObservations.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5 border-t border-white/10 pt-3">
              {s.adminObservations.map((o) => (
                <p key={o.id} className="text-xs text-white/50">
                  <span className="font-semibold text-white/70">{o.adminName}</span> — {o.note}{" "}
                  <span className="text-white/30">({new Date(o.createdAt).toLocaleDateString("es-ES")})</span>
                </p>
              ))}
            </div>
          )}

          {s.validationStatus === "approved" && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              <input
                value={buyerEmail[s.id] ?? ""}
                onChange={(e) => setBuyerEmail((prev) => ({ ...prev, [s.id]: e.target.value }))}
                placeholder="Correo del comprador (pago confirmado externamente)"
                className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
              <button
                disabled={isPending || !buyerEmail[s.id] || !s.priceUsd}
                onClick={() =>
                  startTransition(async () => {
                    await recordManualSaleAction(s.bookId, buyerEmail[s.id], s.priceUsd!);
                    setBuyerEmail((prev) => ({ ...prev, [s.id]: "" }));
                  })
                }
                className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                <Send size={13} />
                Registrar venta manual
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
