"use client";

import { useEffect } from "react";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/config/i18n/locales";

export function LocaleRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const segments = path.split("/").filter(Boolean);
      const firstSegment = segments[0];

      if (SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)) {
        const cleanSegments = segments.slice(1);
        const cleanPath = "/" + cleanSegments.join("/");
        window.location.replace(cleanPath || "/");
      }
    }
  }, []);

  return null;
}
