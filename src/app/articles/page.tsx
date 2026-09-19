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
  title: "Video Engineering & Privacy Guides",
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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VideoReduce Knowledge Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Video Engineering & Privacy Guides | VideoReduce",
    description:
      "Expert guides on video compression, WebAssembly processing, and privacy-first media editing.",
    images: ["/og-image.jpg"],
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
    <div className="relative min-h-screen bg-white py-12 sm:py-20 text-slate-900">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-700">
            <BookOpen className="h-4 w-4 text-red-600" />
            <span>VideoReduce.com Knowledge Hub • By Verse Next</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Video Engineering & Privacy Guides
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Human-crafted, in-depth research articles on psycho-visual video compression, zero-server privacy, codec optimization, and social media workflows.
          </p>
        </div>

        {/* Featured / Master Articles Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((art) => (
            <Link
              key={art.slug}
              href={`/articles/${art.slug}`}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-red-50 px-3 py-0.5 text-xs font-bold text-red-700 ring-1 ring-red-200">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                  {art.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <Image
                    src={art.author.avatar}
                    alt={art.author.name}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-red-200"
                  />
                  <span className="text-slate-700 font-semibold">{art.author.name}</span>
                </div>

                <div className="flex items-center gap-1 font-bold text-red-600 group-hover:translate-x-1 transition-transform">
                  <span>Read Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Verse Next Innovation Banner */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
            <Sparkles className="h-4 w-4" />
            <span>Verse Next Innovation Suite</span>
          </div>
          <h3 className="text-2xl font-black text-slate-950 sm:text-3xl">
            100% Client-Side Computing for Everyone
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            VideoReduce.com is designed and maintained by <strong className="text-slate-900 font-bold">Verse Next</strong> to bring free, private, high-performance multimedia WebAssembly tools to billions of creators worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
