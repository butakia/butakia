"use client";

import { useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { approvePendingAction, rejectPendingAction } from "@/lib/actions";

export default function PendingActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => approvePendingAction(id))}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        <CheckCircle2 size={14} />
        Aprobar
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => rejectPendingAction(id))}
        className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
      >
        <XCircle size={14} />
        Rechazar
      </button>
    </div>
  );
}
