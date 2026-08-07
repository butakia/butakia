"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { addBookCommentAction, deleteBookCommentAction } from "@/lib/books-actions";

interface BookCommentItem {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Date | string;
}

function timeAgo(iso: string | Date): string {
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

export default function BookComments({
  bookId,
  initialComments,
  isLoggedIn,
  currentUserId,
  isAdmin,
}: {
  bookId: string;
  initialComments: BookCommentItem[];
  isLoggedIn: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addBookCommentAction(bookId, message);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("");
      router.refresh();
    });
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    startTransition(async () => {
      await deleteBookCommentAction(commentId);
      router.refresh();
    });
  };

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold md:text-xl">
        <MessageCircle size={19} />
        Comentarios
        <span className="text-sm font-normal text-muted">{comments.length}</span>
      </h2>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Comparte tu opinión sobre esta obra..."
            className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <div className="flex items-center justify-between">
            {error ? (
              <p className="text-xs text-red-400">{error}</p>
            ) : (
              <span className="text-xs text-white/30">{message.length}/1000</span>
            )}
            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Send size={14} />
              Comentar
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/50">
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Inicia sesión
          </Link>{" "}
          para dejar un comentario.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {comments.map((c) => (
            <div
              key={c.id}
              className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                {c.userName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">{c.userName}</span>
                  <span className="text-xs text-white/30">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-white/70">{c.message}</p>
              </div>
              {(c.userId === currentUserId || isAdmin) && (
                <button
                  onClick={() => handleDelete(c.id)}
                  aria-label="Eliminar comentario"
                  className="shrink-0 text-white/30 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
        ))}

        {comments.length === 0 && (
          <p className="rounded-lg border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/30">
            Sé el primero en comentar.
          </p>
        )}
      </div>
    </section>
  );
}
