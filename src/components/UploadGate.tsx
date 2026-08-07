"use client";

import { useState } from "react";
import { HandCoins, Film, Link2, Rocket, ExternalLink } from "lucide-react";

const STEPS = [
  {
    icon: Film,
    title: "1. Sube tu video a un reproductor monetizado",
    body: "Crea una cuenta gratis en plataformas como StreamWish, Filemoon o Doodstream y sube ahí tu película, serie o capítulo. Esas plataformas te pagan por cada reproducción de tu video.",
  },
  {
    icon: Link2,
    title: "2. Copia el enlace o código iframe/embed",
    body: "Una vez subido, la plataforma te da un enlace directo o un código de inserción (iframe/embed) de tu video. Ese es el enlace que vas a compartir en Butakia.",
  },
  {
    icon: Rocket,
    title: "3. Publícalo en Butakia y comparte",
    body: "Pega ese enlace en el formulario de subida junto a la portada, sinopsis y datos del título. Miles de personas en Butakia lo verán, reproducirán tu video y tú sigues generando ingresos en tu plataforma de video.",
  },
];

const PLAYERS = ["StreamWish", "Filemoon", "Doodstream", "VOE", "Vidhide"];

export default function UploadGate({ children }: { children: React.ReactNode }) {
  const [started, setStarted] = useState(false);

  if (started) return <>{children}</>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
          <HandCoins size={28} />
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
          Sube contenido y genera ingresos
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-white/60">
          En Butakia no solo compartes tu contenido con toda la comunidad — también puedes generar
          ingresos reales alojando tus videos en reproductores monetizados. Así funciona:
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-bold text-white">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/60">{step.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5">
        <p className="mb-3 text-sm font-semibold text-white/80">
          Algunos reproductores monetizados populares:
        </p>
        <div className="flex flex-wrap gap-2">
          {PLAYERS.map((name) => (
            <span
              key={name}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
            >
              {name}
            </span>
          ))}
        </div>
        <a
          href="https://streamwish.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
        >
          Ver StreamWish <ExternalLink size={11} />
        </a>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 text-center backdrop-blur-md">
        <h2 className="text-xl font-black text-white">¿Listo para generar ingresos con Butakia?</h2>
        <p className="max-w-md text-sm text-white/60">
          Solo te tomará unos minutos completar el formulario con el enlace de tu video.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-full bg-accent px-8 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
        >
          Sube ahora
        </button>
      </div>
    </div>
  );
}
