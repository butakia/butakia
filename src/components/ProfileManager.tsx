"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Lock, X, Trash2, Shuffle, Check, Crown, Baby } from "lucide-react";
import {
  createProfileAction,
  updateViewerProfileAction,
  setProfilePinAction,
  deleteProfileAction,
  selectProfileAction,
} from "@/lib/actions";
import { Profile } from "@/lib/types";

function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

function avatarStyle(seed: string) {
  const hue = (seed.length * 37 + seed.charCodeAt(0) * 13) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue} 60% 35%), hsl(${(hue + 40) % 360} 60% 20%))`,
  };
}

function ProfileAvatar({ profile, size = 96 }: { profile: Profile; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl text-2xl font-black text-white"
      style={{ ...avatarStyle(profile.avatarSeed), width: size, height: size }}
    >
      {profile.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function ProfileManager({
  profiles,
  limit,
  isPremium,
  profilesPremiumOnly,
}: {
  profiles: Profile[];
  limit: number;
  isPremium: boolean;
  profilesPremiumOnly: boolean;
}) {
  const router = useRouter();
  const [managing, setManaging] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pinPromptId, setPinPromptId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const atLimit = profiles.length >= limit;

  const handleSelect = (profile: Profile) => {
    if (managing) return;
    setError(null);
    if (profile.hasPin) {
      setPinPromptId(profile.id);
      setPinInput("");
      return;
    }
    startTransition(async () => {
      const result = await selectProfileAction(profile.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      window.location.href = "/";
    });
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinPromptId) return;
    setError(null);
    startTransition(async () => {
      const result = await selectProfileAction(pinPromptId, pinInput);
      if (result?.error) {
        setError(result.error);
        setPinInput("");
        return;
      }
      window.location.href = "/";
    });
  };

  if (pinPromptId) {
    const profile = profiles.find((p) => p.id === pinPromptId)!;
    return (
      <div className="flex flex-col items-center gap-5">
        <ProfileAvatar profile={profile} size={120} />
        <h1 className="text-xl font-bold text-white">{profile.name}</h1>
        <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-3">
          <input
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
            type="password"
            inputMode="numeric"
            autoFocus
            placeholder="PIN de 4 dígitos"
            className={`${inputCls} w-48 text-center tracking-[0.5em]`}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending || pinInput.length !== 4}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setPinPromptId(null)}
              className="rounded-lg border border-white/15 px-5 py-2 text-sm text-white/70 hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (editingId) {
    return (
      <EditProfileForm
        profile={profiles.find((p) => p.id === editingId)!}
        onClose={() => setEditingId(null)}
        onDeleted={() => {
          setEditingId(null);
          router.refresh();
        }}
      />
    );
  }

  if (creating) {
    return (
      <CreateProfileForm
        onClose={() => setCreating(false)}
        onCreated={() => {
          setCreating(false);
          router.refresh();
        }}
        requiresPremium={profilesPremiumOnly && !isPremium && profiles.length >= 1}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-black text-white md:text-4xl">¿Quién está viendo?</h1>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap justify-center gap-5">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => (managing ? setEditingId(p.id) : handleSelect(p))}
            disabled={isPending}
            className="group flex flex-col items-center gap-2"
          >
            <div className="relative">
              <ProfileAvatar profile={p} />
              {p.isKids && !managing && (
                <span className="absolute -top-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-black">
                  <Baby size={13} />
                </span>
              )}
              {p.hasPin && !managing && (
                <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white">
                  <Lock size={11} />
                </span>
              )}
              {managing && (
                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60">
                  <Pencil size={22} className="text-white" />
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-white/80 group-hover:text-white">
              {p.name}
            </span>
          </button>
        ))}

        {!atLimit && (
          <button
            onClick={() => setCreating(true)}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-white/40 hover:border-white/40 hover:text-white/60">
              <Plus size={28} />
            </div>
            <span className="text-sm text-white/50">Agregar perfil</span>
          </button>
        )}
      </div>

      {atLimit && profilesPremiumOnly && !isPremium && (
        <p className="flex items-center gap-1.5 text-sm text-white/50">
          <Crown size={14} className="text-yellow-400" />
          Hazte{" "}
          <a href="/premium" className="text-accent hover:underline">
            Premium
          </a>{" "}
          para crear más perfiles.
        </p>
      )}

      <button
        onClick={() => setManaging((v) => !v)}
        className="rounded-lg border border-white/20 px-5 py-2 text-sm font-semibold text-white/70 hover:border-white hover:text-white"
      >
        {managing ? "Listo" : "Administrar perfiles"}
      </button>
    </div>
  );
}

function CreateProfileForm({
  onClose,
  onCreated,
  requiresPremium,
}: {
  onClose: () => void;
  onCreated: () => void;
  requiresPremium: boolean;
}) {
  const [name, setName] = useState("");
  const [seed, setSeed] = useState(randomSeed());
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [isKids, setIsKids] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createProfileAction(name, seed, usePin ? pin : undefined, isKids);
      if (result.error) {
        setError(result.error);
        return;
      }
      onCreated();
    });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <h1 className="text-2xl font-black text-white">Nuevo perfil</h1>
      <div className="relative">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-xl text-3xl font-black text-white"
          style={avatarStyle(seed)}
        >
          {name.slice(0, 2).toUpperCase() || "?"}
        </div>
        <button
          type="button"
          onClick={() => setSeed(randomSeed())}
          aria-label="Cambiar color"
          className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover"
        >
          <Shuffle size={15} />
        </button>
      </div>

      {requiresPremium ? (
        <p className="flex items-center gap-1.5 text-sm text-white/50">
          <Crown size={14} className="text-yellow-400" />
          Necesitas Butakia Premium para crear otro perfil.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            required
            placeholder="Nombre del perfil"
            className={inputCls}
          />

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Baby size={14} />
              Perfil infantil (oculta contenido para adultos)
            </span>
            <input
              type="checkbox"
              checked={isKids}
              onChange={(e) => setIsKids(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/70">
            Proteger con PIN
            <input
              type="checkbox"
              checked={usePin}
              onChange={(e) => setUsePin(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
          </label>
          {usePin && (
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              type="password"
              inputMode="numeric"
              placeholder="PIN de 4 dígitos"
              className={`${inputCls} text-center tracking-[0.4em]`}
            />
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={isPending || !name.trim() || (usePin && pin.length !== 4)}
              className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {isPending ? "Creando..." : "Crear perfil"}
            </button>
          </div>
        </form>
      )}

      <button onClick={onClose} className="text-sm text-white/50 hover:text-white">
        Cancelar
      </button>
    </div>
  );
}

function EditProfileForm({
  profile,
  onClose,
  onDeleted,
}: {
  profile: Profile;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [seed, setSeed] = useState(profile.avatarSeed);
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(profile.hasPin);
  const [isKids, setIsKids] = useState(profile.isKids);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateViewerProfileAction(profile.id, { name, avatarSeed: seed, isKids });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (usePin !== profile.hasPin || (usePin && pin.length === 4)) {
        const pinResult = await setProfilePinAction(profile.id, usePin ? pin || null : null);
        if (pinResult.error) {
          setError(pinResult.error);
          return;
        }
      }
      setSaved(true);
      setTimeout(onClose, 900);
    });
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteProfileAction(profile.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDeleted();
    });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full max-w-xs items-center justify-between">
        <h1 className="text-xl font-black text-white">Editar perfil</h1>
        <button onClick={onClose} aria-label="Cerrar" className="text-white/50 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="relative">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-xl text-3xl font-black text-white"
          style={avatarStyle(seed)}
        >
          {name.slice(0, 2).toUpperCase() || "?"}
        </div>
        <button
          type="button"
          onClick={() => setSeed(randomSeed())}
          aria-label="Cambiar color"
          className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover"
        >
          <Shuffle size={15} />
        </button>
      </div>

      <form onSubmit={handleSave} className="flex w-full max-w-xs flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          required
          className={inputCls}
        />

        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/70">
          <span className="flex items-center gap-1.5">
            <Baby size={14} />
            Perfil infantil (oculta contenido para adultos)
          </span>
          <input
            type="checkbox"
            checked={isKids}
            onChange={(e) => setIsKids(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/70">
          Proteger con PIN
          <input
            type="checkbox"
            checked={usePin}
            onChange={(e) => setUsePin(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
        {usePin && (
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            type="password"
            inputMode="numeric"
            placeholder={profile.hasPin ? "Nuevo PIN (opcional)" : "PIN de 4 dígitos"}
            className={`${inputCls} text-center tracking-[0.4em]`}
          />
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && (
          <p className="flex items-center gap-1.5 text-sm text-accent">
            <Check size={14} /> Guardado
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !name.trim() || (usePin && !profile.hasPin && pin.length !== 4)}
          className="rounded-lg bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Guardar cambios
        </button>
      </form>

      {confirmDelete ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-white/70">¿Eliminar este perfil y todo su historial?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg bg-red-500/80 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
            >
              Sí, eliminar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-white/15 px-4 py-1.5 text-xs text-white/70 hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1.5 text-sm text-red-400/80 hover:text-red-400"
        >
          <Trash2 size={14} />
          Eliminar perfil
        </button>
      )}
    </div>
  );
}
