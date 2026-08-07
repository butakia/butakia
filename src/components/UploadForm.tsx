"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Film, Tv, Compass, Sparkles, UploadCloud, Star, Eye } from "lucide-react";
import ImageDropzone from "./ImageDropzone";
import BlurSelect from "./BlurSelect";
import PlaybackEntriesEditor, { PlaybackEntryState, newEntryId } from "./PlaybackEntriesEditor";
import Confetti from "./Confetti";
import QuickRegisterForm from "./QuickRegisterForm";
import { submitPendingAction } from "@/lib/actions";
import { GENRE_OPTIONS, GENRE_LABEL_ES } from "@/lib/genres";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { FranchiseDef } from "@/lib/types";
import TagInput from "./TagInput";

type ContentKind = "movie" | "series" | "documentary";

function UploadPreviewCard({
  posterUrl,
  title,
  year,
  duration,
  genres,
  description,
  kind,
  seasonNumber,
  episodeNumber,
}: {
  posterUrl: string | null;
  title: string;
  year: string;
  duration: string;
  genres: string[];
  description: string;
  kind: ContentKind;
  seasonNumber: string;
  episodeNumber: string;
}) {
  return (
    <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
        <Eye size={13} />
        Así se verá
      </p>
      <div className="flex gap-3">
        <div className="aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-lg bg-black/40">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/20">
              {kind === "movie" ? (
                <Film size={24} />
              ) : kind === "series" ? (
                <Tv size={24} />
              ) : (
                <Compass size={24} />
              )}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{title || "Título del título"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-white/50">
            <span className="flex items-center gap-0.5">
              <Star size={10} className="fill-accent text-accent" />
              0.0
            </span>
            {year && <span>{year}</span>}
            {duration && <span>{duration}</span>}
            {kind === "series" && (seasonNumber || episodeNumber) && (
              <span>
                T{seasonNumber || "1"}:E{episodeNumber || "1"}
              </span>
            )}
          </div>
          {genres.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {genres.slice(0, 3).map((g) => (
                <span key={g} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                  {GENRE_LABEL_ES[g] ?? g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {description && (
        <p className="mt-3 line-clamp-3 text-xs text-white/50">{description}</p>
      )}
      <span className="mt-3 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
        Nuevo
      </span>
    </div>
  );
}

function initialEntries(): PlaybackEntryState[] {
  return [{ id: newEntryId(), languageId: "es-latino", serverName: "", playerLink: "" }];
}

export default function UploadForm({
  franchises,
  isLoggedIn,
}: {
  franchises: FranchiseDef[];
  isLoggedIn?: boolean;
}) {
  const [kind, setKind] = useState<ContentKind>("movie");
  const [title, setTitle] = useState("");
  const [entries, setEntries] = useState<PlaybackEntryState[]>(initialEntries());
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState<string[]>([]);
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [duration, setDuration] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [franchise, setFranchise] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("1");
  const [episodeNumber, setEpisodeNumber] = useState("1");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pendingId, setPendingId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const toggleGenre = (g: string) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const confirmEntry = (id: string) => setConfirmedIds((prev) => new Set(prev).add(id));
  const rejectEntry = (id: string) =>
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const filledEntries = entries.filter((e) => e.playerLink.trim().length > 0);
  const allFilledConfirmed = filledEntries.every((e) => confirmedIds.has(e.id));

  const canSubmit =
    title.trim().length > 0 &&
    Boolean(posterUrl) &&
    filledEntries.length > 0 &&
    allFilledConfirmed &&
    accepted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const effectiveGenres = kind === "documentary" && !genres.includes("Documentary")
      ? [...genres, "Documentary"]
      : genres;

    startTransition(async () => {
      const result = await submitPendingAction({
        title,
        type: kind === "series" ? "series" : "movie",
        playerLink: filledEntries[0].playerLink.trim(),
        playbackEntries: filledEntries.map((f) => ({
          id: f.id,
          languageId: f.languageId,
          serverName: f.serverName,
          playerLink: f.playerLink.trim(),
        })),
        description: description || undefined,
        posterUrl: posterUrl || undefined,
        backdropUrl: backdropUrl || undefined,
        seasonNumber: kind === "series" ? Number(seasonNumber) || 1 : undefined,
        episodeNumber: kind === "series" ? Number(episodeNumber) || 1 : undefined,
        episodeTitle: kind === "series" ? episodeTitle || undefined : undefined,
        director: director || undefined,
        cast,
        year: year ? Number(year) || undefined : undefined,
        country: country || undefined,
        duration: duration || undefined,
        genres: effectiveGenres,
        franchise: franchise || undefined,
        previewConfirmed: true,
      });
      setPendingId(result.id);
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="relative mx-auto flex max-w-lg flex-col items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <Confetti />
        <CheckCircle2 size={48} className="text-accent" />
        <h2 className="text-xl font-bold text-white">¡Gracias por tu aporte!</h2>
        <p className="text-sm text-white/60">
          <span className="font-semibold text-white">{title}</span> fue enviado y quedará{" "}
          <span className="text-accent">pendiente de revisión</span> antes de publicarse en el
          catálogo. Nuestro equipo verificará que cumpla con las normas de la comunidad.
        </p>

        {isLoggedIn ? (
          <Link
            href="/panel"
            className="mt-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Ver mi panel
          </Link>
        ) : (
          <QuickRegisterForm pendingSubmissionId={pendingId} />
        )}

        <button
          onClick={() => {
            setSubmitted(false);
            setTitle("");
            setEntries(initialEntries());
            setConfirmedIds(new Set());
            setPosterUrl(null);
            setBackdropUrl(null);
            setDescription("");
            setDirector("");
            setCast([]);
            setYear("");
            setCountry("");
            setDuration("");
            setGenres([]);
            setFranchise("");
            setSeasonNumber("1");
            setEpisodeNumber("1");
            setEpisodeTitle("");
            setAccepted(false);
            setPendingId(undefined);
          }}
          className="mt-1 text-sm text-white/50 hover:text-white hover:underline"
        >
          Subir otro título
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_260px]">
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4">
          <Sparkles size={20} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-white/80">
            Puedes subir contenido sin crear una cuenta. Si te registras, obtienes insignia de
            colaborador, prioridad de revisión y beneficios Premium.{" "}
            <Link href="/registro" className="font-semibold text-accent hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {(["movie", "series", "documentary"] as ContentKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                kind === k
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/15 text-white/60 hover:bg-white/5"
              }`}
            >
              {k === "movie" ? <Film size={16} /> : k === "series" ? <Tv size={16} /> : <Compass size={16} />}
              {k === "movie" ? "Película" : k === "series" ? "Serie" : "Documental"}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <ImageDropzone label="Portada" required onChange={setPosterUrl} />

          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/90">
                Título <span className="text-accent">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. La Odisea"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
            </div>

            {kind === "series" && (
              <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Temporada</label>
                  <input
                    value={seasonNumber}
                    onChange={(e) => setSeasonNumber(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Capítulo</label>
                  <input
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Título del capítulo</label>
                  <input
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    placeholder="Opcional"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-sm text-white focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground/90">
                Enlaces del {kind === "series" ? "capítulo" : "reproductor"}{" "}
                <span className="text-accent">*</span>
              </label>
              <p className="mb-3 text-xs text-white/40">
                Agrega el enlace por cada idioma y servidor que tengas disponible. Solo el
                Español Latino viene por defecto — el resto es opcional, la mayoría solo sube ese.
              </p>
              <PlaybackEntriesEditor
                entries={entries}
                confirmedIds={confirmedIds}
                onChange={setEntries}
                onConfirm={confirmEntry}
                onReject={rejectEntry}
              />
              <p className="mt-2 text-xs text-white/40">
                No alojamos videos: solo guardamos el enlace o código de inserción.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">
            Detalles adicionales (opcional — podemos completarlos nosotros)
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Sinopsis breve..."
                className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <ImageDropzone
                label="Imagen de fondo (backdrop)"
                aspect="aspect-video"
                onChange={setBackdropUrl}
              />
            </div>

            {[
              { label: "Director", value: director, set: setDirector, placeholder: "Ej. Christopher Nolan" },
              { label: "Año", value: year, set: setYear, placeholder: "2026" },
              { label: "Duración", value: duration, set: setDuration, placeholder: "Ej. 2h 10m" },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 block text-sm text-white/70">{f.label}</label>
                <input
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none"
                />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-sm text-white/70">Actores</label>
              <TagInput value={cast} onChange={setCast} placeholder="Nombre del actor..." />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-white/70">País</label>
              <BlurSelect
                options={COUNTRY_OPTIONS.map((c) => ({ value: c.name, label: c.name, flag: c.flag }))}
                value={country}
                onChange={setCountry}
                placeholder="Selecciona un país"
                allowEmpty
                emptyLabel="Sin especificar"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">
                ¿Pertenece a una franquicia existente?
              </label>
              <BlurSelect
                options={franchises.map((f) => ({ value: f.name, label: f.name }))}
                value={franchise}
                onChange={setFranchise}
                placeholder="Ej. Star Wars, Marvel..."
                allowEmpty
                emptyLabel="No pertenece a ninguna franquicia"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Géneros</label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      genres.includes(g)
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-white/15 text-white/50 hover:bg-white/5"
                    }`}
                  >
                    {GENRE_LABEL_ES[g] ?? g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
          />
          <span className="text-sm text-white/70">
            Declaro que este contenido es de uso público, no está protegido por derechos de autor, o
            que cuento con los derechos necesarios para compartirlo en Butakia.{" "}
            <span className="text-accent">*</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 font-semibold text-white transition-all duration-200 enabled:hover:scale-[1.01] enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <UploadCloud size={20} />
          {isPending ? "Enviando..." : "Enviar contenido"}
        </button>
      </form>

      <UploadPreviewCard
        posterUrl={posterUrl}
        title={title}
        year={year}
        duration={duration}
        genres={genres}
        description={description}
        kind={kind}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
      />
    </div>
  );
}
