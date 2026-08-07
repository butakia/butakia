"use client";

import { Globe } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { LOCALES, type Locale } from "@/lib/i18n/config";

const LOCALE_LABEL: Record<Locale, string> = { es: "Español", en: "English" };

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <Globe size={14} />
      <span className="sr-only">{t("footer.language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="cursor-pointer rounded-md border border-border bg-transparent px-2 py-1 text-xs text-muted hover:text-foreground focus:outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} className="bg-background text-foreground">
            {LOCALE_LABEL[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
