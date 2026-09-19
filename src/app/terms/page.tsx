import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using VideoReduce.com — a free, client-side video compressor and media suite.",
  alternates: {
    canonical: "https://videoreduce.com/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Terms of Service — VideoReduce.com",
    description:
      "Terms and conditions for using VideoReduce.com — a free, client-side video compressor and media suite.",
    type: "website",
    siteName: "VideoReduce.com",
    url: "https://videoreduce.com/terms",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | VideoReduce.com",
    description:
      "Terms and conditions for using VideoReduce.com.",
  },
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-white py-16 sm:py-24 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl ring-1 ring-slate-100 text-slate-600 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-950">1. Acceptance of Terms</h2>
            <p>
              By accessing and using VideoReduce.com, you accept and agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-xl font-black text-slate-950">2. Free Client-Side Utility</h2>
            <p>
              VideoReduce.com is a client-side media utility provided free of charge for personal and commercial use. All computations execute locally on your device hardware.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="text-xl font-black text-slate-950">3. Intellectual Property</h2>
            <p>
              You retain full ownership and all rights to any media you process using our tools. VideoReduce.com does not claim any rights over your content.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
