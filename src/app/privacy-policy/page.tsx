import React from "react";
import { Metadata } from "next";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "VideoReduce.com privacy policy: 100% client-side WebAssembly processing with zero server uploads. Your files never leave your device.",
  alternates: {
    canonical: "https://videoreduce.com/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy — VideoReduce.com",
    description:
      "100% client-side WebAssembly processing with zero server uploads. Your files never leave your device.",
    type: "website",
    siteName: "VideoReduce.com",
    url: "https://videoreduce.com/privacy-policy",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | VideoReduce.com",
    description:
      "100% client-side WebAssembly processing with zero server uploads.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero-Knowledge Data Policy</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:p-10 backdrop-blur-xl text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              1. Our Core Principle: 0 Server Uploads
            </h2>
            <p>
              We do not upload, collect, store, share, or inspect any files you process with VideoReduce.com. All operations occur 100% locally inside your web browser.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white">2. How Media is Processed</h2>
            <p>
              VideoReduce.com leverages WebAssembly (Wasm) and HTML5 APIs. When you select a video or audio file, it is loaded exclusively into your browser&apos;s local virtual memory. No data is sent to our servers or any third-party infrastructure.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white">3. Local Storage and Cookies</h2>
            <p>
              We do not track user identities or store cookies containing personal information. Your media files are automatically discarded from browser RAM once you close the tab or reset the session.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
