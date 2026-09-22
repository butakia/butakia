"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, RefreshCw } from "lucide-react";
import { quickRegisterAction } from "@/lib/auth-actions";

interface Captcha {
  imageDataUri: string;
  token: string;
}

export default function QuickRegisterForm({ pendingSubmissionId }: { pendingSubmissionId?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [answer, setAnswer] = useState("");
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCaptcha = () => {
    fetch("/api/captcha")
      .then((r) => r.json())
      .then(setCaptcha)
      .catch(() => {});
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha) return;
    setError(null);
    setLoading(true);
    const result = await quickRegisterAction({
      name,
      password,
      pendingSubmissionId,
      captchaAnswer: answer,
      captchaToken: captcha.token,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      setAnswer("");
      loadCaptcha();
      return;
    }
    router.push("/panel");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left"
    >
      <p className="text-center text-sm font-semibold text-white">
        Únete a la comunidad en 10 segundos
      </p>
      <p className="text-center text-xs text-white/50">
        Elige tu usuario y contraseña para entrar directo a tu panel, ver tu aporte pendiente de
        aprobación, y comentar en los libros que te interesen.
      </p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de usuario"
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Contraseña (mín. 6 caracteres)"
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
      />

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Escribe el código de la imagen</label>
        <div className="flex items-center gap-2">
          {captcha ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={captcha.imageDataUri} alt="Código de seguridad" className="h-[44px] shrink-0 rounded-lg" />
          ) : (
            <div className="flex h-[44px] w-[170px] shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs text-white/40">
              Cargando...
            </div>
          )}
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Código"
            autoCapitalize="characters"
            className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={loadCaptcha}
            aria-label="Cambiar código"
            className="shrink-0 rounded-lg border border-white/15 p-2.5 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || !name.trim() || password.length < 6 || !answer}
        className="flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40"
      >
        <UserPlus size={16} />
        {loading ? "Creando cuenta..." : "Crear cuenta y ver mi panel"}
      </button>
    </form>
  );
}
