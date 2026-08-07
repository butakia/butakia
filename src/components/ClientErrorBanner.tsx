"use client";

import { useEffect, useState } from "react";

interface CaughtError {
  message: string;
  source?: string;
}

export default function ClientErrorBanner() {
  const [errors, setErrors] = useState<CaughtError[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    setMounted(true);

    const onError = (event: ErrorEvent) => {
      setErrors((prev) => [
        ...prev,
        { message: event.message, source: `${event.filename}:${event.lineno}:${event.colno}` },
      ]);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
      setErrors((prev) => [...prev, { message: `Promesa rechazada: ${message}` }]);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setTapCount((c) => c + 1)}
        aria-label="Diagnóstico"
        className={`fixed bottom-3 left-3 z-[9999] flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold shadow-lg ${
          mounted ? "bg-green-600 text-white" : "bg-zinc-700 text-white/70"
        }`}
      >
        {mounted ? `JS activo ✓${tapCount > 0 ? ` · toques: ${tapCount}` : ""}` : "JS no activo"}
      </button>

      {!dismissed && errors.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[9999] max-h-[60vh] overflow-y-auto bg-red-950 p-4 text-xs text-red-100 shadow-2xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-bold">
              Se detectaron {errors.length} error{errors.length === 1 ? "" : "es"} de JavaScript. Haz una captura de esta pantalla y compártela.
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded bg-red-800 px-2 py-1 font-semibold text-white"
            >
              Cerrar
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {errors.map((e, i) => (
              <li key={i} className="rounded bg-red-900/60 p-2 font-mono">
                <p>{e.message}</p>
                {e.source && <p className="mt-1 text-red-300">{e.source}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
