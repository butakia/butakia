"use client";

import { useTransition } from "react";
import { ShieldCheck, ShieldOff, Shield } from "lucide-react";
import { promoteToAdminAction, demoteFromAdminAction } from "@/lib/actions";

export default function PromoteButton({
  userId,
  isAdmin,
  adminLevel,
}: {
  userId?: string;
  isAdmin?: boolean;
  adminLevel?: "full" | "partial";
}) {
  const [isPending, startTransition] = useTransition();

  if (!userId) return null;

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
            adminLevel === "full" ? "bg-accent/15 text-accent" : "bg-white/10 text-white/60"
          }`}
        >
          <Shield size={11} />
          {adminLevel === "full" ? "Admin total" : "Admin parcial"}
        </span>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => demoteFromAdminAction(userId))}
          className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          <ShieldOff size={13} />
          Quitar admin
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => promoteToAdminAction(userId, "partial"))}
        className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/20 disabled:opacity-50"
      >
        <ShieldCheck size={13} />
        Admin parcial
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => promoteToAdminAction(userId, "full"))}
        className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
      >
        <ShieldCheck size={13} />
        Admin total
      </button>
    </div>
  );
}
