"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, MousePointerClick, X, RefreshCw, ServerCrash, Upload } from "lucide-react";
import {
  PlaybackServer,
  PlaybackLanguage as PlaybackLanguageType,
  Title,
  SiteSettings,
  VoteCounts,
  ReactionCounts,
  ReactionEmoji,
  Season,
  Episode,
  Contributor,
} from "@/lib/types";
import { updateWatchProgressAction } from "@/lib/actions";
import Header from "./Header";
import PlayerChrome from "./PlayerChrome";
import PrerollScreen from "./PrerollScreen";
import PlayerLanguageSelector from "./PlayerLanguageSelector";
import EpisodeSwitcher from "./EpisodeSwitcher";
import LikeDislike from "./LikeDislike";
import ReactionBar from "./ReactionBar";
import ContentRow from "./ContentRow";
import DonateButtons from "./DonateButtons";
import UploaderInfo from "./UploaderInfo";
import ReportButton from "./ReportButton";
import FavoriteButton from "./FavoriteButton";
import AdFrame from "./ads/AdFrame";
import { isRealImage } from "./PosterPlaceholder";
import { PLAYBACK_LANGUAGES } from "@/lib/playbackLanguages";
import type { AdSlot } from "@/lib/ads-types";

export default function PlayerPageClient({
  item,
  related,
  settings,
  uploader,
  uploaderFollowed,
  isLoggedIn,
  initialFavorited,
  initialVote,
  initialVoteCounts,
  initialReaction,
  initialReactionCounts,
  seasons,
  playerAd,
}: {
  item: Title;
  related: Title[];
  settings: SiteSettings;
  uploader?: Contributor;
  uploaderFollowed?: boolean;
  isLoggedIn?: boolean;
  initialFavorited?: boolean;
  initialVote?: "like" | "dislike" | null;
  initialVoteCounts?: VoteCounts;
  initialReaction?: ReactionEmoji | null;
  initialReactionCounts?: ReactionCounts;
  seasons?: Season[];
  playerAd?: AdSlot;
}) {
  const hasEpisodes = Boolean(seasons?.length);

  // Siempre mostramos los 4 idiomas del sitio en el selector, aunque el título no los
  // tenga todos cargados — así el usuario ve qué falta y puede subirlo él mismo.
  function buildFullPlayback(source: { kind: "video" | "iframe"; value: string } | undefined): PlaybackLanguageType[] {
    return PLAYBACK_LANGUAGES.map((def) =>
      def.id === "es-latino" && source
        ? { id: def.id, label: def.label, flag: def.flag, servers: [{ id: "default", name: "Servidor 1", source }] }
        : { id: def.id, label: def.label, flag: def.flag, servers: [] }
    );
  }

  const [activeSeasonId, setActiveSeasonId] = useState(seasons?.[0]?.id ?? "");
  const [activeEpisodeId, setActiveEpisodeId] = useState(seasons?.[0]?.episodes[0]?.id ?? "");
  const activeEpisode = seasons?.flatMap((s) => s.episodes).find((e) => e.id === activeEpisodeId);

  // Contenido antiguo solo tiene `item.source` (sin `playback`): lo tratamos como
  // "Español Latino > Servidor 1". Las series usan el enlace del episodio activo en vez
  // del enlace del título, pero muestran el mismo selector de 4 idiomas.
  const realLanguages: PlaybackLanguageType[] =
    item.playback && item.playback.length > 0 ? item.playback : [];
  const extraLanguages = realLanguages.filter(
    (l) => !PLAYBACK_LANGUAGES.some((def) => def.id === l.id || def.label === l.label)
  );
  const playback: PlaybackLanguageType[] | undefined = hasEpisodes
    ? buildFullPlayback(activeEpisode?.source)
    : realLanguages.length > 0
      ? [
          ...PLAYBACK_LANGUAGES.map((def) => {
            const existing = realLanguages.find((l) => l.id === def.id || l.label === def.label);
            return existing ?? { id: def.id, label: def.label, flag: def.flag, servers: [] };
          }),
          ...extraLanguages,
        ]
      : buildFullPlayback(item.source);
  const firstLanguage = playback?.find((l) => l.servers.length > 0);
  const firstServer = firstLanguage?.servers[0];

  const [activeLanguageId, setActiveLanguageId] = useState(firstLanguage?.id ?? "es-latino");
  const [activeServerId, setActiveServerId] = useState(firstServer?.id ?? "default");
  const [cinemaMode, setCinemaMode] = useState(false);
  const [showingPreroll, setShowingPreroll] = useState(settings.prerollEnabled);
  const [showPlayHint, setShowPlayHint] = useState(false);
  const [serversExhausted, setServersExhausted] = useState(false);

  const allCombos = playback?.flatMap((l) => l.servers.map((s) => ({ languageId: l.id, serverId: s.id }))) ?? [];

  const currentSource = hasEpisodes
    ? activeEpisode?.source
    : playback
      ? playback
          .find((l) => l.id === activeLanguageId)
          ?.servers.find((s) => s.id === activeServerId)?.source
      : item.source;

  useEffect(() => {
    setShowingPreroll(settings.prerollEnabled);
    setShowPlayHint(false);
  }, [activeLanguageId, activeServerId, activeEpisodeId, settings.prerollEnabled]);

  const handleEpisodeSelect = (season: Season, episode: Episode) => {
    setActiveSeasonId(season.id);
    setActiveEpisodeId(episode.id);
    setServersExhausted(false);
  };

  useEffect(() => {
    if (!showPlayHint) return;
    const timer = setTimeout(() => setShowPlayHint(false), 9000);
    return () => clearTimeout(timer);
  }, [showPlayHint]);

  // Progreso estimado de reproducción: como el video vive en un iframe externo,
  // no sabemos la posición real. Aproximamos usando el tiempo que la pestaña
  // permanece visible en esta página, comparado con la duración declarada.
  const watchedSecondsRef = useRef(0);
  useEffect(() => {
    if (!isLoggedIn || showingPreroll) return;

    const tick = setInterval(() => {
      if (document.visibilityState === "visible") {
        watchedSecondsRef.current += 1;
      }
    }, 1000);

    const report = () => {
      if (watchedSecondsRef.current > 0) {
        updateWatchProgressAction(item.id, watchedSecondsRef.current);
      }
    };
    const heartbeat = setInterval(report, 20000);
    window.addEventListener("beforeunload", report);

    return () => {
      clearInterval(tick);
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", report);
      report();
    };
  }, [isLoggedIn, showingPreroll, item.id]);

  const handleSelect = (languageId: string, server: PlaybackServer) => {
    setActiveLanguageId(languageId);
    setActiveServerId(server.id);
    setServersExhausted(false);
  };

  const handleTryNextServer = () => {
    // Episodes only ever carry a single `source` each (no per-episode server list like
    // movies have via `playback`), so `allCombos` — built from the movie-level `playback`
    // prop — has nothing to do with the currently active episode. Cycling through it here
    // silently changed state that the episode branch of `currentSource` never reads,
    // making the button look broken (click does nothing) instead of correctly reporting
    // that there's no alternate server to fall back to.
    if (hasEpisodes || !allCombos.length) {
      setServersExhausted(true);
      return;
    }
    const currentIndex = allCombos.findIndex(
      (c) => c.languageId === activeLanguageId && c.serverId === activeServerId
    );
    const nextIndex = currentIndex + 1;
    if (nextIndex >= allCombos.length) {
      setServersExhausted(true);
      return;
    }
    const next = allCombos[nextIndex];
    setActiveLanguageId(next.languageId);
    setActiveServerId(next.serverId);
    setServersExhausted(false);
  };

  const handlePrerollFinish = () => {
    setShowingPreroll(false);
    setShowPlayHint(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {!cinemaMode && <Header />}

      <div className={cinemaMode ? "" : "pt-[72px]"}>
        {!cinemaMode && (
          <div className="relative border-b border-white/5 px-6 py-6 md:px-10 md:py-8">
            {isRealImage(item.backdrop) ? (
              <div className="absolute inset-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.backdrop}
                  alt=""
                  className="h-full w-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-zinc-950/80 to-black" />
              </div>
            ) : (
              <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-zinc-900 to-black" />
            )}
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                  {item.title}
                </h1>
                <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                  <Star size={12} className="fill-white" />
                  {item.rating.toFixed(1)}/10
                </span>
              </div>

              <p className="mt-2 max-w-3xl truncate text-sm text-white/60 md:text-base">
                {item.synopsis}
              </p>

              {playback && playback.length > 0 && (
                <div className="mt-5">
                  <PlayerLanguageSelector
                    languages={playback}
                    activeLanguageId={activeLanguageId}
                    activeServerId={activeServerId}
                    onSelect={handleSelect}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className={`relative w-full overflow-hidden ${
            cinemaMode
              ? "h-screen"
              : showingPreroll
                ? "min-h-[420px] max-h-[75vh] sm:aspect-video"
                : "aspect-video max-h-[75vh]"
          }`}
        >
          {/* El iframe real solo se monta al terminar la cuenta regresiva, para que el
              usuario lo reciba "fresco" y pueda interactuar con él desde el primer
              instante (en vez de haber corrido oculto durante 10s sin recibir clics). */}
          {showingPreroll ? (
            <PrerollScreen trivia={item.trivia ?? []} onFinish={handlePrerollFinish} />
          ) : (
            <PlayerChrome
              item={item}
              source={currentSource}
              cinemaMode={cinemaMode}
              onToggleCinema={() => setCinemaMode((v) => !v)}
            />
          )}

          {showPlayHint && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 transition-opacity duration-300">
              <div className="pointer-events-none flex items-center gap-2.5 rounded-full border border-accent/40 bg-black/85 px-4 py-2.5 text-sm text-white shadow-lg backdrop-blur-md">
                <MousePointerClick size={17} className="shrink-0 animate-pulse text-accent" />
                <span>Haz clic en el botón de reproducir del video para comenzar</span>
                <button
                  aria-label="Cerrar aviso"
                  onClick={() => setShowPlayHint(false)}
                  className="pointer-events-auto ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {!cinemaMode && !showingPreroll && (
          <div className="mx-auto max-w-6xl px-6 pt-4 md:px-10">
            {serversExhausted ? (
              <div className="flex flex-col items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <ServerCrash size={18} className="mt-0.5 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Ningún servidor funcionó para este título.
                    </p>
                    <p className="text-xs text-white/50">
                      Repórtalo para que lo revisemos, o si tienes un enlace que sí funcione,
                      súbelo tú mismo y ayuda a la comunidad.
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <ReportButton titleId={item.id} />
                  <Link
                    href="/subir"
                    className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
                  >
                    <Upload size={13} />
                    Subir enlace
                  </Link>
                </div>
              </div>
            ) : (
              <button
                onClick={handleTryNextServer}
                className="flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10"
              >
                <RefreshCw size={13} />
                ¿No se ve la película? Probar otro servidor
              </button>
            )}
          </div>
        )}

        {!cinemaMode && hasEpisodes && (
          <div className="mx-auto max-w-6xl px-6 pt-6 md:px-10">
            <EpisodeSwitcher
              seasons={seasons!}
              activeSeasonId={activeSeasonId}
              activeEpisodeId={activeEpisodeId}
              onSelect={handleEpisodeSelect}
              onSeasonChange={setActiveSeasonId}
            />
          </div>
        )}

        {!cinemaMode && (
          <>
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:px-10">
              <UploaderInfo
                uploader={uploader}
                uploaderFollowed={uploaderFollowed}
                isLoggedIn={isLoggedIn}
              />
              <div className="flex flex-wrap items-center gap-3">
                <LikeDislike
                  titleId={item.id}
                  initialVote={initialVote ?? null}
                  initialCounts={initialVoteCounts ?? { likes: 0, dislikes: 0 }}
                />
                <FavoriteButton titleId={item.id} initialFavorited={initialFavorited ?? false} />
                <ReportButton titleId={item.id} />
              </div>
              <ReactionBar
                titleId={item.id}
                initialReaction={initialReaction ?? null}
                initialCounts={initialReactionCounts ?? { like: 0, heart: 0, cry: 0, poop: 0 }}
              />
              <DonateButtons settings={settings} />
              {playerAd && <AdFrame ad={playerAd} className="overflow-hidden rounded-xl" />}
            </div>

            {related.length > 0 && (
              <div className="pb-12">
                <ContentRow row={{ id: "sugeridos", title: "Sugeridos para ti", items: related }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
