export const SUPPORTED_LOCALES = [
  "en",
  "es",
  "pt",
  "fr",
  "de",
  "it",
  "hi",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface LocaleMeta {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  ogLocale: string;
  dir?: "ltr" | "rtl";
}

export const LOCALES: Record<SupportedLocale, LocaleMeta> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    ogLocale: "en_US",
    dir: "ltr",
  },
  es: {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    ogLocale: "es_ES",
    dir: "ltr",
  },
  pt: {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    ogLocale: "pt_BR",
    dir: "ltr",
  },
  fr: {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    ogLocale: "fr_FR",
    dir: "ltr",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    ogLocale: "de_DE",
    dir: "ltr",
  },
  it: {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    ogLocale: "it_IT",
    dir: "ltr",
  },
  hi: {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    ogLocale: "hi_IN",
    dir: "ltr",
  },
};

export function isValidLocale(lang: string): lang is SupportedLocale {
  return SUPPORTED_LOCALES.includes(lang as SupportedLocale);
}
