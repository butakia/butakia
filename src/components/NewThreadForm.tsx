"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Send, X } from "lucide-react";
import { createForumThreadAction } from "@/lib/actions";

const CATEGORIES = [
  { id: "general", label: "General" },
  { id: "recomendaciones", label: "Recomendaciones" },
  { id: "autores", label: "Autores" },
  { id: "ayuda-lectura", label: "Ayuda de lectura" },
  { id: "debate", label: "Debate literario" },
];

export default function NewThreadForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <p className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/50">
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Inicia sesión
        </Link>{" "}
        para crear un tema en el foro.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
      >
        <Plus size={16} />
        Crear tema
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createForumThreadAction(title, body, category);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.id) {
        router.push(`/foro/${result.id}`);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80">Nuevo tema</h2>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="text-white/40 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              category === c.id
                ? "border-accent bg-accent/15 text-accent"
                : "border-white/15 text-white/50 hover:bg-white/5"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={150}
        placeholder="Título del tema"
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={3000}
        placeholder="Escribe tu mensaje..."
        className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
      />

      <div className="flex items-center justify-between">
        {error ? <p className="text-xs text-red-400">{error}</p> : <span />}
        <button
          type="submit"
          disabled={isPending || !title.trim() || !body.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          <Send size={14} />
          {isPending ? "Publicando..." : "Publicar tema"}
        </button>
      </div>
    </form>
  );
}
