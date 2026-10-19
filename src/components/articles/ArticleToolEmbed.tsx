"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { ToolRunner } from "@/components/tools/ToolRunner";
import { ToolIcon } from "@/components/ui/ToolIcon";
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Film,
  Mic,
  Subtitles,
  Layers,
  Scissors,
  CheckCircle2,
} from "lucide-react";

interface ArticleToolEmbedProps {
  tool: ToolMetadata;
}

const TEXT_TO_VIDEO_PRESETS = [
  {
    label: "🧠 Mind-Blowing Facts",
    prompt: "Did you know that honey never spoils? Archaeologists found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
  },
  {
    label: "💰 Wealth Habits",
    prompt: "The secret to financial freedom is simple: Spend less than you earn, invest the difference wisely, and avoid high-interest consumer debt at all costs.",
  },
  {
    label: "🚀 Space Mysteries",
    prompt: "A day on Venus is longer than a year on Venus. It takes Venus 243 Earth days to rotate once, but only 225 Earth days to orbit the sun.",
  },
  {
    label: "⏳ Stoic Wisdom",
    prompt: "You have power over your mind, not outside events. Realize this, and you will find unstoppable strength.",
  },
];

const TEXT_TO_SPEECH_PRESETS = [
  {
    label: "🎬 Shorts Intro",
    text: "Stop scrolling! Here are 3 psychological tricks that top creators use to hook your attention in under two seconds.",
  },
  {
    label: "🎙️ Podcast Intro",
    text: "Welcome to today's episode. Today we are diving deep into the future of artificial intelligence and creative storytelling.",
  },
  {
    label: "💡 Daily Motivation",
    text: "Discipline is choosing between what you want now and what you want most. Focus on the long game.",
  },
];

export const ArticleToolEmbed: React.FC<ArticleToolEmbedProps> = ({ tool }) => {
  const [t2vPrompt, setT2vPrompt] = useState(TEXT_TO_VIDEO_PRESETS[0].prompt);
  const [ttsScript, setTtsScript] = useState(TEXT_TO_SPEECH_PRESETS[0].text);

  // 1. Text to Video: Dedicated Prompt & Shorts Creator Launcher
  if (tool.id === "text-to-video") {
    return (
      <div className="rounded-3xl border border-red-200/90 bg-gradient-to-b from-white via-red-50/20 to-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                <span>{tool.name}</span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                  100% Free
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Turn any script, article, or story into viral videos with AI scenes, b-rolls & subtitles.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>0 Uploads • In-Browser</span>
          </div>
        </div>

        {/* Interactive Prompt Tester */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Enter Your Script or Story Prompt:
          </label>
          <div className="relative">
            <textarea
              value={t2vPrompt}
              onChange={(e) => setT2vPrompt(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 shadow-inner focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              placeholder="Type your script here or pick a preset below..."
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-500">Quick Ideas:</span>
            {TEXT_TO_VIDEO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setT2vPrompt(preset.prompt)}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                  t2vPrompt === preset.prompt
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Key Feature Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
              <div className="text-xs font-bold text-slate-900">🎬 HD Stock Clips</div>
              <div className="text-[10px] text-slate-500">Auto-matched visuals</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
              <div className="text-xs font-bold text-slate-900">🗣️ AI Voiceover</div>
              <div className="text-[10px] text-slate-500">Natural multi-lingual</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
              <div className="text-xs font-bold text-slate-900">📝 Auto Subtitles</div>
              <div className="text-[10px] text-slate-500">Whisper synced text</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
              <div className="text-xs font-bold text-slate-900">📱 9:16 & 16:9</div>
              <div className="text-[10px] text-slate-500">Shorts, TikTok, YouTube</div>
            </div>
          </div>

          {/* Launch Full Studio Action Button */}
          <div className="pt-4">
            <Link
              href={`/tools/${tool.slug}`}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-3.5 px-6 text-sm font-black text-white shadow-lg shadow-red-600/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-red-600/35 active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Open {tool.name} (Free)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Text to Speech: Dedicated Script & Voiceover Studio Launcher
  if (tool.id === "text-to-speech") {
    return (
      <div className="rounded-3xl border border-indigo-200/90 bg-gradient-to-b from-white via-indigo-50/20 to-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                <span>AI Text to Speech & Voiceover Studio</span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  40+ Voices
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transform scripts into natural, human-like voiceovers in English, Urdu, Hindi, Spanish, and 40+ languages.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>0 Uploads • Private</span>
          </div>
        </div>

        {/* Interactive Script Tester */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Paste or Type Your Script:
          </label>
          <div className="relative">
            <textarea
              value={ttsScript}
              onChange={(e) => setTtsScript(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Paste your voiceover script here..."
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-500">Sample Scripts:</span>
            {TEXT_TO_SPEECH_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setTtsScript(preset.text)}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                  ttsScript === preset.text
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Key Feature Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
              <div className="text-xs font-bold text-slate-900">🌍 40+ Languages</div>
              <div className="text-[10px] text-slate-500">Native accents</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
              <div className="text-xs font-bold text-slate-900">⚡ Real-Time Preview</div>
              <div className="text-[10px] text-slate-500">Instant audio playback</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
              <div className="text-xs font-bold text-slate-900">🎚️ Pitch & Speed</div>
              <div className="text-[10px] text-slate-500">Custom voice tuning</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
              <div className="text-xs font-bold text-slate-900">⬇️ MP3 & WAV</div>
              <div className="text-[10px] text-slate-500">Crystal clear download</div>
            </div>
          </div>

          {/* Launch Full Studio Action Button */}
          <div className="pt-4">
            <Link
              href="/tools/text-to-speech"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 py-3.5 px-6 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-600/35 active:scale-[0.99]"
            >
              <Mic className="h-4 w-4" />
              <span>Open AI Voiceover Studio (Free)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Other AI Studios (Subtitles, Background Remover, Reframe, Silence Remover)
  const isSpecialStudio = [
    "auto-subtitles",
    "video-background-remover",
    "auto-reframe",
    "silence-remover",
    "audio-denoiser",
    "vocal-remover",
    "eye-contact-fixer",
    "video-censor",
  ].includes(tool.id);

  if (isSpecialStudio) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25 shrink-0">
              <ToolIcon name={tool.iconName} className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                <span>{tool.name}</span>
                {tool.badge && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{tool.tagline}</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Client-Side Wasm</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {tool.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={`/tools/${tool.slug}`}
            className="flex w-full sm:w-auto flex-1 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3.5 px-6 text-sm font-black text-white shadow-lg shadow-red-600/25 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-red-600/35 active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open {tool.name} Studio (Free)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 4. Default File Processing Tools (Compressor, GIF, Format Converter, etc.)
  // These tools ACTUALLY require a video/audio file upload/drop!
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
          <Sparkles className="h-4 w-4" />
          <span>Try Live in Browser: {tool.name}</span>
        </div>
        <span className="text-xs text-emerald-700 font-bold">100% Free Wasm</span>
      </div>
      <ToolRunner tool={tool} />
    </div>
  );
};
