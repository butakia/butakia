"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { addForumReplyAction, deleteForumReplyAction } from "@/lib/actions";
import { ForumReply } from "@/lib/types";

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

export default function ForumReplySection({
  threadId,
  initialReplies,
  isLoggedIn,
  currentUserId,
  isAdmin,
}: {
  threadId: string;
  threadAuthorId?: string;
  initialReplies: ForumReply[];
  isLoggedIn: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [replies, setReplies] = useState(initialReplies);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setReplies(initialReplies);
  }, [initialReplies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addForumReplyAction(threadId, body);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  };

  const handleDelete = (replyId: string) => {
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
    startTransition(async () => {
      await deleteForumReplyAction(replyId);
      router.refresh();
    });
  };

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <MessageCircle size={18} />
        Respuestas
        <span className="text-sm font-normal text-white/40">{replies.length}</span>
      </h2>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={3000}
            placeholder="Escribe una respuesta..."
            className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <div className="flex items-center justify-between">
            {error ? <p className="text-xs text-red-400">{error}</p> : <span />}
            <button
              type="submit"
              disabled={isPending || !body.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Send size={14} />
              Responder
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/50">
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Inicia sesión
          </Link>{" "}
          para responder.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {replies.map((r) => (
            <div
              key={r.id}
              className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                {r.authorName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">{r.authorName}</span>
                  <span className="text-xs text-white/30">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-white/70">
                  {r.body}
                </p>
              </div>
              {(r.authorId === currentUserId || isAdmin) && (
                <button
                  onClick={() => handleDelete(r.id)}
                  aria-label="Eliminar respuesta"
                  className="shrink-0 text-white/30 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
        ))}

        {replies.length === 0 && (
          <p className="rounded-lg border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/30">
            Sé el primero en responder.
          </p>
        )}
      </div>
    </section>
  );
}
