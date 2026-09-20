"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { TOOLS } from "@/config/tools";
import { ToolIcon } from "@/components/ui/ToolIcon";
import { SocialShareBar } from "@/components/ui/SocialShareBar";
import {
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  XCircle,
  Zap,
  Layers,
  FileCheck,
  Smartphone,
  Server,
  Lock,
} from "lucide-react";

const ToolRunner = dynamic(
  () => import("@/components/tools/ToolRunner").then((m) => m.ToolRunner),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading Video Compressor Engine...</span>
      </div>
    ),
  }
);

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const compressorTool = TOOLS.find((t) => t.id === "video-compressor") || TOOLS[0];

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
        "@id": "https://videoreduce.com/#website",
        name: "VideoReduce.com",
        url: "https://videoreduce.com",
        description:
          "Free online video size reducer to shrink video file size, lower video size, and compress videos without losing quality. 100% private in-browser WebAssembly.",
      },
      {
        "@type": "WebPage",
        "@id": "https://videoreduce.com/#webpage",
        url: "https://videoreduce.com",
        name: "VideoReduce — Free Video Size Reducer & Online Media Suite",
        description:
          "Reduce video size online for free without losing quality. Shrink video file size, lower video size for Discord, WhatsApp, and iPhone clips with 18 free tools.",
        isPartOf: { "@id": "https://videoreduce.com/#website" },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: "https://videoreduce.com/og-image.jpg",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "VideoReduce — Free Video Size Reducer & Media Suite",
        url: "https://videoreduce.com",
        image: "https://videoreduce.com/logo.png",
        screenshot: "https://videoreduce.com/og-image.jpg",
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Video Size Reducer & Compression Suite",
        operatingSystem: "All (Browser-Based: iOS, Android, Windows, Mac, Linux)",
        softwareRequirements: "Requires WebAssembly Compatible Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "1280",
          bestRating: "5",
          worstRating: "1",
        },
        description:
          "Free online video size reducer to lower video size and shrink video file size without losing quality. 100% private WebAssembly MP4 video compressor.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How to reduce video file size without losing quality?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use VideoReduce.com's instant video size reducer. Drop your video, choose 50% or 70% smaller (or a custom limit), and download. It utilizes Constant Rate Factor (CRF) and dynamic bitrate ceilings to shrink video size up to 90% while keeping visual details sharp.",
            },
          },
          {
            "@type": "Question",
            name: "How to lower video size or shrink video on iPhone or Android phone?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Open VideoReduce.com in Safari or Chrome on your mobile phone, select your video from Photos/Gallery, choose a compression preset (e.g. 70% reduction or 1080p), and click Compress. It processes directly in mobile RAM without installing any app.",
            },
          },
          {
            "@type": "Question",
            name: "Can I compress videos of any size or target Discord/WhatsApp limits?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! VideoReduce compresses videos of any size (from small 10MB phone clips to large 1GB, 5GB & 10GB+ 4K videos). You can also choose dedicated presets for Discord (8MB/25MB) or WhatsApp (16MB).",
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
    <main className="relative min-h-screen overflow-hidden">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* Radiant Glow Backgrounds */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-60" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-red-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute left-0 top-2/3 h-96 w-96 rounded-full bg-rose-500/5 blur-[120px]" />

      {/* Hero Section */}
      <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-7">

          {/* Privacy & Engine Pill */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/90 bg-gradient-to-r from-blue-50/90 via-white to-red-50/90 px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <ShieldCheck className="h-4 w-4 text-[#0B192C]" />
              <span className="text-[#0B192C] font-bold">100% Client-Side WebAssembly</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">0 Server Uploads</span>
              <span className="text-slate-300">•</span>
              <span className="text-red-700 font-bold">100% Free</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl leading-[1.15]">
              Free Video Size Reducer &{" "}
              <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent">
                Shrink Video File Size
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
              The easiest way to lower video size, shrink video file size, and decrease video size up to 90% without losing quality. Drop any video below for instant, 100% free, private browser compression.
            </p>
          </div>

          {/* Interactive Video Reducer Runner Applet */}
          <div className="mx-auto max-w-4xl text-left">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl ring-1 ring-slate-100" suppressHydrationWarning>
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20">
                    <ToolIcon name={compressorTool.iconName} className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>Instant Video Reducer</span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        Drop & Compress
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Reduce video size in 1 click • No uploads • 100% Private in Browser
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/tools/video-compressor"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <span>Advanced Studio (CRF & Bitrate)</span>
                    <ArrowRight className="h-3.5 w-3.5 text-red-600" />
                  </Link>
                </div>
              </div>

              <ToolRunner tool={compressorTool} />

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Your video never leaves this device (Processed locally via WebCodecs GPU & WebAssembly)</span>
                </div>
                <Link
                  href="/tools/video-compressor"
                  className="inline-flex items-center gap-1 text-red-600 font-semibold hover:underline shrink-0"
                >
                  <span>Need custom CRF or 4K downscaling? Open Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Popular Instant Shortcuts */}
          <div className="pt-2 max-w-3xl mx-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              ⚡ Instant Quick Presets & Tools
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { name: "💬 Discord (8MB/25MB)", href: "/compress/discord-video" },
                { name: "📱 WhatsApp (16MB)", href: "/compress/whatsapp-video" },
                { name: "✉️ Email Attachment", href: "/compress/email-attachment" },
                { name: "🔄 Video to GIF", href: "/tools/video-to-gif" },
                { name: "🎬 MOV to MP4", href: "/convert/mov-to-mp4" },
                { name: "🎵 Extract Audio (MP3)", href: "/tools/audio-extractor" },
                { name: "🔇 Mute Video", href: "/tools/video-mute" },
                { name: "🛡️ Remove Metadata", href: "/tools/metadata-stripper" },
              ].map((chip) => (
                <Link
                  key={chip.name}
                  href={chip.href}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  {chip.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Social Share Bar */}
          <div className="max-w-xl mx-auto pt-1">
            <SocialShareBar />
          </div>

          {/* Key Value Statistics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-4xl mx-auto pt-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] font-mono">0 Bytes</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Uploaded to Server</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">18 Tools</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Video & Audio Suite</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] font-mono">∞ Unlimited</div>
              <div className="text-xs text-slate-500 font-medium mt-1">File Size & Usage</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">Wasm v0.12</div>
              <div className="text-xs text-slate-500 font-medium mt-1">FFmpeg SIMD Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Suite Grid */}
      <section id="tools-grid" className="relative py-16 sm:py-24 border-t border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
              <Cpu className="h-4 w-4" />
              <span>Full VideoReduce.com Suite (18 Utilities)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Powerful Tools for Video Reduction & Editing
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Every tool executes 100% locally with high-fidelity algorithms, custom presets, and real-time previews. Choose a utility below to start processing immediately without software installation.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${activeCategory === cat
                    ? "bg-[#0B192C] text-white shadow-md shadow-blue-950/25 ring-1 ring-[#0B192C]"
                    : "bg-white text-slate-700 hover:bg-slate-100 hover:text-[#0B192C] border border-slate-200 shadow-sm"
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
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-400 hover:shadow-xl hover:shadow-red-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">
                      <ToolIcon name={tool.iconName} className="h-5 w-5" />
                    </div>
                    {tool.badge && (
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    {tool.name}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs font-bold text-red-600">
                  <span>Launch Tool</span>
                  <ArrowRight className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Rich Educational Section: How WebAssembly Video Compression Works */}
      <section className="relative py-16 sm:py-24 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              How In-Browser Video Compression Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Traditional online converters require you to upload private videos to remote cloud servers. VideoReduce.com runs a full FFmpeg C/C++ engine compiled directly into WebAssembly (Wasm), executing binary operations directly inside your browser memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200">
                <Lock className="h-5 w-5" />
              </div>
              <div className="text-base font-bold text-slate-900">100% Zero Server Uploads</div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When you drag a file into VideoReduce, JavaScript creates an in-memory virtual filesystem blob. The video never travels across the internet, protecting personal memories, medical footage, and confidential recordings.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="text-base font-bold text-slate-900">Multi-Threaded Hardware Encoding</div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Using SharedArrayBuffer and Web Workers, compression tasks are distributed across your CPU cores. This achieves blazing-fast encoding speeds on modern laptops, desktops, iPhones, and Android smartphones.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-200">
                <Zap className="h-5 w-5" />
              </div>
              <div className="text-base font-bold text-slate-900">Smart CRF & Bitrate Optimization</div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our dynamic algorithms use Constant Rate Factor (CRF 23-28) and H.264/AAC transcoding to strip invisible redundancy without degrading human-perceived visual quality, reducing file size by up to 90%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Codec & Format Compatibility Table */}
      <section className="relative py-16 sm:py-24 border-t border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight sm:text-4xl">
              Supported Video Codecs & Formats
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              VideoReduce supports industry-standard video containers, audio tracks, and compression standards.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-4">Format / Container</th>
                    <th scope="col" className="px-6 py-4">Video Codecs</th>
                    <th scope="col" className="px-6 py-4">Audio Codecs</th>
                    <th scope="col" className="px-6 py-4">Best Used For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 font-mono text-xs border border-red-200">MP4</span>
                    </td>
                    <td className="px-6 py-4">H.264 (AVC), H.265 (HEVC), AV1</td>
                    <td className="px-6 py-4">AAC, MP3, Opus</td>
                    <td className="px-6 py-4 text-slate-600">Web, Discord, WhatsApp, YouTube, Instagram</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 font-mono text-xs border border-red-200">MOV</span>
                    </td>
                    <td className="px-6 py-4">Apple ProRes, H.264, HEVC</td>
                    <td className="px-6 py-4">PCM, AAC</td>
                    <td className="px-6 py-4 text-slate-600">iPhone recordings, Final Cut Pro, QuickTime</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 font-mono text-xs border border-emerald-200">WebM</span>
                    </td>
                    <td className="px-6 py-4">VP8, VP9, AV1</td>
                    <td className="px-6 py-4">Opus, Vorbis</td>
                    <td className="px-6 py-4 text-slate-600">High-efficiency web playback & HTML5 video</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 font-mono text-xs border border-red-200">MKV</span>
                    </td>
                    <td className="px-6 py-4">H.264, HEVC, VP9, MPEG-4</td>
                    <td className="px-6 py-4">AAC, FLAC, AC3</td>
                    <td className="px-6 py-4 text-slate-600">Lossless archiving, multi-track audio & subtitles</td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700 font-mono text-xs border border-amber-200">GIF</span>
                    </td>
                    <td className="px-6 py-4">8-Bit Indexed Color (256 colors)</td>
                    <td className="px-6 py-4">None (Silent)</td>
                    <td className="px-6 py-4 text-slate-600">Memes, email newsletters, Twitter/Discord reactions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud vs Client-Side Comparison */}
      <section className="relative py-16 sm:py-24 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Why VideoReduce.com is Better
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Compare client-side WebAssembly against traditional cloud converters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Cloud Converters */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="text-lg font-bold text-slate-900">Traditional Cloud Converters</div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>Files uploaded to third-party cloud servers (severe privacy risk).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>Strict file size limits (50MB - 100MB) without expensive paid plans.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>Slow upload queues, waiting times, and download expiration links.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-600 font-bold">✕</span>
                  <span>Watermarks placed on output files unless you create an account.</span>
                </li>
              </ul>
            </div>

            {/* VideoReduce.com */}
            <div className="relative rounded-3xl border-2 border-[#0B192C] bg-white p-8 space-y-6 shadow-xl shadow-blue-950/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B192C] ring-1 ring-blue-200">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-950">VideoReduce.com (Wasm)</div>
                </div>
                <span className="rounded-full bg-[#0B192C] px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                  Recommended • 100% Private
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>0 Bytes uploaded</strong> — everything processes in browser memory.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero file size caps</strong> — process large 4K / HD files on device.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>18 Specialized Tools</strong> — complete suite of video, audio, and privacy tools.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Installable PWA</strong> — works seamlessly on mobile and desktop offline.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Global FAQ Section */}
      <section className="relative py-16 sm:py-24 border-t border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
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
                q: "Can I compress videos of any size, or only for Discord & WhatsApp limits?",
                a: "You can compress videos of any file size — from small 10MB phone clips to large 1GB, 5GB & 10GB+ 4K videos. You can also pick exact target size limits like Discord (8MB/25MB), WhatsApp (16MB), or Email (25MB) that automatically calculate the optimal bitrate.",
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
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm"
              >
                <div className="text-base font-bold text-slate-900">
                  {faq.q}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
