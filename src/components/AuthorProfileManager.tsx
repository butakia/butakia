"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, BadgeCheck, Clock } from "lucide-react";
import { claimAuthorProfileAction, updateMyAuthorProfileAction } from "@/lib/books-actions";
import ImageDropzone from "@/components/ImageDropzone";
import { isRealImage } from "@/components/PosterPlaceholder";
import { Book } from "@/lib/types";

interface AuthorProfile {
  id: string;
  slug: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  trajectory: string;
  verified: boolean;
}

export default function AuthorProfileManager({
  profile,
  books,
}: {
  profile: AuthorProfile | null;
  books: Book[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    profile?.photoUrl && isRealImage(profile.photoUrl) ? profile.photoUrl : null
  );
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [trajectory, setTrajectory] = useState(profile?.trajectory ?? "");
  const [saved, setSaved] = useState(false);
  // Guards against submitting before the photo finishes uploading — saving mid-upload
  // used to persist before the real URL came back, silently dropping the photo.
  const [uploading, setUploading] = useState(false);

  if (!profile) {
    const handleClaim = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      startTransition(async () => {
        const result = await claimAuthorProfileAction(displayName);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      });
    };

    return (
      <form onSubmit={handleClaim} className="max-w-lg rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="mb-4 text-sm text-white/60">
          Reclama tu perfil de autor con el nombre exacto con el que apareces acreditado en tus
          libros. Un administrador revisará tu perfil y podrá marcarlo como{" "}
          <strong className="text-white/80">verificado</strong>.
        </p>
        <label className="mb-1.5 block text-sm text-white/70">Nombre de autor</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ej: Gabriel García Márquez"
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isPending || displayName.trim().length < 2}
          className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Reclamando..." : "Reclamar perfil de autor"}
        </button>
      </form>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateMyAuthorProfileAction({ photoUrl: photoUrl || undefined, bio, trajectory });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-white">{profile.name}</span>
          {profile.verified ? (
            <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
              <BadgeCheck size={14} />
              Verificado
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/50">
              <Clock size={14} />
              Pendiente de verificación
            </span>
          )}
        </div>
        <Link href={`/autor/${profile.slug}`} className="text-xs text-accent hover:underline">
          Ver mi página pública →
        </Link>
      </div>

      <form onSubmit={handleSave} className="max-w-lg rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-5">
          <ImageDropzone
            label="Foto de autor"
            shape="circle"
            initialUrl={photoUrl ?? undefined}
            onChange={setPhotoUrl}
            onUploadingChange={setUploading}
          />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm text-white/70">Biografía corta</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-white/70">Trayectoria</label>
          <textarea
            value={trajectory}
            onChange={(e) => setTrajectory(e.target.value)}
            rows={6}
            maxLength={3000}
            placeholder="Cuéntanos tu trayectoria como escritor: premios, publicaciones, formación, etc."
            className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <Save size={16} />
          {uploading ? "Subiendo imagen..." : isPending ? "Guardando..." : "Guardar cambios"}
        </button>
        {saved && <p className="mt-2 text-xs text-accent">Guardado correctamente.</p>}
      </form>

      <div>
        <h2 className="mb-3 font-bold text-white">Tus libros ({books.length})</h2>
        {books.length === 0 ? (
          <p className="text-sm text-white/40">Todavía no tienes libros acreditados a este nombre.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {books.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3"
              >
                <span className="truncate text-sm text-white/80">{b.title}</span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                    b.status === "published" ? "bg-accent/15 text-accent" : "bg-white/10 text-white/50"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
