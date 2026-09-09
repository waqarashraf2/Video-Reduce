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
    return targetLang === "en" ? "/" : `/${targetLang}/compress/whatsapp-video`;
  }

  // Check if pathname starts with a supported locale, e.g. /es/convert/mov-to-mp4
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  const hasLocalePrefix = SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale);
  const coreSegments = hasLocalePrefix ? segments.slice(1) : segments;
  const corePath = "/" + coreSegments.join("/");

  // 1. Direct match for main compressor pages (/tools/video-compressor, /compress)
  if (
    corePath === "/tools/video-compressor" ||
    corePath === "/compress" ||
    (coreSegments[0] === "tools" && corePath.includes("compress"))
  ) {
    if (targetLang === "en") {
      return corePath || "/tools/video-compressor";
    }
    return `/${targetLang}/compress/whatsapp-video`;
  }

  // 2. Direct match for converter tools (/tools/format-converter, /convert)
  if (
    corePath === "/convert" ||
    (coreSegments[0] === "tools" && corePath.includes("convert"))
  ) {
    if (targetLang === "en") {
      return corePath || "/convert/mov-to-mp4";
    }
    return `/${targetLang}/convert/mov-to-mp4`;
  }

  // 3. Fallback for any other /tools/[slug] pages
  if (coreSegments[0] === "tools") {
    if (targetLang === "en") {
      return corePath || "/";
    }
    return `/${targetLang}/compress/whatsapp-video`;
  }

  // 4. CRITICAL SAFEGUARD: Localization is strictly supported for /convert/[slug] and /compress/[slug]
  const isLocalizable =
    coreSegments.length >= 2 &&
    (coreSegments[0] === "convert" || coreSegments[0] === "compress");

  if (!isLocalizable) {
    // For articles, about, faq, contact, terms, privacy:
    // If targetLang is English, return the clean English path.
    // If switching to another language, redirect to the primary localized suite instead of staying stuck on English.
    return targetLang === "en" ? (corePath || "/") : `/${targetLang}/compress/whatsapp-video`;
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
