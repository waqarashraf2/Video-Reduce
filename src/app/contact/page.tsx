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
  AlertCircle,
} from "lucide-react";


export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Feature Request",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.videoreduce.com";


    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          throw new Error(String(firstError || data.message || "Validation failed"));
        }
        throw new Error(data.message || `Server responded with status ${response.status}`);
      }

      setStatus("success");
    } catch (err: any) {
      console.error("Contact Form Submission Error:", err);
      setStatus("error");
      setErrorMessage(
        err.message || "Failed to submit message. Please verify the backend API is running."
      );
    }
  };


  return (
    <div className="relative min-h-screen bg-white py-12 sm:py-20 text-slate-900">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold text-red-700 shadow-sm">
            <Mail className="h-4 w-4 text-red-600" />
            <span>Official Support & Feedback • Verse Next Team</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Contact VideoReduce.com
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Have questions about WebAssembly video processing, partnership inquiries, or feature suggestions? Send us a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Contact Info & Trust Cards */}
          <div className="md:col-span-2 space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <BrandLogo size="sm" />
              <p className="text-xs text-slate-600 leading-relaxed">
                VideoReduce.com is an open-access client-side multimedia utility created and maintained by the <strong className="text-slate-900">Verse Next</strong> media engineering team.
              </p>

              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-red-600 shrink-0" />
                  <span>Official Domain: <strong className="text-slate-950">videoreduce.com</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Response Time: <strong className="text-slate-950">Within 24 Hours</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-red-600 shrink-0" />
                  <span>100% Privacy Guarantee</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                <HelpCircle className="h-4 w-4 text-red-600" />
                <span>Need Instant Help?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check our master FAQ and guides for instant troubleshooting tips.
              </p>
              <Link
                href="/faq"
                className="inline-block pt-1 text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
              >
                Visit Help Center & FAQ ➔
              </Link>
            </div>
          </div>

          {/* Right Interactive Input Form */}
          <div className="md:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl ring-1 ring-slate-100 space-y-6">
            <h2 className="text-lg font-black text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="h-5 w-5 text-red-600" />
              Send Us a Message
            </h2>

            {status === "success" ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3 animate-in fade-in">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">Thank You for Your Feedback!</h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your message has been received by the Verse Next engineering team. We appreciate your input as we continue expanding VideoReduce.com!
                </p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setFormData({ name: "", email: "", subject: "Feedback", message: "" });
                  }}
                  className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <p className="leading-relaxed">{errorMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Smith"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject / Category</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="Feature Request">Feature Request / Suggestion</option>
                    <option value="Bug Report">Bug Report / Processing Issue</option>
                    <option value="Partnership">Partnership & API Inquiry</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you love, what can be improved, or tools you want to see..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 p-3 text-xs font-bold text-white shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
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
