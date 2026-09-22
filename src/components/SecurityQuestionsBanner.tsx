"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, X, Save } from "lucide-react";
import { setSecurityQuestionsAction } from "@/lib/auth-actions";

const SUGGESTED_QUESTIONS = [
  "¿Cuál era el nombre de tu primera mascota?",
  "¿En qué ciudad naciste?",
  "¿Cuál es tu libro favorito?",
  "¿Cuál era el nombre de tu escuela primaria?",
];

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function SecurityQuestionsBanner() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [question1, setQuestion1] = useState(SUGGESTED_QUESTIONS[0]);
  const [answer1, setAnswer1] = useState("");
  const [question2, setQuestion2] = useState(SUGGESTED_QUESTIONS[1]);
  const [answer2, setAnswer2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (dismissed || saved) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await setSecurityQuestionsAction({ question1, answer1, question2, answer2 });
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  if (!open) {
    return (
      <div className="mb-6 flex flex-col items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-semibold text-white">Configura tu recuperación de cuenta</p>
            <p className="text-xs text-white/50">
              Añade dos preguntas de seguridad para poder recuperar tu contraseña si la olvidas.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
          >
            Configurar ahora
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Cerrar"
            className="rounded-lg border border-white/15 p-2 text-white/50 hover:bg-white/10"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck size={16} className="text-accent" />
          Preguntas de seguridad
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
          className="text-white/40 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Pregunta 1</label>
          <select
            value={question1}
            onChange={(e) => setQuestion1(e.target.value)}
            className={inputCls}
          >
            {SUGGESTED_QUESTIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          <input
            value={answer1}
            onChange={(e) => setAnswer1(e.target.value)}
            placeholder="Tu respuesta"
            className={`${inputCls} mt-2`}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Pregunta 2</label>
          <select
            value={question2}
            onChange={(e) => setQuestion2(e.target.value)}
            className={inputCls}
          >
            {SUGGESTED_QUESTIONS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          <input
            value={answer2}
            onChange={(e) => setAnswer2(e.target.value)}
            placeholder="Tu respuesta"
            className={`${inputCls} mt-2`}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-fit items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <Save size={15} />
        {isPending ? "Guardando..." : "Guardar preguntas"}
      </button>
    </form>
  );
}
