"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Film, Tv, Save, Star, Search } from "lucide-react";
import { createTitleAction, updateTitleAction } from "@/lib/actions";
import { Title } from "@/lib/types";
import { GENRE_OPTIONS, GENRE_LABEL_ES } from "@/lib/genres";
import ImageDropzone from "@/components/ImageDropzone";
import { isRealImage } from "@/components/PosterPlaceholder";
import { FranchiseDef, Tag as TagType } from "@/lib/types";
import { SEO_TITLE_TEMPLATES } from "@/lib/seo-templates";
import TagInput from "@/components/TagInput";

const ALL_BADGES = ["new", "trending", "top10", "4k", "hd"] as const;
const BADGE_LABEL: Record<string, string> = {
  new: "Nuevo",
  trending: "Trending",
  top10: "Top 10",
  "4k": "4K",
  hd: "HD",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-white/70">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function AdminTitleForm({
  initial,
  franchises = [],
  tags: availableTags = [],
}: {
  initial?: Title;
  franchises?: FranchiseDef[];
  tags?: TagType[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<"movie" | "series">(initial?.type ?? "movie");
  const [year, setYear] = useState(String(initial?.year ?? new Date().getFullYear()));
  const [duration, setDuration] = useState(initial?.duration ?? "");
  const [rating, setRating] = useState(String(initial?.rating ?? 0));
  const [ageRating, setAgeRating] = useState(initial?.ageRating ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "");
  const [genres, setGenres] = useState(initial?.genres?.join(", ") ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [synopsis, setSynopsis] = useState(initial?.synopsis ?? "");
  const [director, setDirector] = useState(initial?.director ?? "");
  const [cast, setCast] = useState<string[]>(initial?.cast ?? []);
  const [playerLink, setPlayerLink] = useState(initial?.source?.value ?? "");
  const [trailerUrl, setTrailerUrl] = useState(initial?.trailerUrl ?? "");
  const [badges, setBadges] = useState<string[]>(initial?.badges ?? []);
  const [customTags, setCustomTags] = useState<string[]>(initial?.customTags ?? []);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [featuredOrder, setFeaturedOrder] = useState(String(initial?.featuredOrder ?? 0));
  const [poster, setPoster] = useState<string | null>(
    initial && isRealImage(initial.poster) ? initial.poster : null
  );
  const [backdrop, setBackdrop] = useState<string | null>(
    initial && isRealImage(initial.backdrop) ? initial.backdrop : null
  );
  // Guards against submitting before an image finishes uploading — the form used to
  // let "Guardar" fire mid-upload, saving before the real URL came back and silently
  // falling back to no poster at all.
  const [uploadingCount, setUploadingCount] = useState(0);
  const handleUploadingChange = (uploading: boolean) => setUploadingCount((c) => c + (uploading ? 1 : -1));
  const [trivia, setTrivia] = useState(initial?.trivia?.join("\n") ?? "");
  const [franchise, setFranchise] = useState(initial?.franchise ?? "");
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [seoKeywords, setSeoKeywords] = useState<string[]>(initial?.seoKeywords ?? []);

  const selectedGenres = genres
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const toggleBadge = (b: string) => {
    setBadges((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  };

  const toggleCustomTag = (label: string) => {
    setCustomTags((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]));
  };

  const toggleGenre = (g: string) => {
    const current = selectedGenres;
    const next = current.includes(g) ? current.filter((x) => x !== g) : [...current, g];
    setGenres(next.join(", "));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      type,
      year: Number(year) || new Date().getFullYear(),
      duration: duration || undefined,
      rating: Number(rating) || 0,
      ageRating: ageRating || undefined,
      country: country || undefined,
      language: language || undefined,
      genres: genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      tags,
      synopsis,
      director: director || undefined,
      cast,
      playerLink: playerLink || undefined,
      trailerUrl: trailerUrl || undefined,
      badges,
      customTags,
      featured,
      featuredOrder: Number(featuredOrder) || 0,
      poster: poster || undefined,
      backdrop: backdrop || undefined,
      franchise: franchise || undefined,
      trivia: trivia
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoKeywords,
    };

    startTransition(async () => {
      if (isEdit && initial) {
        await updateTitleAction(initial.slug, payload);
      } else {
        await createTitleAction(payload);
      }
      router.push("/admin/contenido");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="mb-6 flex gap-3">
        {(["movie", "series"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setType(k)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              type === k
                ? "border-accent bg-accent/15 text-accent"
                : "border-white/15 text-white/60 hover:bg-white/5"
            }`}
          >
            {k === "movie" ? <Film size={16} /> : <Tv size={16} />}
            {k === "movie" ? "Película" : "Serie"}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-6">
        <ImageDropzone
          label="Portada"
          initialUrl={poster ?? undefined}
          onChange={setPoster}
          onUploadingChange={handleUploadingChange}
        />
        <ImageDropzone
          label="Imagen de fondo"
          aspect="aspect-video"
          initialUrl={backdrop ?? undefined}
          onChange={setBackdrop}
          onUploadingChange={handleUploadingChange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Título *">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputCls}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Enlace del reproductor (embed / iframe / URL)">
            <input
              value={playerLink}
              onChange={(e) => setPlayerLink(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Enlace del tráiler (opcional, YouTube u otro)">
            <input
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={inputCls}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Sinopsis">
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        <Field label="Director">
          <input value={director} onChange={(e) => setDirector(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Actores (escribe y presiona Enter)">
          <TagInput value={cast} onChange={setCast} placeholder="Nombre del actor..." />
        </Field>
        <Field label="Año">
          <input value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Calificación (0-10)">
          <input value={rating} onChange={(e) => setRating(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Clasificación de edad">
          <input value={ageRating} onChange={(e) => setAgeRating(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Duración">
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} />
        </Field>
        <Field label="País">
          <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Idioma">
          <input value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Etiquetas (escribe y presiona Enter)">
          <TagInput value={tags} onChange={setTags} placeholder="Etiqueta..." />
        </Field>
        <Field label="Franquicia (opcional)">
          <input
            value={franchise}
            onChange={(e) => setFranchise(e.target.value)}
            list="franchise-options"
            placeholder="Ej. Star Wars"
            className={inputCls}
          />
          <datalist id="franchise-options">
            {franchises.map((f) => (
              <option key={f.id} value={f.name} />
            ))}
          </datalist>
        </Field>
        <div className="md:col-span-2">
          <Field label="Datos curiosos (uno por línea)">
            <textarea
              value={trivia}
              onChange={(e) => setTrivia(e.target.value)}
              rows={3}
              placeholder={"Ej. La escena final se rodó en una sola toma.\nEl actor principal aprendió a nadar para este papel."}
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm text-white/70">Géneros</label>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGenre(g)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedGenres.includes(g)
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/15 text-white/50 hover:bg-white/5"
              }`}
            >
              {GENRE_LABEL_ES[g] ?? g}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <Star size={15} className={featured ? "fill-accent text-accent" : "text-white/40"} />
          Destacado en el carrusel del inicio
        </label>
        {featured && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">Orden</span>
            <input
              value={featuredOrder}
              onChange={(e) => setFeaturedOrder(e.target.value)}
              className="w-16 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-center text-sm text-white focus:border-accent focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm text-white/70">Insignias</label>
        <div className="flex flex-wrap gap-2">
          {ALL_BADGES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => toggleBadge(b)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                badges.includes(b)
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/15 text-white/50 hover:bg-white/5"
              }`}
            >
              {BADGE_LABEL[b]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm text-white/70">
          Etiquetas personalizadas{" "}
          <a href="/admin/etiquetas" target="_blank" className="text-xs text-accent hover:underline">
            (crear nuevas)
          </a>
        </label>
        {availableTags.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/40">
            Aún no has creado etiquetas.{" "}
            <a href="/admin/etiquetas" target="_blank" className="text-accent hover:underline">
              Créalas aquí
            </a>{" "}
            (ej. NUEVO, 4K, RECOMENDADO, MEJOR VALORADO, CALIDAD HD) y luego asígnalas a este título.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleCustomTag(t.label)}
                style={
                  customTags.includes(t.label)
                    ? { backgroundColor: `${t.color}26`, borderColor: t.color, color: t.color }
                    : undefined
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide transition-colors ${
                  customTags.includes(t.label)
                    ? ""
                    : "border-white/15 text-white/50 hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
          <Search size={16} className="text-accent" />
          Posicionamiento en Google (SEO)
        </h3>

        <div className="mb-4">
          <p className="mb-1.5 text-xs text-white/50">Plantillas rápidas (según lo que la gente busca)</p>
          <div className="flex flex-wrap gap-2">
            {SEO_TITLE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => {
                  const t = title || "esta película";
                  setSeoTitle(tpl.build(t));
                  setSeoDescription(
                    `Mira ${t} online gratis en HD y en español latino, sin cortes ni anuncios molestos. ${
                      synopsis?.slice(0, 100) ?? ""
                    }`
                  );
                  setSeoKeywords([
                    `ver ${t} online gratis`,
                    `${t} español latino`,
                    `${t} sin anuncios`,
                    `${t} gratis en español`,
                  ]);
                }}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-accent/60 hover:text-white"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="Título para buscadores (deja vacío para usar el título automático)">
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={`Ver ${title || "..."} Gratis Online en HD (${year})`}
              className={inputCls}
            />
          </Field>
          <Field label="Descripción para buscadores (meta description)">
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              placeholder={`Mira ${title || "esta película"} online gratis en HD y sin cortes. ${synopsis?.slice(0, 80) || ""}`}
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="Palabras clave (escribe y presiona Enter)">
            <TagInput
              value={seoKeywords}
              onChange={setSeoKeywords}
              placeholder={`ver ${title || "película"} online...`}
            />
          </Field>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Estos campos controlan cómo aparece esta página en Google y al compartirla en redes
          sociales. Si los dejas vacíos, se genera un título y descripción automáticos.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending || uploadingCount > 0}
        className="mt-8 flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <Save size={18} />
        {uploadingCount > 0 ? "Subiendo imagen..." : isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear título"}
      </button>
    </form>
  );
}
