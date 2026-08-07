"use client";

import { Plus, X } from "lucide-react";
import { PLAYBACK_LANGUAGES, SERVER_NAME_PRESETS } from "@/lib/playbackLanguages";
import LinkPreviewStep from "./LinkPreviewStep";

export interface PlaybackEntryState {
  id: string;
  languageId: string;
  serverName: string;
  playerLink: string;
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

let counter = 0;
export function newEntryId(): string {
  counter += 1;
  return `entry-${Date.now()}-${counter}`;
}

export default function PlaybackEntriesEditor({
  entries,
  confirmedIds,
  onChange,
  onConfirm,
  onReject,
}: {
  entries: PlaybackEntryState[];
  confirmedIds: Set<string>;
  onChange: (entries: PlaybackEntryState[]) => void;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const languagesUsed = Array.from(new Set(entries.map((e) => e.languageId)));
  const availableToAdd = PLAYBACK_LANGUAGES.filter((l) => !languagesUsed.includes(l.id));

  const updateEntry = (id: string, patch: Partial<PlaybackEntryState>) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    if (patch.playerLink !== undefined) onReject(id);
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  const addServer = (languageId: string) => {
    onChange([...entries, { id: newEntryId(), languageId, serverName: "", playerLink: "" }]);
  };

  return (
    <div className="flex flex-col gap-4">
      <datalist id="server-name-presets">
        {SERVER_NAME_PRESETS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      {PLAYBACK_LANGUAGES.filter((lang) => languagesUsed.includes(lang.id)).map((lang) => {
        const langEntries = entries.filter((e) => e.languageId === lang.id);
        return (
          <div key={lang.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <span>{lang.flag}</span>
                {lang.label}
              </span>
              <button
                type="button"
                onClick={() => addServer(lang.id)}
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <Plus size={12} />
                Agregar servidor
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {langEntries.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <div className="flex gap-2">
                    <input
                      value={entry.serverName}
                      onChange={(e) => updateEntry(entry.id, { serverName: e.target.value })}
                      list="server-name-presets"
                      placeholder="Nombre del servidor (opcional, ej. Servidor HD)"
                      className={`${inputCls} flex-1`}
                    />
                    {langEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        aria-label="Quitar servidor"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white/50 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    value={entry.playerLink}
                    onChange={(e) => updateEntry(entry.id, { playerLink: e.target.value })}
                    placeholder="Enlace del reproductor (embed / iframe / URL)"
                    className={`${inputCls} mt-2`}
                  />
                  <div className="mt-2">
                    <LinkPreviewStep
                      playerLink={entry.playerLink}
                      confirmed={confirmedIds.has(entry.id)}
                      onConfirm={() => onConfirm(entry.id)}
                      onReject={() => onReject(entry.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {availableToAdd.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-white/40">
            + Agregar otro idioma (opcional — la mayoría solo sube en Español Latino):
          </p>
          <div className="flex flex-wrap gap-2">
            {availableToAdd.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => addServer(lang.id)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/5"
              >
                <span>{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
