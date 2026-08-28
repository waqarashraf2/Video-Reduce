"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  Mail,
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Globe,
  Clock,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Feedback / Feature Request",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate instant secure submission (can also POST to Verse Next Laravel API endpoint)
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
  };

  return (
    <div className="relative min-h-screen py-12 sm:py-20">
      {/* Glow Backdrops */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[450px] w-full max-w-7xl bg-hero-glow blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <Mail className="h-4 w-4" />
            <span>Official Support & Feedback • Verse Next Team</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Contact VideoReduce.com
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Have questions about WebAssembly video processing, partnership inquiries, or feature suggestions? Send us a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Contact Info & Trust Cards */}
          <div className="md:col-span-2 space-y-5">
            <div className="rounded-3xl border border-white/10 bg-[#0d1424]/90 p-6 space-y-4">
              <BrandLogo size="sm" />
              <p className="text-xs text-slate-300 leading-relaxed">
                VideoReduce.com is an open-access client-side multimedia utility created and maintained by the <strong>Verse Next</strong> media engineering team.
              </p>

              <div className="space-y-3 pt-2 border-t border-white/10 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Official Domain: <strong>videoreduce.com</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Response Time: <strong>Within 24 Hours</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>100% Privacy Guarantee</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <HelpCircle className="h-4 w-4" />
                <span>Need Instant Help?</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check our master FAQ and guides for instant troubleshooting tips.
              </p>
              <Link
                href="/faq"
                className="inline-block pt-1 text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                Visit Help Center & FAQ ➔
              </Link>
            </div>
          </div>

          {/* Right Interactive Input Form */}
          <div className="md:col-span-3 rounded-3xl border border-white/10 bg-[#0a0f1d] p-6 sm:p-8 shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Send Us a Message
            </h2>

            {status === "success" ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3 animate-in fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white">Thank You for Your Feedback!</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your message has been received by the Verse Next engineering team. We appreciate your input as we continue expanding VideoReduce.com!
                </p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setFormData({ name: "", email: "", subject: "Feedback", message: "" });
                  }}
                  className="mt-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Smith"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Subject / Category</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Feature Request">Feature Request / Suggestion</option>
                    <option value="Bug Report">Bug Report / Processing Issue</option>
                    <option value="Partnership">Partnership & API Inquiry</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you love, what can be improved, or tools you want to see..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 p-3.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{status === "submitting" ? "Sending..." : "Submit Message"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
