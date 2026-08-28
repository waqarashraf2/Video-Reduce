"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TOOLS } from "@/config/tools";
import { ToolIcon } from "@/components/ui/ToolIcon";
import {
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  XCircle,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Video", "Audio", "Conversion", "Optimization", "Privacy & Pro"];

  const filteredTools =
    activeCategory === "All"
      ? TOOLS
      : TOOLS.filter((t) => t.category === activeCategory);

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "VideoReduce.com",
        url: "https://videoreduce.com",
        description:
          "Free online video compressor to reduce video size and file size without losing quality. 100% private WebAssembly MP4 video compressor.",
      },
      {
        "@type": "SoftwareApplication",
        name: "VideoReduce - Free Online Video Compressor",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All (iOS, Android, Windows, Mac, Linux)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How to reduce video file size without losing quality?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use VideoReduce.com's smart video compressor. It utilizes Constant Rate Factor (CRF) and dynamic bitrate ceilings to reduce file size up to 90% while keeping visual details sharp.",
            },
          },
          {
            "@type": "Question",
            name: "How to reduce video size on iPhone or Android phone?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Open VideoReduce.com in Safari or Chrome on your mobile phone, select your video from Photos/Gallery, choose a compression preset (e.g. 70% reduction or 1080p), and click Compress. It processes directly in mobile RAM without installing any app.",
            },
          },
          {
            "@type": "Question",
            name: "How to compress a video for Discord (8MB & 25MB limits)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Select the Discord preset or set the Custom Target Size to 8MB or 24MB. The video compressor strictly caps the bitrate so the video embeds and plays smoothly in Discord chat.",
            },
          },
          {
            "@type": "Question",
            name: "Does Dropbox reduce video quality?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Dropbox does not modify original downloaded files, but its browser streaming preview heavily compresses video playback. Pre-compressing with VideoReduce ensures your video stays lightweight and crisp across any platform.",
            },
          },
          {
            "@type": "Question",
            name: "How does VideoReduce compare to HandBrake, Veed, or FreeConvert?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Unlike HandBrake, VideoReduce works immediately in your browser without software installs. Unlike Veed or FreeConvert, VideoReduce is 100% free with no file size limits, zero watermarks, and 100% private client-side processing.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* Radiant Glow Backgrounds */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-70" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute left-0 top-2/3 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Main Logo & Badge Showcase */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative inline-flex items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600/30 via-indigo-500/20 to-cyan-500/30 p-2 shadow-2xl shadow-blue-500/30 ring-1 ring-white/20 backdrop-blur-2xl">
              <Image
                src="/logo.png"
                alt="VideoReduce.com Official Logo"
                width={84}
                height={84}
                className="rounded-2xl object-cover shadow-inner"
                priority
              />
            </div>

            {/* Privacy Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
              <ShieldCheck className="h-4 w-4" />
              <span>VideoReduce.com • 100% Client-Side Wasm • 0 Server Uploads</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
              Free Video Compressor &{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Reduce Video File Size
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Reduce video size online for free without losing quality. 18 powerful tools for MP4 compression, Discord (8MB/10MB), iPhone, GIF conversion, and audio editing — 100% private in your browser.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/tools/video-compressor"
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:brightness-110 hover:shadow-blue-500/40 active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              <span>Compress Video Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#tools-grid"
              className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 backdrop-blur-xl transition-all hover:bg-slate-800 hover:text-white"
            >
              <span>Explore All 18 Tools</span>
            </Link>
          </div>

          {/* Key Value Statistics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto pt-10">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">0 Bytes</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Uploaded to Server</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">18 Tools</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Video & Audio Suite</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-violet-400 font-mono">∞ Unlimited</div>
              <div className="text-xs text-slate-400 font-medium mt-1">File Size & Usage</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">Wasm v0.12</div>
              <div className="text-xs text-slate-400 font-medium mt-1">FFmpeg Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Suite Grid */}
      <section id="tools-grid" className="relative py-16 sm:py-24 border-t border-white/[0.08] bg-[#070b12]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Cpu className="h-4 w-4" />
              <span>Full VideoReduce.com Suite (18 Utilities)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Powerful Tools for Video Reduction & Editing
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Every tool executes 100% locally with high-fidelity algorithms, custom presets, and real-time previews.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400"
                    : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tool Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0f1728]/70 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 text-blue-400 ring-1 ring-white/10 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ToolIcon name={tool.iconName} className="h-5 w-5" />
                    </div>
                    {tool.badge && (
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 ring-1 ring-blue-500/30">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3.5 text-xs font-semibold text-blue-400">
                  <span>Launch Tool</span>
                  <ArrowRight className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cloud vs Client-Side Comparison */}
      <section className="relative py-16 sm:py-24 border-t border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why VideoReduce.com is Better
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Compare client-side WebAssembly against traditional cloud converters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Cloud Converters */}
            <div className="rounded-3xl border border-rose-500/20 bg-slate-950/60 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <XCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Traditional Cloud Converters</h3>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Files uploaded to third-party cloud servers (severe privacy risk).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Strict file size limits (50MB - 100MB) without expensive paid plans.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Slow upload queues, waiting times, and download expiration links.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Watermarks placed on output files unless you create an account.</span>
                </li>
              </ul>
            </div>

            {/* VideoReduce.com */}
            <div className="relative rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#0f1b2b] to-[#0a121e] p-8 space-y-6 shadow-2xl shadow-emerald-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">VideoReduce.com (Wasm)</h3>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                  100% Private
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>0 Bytes uploaded</strong> — everything processes in browser memory.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero file size caps</strong> — process large 4K / HD files on device.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>18 Specialized Tools</strong> — complete suite of video, audio, and privacy tools.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Installable PWA</strong> — works seamlessly on mobile and desktop offline.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Global FAQ Section */}
      <section className="relative py-16 sm:py-24 border-t border-white/[0.08] bg-[#070b12]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400">
              Everything you need to know about VideoReduce.com and WebAssembly processing.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How to reduce video file size without losing quality?",
                a: "To reduce video file size without losing quality, VideoReduce.com uses smart Constant Rate Factor (CRF) encoding and dynamic bitrate ceilings. This reduces redundant pixel data while preserving sharp details on faces, text, and fast motion scenes.",
              },
              {
                q: "How to reduce video size on iPhone or my mobile phone?",
                a: "Open VideoReduce.com in Safari or Chrome on your iPhone or Android phone. Select any video from your camera roll, choose your desired reduction preset (e.g. 50% Smaller, 70% Smaller, or 1080p), and tap Compress. It runs directly on your phone's processor with zero data upload.",
              },
              {
                q: "How do I reduce video resolution or storage size?",
                a: "In the Smart Video Compressor, select an optimized resolution preset such as 1080p, 720p, or 480p. Downscaling high-bitrate 4K footage to 1080p cuts file size by up to 75% while looking crystal clear on mobile and laptop screens.",
              },
              {
                q: "Does Dropbox reduce video quality when sharing?",
                a: "Dropbox does not alter your original downloaded file, but its web video player heavily compresses previews to 480p/720p with low bitrates. To ensure recipients see crisp video without buffering, compress your video with VideoReduce before sharing.",
              },
              {
                q: "How do I compress video for Discord (8MB & 10MB limits)?",
                a: "Discord limits free uploads to 8MB or 25MB. VideoReduce.com includes dedicated 8MB, 10MB, and 24MB presets that calculate the exact bitrate ceiling and inject faststart web flags so your clip plays directly in Discord chat channels.",
              },
              {
                q: "Why is VideoReduce better than HandBrake, Veed, or FreeConvert?",
                a: "Unlike HandBrake, VideoReduce requires no software downloads and works instantly on all devices. Unlike Veed or FreeConvert, VideoReduce is 100% free with no file size limits, zero watermarks, and 100% private client-side WebAssembly processing.",
              },
              {
                q: "Are my video files uploaded to any remote server?",
                a: "No! All video compression and conversion runs 100% locally in your web browser RAM using WebAssembly. Your personal files never leave your device.",
              },
              {
                q: "Can I convert video to GIF in high quality?",
                a: "Yes! Use our Video to GIF converter. It uses two-pass color palette generation (palettegen + paletteuse) to create smooth, high-definition animated GIFs from MP4, iPhone MOV, YouTube, and Twitter clips.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-2"
              >
                <h3 className="text-base font-semibold text-white">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
