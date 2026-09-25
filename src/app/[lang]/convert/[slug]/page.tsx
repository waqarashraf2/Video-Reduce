import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  SUPPORTED_LOCALES,
  NON_ENGLISH_LOCALES,
  SupportedLocale,
  isValidLocale,
  getTranslations,
  getLocalizedFormat,
} from "@/config/i18n";
import { FORMAT_PAIRS, getFormatPairBySlug } from "@/config/formats";
import { getToolBySlug } from "@/config/tools";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { SocialShareBar } from "@/components/ui/SocialShareBar";
import { CompetitorComparison } from "@/components/ui/CompetitorComparison";
import dynamic from "next/dynamic";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Info,
  Globe,
  RefreshCw,
} from "lucide-react";

const ToolRunner = dynamic(
  () => import("@/components/tools/ToolRunner").then((m) => m.ToolRunner),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading Converter...</span>
      </div>
    ),
  }
);

interface LocalizedFormatPageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];

  for (const lang of NON_ENGLISH_LOCALES) {
    for (const format of FORMAT_PAIRS) {
      params.push({
        lang,
        slug: format.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: LocalizedFormatPageProps): Promise<Metadata> {
  if (!isValidLocale(params.lang) || params.lang === "en") {
    return { title: "Page Not Found | VideoReduce" };
  }

  const format = getLocalizedFormat(params.slug, params.lang);
  if (!format) {
    return { title: "Converter Not Found | VideoReduce" };
  }

  const canonicalUrl = `https://videoreduce.com/${params.lang}/convert/${format.slug}`;

  return {
    title: format.localeSeoTitle,
    description: format.localeSeoDescription,
    keywords: format.localeKeywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `https://videoreduce.com/convert/${format.slug}`,
        es: `https://videoreduce.com/es/convert/${format.slug}`,
        pt: `https://videoreduce.com/pt/convert/${format.slug}`,
        fr: `https://videoreduce.com/fr/convert/${format.slug}`,
        de: `https://videoreduce.com/de/convert/${format.slug}`,
        it: `https://videoreduce.com/it/convert/${format.slug}`,
        hi: `https://videoreduce.com/hi/convert/${format.slug}`,
        "x-default": `https://videoreduce.com/convert/${format.slug}`,
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
      title: format.localeSeoTitle,
      description: format.localeSeoDescription,
      type: "website",
      siteName: "VideoReduce",
      url: canonicalUrl,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${format.title} — VideoReduce`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: format.localeSeoTitle,
      description: format.localeSeoDescription,
      images: ["/og-image.jpg"],
    },
  };
}

export default function LocalizedFormatConverterPage({
  params,
}: LocalizedFormatPageProps) {
  if (!isValidLocale(params.lang) || params.lang === "en") {
    notFound();
  }

  const format = getLocalizedFormat(params.slug, params.lang);
  if (!format) {
    notFound();
  }

  const t = getTranslations(params.lang);
  const tool =
    getToolBySlug(format.toolSlug || "format-converter") ||
    getToolBySlug("format-converter")!;

  const canonicalUrl = `https://videoreduce.com/${params.lang}/convert/${format.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: `${format.title} — VideoReduce`,
        url: canonicalUrl,
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
        description: format.localeSeoDescription,
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
            name: t.convert,
            item: `https://videoreduce.com/${params.lang}/convert/mov-to-mp4`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: format.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "HowTo",
        name: `${t.howToConvert} ${format.fromFormat} ➔ ${format.toFormat}`,
        description: format.localeSeoDescription,
        image: "https://videoreduce.com/og-image.jpg",
        totalTime: "PT1M",
        step: (format.localeSteps || format.steps).map((s) => ({
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
        mainEntity: (format.localeFaqs || format.faqs).map((f) => ({
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
    <div className="relative min-h-screen bg-white py-10 sm:py-14 text-slate-900">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation & In-Page Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Link
              href={`/${params.lang}`}
              className="hover:text-red-600 transition-colors"
            >
              {t.home}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link
              href={`/${params.lang}/convert/mov-to-mp4`}
              className="hover:text-red-600 transition-colors"
            >
              {t.convert}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-red-600 font-bold">{format.title}</span>
          </nav>

          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-red-600" />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Page Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
              {format.badge}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {t.inBrowserPrivate}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 border border-slate-200 flex items-center gap-1">
              <Zap className="h-3 w-3 text-red-600" />
              {t.noServerUpload}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950">
            {format.localeH1}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
            {format.localeTagline}
          </p>
        </header>

        {/* Interactive Format Converter Tool */}
        <main className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl ring-1 ring-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
              <RefreshCw className="h-4 w-4" />
              <span>Transcoding {format.fromFormat} ➔ {format.toFormat}</span>
            </div>
            <span className="text-xs text-emerald-700 font-semibold">{t.zeroServerCost}</span>
          </div>

          <ToolRunner
            tool={tool}
            initialOptions={{
              targetFormat: (format.targetFormatEnum || "mp4") as any,
              conversionMode: "fast-copy",
            }}
          />
        </main>

        {/* Social Share Bar */}
        <SocialShareBar
          title={`${format.title} | VideoReduce.com`}
          url={canonicalUrl}
          description={format.localeSeoDescription}
        />

        {/* Competitor Differentiation (VideoReduce vs FreeConvert) */}
        <CompetitorComparison lang={params.lang as SupportedLocale} />

        {/* Why Convert & Technical Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              {t.whyConvertTitle} {format.fromFormat} ➔ {format.toFormat}?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {format.localeWhyConvert}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-3 shadow-sm">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {t.techSpecsTitle}
            </h2>
            <div className="space-y-2.5 pt-1">
              {(format.localeTechnicalSpecs || format.technicalSpecs).map((s, idx) => (
                <div key={idx} className="flex justify-between border-b border-slate-100 pb-1.5 text-xs">
                  <span className="text-slate-500">{s.label}:</span>
                  <span className="font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-950">
              {t.howToConvert} {format.fromFormat} ➔ {format.toFormat}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(format.localeSteps || format.steps).map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm hover:border-red-200 hover:shadow-md transition-all"
              >
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 font-mono text-xs font-black text-red-600 border border-red-200">
                  0{s.step}
                </div>
                <div className="text-sm font-bold text-slate-900">{s.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        {(format.localeFaqs || format.faqs).length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-red-600" />
              {t.faqTitle}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {(format.localeFaqs || format.faqs).map((f, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1.5 shadow-sm">
                  <div className="text-sm font-bold text-slate-900">{f.q}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
