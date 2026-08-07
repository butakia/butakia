"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, Crown, LogOut, LayoutDashboard, Armchair, Heart, Users, Library } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import { useAuth } from "./AuthProvider";

export default function UserMenu() {
  const user = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        <User size={16} />
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold">
          {(user.activeProfile?.name ?? user.name).slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">
          {user.activeProfile?.name ?? user.name}
        </span>
        {user.isPremium && <Crown size={14} className="shrink-0 text-yellow-400" />}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-2xl">
          <Link
            href="/panel"
            className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10"
          >
            <Armchair size={15} />
            Mi panel
          </Link>
          <Link
            href="/mi-lista"
            className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10"
          >
            <Heart size={15} />
            Mi lista
          </Link>
          <Link
            href="/libros/colecciones"
            className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10"
          >
            <Library size={15} />
            Mis colecciones
          </Link>
          <Link
            href="/perfiles"
            className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10"
          >
            <Users size={15} />
            Cambiar perfil
          </Link>
          {!user.isPremium && (
            <Link
              href="/premium"
              className="flex items-center gap-2 px-4 py-3 text-sm text-yellow-400 hover:bg-white/10"
            >
              <Crown size={15} />
              Hazte Premium
            </Link>
          )}
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/10"
            >
              <LayoutDashboard size={15} />
              Panel admin
            </Link>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10"
            >
              <LogOut size={15} />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
