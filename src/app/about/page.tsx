import React from "react";
import { Metadata } from "next";
import { ShieldCheck, Cpu, Zap, Lock, Globe, HardDrive } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works & WebAssembly Architecture",
  description:
    "Learn how VideoReduce.com processes large video and audio files entirely inside your browser using WebAssembly and Web Workers without any server uploads.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <Cpu className="h-4 w-4" />
            <span>Under the Hood: WebAssembly Architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            How VideoReduce.com Works
          </h1>
          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A breakthrough in client-side media computing. No servers, no upload queues, and absolute data sovereignty.
          </p>
        </div>

        <div className="space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:p-10 backdrop-blur-xl text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Zap className="h-5 w-5 text-blue-400" />
              1. The WebAssembly Engine
            </h2>
            <p>
              VideoReduce.com uses <strong>WebAssembly (Wasm)</strong> — a low-level binary code format that runs in modern browsers at near-native CPU speeds. We compiled the entire open-source <strong>FFmpeg</strong> multimedia framework into WebAssembly, allowing your browser to execute raw video transcoding, stream demuxing, filtering, and scaling directly inside your computer or smartphone&apos;s RAM.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-emerald-400" />
              2. Absolute Privacy: 0 Bytes Uploaded
            </h2>
            <p>
              When you pick a file on VideoReduce.com, it is never transmitted over the internet. The file data is loaded into an isolated <strong>Virtual File System (MEMFS)</strong> allocated in your browser&apos;s memory. Once your operation completes, the converted file is rendered and downloaded directly from local RAM.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <HardDrive className="h-5 w-5 text-indigo-400" />
              3. Web Workers & Non-Blocking UI
            </h2>
            <p>
              Heavy media calculations run in a dedicated background <strong>Web Worker thread</strong>. This ensures that your browser UI remains smooth, responsive, and interactive without freezing while compressing high-resolution 4K or 1080p clips.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
