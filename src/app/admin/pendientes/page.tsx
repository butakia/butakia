import { Film, Tv, Compass, Link2, User, CheckCircle2, Eye } from "lucide-react";
import { getPendingSubmissions } from "@/lib/data";
import { PLAYBACK_LANGUAGES } from "@/lib/playbackLanguages";
import PendingActions from "@/components/admin/PendingActions";

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-white/30">{label}</p>
      <p className="truncate text-white/80">{value}</p>
    </div>
  );
}

export default async function AdminPendientesPage() {
  const pending = await getPendingSubmissions();

  return (
    <div>
      <h1 className="text-2xl font-black text-white">Pendientes de revisión</h1>
      <p className="mt-1 text-sm text-white/50">
        Contenido enviado por la comunidad esperando aprobación. {pending.length} en cola.
      </p>

      <div className="mt-6 space-y-3">
        {pending.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {p.genres?.includes("Documentary") ? (
                    <Compass size={16} className="text-white/40" />
                  ) : p.type === "movie" ? (
                    <Film size={16} className="text-white/40" />
                  ) : (
                    <Tv size={16} className="text-white/40" />
                  )}
                  <h2 className="font-bold text-white">{p.title}</h2>
                  {p.previewConfirmed && (
                    <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                      <CheckCircle2 size={11} />
                      Enlace confirmado
                    </span>
                  )}
                </div>
                {p.description && <p className="mt-1.5 text-sm text-white/60">{p.description}</p>}

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
                  <Detail label="Director" value={p.director} />
                  <Detail label="Actores" value={p.cast?.join(", ")} />
                  <Detail label="Año" value={p.year} />
                  <Detail label="Duración" value={p.duration} />
                  <Detail label="País" value={p.country} />
                  <Detail label="Idioma" value={p.language} />
                  <Detail label="Franquicia" value={p.franchise} />
                  <Detail label="Géneros" value={p.genres?.join(", ")} />
                  {p.type === "series" && (
                    <Detail
                      label="Episodio"
                      value={`T${p.seasonNumber ?? 1}:E${p.episodeNumber ?? 1}${p.episodeTitle ? ` — ${p.episodeTitle}` : ""}`}
                    />
                  )}
                </div>

                {(p.posterUrl || p.backdropUrl) && (
                  <div className="mt-3 flex gap-2">
                    {p.posterUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.posterUrl}
                        alt="Portada"
                        className="h-20 w-14 rounded border border-white/10 object-cover"
                      />
                    )}
                    {p.backdropUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.backdropUrl}
                        alt="Backdrop"
                        className="h-20 w-32 rounded border border-white/10 object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <User size={12} /> {p.submittedBy}
                  </span>
                  <span>{p.submittedAt}</span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {(p.playbackEntries?.length
                    ? p.playbackEntries
                    : [{ id: "legacy", languageId: "es-latino", serverName: "Servidor", playerLink: p.playerLink }]
                  ).map((entry) => {
                    const lang = PLAYBACK_LANGUAGES.find((l) => l.id === entry.languageId);
                    return (
                      <details key={entry.id} className="group rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                        <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-2 text-xs">
                          <span className="flex items-center gap-1.5 font-semibold text-white/80">
                            <span>{lang?.flag ?? "🌐"}</span>
                            {lang?.label ?? entry.languageId}
                            <span className="text-white/40">· {entry.serverName || "Servidor"}</span>
                          </span>
                          <span className="flex items-center gap-1 text-white/50 group-open:text-accent">
                            <Eye size={12} />
                            Previsualizar
                          </span>
                        </summary>
                        <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] text-white/40">
                          <Link2 size={11} /> {entry.playerLink}
                        </p>
                        <div className="mt-2 aspect-video w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-black">
                          <iframe
                            src={entry.playerLink}
                            className="h-full w-full"
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                          />
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>

              <PendingActions id={p.id} />
            </div>
          </div>
        ))}

        {pending.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
            No hay contenido pendiente por revisar. 🎉
          </div>
        )}
      </div>
    </div>
  );
}
