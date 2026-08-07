"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { dictionaries, type DictionaryKey } from "@/lib/i18n/dictionaries";

interface LocaleContextValue {
  locale: Locale;
  t: (key: DictionaryKey) => string;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      router.refresh();
    },
    [router]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: (key) => dictionaries[locale][key] ?? dictionaries.es[key] ?? key,
      setLocale,
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
