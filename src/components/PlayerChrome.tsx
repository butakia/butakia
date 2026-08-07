"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  MonitorPlay,
  Clapperboard,
} from "lucide-react";
import { Title } from "@/lib/types";
import { extractIframeSrc } from "@/lib/validateEmbedUrl";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Source = { kind: "video" | "iframe"; value: string } | undefined;

export default function PlayerChrome({
  item,
  source,
  cinemaMode,
  onToggleCinema,
}: {
  item: Title;
  source: Source;
  cinemaMode: boolean;
  onToggleCinema: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const hasSource = Boolean(source?.value);
  const isVideo = source?.kind === "video" && hasSource;
  const isIframe = source?.kind === "iframe" && hasSource;

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const syncDuration = () => {
      if (Number.isFinite(v.duration)) setDuration(v.duration);
    };
    const onTimeUpdate = () => {
      setProgress(v.currentTime);
      syncDuration();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    v.addEventListener("loadedmetadata", syncDuration);
    v.addEventListener("durationchange", syncDuration);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);

    if (v.readyState >= 1) syncDuration();

    return () => {
      v.removeEventListener("loadedmetadata", syncDuration);
      v.removeEventListener("durationchange", syncDuration);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [source?.value]);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setDuration(0);
  }, [source?.value]);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 2800);
  };

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const showControls = () => {
    setControlsVisible(true);
    scheduleHide();
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * duration;
  };

  const progressPct = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={showControls}
      onTouchStart={showControls}
      className={`relative flex w-full items-center justify-center bg-black ${
        cinemaMode ? "h-screen" : "aspect-video max-h-[75vh]"
      }`}
    >
      {isVideo && (
        <video
          key={source!.value}
          ref={videoRef}
          src={source!.value}
          className="h-full w-full"
          onClick={togglePlay}
          autoPlay
        />
      )}

      {isIframe && (
        <iframe
          key={source!.value}
          src={extractIframeSrc(source!.value) ?? source!.value}
          className="h-full w-full bg-black"
          style={{ colorScheme: "dark" }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}

      {!hasSource && (
        <div className="flex flex-col items-center gap-3 px-6 text-center text-white/60">
          <Clapperboard size={48} strokeWidth={1.2} />
          <p className="text-lg font-semibold text-white/80">Servidor no disponible</p>
          <p className="max-w-sm text-sm">
            Elige otro idioma o servidor arriba, o inténtalo de nuevo más tarde.
          </p>
        </div>
      )}

      {(controlsVisible || !playing) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/60 via-transparent to-black/80 transition-opacity duration-200">
            <div className="pointer-events-auto p-4 md:p-6">
              <Link
                href={`/titulo/${item.slug}`}
                aria-label="Volver"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-white/20 active:scale-90"
              >
                <ArrowLeft size={20} />
              </Link>
            </div>

            {isVideo && (
              <div className="pointer-events-auto flex flex-col gap-2 p-4 md:p-6">
                <div
                  onClick={seek}
                  className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/20"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-100"
                    style={{ width: `${progressPct}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-accent opacity-0 shadow transition-opacity group-hover:opacity-100"
                    style={{ left: `${progressPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      aria-label={playing ? "Pausar" : "Reproducir"}
                      onClick={togglePlay}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110 active:scale-90"
                    >
                      {playing ? (
                        <Pause size={20} className="fill-black" />
                      ) : (
                        <Play size={20} className="fill-black" />
                      )}
                    </button>
                    <button
                      aria-label={muted ? "Activar sonido" : "Silenciar"}
                      onClick={toggleMute}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110 hover:bg-white/10 active:scale-90"
                    >
                      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <span className="text-xs text-white/70">
                      {formatTime(progress)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Modo cine"
                      onClick={onToggleCinema}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-90 ${
                        cinemaMode ? "bg-accent text-white" : "text-white hover:bg-white/10"
                      }`}
                    >
                      <MonitorPlay size={18} />
                    </button>
                    <button
                      aria-label="Pantalla completa"
                      onClick={toggleFullscreen}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-110 hover:bg-white/10 active:scale-90"
                    >
                      {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
