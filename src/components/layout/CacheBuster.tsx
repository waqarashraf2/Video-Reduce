"use client";

import { useEffect } from "react";

export function CacheBuster() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local");

    if (isLocalhost) {
      // On localhost, immediately purge all cached stores and unregister all service workers
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      }
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
      return;
    }

    // 1. Proactively purge old service worker caches (e.g. privatemedia-v1, videoreduce-v2, videoreduce-v4)
    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== "videoreduce-v5") {
            caches.delete(key).then(() => {
              console.log("[CacheBuster] Purged outdated cache store:", key);
            });
          }
        });
      });
    }

    // 2. Proactively trigger service worker update check on server
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update().catch(() => {});
        }
      });
    }

    // 3. Auto version check & cache bust on deployment
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!data || !data.version) return;

        const serverVersion = String(data.version);
        const localVersion = localStorage.getItem("vr_app_build_version");

        if (!localVersion) {
          // First visit: record current version
          localStorage.setItem("vr_app_build_version", serverVersion);
        } else if (localVersion !== serverVersion) {
          // New deployment detected!
          console.log(
            `[CacheBuster] New version detected (${serverVersion} vs ${localVersion}). Refreshing cache...`
          );
          localStorage.setItem("vr_app_build_version", serverVersion);

          // Clear outdated caches on version bump
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }

          // Update service worker registration to fetch latest in background
          if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update().catch(() => {});
          }
        }
      } catch {
        // Silently continue if offline
      }
    };

    checkVersion();
  }, []);

  return null;
}
