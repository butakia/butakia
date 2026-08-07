"use client";

import { useEffect, useState, useActionState } from "react";
import Link from "next/link";
import { UserPlus, Gift, RefreshCw } from "lucide-react";
import { registerAction } from "@/lib/auth-actions";
import GoogleLoginButton from "./GoogleLoginButton";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

interface Captcha {
  imageDataUri: string;
  token: string;
}

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, undefined);
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [refCode, setRefCode] = useState("");

  const loadCaptcha = () => {
    fetch("/api/captcha")
      .then((r) => r.json())
      .then(setCaptcha)
      .catch(() => {});
  };

  useEffect(() => {
    loadCaptcha();
    setRefCode(new URLSearchParams(window.location.search).get("ref") ?? "");
  }, []);

  useEffect(() => {
    if (state?.error) loadCaptcha();
  }, [state?.error]);

  return (
    <form action={action} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <GoogleLoginButton />
      <div className="flex items-center gap-3 text-xs text-white/30">
        <span className="h-px flex-1 bg-white/10" />
        o con tu correo
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/70">Nombre de usuario</label>
        <input name="name" required className={inputCls} placeholder="Ej. CineFan99" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-white/70">Correo</label>
        <input name="email" type="email" required className={inputCls} placeholder="tu@correo.com" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-white/70">Contraseña</label>
        <input name="password" type="password" required className={inputCls} placeholder="Mínimo 6 caracteres" />
      </div>
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm text-white/70">
          <Gift size={14} className="text-accent" />
          Código de invitación (opcional)
        </label>
        <input
          name="ref"
          value={refCode}
          onChange={(e) => setRefCode(e.target.value)}
          className={inputCls}
          placeholder="Ej. A1B2C3"
          maxLength={20}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/70">Escribe el código de la imagen</label>
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
            name="captchaAnswer"
            required
            autoCapitalize="characters"
            placeholder="Código"
            className={`${inputCls} w-24`}
          />
          <input type="hidden" name="captchaToken" value={captcha?.token ?? ""} />
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

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <UserPlus size={18} />
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-white/50">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
