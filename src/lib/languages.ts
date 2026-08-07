export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "Inglés", flag: "🇺🇸" },
  { code: "pt", name: "Portugués", flag: "🇧🇷" },
  { code: "fr", name: "Francés", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "de", name: "Alemán", flag: "🇩🇪" },
  { code: "ja", name: "Japonés", flag: "🇯🇵" },
  { code: "ko", name: "Coreano", flag: "🇰🇷" },
  { code: "other", name: "Otro", flag: "🌐" },
];
