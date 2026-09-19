"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/config/tools";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/config/i18n/locales";
import {
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Mail,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const segments = (pathname || "").split("/").filter(Boolean);
  const firstSegment = segments[0];
  const isLocalized = SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale);
  const compressorHref = isLocalized
    ? `/${firstSegment}/compress/whatsapp-video`
    : "/tools/video-compressor";
  const isCompressorActive =
    pathname === "/tools/video-compressor" ||
    (isLocalized && segments[1] === "compress");

  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full px-3 py-2.5 sm:px-6 lg:px-8 sm:pt-4 pointer-events-none transition-all">
      {/* Floating Curved Pill Header Container */}
      <div
        className={`pointer-events-auto mx-auto max-w-7xl border border-slate-200/90 bg-white/92 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-100 transition-all duration-300 ${
          mobileMenuOpen ? "rounded-3xl" : "rounded-full"
        }`}
      >
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Brand Logo */}
          <Link
            href="/"
            className="group flex items-center transition-transform active:scale-95 shrink-0"
          >
            <BrandLogo size="sm" />
          </Link>

          {/* Center / Right: Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {/* Tools Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-1.5 ${
                  toolsOpen || pathname.startsWith("/tools")
                    ? "text-[#0B192C] font-black"
                    : "text-slate-700 hover:text-[#0B192C]"
                }`}
              >
                <span>Tools</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    toolsOpen ? "rotate-180 text-[#0B192C]" : "text-slate-500"
                  }`}
                />
              </button>

              {/* Tools Dropdown Menu */}
              {toolsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[680px] max-h-[520px] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(11,25,44,0.12)] z-[100] animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3 px-2 pb-2.5 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-2 text-[#0B192C] font-black">
                      <Sparkles className="h-3.5 w-3.5 text-red-600" />
                      All 18 Media Tools
                    </span>
                    <span className="text-emerald-700 text-[11px] font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      100% In-Browser Wasm
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {TOOLS.map((tool) => {
                      const isActive = pathname === `/tools/${tool.slug}`;
                      return (
                        <Link
                          key={tool.id}
                          href={`/tools/${tool.slug}`}
                          onClick={() => setToolsOpen(false)}
                          className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-[#0B192C] to-[#1e3a8a] text-white shadow-md shadow-blue-950/25 font-semibold"
                              : "bg-slate-50 text-slate-800 hover:bg-blue-50/60 hover:text-[#0B192C] border border-slate-100/80"
                          }`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                            isActive ? "bg-red-600 text-white" : "bg-white text-[#0B192C] ring-1 ring-slate-200"
                          }`}>
                            <ToolIcon name={tool.iconName} className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate">
                              {tool.shortName}
                            </span>
                            <span className={`text-[11px] truncate ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                              {tool.tagline}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href={compressorHref}
              className={`text-sm font-semibold transition-colors ${
                isCompressorActive
                  ? "text-[#0B192C] font-black"
                  : "text-slate-700 hover:text-[#0B192C]"
              }`}
            >
              Compressor
            </Link>

            <Link
              href="/articles"
              className={`text-sm font-semibold transition-colors ${
                pathname.startsWith("/articles")
                  ? "text-[#0B192C] font-black"
                  : "text-slate-700 hover:text-[#0B192C]"
              }`}
            >
              Guides & Articles
            </Link>

            <Link
              href="/faq"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/faq"
                  ? "text-[#0B192C] font-black"
                  : "text-slate-700 hover:text-[#0B192C]"
              }`}
            >
              FAQ
            </Link>

            <Link
              href="/contact"
              className={`text-sm font-semibold transition-colors ${
                pathname === "/contact"
                  ? "text-[#0B192C] font-black"
                  : "text-slate-700 hover:text-[#0B192C]"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Right Controls: Hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 px-4 py-5 md:hidden max-h-[75vh] overflow-y-auto rounded-b-3xl bg-white animate-in slide-in-from-top-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
                <span>18 Media Tools</span>
                <span className="text-emerald-600 font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">100% Wasm</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TOOLS.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium ${
                      pathname === `/tools/${tool.slug}`
                        ? "bg-gradient-to-r from-[#0B192C] to-[#1e3a8a] text-white font-bold shadow-sm shadow-blue-950/30"
                        : "bg-slate-50 text-slate-800 hover:bg-blue-50/60 hover:text-[#0B192C] border border-slate-100"
                    }`}
                  >
                    <ToolIcon name={tool.iconName} className="h-3.5 w-3.5 text-[#0B192C] shrink-0" />
                    <span className="truncate">{tool.shortName}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-sm font-medium">
                <Link
                  href={compressorHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#0B192C] text-white p-2.5 shadow-md shadow-blue-950/20 hover:bg-[#1E3E62] transition-colors"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Sparkles className="h-4 w-4 text-rose-400" />
                    Smart Video Compressor
                  </span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </Link>
                <Link
                  href="/articles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-slate-800 hover:bg-red-50 hover:text-red-600"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-600" />
                    Guides & Articles
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-slate-800 hover:bg-red-50 hover:text-red-600"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-slate-600" />
                    FAQ & Help Center
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-slate-800 hover:bg-red-50 hover:text-red-600"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-600" />
                    Contact & Support
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
