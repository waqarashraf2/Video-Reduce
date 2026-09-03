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
  ArrowRight,
  BookOpen,
  HelpCircle,
  Mail,
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
    <header className="sticky top-0 z-50 w-full px-3 py-2.5 sm:px-6 lg:px-8 sm:pt-4 pointer-events-none transition-all">
      {/* Floating Curved Pill Header Container (Bradleys Law Style) */}
      <div
        className={`pointer-events-auto mx-auto max-w-7xl border border-white/15 bg-[#121a2d]/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] ring-1 ring-white/10 transition-all duration-300 ${
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
          <nav className="hidden items-center gap-7 md:flex">
            {/* Tools Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-1.5 ${
                  toolsOpen || pathname.startsWith("/tools")
                    ? "text-blue-400 font-semibold"
                    : "text-slate-200 hover:text-white"
                }`}
              >
                <span>Tools</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    toolsOpen ? "rotate-180 text-blue-400" : "text-slate-400"
                  }`}
                />
              </button>

              {/* Tools Dropdown Menu */}
              {toolsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[680px] max-h-[520px] overflow-y-auto rounded-3xl border border-white/15 bg-[#0f172a] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.9)] z-[100] animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3 px-2 pb-2.5 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                      All 18 Media Tools
                    </span>
                    <span className="text-emerald-400 text-[11px] font-mono font-bold">
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
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "bg-[#182238] text-slate-200 hover:bg-[#1f2c48] hover:text-white border border-white/5"
                          }`}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-blue-400 ring-1 ring-white/10">
                            <ToolIcon name={tool.iconName} className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate">
                              {tool.shortName}
                            </span>
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
              className={`text-sm font-medium transition-colors ${
                pathname === "/tools/video-compressor"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Compressor
            </Link>

            <Link
              href="/articles"
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith("/articles")
                  ? "text-blue-400 font-semibold"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Guides & Articles
            </Link>

            <Link
              href="/faq"
              className={`text-sm font-medium transition-colors ${
                pathname === "/faq"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              FAQ
            </Link>

            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                pathname === "/contact"
                  ? "text-blue-400 font-semibold"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Right Controls: Hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 px-4 py-5 md:hidden max-h-[75vh] overflow-y-auto rounded-b-3xl bg-[#0f172a] animate-in slide-in-from-top-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 px-1">
                <span>18 Media Tools</span>
                <span className="text-emerald-400 font-mono text-[10px]">100% Wasm</span>
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
                        : "bg-[#182238] text-slate-200 hover:bg-[#1f2c48]"
                    }`}
                  >
                    <ToolIcon name={tool.iconName} className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{tool.shortName}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-1.5 text-sm font-medium">
                <Link
                  href="/tools/video-compressor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-blue-600/20 border border-blue-500/30 p-2.5 text-blue-300 hover:bg-blue-600/30"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    Smart Video Compressor
                  </span>
                  <ArrowRight className="h-4 w-4 text-blue-400" />
                </Link>
                <Link
                  href="/articles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#182238] p-2.5 text-slate-200 hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                    Guides & Articles
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#182238] p-2.5 text-slate-200 hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-400" />
                    FAQ & Help Center
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-[#182238] p-2.5 text-slate-200 hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-400" />
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
