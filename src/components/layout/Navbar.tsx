"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/config/tools";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ChevronDown,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Mail,
  HelpCircle,
  ExternalLink,
  Zap,
  ArrowRight,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#070b14]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group flex items-center transition-transform active:scale-95"
          >
            <BrandLogo size="md" />
          </Link>

          {/* Verse Next Tagline Link */}
          <a
            href="https://versenext.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Verse Next Official Website"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-[11px] font-medium text-blue-300/80 transition-all hover:border-blue-400/50 hover:bg-blue-500/15 hover:text-blue-200 group"
          >
            <span className="text-slate-400">by</span>
            <span className="font-semibold text-white group-hover:text-blue-300">Verse Next</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {/* Desktop Central Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {/* Tools Mega Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                toolsOpen || pathname.startsWith("/tools")
                  ? "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Tools</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  toolsOpen ? "rotate-180 text-blue-400" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {toolsOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[720px] max-h-[560px] overflow-y-auto rounded-3xl border border-white/10 bg-[#090e1c] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.95)] z-[100] animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4 px-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Complete WebAssembly Media Suite
                    </span>
                  </div>
                  <a
                    href="https://versenext.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Powered by Verse Next</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {TOOLS.map((tool) => {
                    const isActive = pathname === `/tools/${tool.slug}`;
                    return (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.slug}`}
                        onClick={() => setToolsOpen(false)}
                        className={`group/item flex items-center gap-3 rounded-2xl p-3 transition-all ${
                          isActive
                            ? "bg-blue-600/30 text-white ring-1 ring-blue-400/50 shadow-lg shadow-blue-500/10"
                            : "bg-[#0f1629] text-slate-200 hover:bg-[#151f38] hover:text-white border border-white/5"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-blue-400 ring-1 ring-white/10 group-hover/item:scale-105 group-hover/item:text-blue-300 transition-transform">
                          <ToolIcon name={tool.iconName} className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold tracking-tight truncate">
                              {tool.shortName}
                            </span>
                            {tool.badge && (
                              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 uppercase">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate group-hover/item:text-slate-300">
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
            href="/tools/video-compressor"
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              pathname === "/tools/video-compressor"
                ? "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            Compressor
          </Link>

          <Link
            href="/articles"
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              pathname.startsWith("/articles")
                ? "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>Guides</span>
          </Link>

          <Link
            href="/faq"
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              pathname === "/faq"
                ? "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
            <span>FAQ</span>
          </Link>

          <Link
            href="/contact"
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              pathname === "/contact"
                ? "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-emerald-400" />
            <span>Contact</span>
          </Link>
        </nav>

        {/* Right Actions (Verse Next Link & Primary CTA Button) */}
        <div className="flex items-center gap-3">
          {/* Verse Next Portal Button */}
          <a
            href="https://versenext.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-blue-500/40 hover:bg-blue-950/40 hover:text-white group"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
            <span>VerseNext.com</span>
            <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </a>

          {/* Primary Action Button */}
          <Link
            href="/tools/video-compressor"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 hover:shadow-blue-500/40 active:scale-95"
          >
            <Zap className="h-3.5 w-3.5 fill-current text-yellow-300" />
            <span className="hidden sm:inline">Start Compressing</span>
            <span className="sm:hidden">Compress</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#070b14] px-4 py-6 lg:hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                18 Media Processing Tools
              </span>
              <a
                href="https://versenext.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-400"
              >
                <span>VerseNext.com</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium ${
                    pathname === `/tools/${tool.slug}`
                      ? "bg-blue-600 text-white"
                      : "bg-[#0e1526] text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <ToolIcon name={tool.iconName} className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="truncate">{tool.shortName}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <Link
                href="/articles"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                <span>Guides & Articles Knowledge Base</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                <span>Master FAQ & Help Center</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                <span>Contact & Support Desk</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
              <a
                href="https://versenext.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm font-semibold text-blue-300"
              >
                <span>Visit Verse Next Official Portal</span>
                <ExternalLink className="h-4 w-4 text-blue-400" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
