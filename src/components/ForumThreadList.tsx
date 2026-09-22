import Link from "next/link";
import { Pin, MessageCircle } from "lucide-react";
import { ForumThread } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  recomendaciones: "Recomendaciones",
  autores: "Autores",
  "ayuda-lectura": "Ayuda de lectura",
  debate: "Debate literario",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "justo ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-ES");
}

export default function ForumThreadList({ threads }: { threads: ForumThread[] }) {
  if (threads.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
        Aún no hay temas en el foro. ¡Sé el primero en crear uno!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {threads.map((t) => (
        <Link
          key={t.id}
          href={`/foro/${t.id}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {t.pinned && <Pin size={13} className="shrink-0 text-accent" />}
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                {CATEGORY_LABEL[t.category] ?? t.category}
              </span>
            </div>
            <p className="mt-1 truncate font-semibold text-white">{t.title}</p>
            <p className="mt-0.5 text-xs text-white/40">
              {t.authorName} · {timeAgo(t.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-sm text-white/50">
            <MessageCircle size={15} />
            {t.replyCount}
          </div>
        </Link>
      ))}
    </div>
  );
}
