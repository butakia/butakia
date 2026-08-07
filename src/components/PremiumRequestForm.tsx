"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Crown, DollarSign, Heart, CheckCircle2, Send } from "lucide-react";
import { createPremiumRequestAction } from "@/lib/actions";

export default function PremiumRequestForm({
  isLoggedIn,
  isPremium,
  paypalLink,
  yapeNumber,
  priceMonthly,
}: {
  isLoggedIn: boolean;
  isPremium: boolean;
  paypalLink?: string;
  yapeNumber?: string;
  priceMonthly: number;
}) {
  const [method, setMethod] = useState<"paypal" | "yape">("paypal");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isPremium) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-6 text-center">
        <Crown size={24} className="text-yellow-400" />
        <p className="font-semibold text-white">Ya tienes Butakia Premium activo.</p>
        <p className="text-sm text-white/50">Gracias por apoyar el proyecto.</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-white/50">
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Inicia sesión
        </Link>{" "}
        para solicitar Butakia Premium.
      </p>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
        <CheckCircle2 size={24} className="text-accent" />
        <p className="font-semibold text-white">¡Solicitud enviada!</p>
        <p className="text-sm text-white/50">
          Un administrador confirmará tu pago y activará Premium en tu cuenta pronto.
        </p>
      </div>
    );
  }

  if (!paypalLink && !yapeNumber) {
    return (
      <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-white/50">
        Los métodos de pago aún no están configurados. Vuelve pronto.
      </p>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPremiumRequestAction(method, note);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5"
    >
      <h2 className="font-bold text-white">Hazte Premium — ${priceMonthly.toFixed(2)}/mes</h2>

      <div className="flex gap-2">
        {paypalLink && (
          <button
            type="button"
            onClick={() => setMethod("paypal")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              method === "paypal"
                ? "border-accent bg-accent/15 text-accent"
                : "border-white/15 text-white/60 hover:bg-white/5"
            }`}
          >
            <DollarSign size={15} />
            PayPal
          </button>
        )}
        {yapeNumber && (
          <button
            type="button"
            onClick={() => setMethod("yape")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              method === "yape"
                ? "border-accent bg-accent/15 text-accent"
                : "border-white/15 text-white/60 hover:bg-white/5"
            }`}
          >
            <Heart size={15} />
            Yape
          </button>
        )}
      </div>

      {method === "paypal" && paypalLink && (
        <a
          href={paypalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0070ba] px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95"
        >
          <DollarSign size={15} />
          Pagar con PayPal
        </a>
      )}
      {method === "yape" && yapeNumber && (
        <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm text-white">
          Yapea a <span className="font-bold">{yapeNumber}</span>
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-xs text-white/50">
          Nota para el administrador (opcional: referencia del pago, hora, etc.)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Ej. Pagué a las 3pm con mi cuenta terminada en 1234"
          className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <Send size={16} />
        {isPending ? "Enviando..." : "Ya pagué, notificar al admin"}
      </button>
    </form>
  );
}
