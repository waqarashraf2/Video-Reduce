import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Smartphone,
  Cpu,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ & Knowledge Base",
  description:
    "Find answers to frequently asked questions about VideoReduce.com — client-side WebAssembly video compression, format conversions, privacy, and browser support.",
  keywords: [
    "videoreduce faq",
    "video compression questions",
    "how does wasm video converter work",
    "is online video compression free",
    "videoreduce help center",
  ],
  alternates: {
    canonical: "https://videoreduce.com/faq",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "FAQ & Knowledge Base — VideoReduce.com",
    description:
      "Answers to all frequently asked questions about client-side video compression, format conversions, and privacy.",
    type: "website",
    siteName: "VideoReduce.com",
    url: "https://videoreduce.com/faq",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "VideoReduce.com FAQ & Knowledge Base",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ & Knowledge Base | VideoReduce.com",
    description:
      "Answers to all frequently asked questions about VideoReduce.com and WebAssembly video processing.",
    images: ["/logo.png"],
  },
};

export default function FAQPage() {
  const faqCategories = [
    {
      category: "Privacy & Zero Server Uploads",
      icon: "ShieldCheck",
      questions: [
        {
          q: "How does VideoReduce.com process videos without uploading them to a server?",
          a: "We compiled the entire FFmpeg multimedia framework into WebAssembly (Wasm). When you select a video, your browser loads the binary into an isolated Web Worker thread, processing frames in your device's local memory (RAM). Zero bytes are transmitted to any external server.",
        },
        {
          q: "Can anyone on the internet access my processed files?",
          a: "No. Since files never leave your device, there is zero risk of cloud data breaches, third-party inspection, or unauthorized storage.",
        },
        {
          q: "What happens to the video after I finish compressing?",
          a: "The temporary virtual memory buffer is immediately wiped when you reset the tool or close the browser tab.",
        },
      ],
    },
    {
      category: "Video Compression & Quality",
      icon: "Zap",
      questions: [
        {
          q: "What is Constant Rate Factor (CRF) and how does it prevent quality loss?",
          a: "CRF is an intelligent rate control mechanism in H.264 video encoding. It allocates more bits to high-action motion scenes and compresses static backgrounds more heavily, resulting in human-lossless visual quality at 50%–70% smaller file sizes.",
        },
        {
          q: "How do I compress a video specifically for WhatsApp (16MB limit)?",
          a: "Use our dedicated WhatsApp Video Compressor (/compress/whatsapp-video) or select the '70% Smaller' preset with 720p resolution on the homepage compressor.",
        },
        {
          q: "How do I compress a video for Discord (25MB limit)?",
          a: "Select our Discord Video Compressor (/compress/discord-video) or enter '24 MB' in the Custom Target Size box to guarantee smooth in-chat video embed playback.",
        },
      ],
    },
    {
      category: "Format & Codec Support",
      icon: "Cpu",
      questions: [
        {
          q: "Which video and audio formats are supported?",
          a: "We support MP4, MOV (Apple QuickTime), MKV (Matroska), WebM (Google VP8/VP9), AVI, FLV, GIF, MP3, AAC, and lossless studio WAV (16-bit PCM).",
        },
        {
          q: "Can I convert iPhone MOV videos to MP4?",
          a: "Yes! Use our MOV to MP4 Converter (/convert/mov-to-mp4) to convert Apple QuickTime recordings into universal H.264 MP4 videos compatible with Windows and Android.",
        },
      ],
    },
    {
      category: "Devices, PWA & Commercial Use",
      icon: "Smartphone",
      questions: [
        {
          q: "Can I install VideoReduce.com as an app on my phone or computer?",
          a: "Yes! VideoReduce.com is a certified Progressive Web App (PWA). Click 'Install App' in the navbar or use 'Add to Home Screen' in iOS Safari / Android Chrome to install it natively.",
        },
        {
          q: "Is VideoReduce.com free for commercial use?",
          a: "Yes. VideoReduce.com is provided free of charge for both personal and commercial use without watermarks or account signups.",
        },
      ],
    },
  ];

  const allFaqsFlat = faqCategories.flatMap((c) => c.questions);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqsFlat.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <div className="relative min-h-screen py-12 sm:py-20">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Glow Backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[450px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <HelpCircle className="h-4 w-4" />
            <span>Master FAQ & Troubleshooting Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Everything you need to know about VideoReduce.com, WebAssembly technology, formats, and platform limits.
          </p>
        </div>

        {/* Categories of FAQs */}
        <div className="space-y-10">
          {faqCategories.map((cat, idx) => (
            <div key={idx} className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2.5">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>{cat.category}</span>
              </h2>

              <div className="grid grid-cols-1 gap-3.5">
                {cat.questions.map((faq, qIdx) => (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-2"
                  >
                    <h3 className="text-base font-semibold text-white">
                      {faq.q}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-[#0d1627] via-slate-900 to-[#0e1b30] p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Still Have Questions?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Our engineering team is here to assist with custom codec parameters, bug reports, and partnership inquiries.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500"
          >
            <span>Contact Support Team</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
