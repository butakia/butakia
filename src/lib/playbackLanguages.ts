export interface PlaybackLanguageDef {
  id: string;
  label: string;
  flag: string;
}

export const PLAYBACK_LANGUAGES: PlaybackLanguageDef[] = [
  { id: "es-latino", label: "Español Latino", flag: "🇲🇽" },
  { id: "es-espana", label: "Español (España)", flag: "🇪🇸" },
  { id: "en-sub", label: "Inglés Subtitulado", flag: "🇺🇸" },
  { id: "en", label: "Inglés", flag: "🇺🇸" },
];

export const SERVER_NAME_PRESETS = [
  "Servidor HD",
  "Servidor Full HD",
  "Servidor 4K",
  "Servidor Alterno",
];

export interface PlaybackEntry {
  id: string;
  languageId: string;
  serverName: string;
  playerLink: string;
}
