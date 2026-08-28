"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/config/tools";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Download,
  BookOpen,
  Mail,
  HelpCircle,
} from "lucide-react";

interface NavbarProps {
  onInstallClick?: () => void;
  canInstall?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onInstallClick, canInstall }) => {
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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#080c14] transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with VideoReduce.com branding */}
        <Link
          href="/"
          className="group flex items-center transition-transform active:scale-95"
        >
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {/* Tools Dropdown with 100% Solid Non-Transparent Background */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                toolsOpen || pathname.startsWith("/tools")
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span>All 18 Tools</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-300 transition-transform duration-200 ${
                  toolsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Solid Opaque Dropdown Menu (No Transparency / No Bleed Through) */}
            {toolsOpen && (
              <div className="absolute left-0 top-full mt-2 w-[680px] max-h-[540px] overflow-y-auto rounded-2xl border-2 border-slate-700 bg-[#0a0f1d] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.95)] z-[100] animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/10 pb-2.5">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                    VideoReduce.com Media Toolkit
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-400 font-mono text-[11px] font-bold">
                    18 Tools Active • 100% Wasm
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
                        className={`flex items-center gap-2.5 rounded-xl p-2.5 transition-all ${
                          isActive
                            ? "bg-blue-600 text-white ring-1 ring-blue-400 shadow-md"
                            : "bg-[#10172a] text-slate-200 hover:bg-slate-800 hover:text-white border border-white/5"
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-blue-400 ring-1 ring-white/10">
                          <ToolIcon name={tool.iconName} className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate">
                              {tool.shortName}
                            </span>
                            {tool.badge && (
                              <span className="rounded bg-blue-500/30 px-1 py-0.2 text-[9px] font-bold text-blue-300">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 truncate">
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
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              pathname === "/tools/video-compressor"
                ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            Compressor
          </Link>

          <Link
            href="/articles"
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith("/articles")
                ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span>Guides & Articles</span>
          </Link>

          <Link
            href="/faq"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/faq"
                ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <HelpCircle className="h-4 w-4 text-blue-400" />
            <span>FAQ</span>
          </Link>

          <Link
            href="/contact"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/contact"
                ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Mail className="h-4 w-4 text-emerald-400" />
            <span>Contact</span>
          </Link>
        </nav>

        {/* Right CTA / PWA Button */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verse Next Lab</span>
          </div>

          {canInstall && (
            <button
              onClick={onInstallClick}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:brightness-110 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with 100% Solid Background */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#080d1a] px-4 py-4 md:hidden max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-4">
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-300 flex justify-between">
              <span>All 18 Media Tools</span>
              <span className="text-emerald-400">100% Wasm</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pb-3">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg p-2 text-xs font-medium ${
                    pathname === `/tools/${tool.slug}`
                      ? "bg-blue-600 text-white"
                      : "bg-[#10172a] text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <ToolIcon name={tool.iconName} className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{tool.shortName}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-white/10 pt-2 space-y-1">
              <Link
                href="/articles"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Guides & Articles Knowledge Base
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Master FAQ & Help Center
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                Contact Us & Feedback Form
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
              >
                About & WebAssembly Engine
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
