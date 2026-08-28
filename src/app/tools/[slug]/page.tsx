import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TOOLS, getToolBySlug } from "@/config/tools";
import { ToolSeoContent } from "@/components/tools/ToolSeoContent";
import { ToolIcon } from "@/components/ui/ToolIcon";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";

const ToolRunner = dynamic(
  () => import("@/components/tools/ToolRunner").then((m) => m.ToolRunner),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <span className="text-xs text-slate-400">Loading WebAssembly Suite...</span>
      </div>
    ),
  }
);

interface ToolPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    return {
      title: "Tool Not Found | VideoReduce.com",
    };
  }

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.seoKeywords.slice(0, 8),
    alternates: {
      canonical: `https://videoreduce.com/tools/${tool.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${tool.seoTitle} — VideoReduce.com`,
      description: tool.seoDescription,
      type: "website",
      siteName: "VideoReduce.com",
      url: `https://videoreduce.com/tools/${tool.slug}`,
      images: [
        {
          url: "/logo.png",
          width: 1024,
          height: 1024,
          alt: `${tool.name} — Free Online Tool by VideoReduce.com`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.seoTitle} | VideoReduce.com`,
      description: tool.seoDescription,
      images: ["/logo.png"],
    },
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="relative min-h-screen py-10 sm:py-14">
      {/* Glow Backdrops */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[450px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-60" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-slate-500">Tools</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-blue-400 font-semibold">{tool.name}</span>
        </nav>

        {/* Tool Header */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
              <ToolIcon name={tool.iconName} className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  {tool.name}
                </h1>
                {tool.badge && (
                  <span className="rounded-full bg-blue-500/15 px-3 py-0.5 text-xs font-bold text-blue-400 ring-1 ring-blue-500/30">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-300">
                {tool.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-emerald-400 ring-1 ring-emerald-500/20 font-medium">
              <Lock className="h-3.5 w-3.5" />
              <span>100% Client-Side WebAssembly</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2.5 py-1 text-blue-400 ring-1 ring-blue-500/20 font-medium">
              <Zap className="h-3.5 w-3.5" />
              <span>{tool.estimatedSpeed}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 text-slate-300 ring-1 ring-white/10 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span>No File Size Limits</span>
            </div>
          </div>
        </header>

        {/* Interactive Tool Runner Applet */}
        <main className="rounded-3xl border border-white/10 bg-[#0d1424]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <ToolRunner tool={tool} />
        </main>

        {/* Below-the-fold Rich SEO Content, FAQs, and Schemas */}
        <ToolSeoContent tool={tool} />
      </div>
    </div>
  );
}
