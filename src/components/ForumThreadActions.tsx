"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pin, PinOff } from "lucide-react";
import { deleteForumThreadAction, togglePinForumThreadAction } from "@/lib/actions";

export default function ForumThreadActions({
  threadId,
  canDelete,
  isAdmin,
  pinned,
}: {
  threadId: string;
  canDelete: boolean;
  isAdmin: boolean;
  pinned: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!canDelete && !isAdmin) return null;

  const handleDelete = () => {
    startTransition(async () => {
      await deleteForumThreadAction(threadId);
      router.push("/foro");
    });
  };

  const handleTogglePin = () => {
    startTransition(async () => {
      await togglePinForumThreadAction(threadId);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <button
          onClick={handleTogglePin}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10"
        >
          {pinned ? <PinOff size={13} /> : <Pin size={13} />}
          {pinned ? "Desfijar" : "Fijar"}
        </button>
      )}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={13} />
          Eliminar tema
        </button>
      )}
    </div>
  );
}
