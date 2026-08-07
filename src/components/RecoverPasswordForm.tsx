"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { getSecurityQuestionsAction, resetPasswordWithAnswersAction } from "@/lib/auth-actions";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function RecoverPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "answers" | "done">("email");
  const [email, setEmail] = useState("");
  const [question1, setQuestion1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await getSecurityQuestionsAction(email);
      if (result.error) {
        setError(result.error);
        return;
      }
      setQuestion1(result.question1!);
      setQuestion2(result.question2!);
      setStep("answers");
    });
  };

  const handleAnswersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await resetPasswordWithAnswersAction({ email, answer1, answer2, newPassword });
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep("done");
      setTimeout(() => router.push("/login"), 2000);
    });
  };

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
        <CheckCircle2 size={24} className="text-accent" />
        <p className="font-semibold text-white">¡Contraseña actualizada!</p>
        <p className="text-sm text-white/50">Te llevaremos al inicio de sesión...</p>
      </div>
    );
  }

  if (step === "answers") {
    return (
      <form onSubmit={handleAnswersSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm text-white/70">{question1}</label>
          <input
            value={answer1}
            onChange={(e) => setAnswer1(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-white/70">{question2}</label>
          <input
            value={answer2}
            onChange={(e) => setAnswer2(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-white/70">Nueva contraseña</label>
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            required
            placeholder="Mínimo 6 caracteres"
            className={inputCls}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <KeyRound size={18} />
          {isPending ? "Verificando..." : "Cambiar contraseña"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm text-white/70">Correo de tu cuenta</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="tu@correo.com"
          className={inputCls}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {isPending ? "Buscando..." : "Continuar"}
      </button>

      <p className="text-center text-sm text-white/50">
        <Link href="/login" className="text-accent hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
