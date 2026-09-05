"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUPPORTED_LOCALES, LOCALES, SupportedLocale } from "@/config/i18n/locales";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pills" | "compact";
}

export function getLocalizedPath(pathname: string, targetLang: SupportedLocale): string {
  if (!pathname || pathname === "/") {
    return targetLang === "en" ? "/" : `/${targetLang}/convert/mov-to-mp4`;
  }

  // Check if pathname starts with a supported locale, e.g. /es/convert/mov-to-mp4
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  const hasLocalePrefix = SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale);
  const coreSegments = hasLocalePrefix ? segments.slice(1) : segments;
  const corePath = "/" + coreSegments.join("/");

  // CRITICAL SAFEGUARD: Localization is strictly ONLY supported for /convert/[slug] and /compress/[slug]
  const isLocalizable =
    coreSegments.length >= 2 &&
    (coreSegments[0] === "convert" || coreSegments[0] === "compress");

  if (!isLocalizable) {
    // For articles, tools, about, faq, contact, terms, privacy:
    // ALWAYS return the clean, simple path without language prefix to prevent 404s!
    return corePath || "/";
  }

  if (targetLang === "en") {
    return corePath || "/";
  }

  return `/${targetLang}${corePath}`;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "pills",
}) => {
  const pathname = usePathname() || "/";

  // Determine current active language from pathname
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const currentLang: SupportedLocale =
    SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)
      ? (firstSegment as SupportedLocale)
      : "en";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {SUPPORTED_LOCALES.map((langCode) => {
        const loc = LOCALES[langCode];
        const targetHref = getLocalizedPath(pathname, langCode);
        const isActive = currentLang === langCode;

        return (
          <Link
            key={langCode}
            href={targetHref}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400"
                : "bg-slate-900/90 text-slate-300 border border-white/10 hover:border-blue-500/50 hover:text-white"
            }`}
          >
            <span>{loc.flag}</span>
            <span>{loc.nativeName}</span>
          </Link>
        );
      })}
    </div>
  );
};
