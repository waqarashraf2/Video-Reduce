import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ARTICLES, getArticleBySlug } from "@/config/articles";
import { getToolBySlug } from "@/config/tools";
import dynamic from "next/dynamic";
import { parseArticleMarkdown } from "@/lib/markdown";
import { SocialShareBar } from "@/components/ui/SocialShareBar";

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
    title: article.seoTitle,
    description: article.seoDescription,
    keywords: article.targetKeywords.slice(0, 8),
    alternates: {
      canonical: `https://videoreduce.com/articles/${article.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${article.seoTitle} — VideoReduce.com`,
      description: article.seoDescription,
      type: "article",
      publishedTime: article.publishedDate,
      authors: [article.author.name],
      siteName: "VideoReduce.com",
      url: `https://videoreduce.com/articles/${article.slug}`,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle,
      description: article.seoDescription,
      images: ["/og-image.jpg"],
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
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://videoreduce.com/articles/${article.slug}`,
        },
        image: "https://videoreduce.com/og-image.jpg",
        author: {
          "@type": "Organization",
          name: article.author.name,
          url: "https://videoreduce.com",
        },
        publisher: {
          "@type": "Organization",
          name: "VideoReduce.com",
          logo: {
            "@type": "ImageObject",
            url: "https://videoreduce.com/logo.png",
          },
        },
        keywords: article.targetKeywords.join(", "),
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
            name: "Articles",
            item: "https://videoreduce.com/articles",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: `https://videoreduce.com/articles/${article.slug}`,
          },
        ],
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
    <article className="relative min-h-screen bg-white py-10 sm:py-16 text-slate-900">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-red-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href="/articles" className="hover:text-red-600 transition-colors">
              Articles
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-red-600 font-bold truncate max-w-[220px] sm:max-w-none">
              {article.category}
            </span>
          </nav>

          <Link
            href="/articles"
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 hover:border-red-300 border border-slate-200 shadow-sm transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200">
              {article.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              <span>{article.publishedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl leading-[1.2]">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {article.summary}
          </p>

          {/* Author & Verse Next Byline */}
          <div className="flex items-center justify-between border-y border-slate-200 py-4">
            <div className="flex items-center gap-3">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-red-200"
              />
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{article.author.name}</span>
                  <span className="rounded bg-red-50 border border-red-200 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
                    Verse Next
                  </span>
                </div>
                <div className="text-xs text-slate-500">{article.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>0 Bytes Uploaded</span>
            </div>
          </div>
        </header>

        {/* Embedded Interactive Tool Applet */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
              <Sparkles className="h-4 w-4" />
              <span>Try Live in Browser: {recommendedTool.name}</span>
            </div>
            <span className="text-xs text-emerald-700 font-bold">100% Free Wasm</span>
          </div>

          <ToolRunner tool={recommendedTool} />
        </section>

        {/* Social Share Bar */}
        <SocialShareBar
          title={`${article.title} | VideoReduce.com`}
          url={`https://videoreduce.com/articles/${article.slug}`}
          description={article.seoDescription}
        />

        {/* Long-Form Humanized Editorial Body */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm text-slate-800 leading-relaxed">
          <div
            dangerouslySetInnerHTML={{
              __html: parseArticleMarkdown(article.content),
            }}
          />
        </div>

        {/* Article Specific FAQ Section */}
        {article.faqs.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-slate-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-950 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-red-600" />
                Frequently Asked Questions
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {article.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-2 shadow-sm"
                >
                  <h3 className="text-base font-bold text-slate-900">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Next Articles & Ecosystem Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-900">VideoReduce.com</span> is a product of the{" "}
            <strong className="text-red-600">Verse Next</strong> modern AI & WebAssembly innovation lab.
          </div>
          <Link
            href="/articles"
            className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 shrink-0"
          >
            <span>Explore More Guides</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
