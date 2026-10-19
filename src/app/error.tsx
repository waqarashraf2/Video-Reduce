"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    console.error(error);

    // Auto-heal chunk loading, MIME mismatch, and stale webpack module errors
    const errorMessage = String(error?.message || "");
    const isChunkOrMimeError =
      errorMessage.includes("ChunkLoadError") ||
      errorMessage.includes("is not a function") ||
      errorMessage.includes("Loading chunk") ||
      errorMessage.includes("MIME type");

    if (isChunkOrMimeError && typeof window !== "undefined") {
      const hasRecovered = sessionStorage.getItem("vr_chunk_recovery_attempted");
      if (!hasRecovered) {
        sessionStorage.setItem("vr_chunk_recovery_attempted", "true");
        setIsRecovering(true);
        if (typeof caches !== "undefined") {
          caches.keys().then((keys) => {
            Promise.all(keys.map((k) => caches.delete(k))).finally(() => {
              (window as Window).location.reload();
            });
          });
        } else {
          (window as Window).location.reload();
        }
      }
    }
  }, [error]);

  const handleTryAgain = async () => {
    setIsRecovering(true);
    try {
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("vr_chunk_recovery_attempted");
      }
    } catch {}
    if (typeof window !== "undefined") {
      (window as Window).location.reload();
    }
  };

  return (
    <div className="relative min-h-[70vh] bg-white flex items-center justify-center px-4 py-16 text-slate-900">
      <div className="relative mx-auto max-w-lg text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-200">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">Something went wrong</h1>
          <p className="text-sm text-slate-600">
            {isRecovering
              ? "Clearing outdated app caches and reloading..."
              : "An unexpected error occurred while processing your request."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleTryAgain}
            disabled={isRecovering}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:from-red-700 hover:to-rose-700 transition-colors disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${isRecovering ? "animate-spin" : ""}`} />
            <span>{isRecovering ? "Reloading..." : "Try again"}</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-red-600 hover:border-red-300 shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
