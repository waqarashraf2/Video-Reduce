"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Share2, PlusSquare, Smartphone } from "lucide-react";

interface PwaInstallBannerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({
  isOpen: forcedOpen,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if already in standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt on Chromium browsers
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem("pwa_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered:", reg.scope))
        .catch((err) => console.log("Service Worker registration failed:", err));
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa_dismissed", "true");
    if (onClose) onClose();
  };

  if (!mounted) return null;

  const showModal = forcedOpen || (isVisible && !isStandalone && !isInstalled);

  if (!showModal) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg animate-in slide-in-from-bottom-5">
      <div className="relative rounded-2xl border border-blue-500/30 bg-[#0f1628]/95 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Close install prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">
              Install VideoReduce.com
            </h4>
            <p className="text-xs text-slate-300">
              Run offline, launch directly from your home screen or dock, and process videos at native speed.
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="mt-3.5 rounded-xl bg-slate-900/80 p-3 text-xs text-slate-300 border border-white/10 space-y-2">
            <div className="font-medium text-blue-400">How to install on iOS Safari:</div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 text-[10px] font-bold text-blue-400">1</span>
              <span>Tap the <strong className="text-white">Share</strong> button <Share2 className="inline h-3.5 w-3.5 mx-0.5 text-blue-400" /> at bottom of Safari</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 text-[10px] font-bold text-blue-400">2</span>
              <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="inline h-3.5 w-3.5 mx-0.5 text-blue-400" /></span>
            </div>
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-2">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Install App Now</span>
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Maybe Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
