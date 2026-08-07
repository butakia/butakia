"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateProfileAction } from "@/lib/actions";
import { Contributor } from "@/lib/types";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import ImageDropzone from "./ImageDropzone";
import BlurSelect from "./BlurSelect";

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function ContributorEditForm({
  contributor,
  canChangeName,
  daysUntilNameChange,
}: {
  contributor: Contributor;
  canChangeName: boolean;
  daysUntilNameChange: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(contributor.name);
  const [bio, setBio] = useState(contributor.bio ?? "");
  const [country, setCountry] = useState(contributor.country ?? "");
  const [socialLink, setSocialLink] = useState(contributor.socialLink ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(contributor.avatarUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateProfileAction({
        name,
        bio,
        country,
        socialLink,
        avatarUrl: avatarUrl ?? undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/colaboradores/${contributor.id}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4">
      <div className="flex justify-center">
        <ImageDropzone
          label="Foto de perfil"
          shape="circle"
          aspect="aspect-square"
          initialUrl={avatarUrl ?? undefined}
          onChange={setAvatarUrl}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/70">Nombre de usuario</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canChangeName}
          className={`${inputCls} disabled:cursor-not-allowed disabled:opacity-50`}
        />
        {!canChangeName && (
          <p className="mt-1 text-xs text-white/40">
            Podrás cambiar tu nombre de nuevo en {daysUntilNameChange} día(s).
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/70">Descripción</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Cuéntanos sobre ti..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/70">País (opcional)</label>
        <BlurSelect
          options={COUNTRY_OPTIONS.map((c) => ({ value: c.name, label: c.name, flag: c.flag }))}
          value={country}
          onChange={setCountry}
          placeholder="Selecciona tu país"
          allowEmpty
          emptyLabel="Prefiero no decirlo"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/70">Red social (opcional)</label>
        <input
          value={socialLink}
          onChange={(e) => setSocialLink(e.target.value)}
          placeholder="https://instagram.com/tu-usuario"
          className={inputCls}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <Save size={18} />
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
