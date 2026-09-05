"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ARTICLES } from "@/config/articles";
import { USE_CASES } from "@/config/use-cases";
import { FORMAT_PAIRS } from "@/config/formats";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/config/i18n/locales";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Cpu, Lock, Globe, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const currentLang: SupportedLocale =
    SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)
      ? (firstSegment as SupportedLocale)
      : "en";

  const getHref = (path: string) => {
    if (currentLang === "en") return path;
    return `/${currentLang}${path}`;
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#05080e] pt-16 pb-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Privacy Statement */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" />
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              High-performance, WebAssembly-powered video compressor and media suite on VideoReduce.com. A product of the{" "}
              <a
                href="https://versenext.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/40 transition-colors"
              >
                Verse Next
              </a>{" "}
              innovation ecosystem.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 p-3 ring-1 ring-white/10 text-xs text-slate-300">
              <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Zero server uploads. Your media files are processed locally inside your browser&apos;s WebAssembly memory.
              </span>
            </div>

            <a
              href="https://versenext.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-3 ring-1 ring-blue-500/20 text-xs text-blue-300 hover:ring-blue-400/50 hover:text-white transition-all group"
            >
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>
                <strong className="text-white">Verse Next Innovation</strong> • 100% Free & Open Web Suite ↗
              </span>
            </a>
          </div>

          {/* Format Converters */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Format Converters
            </p>
            <ul className="mt-4 space-y-2 text-xs">
              {FORMAT_PAIRS.slice(0, 10).map((fp) => (
                <li key={fp.slug}>
                  <Link
                    href={getHref(`/convert/${fp.slug}`)}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {fp.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/tools/format-converter"
                  className="font-semibold text-blue-400 hover:text-blue-300"
                >
                  All 16 Converters ➔
                </Link>
              </li>
            </ul>
          </div>

          {/* Solution Hubs / Compress Presets */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform Solutions
            </p>
            <ul className="mt-4 space-y-2 text-xs">
              {USE_CASES.slice(0, 10).map((uc) => (
                <li key={uc.slug}>
                  <Link
                    href={getHref(`/compress/${uc.slug}`)}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {uc.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/tools/video-compressor"
                  className="font-semibold text-blue-400 hover:text-blue-300"
                >
                  All 16 Solution Presets ➔
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">
              Privacy & Guides
            </p>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/articles" className="hover:text-blue-400 transition-colors font-semibold text-blue-400">
                  All Knowledge Guides
                </Link>
              </li>
              <li>
                <Link href="/tools/video-compressor" className="hover:text-blue-400 transition-colors">
                  Smart Video Compressor
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  How WebAssembly Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition-colors">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Cpu className="h-3.5 w-3.5 text-blue-400" />
                  <span>Powered by FFmpeg v0.12 Wasm</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Global 7-Language Switcher (Dynamic Current Page Preserving) */}
        <div className="border-t border-white/[0.08] pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Globe className="h-4 w-4 text-blue-400" />
              <span>Select Language / Idioma / Sprache / भाषा:</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-6 sm:flex-row text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} VideoReduce.com — An Innovation by{" "}
            <a
              href="https://versenext.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
            >
              Verse Next
            </a>
            .
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              videoreduce.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
