"use client";

import { useEffect } from "react";

export function CacheBuster() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Proactively purge old service worker caches (e.g. privatemedia-v1)
    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== "videoreduce-v2") {
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
