"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { loginAction } from "@/lib/auth-actions";
import GoogleLoginButton from "./GoogleLoginButton";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

const OAUTH_ERROR_LABEL: Record<string, string> = {
  google_not_configured: "El inicio de sesión con Google no está disponible por el momento.",
  google_auth_failed: "No se pudo completar el inicio de sesión con Google. Intenta de nuevo.",
  google_email_unverified: "Tu cuenta de Google no tiene el correo verificado.",
};

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  return (
    <form action={action} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <GoogleLoginButton />
      <div className="flex items-center gap-3 text-xs text-white/30">
        <span className="h-px flex-1 bg-white/10" />
        o con tu correo
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {oauthError && (
        <p className="text-sm text-red-400">
          {OAUTH_ERROR_LABEL[oauthError] ?? "Ocurrió un error. Intenta de nuevo."}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm text-white/70">Correo</label>
        <input name="email" type="email" required className={inputCls} placeholder="tu@correo.com" />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm text-white/70">Contraseña</label>
          <Link href="/recuperar" className="text-xs text-accent hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <input name="password" type="password" required className={inputCls} placeholder="••••••••" />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <LogIn size={18} />
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-white/50">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-accent hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
