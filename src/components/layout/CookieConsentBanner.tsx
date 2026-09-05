"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";

const CONSENT_STORAGE_KEY = "vr_cookie_consent";
const CONSENT_EXPIRY_DAYS = 180;

export const CookieConsentBanner: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Read stored consent
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        // Small delay for clean entrance animation
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(stored);
        // Dispatch existing status for scripts
        window.dispatchEvent(
          new CustomEvent("cookieConsentChanged", {
            detail: {
              consent: parsed.consent,
              analyticsAllowed: parsed.consent === "all",
            },
          })
        );
      }
    } catch {
      // Fallback if localStorage is restricted
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (choice: "all" | "essential") => {
    const payload = {
      consent: choice,
      timestamp: new Date().toISOString(),
      version: "1.0",
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Storage restricted", e);
    }

    // Set standard cookie for 180 days
    const maxAge = CONSENT_EXPIRY_DAYS * 24 * 60 * 60;
    document.cookie = `${CONSENT_STORAGE_KEY}=${choice}; max-age=${maxAge}; path=/; SameSite=Lax; Secure`;

    // Notify listeners / analytics
    window.dispatchEvent(
      new CustomEvent("cookieConsentChanged", {
        detail: {
          consent: choice,
          analyticsAllowed: choice === "all",
        },
      })
    );

    setIsVisible(false);
  };

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-4xl z-[100] transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#0e1626]/95 backdrop-blur-xl border border-slate-700/60 p-4 sm:p-5 md:p-6 shadow-2xl shadow-black/80 ring-1 ring-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          
          {/* Content */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 hidden sm:flex items-center justify-center">
              <Cookie className="w-5 h-5" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 sm:hidden">
                  <Cookie className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
                  Your Privacy & Preferences
                  <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong className="text-white font-medium">VideoReduce</strong> uses cookies to remember your video compression quality settings, maintain secure user sessions, and gather anonymous site analytics. We never sell your personal data. Learn more in our{" "}
                <Link
                  href="/privacy"
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium"
                >
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t border-slate-800 md:border-t-0">
            <button
              type="button"
              onClick={() => handleConsent("essential")}
              className="flex-1 md:flex-initial px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 text-center"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => handleConsent("all")}
              className="flex-1 md:flex-initial px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/30 transition-all duration-200 active:scale-95 text-center"
            >
              Accept All
            </button>
          </div>

        </div>
      </div>
    </aside>
  );
};
