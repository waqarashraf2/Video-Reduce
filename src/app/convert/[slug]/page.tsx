import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FORMAT_PAIRS, getFormatPairBySlug } from "@/config/formats";
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
        <span className="text-xs text-slate-400">Loading Converter Engine...</span>
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
  RefreshCw,
} from "lucide-react";

interface FormatPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return FORMAT_PAIRS.map((f) => ({
    slug: f.slug,
  }));
}

export async function generateMetadata({ params }: FormatPageProps): Promise<Metadata> {
  const formatPair = getFormatPairBySlug(params.slug);
  if (!formatPair) {
    return {
      title: "Converter Not Found | VideoReduce.com",
    };
  }

  return {
    title: formatPair.title,
    description: formatPair.seoDescription,
    keywords: formatPair.keywords.slice(0, 8),
    alternates: {
      canonical: `https://videoreduce.com/convert/${formatPair.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${formatPair.title} — VideoReduce.com`,
      description: formatPair.seoDescription,
      type: "website",
      siteName: "VideoReduce.com",
      url: `https://videoreduce.com/convert/${formatPair.slug}`,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${formatPair.title} — VideoReduce`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: formatPair.title,
      description: formatPair.seoDescription,
      images: ["/og-image.jpg"],
    },
  };
}

export default function FormatConverterPage({ params }: FormatPageProps) {
  const formatPair = getFormatPairBySlug(params.slug);

  if (!formatPair) {
    notFound();
  }

  const tool = getToolBySlug("format-converter")!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `${formatPair.title} — VideoReduce.com`,
        url: `https://videoreduce.com/convert/${formatPair.slug}`,
        image: "https://videoreduce.com/logo.png",
        screenshot: "https://videoreduce.com/logo.png",
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Video & Audio Processing",
        operatingSystem: "All (Browser-Based: Windows, Mac, iOS, Android, Linux)",
        browserRequirements: "Requires WebAssembly Compatible Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "750",
          bestRating: "5",
          worstRating: "1",
        },
        description: formatPair.seoDescription,
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
            name: "Converters",
            item: "https://videoreduce.com/tools/format-converter",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: formatPair.title,
            item: `https://videoreduce.com/convert/${formatPair.slug}`,
          },
        ],
      },
      {
        "@type": "HowTo",
        name: `How to Convert ${formatPair.fromFormat} to ${formatPair.toFormat}`,
        description: formatPair.seoDescription,
        totalTime: "PT2M",
        step: formatPair.steps.map((s) => ({
          "@type": "HowToStep",
          position: s.step,
          name: s.title,
          text: s.desc,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: formatPair.faqs.map((f) => ({
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
          <span className="text-slate-500">Convert</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-blue-400 font-semibold">{formatPair.title}</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400 ring-1 ring-blue-500/30">
              {formatPair.badge}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/30 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              100% In-Browser Transcode
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {formatPair.h1}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl">
            {formatPair.tagline}
          </p>
        </header>

        {/* Interactive Format Converter Tool */}
        <main className="rounded-3xl border border-blue-500/30 bg-[#0d1424]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <RefreshCw className="h-4 w-4" />
              <span>Transcoding {formatPair.fromFormat} ➔ {formatPair.toFormat}</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium">0 Server Cost</span>
          </div>

          <ToolRunner tool={tool} />
        </main>

        {/* Social Share Bar */}
        <SocialShareBar
          title={`${formatPair.title} | VideoReduce.com`}
          url={`https://videoreduce.com/convert/${formatPair.slug}`}
          description={formatPair.seoDescription}
        />

        {/* Why Convert & Technical Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              Why Convert {formatPair.fromFormat} to {formatPair.toFormat}?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {formatPair.whyConvert}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Technical Format Specifications
            </h2>
            <div className="space-y-2.5 pt-1">
              {formatPair.technicalSpecs.map((s, idx) => (
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
            <h2 className="text-2xl font-bold text-white">How to Convert {formatPair.fromFormat} to {formatPair.toFormat}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {formatPair.steps.map((s) => (
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
        {formatPair.faqs.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {formatPair.faqs.map((f, idx) => (
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
