"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { createReportAction } from "@/lib/actions";

export default function ReportButton({ titleId }: { titleId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setMessage("");
    }, 200);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      await createReportAction(titleId, message || undefined);
      setSent(true);
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/70 transition-all duration-200 hover:scale-105 hover:border-red-400/50 hover:text-red-400"
      >
        <AlertTriangle size={16} />
        Reportar servidor caído
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6"
          >
            <button
              aria-label="Cerrar"
              onClick={close}
              className="absolute right-3 top-3 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 size={40} className="text-accent" />
                <h3 className="font-bold text-white">¡Gracias por avisar!</h3>
                <p className="text-sm text-white/60">
                  Nuestro equipo revisará el enlace y lo actualizará pronto.
                </p>
              </div>
            ) : (
              <>
                <h3 className="mb-1 flex items-center gap-2 font-bold text-white">
                  <AlertTriangle size={18} className="text-red-400" />
                  Reportar problema
                </h3>
                <p className="mb-4 text-sm text-white/50">
                  ¿El servidor o enlace no funciona? Cuéntanos qué pasó para repararlo.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Ej. El servidor Hyper no carga, o el video está en otro idioma... (opcional)"
                  className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                />
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="mt-4 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isPending ? "Enviando..." : "Enviar reporte"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
