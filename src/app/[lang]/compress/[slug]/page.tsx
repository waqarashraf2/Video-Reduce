import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { USE_CASES } from "@/config/use-cases";
import { getToolBySlug } from "@/config/tools";
import {
  SUPPORTED_LOCALES,
  NON_ENGLISH_LOCALES,
  SupportedLocale,
  isValidLocale,
  getLocalizedUseCase,
  getTranslations,
} from "@/config/i18n";
import { SocialShareBar } from "@/components/ui/SocialShareBar";
import { CompetitorComparison } from "@/components/ui/CompetitorComparison";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import dynamic from "next/dynamic";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Globe,
} from "lucide-react";

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

interface LocalizedUseCasePageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];

  for (const lang of NON_ENGLISH_LOCALES) {
    for (const uc of USE_CASES) {
      params.push({
        lang,
        slug: uc.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: LocalizedUseCasePageProps): Promise<Metadata> {
  if (!isValidLocale(params.lang) || params.lang === "en") {
    return { title: "Page Not Found | VideoReduce" };
  }

  const useCase = getLocalizedUseCase(params.slug, params.lang);
  if (!useCase) {
    return { title: "Preset Not Found | VideoReduce" };
  }

  const canonicalUrl = `https://videoreduce.com/${params.lang}/compress/${useCase.slug}`;

  return {
    title: useCase.localeSeoTitle,
    description: useCase.localeSeoDescription,
    keywords: useCase.localeKeywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `https://videoreduce.com/compress/${useCase.slug}`,
        es: `https://videoreduce.com/es/compress/${useCase.slug}`,
        pt: `https://videoreduce.com/pt/compress/${useCase.slug}`,
        fr: `https://videoreduce.com/fr/compress/${useCase.slug}`,
        de: `https://videoreduce.com/de/compress/${useCase.slug}`,
        it: `https://videoreduce.com/it/compress/${useCase.slug}`,
        hi: `https://videoreduce.com/hi/compress/${useCase.slug}`,
        "x-default": `https://videoreduce.com/compress/${useCase.slug}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
    openGraph: {
      title: useCase.localeSeoTitle,
      description: useCase.localeSeoDescription,
      type: "website",
      siteName: "VideoReduce",
      url: canonicalUrl,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${useCase.title} — VideoReduce`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: useCase.localeSeoTitle,
      description: useCase.localeSeoDescription,
      images: ["/og-image.jpg"],
    },
  };
}

export default function LocalizedUseCasePage({
  params,
}: LocalizedUseCasePageProps) {
  if (!isValidLocale(params.lang) || params.lang === "en") {
    notFound();
  }

  const useCase = getLocalizedUseCase(params.slug, params.lang);
  if (!useCase) {
    notFound();
  }

  const t = getTranslations(params.lang);
  const tool = getToolBySlug("video-compressor")!;

  const canonicalUrl = `https://videoreduce.com/${params.lang}/compress/${useCase.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `${useCase.title} — VideoReduce`,
        url: canonicalUrl,
        image: "https://videoreduce.com/logo.png",
        screenshot: "https://videoreduce.com/og-image.jpg",
        applicationCategory: "MultimediaApplication",
        applicationSubCategory: "Video Compression & Optimization",
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
        description: useCase.localeSeoDescription,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t.home,
            item: `https://videoreduce.com/${params.lang}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: t.compress,
            item: `https://videoreduce.com/${params.lang}/compress/whatsapp-video`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: useCase.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "HowTo",
        name: `${t.howToCompress} - ${useCase.title}`,
        description: useCase.localeSeoDescription,
        image: "https://videoreduce.com/og-image.jpg",
        totalTime: "PT1M",
        step: (useCase.localeSteps || useCase.steps).map((s) => ({
          "@type": "HowToStep",
          position: s.step,
          name: s.title,
          text: s.desc,
          url: `${canonicalUrl}#step-${s.step}`,
          image: "https://videoreduce.com/og-image.jpg",
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: (useCase.localeFaqs || useCase.faqs).map((f) => ({
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
        {/* Breadcrumb Navigation & In-Page Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link
              href={`/${params.lang}`}
              className="hover:text-blue-400 transition-colors"
            >
              {t.home}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <Link
              href={`/${params.lang}/compress/whatsapp-video`}
              className="hover:text-blue-400 transition-colors"
            >
              {t.compress}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-blue-400 font-semibold">{useCase.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Page Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400 ring-1 ring-blue-500/30">
              {useCase.badge}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/30 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {t.inBrowserPrivate}
            </span>
            <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-400 ring-1 ring-indigo-500/30 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {t.noServerUpload}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            {useCase.localeH1}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            {useCase.localeTagline}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-white/10">
              <span className="font-semibold text-white">{t.targetLimit}</span>
              <span className="text-emerald-400 font-mono font-bold">{useCase.targetSizeText}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 border border-white/10">
              <span className="font-semibold text-white">{t.recommendedPreset}</span>
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
            <span className="text-xs text-emerald-400 font-medium">{t.zeroServerCost}</span>
          </div>

          <ToolRunner tool={tool} />
        </main>

        {/* Social Share Bar */}
        <SocialShareBar
          title={`${useCase.title} | VideoReduce.com`}
          url={canonicalUrl}
          description={useCase.localeSeoDescription}
        />

        {/* Competitor Differentiation (VideoReduce vs FreeConvert) */}
        <CompetitorComparison lang={params.lang as SupportedLocale} />

        {/* Why It Matters & Best Settings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              {t.whyCompressTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {useCase.localeWhyItMatters}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              {t.techSpecsTitle}
            </h2>
            <div className="space-y-2.5 pt-1">
              {(useCase.localeBestSettings || useCase.bestSettings).map((s, idx) => (
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
            <h2 className="text-2xl font-bold text-white">
              {t.howToCompress} - {useCase.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(useCase.localeSteps || useCase.steps).map((s) => (
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
        {(useCase.localeFaqs || useCase.faqs).length > 0 && (
          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              {t.faqTitle}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {(useCase.localeFaqs || useCase.faqs).map((f, idx) => (
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
