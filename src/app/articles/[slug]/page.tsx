import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ARTICLES, getArticleBySlug } from "@/config/articles";
import { getToolBySlug } from "@/config/tools";
import dynamic from "next/dynamic";
import { parseArticleMarkdown } from "@/lib/markdown";

const ToolRunner = dynamic(
  () => import("@/components/tools/ToolRunner").then((m) => m.ToolRunner),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-xs text-slate-400">Loading Interactive Tool...</span>
      </div>
    ),
  }
);
import {
  ChevronRight,
  Clock,
  Calendar,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  Share2,
  Lock,
} from "lucide-react";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: "Article Not Found | VideoReduce.com",
    };
  }

  return {
    title: article.title,
    description: article.seoDescription,
    keywords: article.targetKeywords,
    openGraph: {
      title: `${article.title} - VideoReduce.com`,
      description: article.seoDescription,
      type: "article",
      publishedTime: article.publishedDate,
      authors: [article.author.name],
      siteName: "VideoReduce.com by Verse Next",
      url: `https://videoreduce.com/articles/${article.slug}`,
      images: [
        {
          url: "/logo.png",
          width: 1024,
          height: 1024,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.seoDescription,
      images: ["/logo.png"],
    },
  };
}

export default function ArticleDetailPage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const recommendedTool = getToolBySlug(article.toolRecommendation) || getToolBySlug("video-compressor")!;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.seoDescription,
        datePublished: article.publishedDate,
        dateModified: article.publishedDate,
        mainEntityOfPage: `https://videoreduce.com/articles/${article.slug}`,
        author: {
          "@type": "Organization",
          name: article.author.name,
          url: "https://videoreduce.com",
        },
        publisher: {
          "@type": "Organization",
          name: "VideoReduce.com by Verse Next",
          logo: {
            "@type": "ImageObject",
            url: "https://videoreduce.com/logo.png",
          },
        },
        keywords: article.targetKeywords.join(", "),
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="relative min-h-screen py-10 sm:py-16">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Glow Backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[450px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <Link href="/articles" className="hover:text-blue-400 transition-colors">
              Articles
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-blue-400 font-semibold truncate max-w-[220px] sm:max-w-none">
              {article.category}
            </span>
          </nav>

          <Link
            href="/articles"
            className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400 ring-1 ring-blue-500/30">
              {article.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{article.publishedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.2]">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {article.summary}
          </p>

          {/* Author & Verse Next Byline */}
          <div className="flex items-center justify-between border-y border-white/10 py-4">
            <div className="flex items-center gap-3">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{article.author.name}</span>
                  <span className="rounded bg-violet-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-violet-400">
                    Verse Next
                  </span>
                </div>
                <div className="text-xs text-slate-400">{article.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Lock className="h-3.5 w-3.5" />
              <span>0 Bytes Uploaded</span>
            </div>
          </div>
        </header>

        {/* Embedded Interactive Tool Applet */}
        <section className="rounded-3xl border border-blue-500/30 bg-[#0d1424]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Sparkles className="h-4 w-4" />
              <span>Try Live in Browser: {recommendedTool.name}</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium">100% Free Wasm</span>
          </div>

          <ToolRunner tool={recommendedTool} />
        </section>

        {/* Long-Form Humanized Editorial Body */}
        <article className="prose prose-invert max-w-none rounded-3xl border border-white/10 bg-slate-900/40 p-8 sm:p-10 backdrop-blur-xl">
          <div
            dangerouslySetInnerHTML={{
              __html: parseArticleMarkdown(article.content),
            }}
          />
        </article>

        {/* Article Specific FAQ Section */}
        {article.faqs.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-white/10">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-blue-400" />
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {article.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-2"
                >
                  <h3 className="text-base font-semibold text-white">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Next Articles & Ecosystem Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c121e] p-6 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-white">VideoReduce.com</span> is a product of the{" "}
            <strong className="text-blue-400">Verse Next</strong> modern AI & WebAssembly innovation lab.
          </div>
          <Link
            href="/articles"
            className="flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 shrink-0"
          >
            <span>Explore More Guides</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
