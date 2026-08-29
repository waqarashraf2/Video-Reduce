import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { USE_CASES, getUseCaseBySlug } from "@/config/use-cases";
import { getToolBySlug } from "@/config/tools";
import { SocialShareBar } from "@/components/ui/SocialShareBar";
import dynamic from "next/dynamic";

const ToolRunner = dynamic(
  () => import("@/components/tools/ToolRunner").then((m) => m.ToolRunner),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-xs text-slate-400">Loading Compressor...</span>
      </div>
    ),
  }
);
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

interface UseCasePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return USE_CASES.map((u) => ({
    slug: u.slug,
  }));
}

export async function generateMetadata({ params }: UseCasePageProps): Promise<Metadata> {
  const useCase = getUseCaseBySlug(params.slug);
  if (!useCase) {
    return {
      title: "Page Not Found | VideoReduce.com",
    };
  }

  return {
    title: useCase.title,
    description: useCase.seoDescription,
    keywords: useCase.keywords.slice(0, 8),
    alternates: {
      canonical: `https://videoreduce.com/compress/${useCase.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${useCase.title} — VideoReduce.com`,
      description: useCase.seoDescription,
      type: "website",
      siteName: "VideoReduce.com",
      url: `https://videoreduce.com/compress/${useCase.slug}`,
      images: [
        {
          url: "/logo.png",
          width: 1024,
          height: 1024,
          alt: `${useCase.title} — VideoReduce.com`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: useCase.title,
      description: useCase.seoDescription,
      images: ["/logo.png"],
    },
  };
}

export default function UseCasePage({ params }: UseCasePageProps) {
  const useCase = getUseCaseBySlug(params.slug);

  if (!useCase) {
    notFound();
  }

  const tool = getToolBySlug("video-compressor")!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `${useCase.title} — VideoReduce.com`,
        url: `https://videoreduce.com/compress/${useCase.slug}`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "All (Browser-Based)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: useCase.seoDescription,
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
            name: "Compress",
            item: "https://videoreduce.com/#tools-grid",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: useCase.title,
            item: `https://videoreduce.com/compress/${useCase.slug}`,
          },
        ],
      },
      {
        "@type": "HowTo",
        name: `How to ${useCase.title}`,
        step: useCase.steps.map((s) => ({
          "@type": "HowToStep",
          position: s.step,
          name: s.title,
          text: s.desc,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: useCase.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="relative min-h-screen py-10 sm:py-14">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Glow Backdrops */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[450px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-60" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-slate-500">Compress</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-blue-400 font-semibold">{useCase.title}</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400 ring-1 ring-blue-500/30">
              {useCase.badge}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/30 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              100% Private Wasm
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {useCase.h1}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl">
            {useCase.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-white/10">
              <span className="font-semibold text-white">Target Limit:</span>
              <span className="text-emerald-400 font-mono font-bold">{useCase.targetSizeText}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-white/10">
              <span className="font-semibold text-white">Recommended Preset:</span>
              <span className="text-blue-400 font-bold">{useCase.recommendedPreset}</span>
            </div>
          </div>
        </header>

        {/* Interactive Compressor Tool */}
        <main className="rounded-3xl border border-blue-500/30 bg-[#0d1424]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Sparkles className="h-4 w-4" />
              <span>Instant Video Compression Engine</span>
            </div>
            <span className="text-xs text-slate-400">0 Bytes Uploaded</span>
          </div>

          <ToolRunner tool={tool} />
        </main>

        {/* Social Share Bar */}
        <SocialShareBar
          title={`${useCase.title} | VideoReduce.com`}
          url={`https://videoreduce.com/compress/${useCase.slug}`}
          description={useCase.seoDescription}
        />

        {/* Why It Matters & Best Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              Why Pre-Compressing Matters
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {useCase.whyItMatters}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Optimal Technical Specifications
            </h2>
            <div className="space-y-2.5 pt-1">
              {useCase.bestSettings.map((s, idx) => (
                <div key={idx} className="flex justify-between border-b border-white/5 pb-1.5 text-xs">
                  <span className="text-slate-400">{s.label}:</span>
                  <span className="font-semibold text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">How to {useCase.title}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {useCase.steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-2"
              >
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 font-mono text-xs font-bold text-blue-400">
                  0{s.step}
                </div>
                <div className="text-sm font-bold text-white">{s.title}</div>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        {useCase.faqs.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {useCase.faqs.map((f, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-1.5">
                  <div className="text-sm font-semibold text-white">{f.q}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
