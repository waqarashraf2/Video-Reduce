import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Zap,
  Lock,
  HardDrive,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Smartphone,
  Layers,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How Video Reducer Works — In-Browser Video Compression",
  description:
    "Discover how Video Reducer compresses videos of any size (from 10MB to 10GB+) locally in your browser using WebAssembly. 100% private, zero quality loss, and no server uploads.",
  keywords: [
    "video reducer",
    "how video reducer works",
    "reduce video file size",
    "compress 1gb video",
    "compress 10gb video",
    "reduce video size without losing quality",
    "webassembly video compressor",
    "private video compressor",
    "in-browser video compression",
    "free video reducer",
  ],
  alternates: {
    canonical: "https://videoreduce.com/about",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "How Video Reducer Works — Fast, Private WebAssembly Compression",
    description:
      "Learn how Video Reducer shrinks large video files (10MB to 10GB+) directly in your browser RAM with zero server uploads and maximum visual quality.",
    type: "website",
    siteName: "VideoReduce.com",
    url: "https://videoreduce.com/about",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "How Video Reducer Works — WebAssembly Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Video Reducer Works — Private In-Browser Video Compression",
    description:
      "Compress videos of any size from 10MB to 10GB+ locally on your device with WebAssembly.",
    images: ["/og-image.jpg"],
  },
};

export default function AboutPage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://videoreduce.com/about#aboutpage",
        url: "https://videoreduce.com/about",
        name: "How Video Reducer Works — WebAssembly Video Compression",
        description:
          "Educational overview of client-side WebAssembly video reduction, privacy architecture, and CRF compression algorithms.",
        isPartOf: {
          "@type": "WebSite",
          name: "VideoReduce.com",
          url: "https://videoreduce.com",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://videoreduce.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About & How It Works",
            item: "https://videoreduce.com/about",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does Video Reducer compress videos without uploading to a server?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Video Reducer runs a WebAssembly compilation of FFmpeg directly inside your web browser. When you select a video, it is placed in an in-memory virtual filesystem (MEMFS) and processed by your CPU cores without transmitting a single byte across the internet.",
            },
          },
          {
            "@type": "Question",
            name: "Can Video Reducer handle large files from 10MB to 10GB+?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Because processing occurs entirely on your device hardware rather than on expensive cloud servers with strict bandwidth caps, you can compress files ranging from small 10MB phone clips to large 1GB, 5GB, and 10GB+ 4K videos without subscription fees or artificial limits.",
            },
          },
          {
            "@type": "Question",
            name: "How does Video Reducer maintain video quality while reducing size?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Video Reducer uses Constant Rate Factor (CRF 23-28) psycho-visual algorithms and advanced H.264/AAC encoding. It compresses invisible background redundancies while preserving crisp visual sharpness on high-detail focal areas like human faces, text, and fast motion scenes.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="relative min-h-screen py-12 sm:py-20">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      {/* Glow Backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-60" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 backdrop-blur-md shadow-lg shadow-blue-500/10">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>Next-Generation In-Browser Media Architecture</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
            How Video Reducer{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Works
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            A breakthrough in client-side media engineering. Compress, convert, and optimize any video file from{" "}
            <strong className="text-white font-semibold">10MB to 10GB+</strong> directly on your device with zero cloud uploads, infinite privacy, and no quality loss.
          </p>
        </div>

        {/* Quick Value Metrics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">0 Bytes</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Uploaded to Cloud</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">10MB–10GB+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">File Support Range</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-400 font-mono">Up to 90%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Size Reduction</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">Wasm SIMD</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Hardware Accelerated</div>
          </div>
        </div>

        {/* Deep Dive Engineering Breakdown */}
        <div className="space-y-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-10 backdrop-blur-2xl text-slate-300 leading-relaxed text-sm sm:text-base shadow-2xl">
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                1. The WebAssembly (Wasm) Native Execution Engine
              </h2>
            </div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Traditional online converters force you to upload large video files to remote third-party cloud servers. This exposes confidential footage, wastes valuable mobile bandwidth, and subjects you to slow upload queues and strict 50MB–100MB file caps.
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              <strong>Video Reducer</strong> eliminates remote servers entirely. By compiling the complete, industry-standard <strong>FFmpeg</strong> multimedia engine into high-performance <strong>WebAssembly (Wasm)</strong> with <strong>SIMD vector instructions</strong>, raw video transcoding operations execute directly inside your web browser at near-native CPU speeds.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                2. Absolute Privacy: 0 Bytes Uploaded to the Cloud
              </h2>
            </div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              When you drop a file into Video Reducer, JavaScript mounts your file in an isolated <strong>Virtual File System (MEMFS)</strong> allocated strictly within your device&apos;s local RAM.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Zero Server Transmission</span>
                </div>
                <p className="text-xs text-slate-300">
                  Your personal memories, business presentations, medical videos, and confidential files never cross the internet.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1.5">
                <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Zero Data Retention</span>
                </div>
                <p className="text-xs text-slate-300">
                  No databases, no tracking cookies, and no storage servers. When you close the browser tab, memory is instantly freed.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30">
                <HardDrive className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                3. Compress Any Video File Size: 10MB to 10GB+ with Zero Caps
              </h2>
            </div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Because all calculations run locally on your device hardware, Video Reducer imposes no artificial file size ceilings. Whether you are compressing a small <strong>10MB phone recording</strong> for a quick text message, a <strong>500MB Discord gameplay clip</strong>, or a massive <strong>1GB to 10GB+ 4K UHD video</strong> from a DSLR camera or drone, the engine processes it with full fidelity.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30">
                <Sliders className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                4. Constant Rate Factor (CRF) & Quality Preservation
              </h2>
            </div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              How does Video Reducer cut file size by up to 90% without pixelation or visible artifacts?
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>Psycho-Visual CRF Rate Control (CRF 23–28):</strong> Allocates higher bitrates to complex focal areas (faces, sharp text, rapid motion) while heavily compressing invisible background gradients.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>Dynamic Bitrate Ceilings:</strong> Automatically calculates the exact maximum bitrate required for platforms like Discord (8MB/25MB) and WhatsApp (16MB) to ensure seamless delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span><strong>H.264 (AVC) & AAC Audio Transcoding:</strong> Produces universal MP4 files playable on every iPhone, Android, Mac, Windows, and Smart TV without compatibility errors.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                5. Multi-Threaded Web Workers for Responsive UI
              </h2>
            </div>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Intensive media operations are offloaded into background <strong>Web Worker threads</strong>. Using <code>SharedArrayBuffer</code> and multi-core CPU distribution, your device encodes video frames in parallel while keeping the browser UI completely responsive, smooth, and interactive.
            </p>
          </section>
        </div>

        {/* Action Callout */}
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-[#0e172a] to-indigo-950/60 p-8 sm:p-10 text-center space-y-6 shadow-2xl">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to Reduce Video Size Privately?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Start compressing any video from 10MB to 10GB+ right now in your browser. 100% free with no signups, no watermarks, and zero file limits.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools/video-compressor"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Video Reducer</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <span>Explore All 18 Tools</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
