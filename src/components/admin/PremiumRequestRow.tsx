"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approvePremiumRequestAction, rejectPremiumRequestAction } from "@/lib/actions";

interface PremiumRequestData {
  id: string;
  userName: string;
  method: string;
  note?: string;
  createdAt: string;
}

export default function PremiumRequestRow({ request }: { request: PremiumRequestData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      await approvePremiumRequestAction(request.id);
      router.refresh();
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await rejectPremiumRequestAction(request.id);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-4 border-b border-white/5 bg-white/[0.02] p-3.5 last:border-b-0 hover:bg-white/5">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white">{request.userName}</p>
        <p className="mt-0.5 text-xs text-white/40">
          Método: <span className="uppercase">{request.method}</span> ·{" "}
          {new Date(request.createdAt).toLocaleString("es-ES")}
        </p>
        {request.note && <p className="mt-1 text-sm text-white/60">&quot;{request.note}&quot;</p>}
      </div>
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
      >
        <Check size={13} />
        Aprobar
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
      >
        <X size={13} />
        Rechazar
      </button>
    </div>
  );
}
