import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ARTICLES } from "@/config/articles";
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Video Engineering & Privacy Guides | VideoReduce.com",
  description:
    "Explore in-depth technical guides on video compression, privacy-first media processing, format conversion, and social media optimization by VideoReduce.com.",
  keywords: [
    "video compression guide",
    "how to compress videos",
    "video engineering blog",
    "private video converter guide",
    "videoreduce articles",
  ],
  alternates: {
    canonical: "https://videoreduce.com/articles",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Video Engineering & Privacy Guides — VideoReduce.com",
    description:
      "Expert guides on video compression, WebAssembly processing, GIF conversion, and privacy-first media editing.",
    type: "website",
    siteName: "VideoReduce.com",
    url: "https://videoreduce.com/articles",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "VideoReduce.com Knowledge Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Engineering & Privacy Guides | VideoReduce.com",
    description:
      "Expert guides on video compression, WebAssembly processing, and privacy-first media editing.",
    images: ["/logo.png"],
  },
};

export default function ArticlesDirectoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "VideoReduce.com Knowledge Hub",
    description: "Expert guides on video compression, WebAssembly processing, and privacy.",
    url: "https://videoreduce.com/articles",
    blogPost: ARTICLES.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      description: a.seoDescription,
      datePublished: a.publishedDate,
      url: `https://videoreduce.com/articles/${a.slug}`,
      author: {
        "@type": "Organization",
        name: a.author.name,
      },
    })),
  };

  return (
    <div className="relative min-h-screen py-12 sm:py-20">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Glow Backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <BookOpen className="h-4 w-4" />
            <span>VideoReduce.com Knowledge Hub • By Verse Next</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Video Engineering & Privacy Guides
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Human-crafted, in-depth research articles on psycho-visual video compression, zero-server privacy, codec optimization, and social media workflows.
          </p>
        </div>

        {/* Featured / Master Articles Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((art) => (
            <Link
              key={art.slug}
              href={`/articles/${art.slug}`}
              className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0d1424]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-blue-500/15"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/15 px-3 py-0.5 text-xs font-semibold text-blue-400 ring-1 ring-blue-500/30">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {art.title}
                </h2>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <Image
                    src={art.author.avatar}
                    alt={art.author.name}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-white/20"
                  />
                  <span className="text-slate-300 font-medium">{art.author.name}</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Read Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Verse Next Innovation Banner */}
        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-[#0d1627] via-slate-900 to-[#0e1b30] p-8 sm:p-10 backdrop-blur-2xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span>Verse Next Innovation Suite</span>
          </div>
          <h3 className="text-2xl font-bold text-white sm:text-3xl">
            100% Client-Side Computing for Everyone
          </h3>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            VideoReduce.com is designed and maintained by <strong>Verse Next</strong> to bring free, private, high-performance multimedia WebAssembly tools to billions of creators worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
