"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { updateLiteraryAuthorAction } from "@/lib/books-actions";
import ImageDropzone from "@/components/ImageDropzone";
import { isRealImage } from "@/components/PosterPlaceholder";

export default function LiteraryAuthorForm({
  id,
  initialPhotoUrl,
  initialBio,
  initialVerified = false,
  claimedByUserName,
}: {
  id: string;
  initialPhotoUrl?: string;
  initialBio?: string;
  initialVerified?: boolean;
  claimedByUserName?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initialPhotoUrl && isRealImage(initialPhotoUrl) ? initialPhotoUrl : null
  );
  const [bio, setBio] = useState(initialBio ?? "");
  const [verified, setVerified] = useState(initialVerified);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateLiteraryAuthorAction(id, { photoUrl: photoUrl || undefined, bio: bio || undefined, verified });
      router.push("/admin/libros-autores");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      <div className="mb-6">
        <ImageDropzone label="Foto del autor" shape="circle" initialUrl={photoUrl ?? undefined} onChange={setPhotoUrl} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-white/70">Biografía</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm text-white/80">Autor verificado</span>
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
        <p className="mt-2 text-xs text-white/40">
          {claimedByUserName
            ? `Perfil reclamado por: ${claimedByUserName}. Marca esta casilla para mostrar la insignia de verificado.`
            : "Nadie ha reclamado este perfil de autor todavía — un usuario puede reclamarlo desde /libros/mi-perfil-autor."}
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <Save size={18} />
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
