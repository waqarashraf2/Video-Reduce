import React from "react";
import Link from "next/link";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { ARTICLES } from "@/config/articles";
import { USE_CASES } from "@/config/use-cases";
import { FORMAT_PAIRS } from "@/config/formats";
import { SocialShareBar } from "@/components/ui/SocialShareBar";
import { ToolFeedback } from "@/components/feedback/ToolFeedback";
import {
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Layers,
  FileCheck,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Zap,
} from "lucide-react";

interface ToolSeoContentProps {
  tool: ToolMetadata;
}

export const ToolSeoContent: React.FC<ToolSeoContentProps> = ({ tool }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `${tool.name} — VideoReduce.com`,
        url: `https://videoreduce.com/tools/${tool.slug}`,
        image: "https://videoreduce.com/logo.png",
        screenshot: "https://videoreduce.com/og-image.jpg",
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Video & Audio Processing",
        operatingSystem: "All (Browser-Based: Windows, Mac, iOS, Android, Linux)",
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
        description: tool.seoDescription,
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
            name: "Tools",
            item: "https://videoreduce.com/tools/video-compressor",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: `https://videoreduce.com/tools/${tool.slug}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: tool.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "HowTo",
        name: `How to use ${tool.name} on VideoReduce`,
        description: tool.description,
        image: "https://videoreduce.com/og-image.jpg",
        totalTime: "PT2M",
        step: tool.steps.map((s) => ({
          "@type": "HowToStep",
          position: s.step,
          name: s.title,
          text: s.description,
          url: `https://videoreduce.com/tools/${tool.slug}#step-${s.step}`,
          image: "https://videoreduce.com/og-image.jpg",
        })),
      },
    ],
  };

  return (
    <div className="mt-14 space-y-16 border-t border-slate-200 pt-12">
      {/* Dynamic JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Social Sharing Bar */}
      <SocialShareBar
        title={`${tool.name} — Free Online Tool | VideoReduce.com`}
        url={`https://videoreduce.com/tools/${tool.slug}`}
        description={tool.seoDescription}
      />

      {/* How To Step-by-Step Guide */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-700">
            <Layers className="h-3.5 w-3.5 text-red-600" />
            <span>Step-by-Step Instructions</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            How to use {tool.name}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Follow these 3 quick steps to process your media privately in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {tool.steps.map((step) => (
            <div
              key={step.step}
              className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-red-300 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 font-mono text-sm font-bold text-red-600 ring-1 ring-red-200">
                  0{step.step}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Feature Matrix */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Client-Side Computing</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Why use {tool.name} on VideoReduce.com?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Zero server uploads, infinite privacy, and native WebAssembly hardware acceleration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tool.features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 hover:border-slate-300 shadow-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-600" />
                <div className="text-sm font-bold text-slate-900">{feature.title}</div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Linking: Platform Solution Hubs & Presets */}
      <section className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              <span>Platform Solution Hubs & Presets</span>
            </div>
            <p className="text-xs text-slate-600">
              One-click optimized presets for specific social media and communication platforms.
            </p>
          </div>
          <Link
            href="/compress/whatsapp-video"
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
          >
            <span>Explore Solutions</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {USE_CASES.map((uc) => (
            <Link
              key={uc.slug}
              href={`/compress/${uc.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-red-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  {uc.badge}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                {uc.title}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                {uc.tagline}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Internal Linking: Related Knowledge Guides */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-red-600" />
              <span>Related Engineering & Privacy Guides</span>
            </div>
            <p className="text-xs text-slate-600">
              In-depth research by the VideoReduce Media Lab.
            </p>
          </div>
          <Link
            href="/articles"
            className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
          >
            <span>All Articles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {(() => {
          const matched = ARTICLES.filter((a) => a.toolRecommendation === tool.id);
          const others = ARTICLES.filter((a) => a.toolRecommendation !== tool.id);
          const displayed = [...matched, ...others].slice(0, 3);
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayed.map((art) => (
                <Link
                  key={art.slug}
                  href={`/articles/${art.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-red-300 hover:shadow-md"
                >
                  <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {art.category}
                  </span>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors mt-2 leading-snug">
                    {art.title}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5">
                    {art.summary}
                  </p>
                </Link>
              ))}
            </div>
          );
        })()}
      </section>

      {/* User Reviews, Star Rating & Feedback Recommendations */}
      <ToolFeedback toolName={tool.name} toolSlug={tool.slug} />

      {/* Frequently Asked Questions (FAQ) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-red-600" />
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Everything you need to know about {tool.name} and local WebAssembly processing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
          {tool.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm"
            >
              <div className="text-base font-bold text-slate-900">
                {faq.question}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
