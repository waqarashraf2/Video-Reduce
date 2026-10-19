"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ToolMetadata } from "@/lib/ffmpeg/types";

// Dynamic imports with ssr: false inside a Client Component (100% Next.js App Router compliant)
const ToolRunner = dynamic(
  () => import("@/components/tools/ToolRunner").then((m) => m.ToolRunner),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading WebAssembly Suite...</span>
      </div>
    ),
  }
);

const AiSubtitlesStudio = dynamic(
  () => import("@/components/tools/subtitles/AiSubtitlesStudio").then((m) => m.AiSubtitlesStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Subtitles Studio...</span>
      </div>
    ),
  }
);

const AiBackgroundRemoverStudio = dynamic(
  () => import("@/components/tools/background/AiBackgroundRemoverStudio").then((m) => m.AiBackgroundRemoverStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Background Remover...</span>
      </div>
    ),
  }
);

const AiAutoReframeStudio = dynamic(
  () => import("@/components/tools/reframe/AiAutoReframeStudio").then((m) => m.AiAutoReframeStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Auto-Reframe Studio...</span>
      </div>
    ),
  }
);

const AiSilenceRemoverStudio = dynamic(
  () => import("@/components/tools/silence/AiSilenceRemoverStudio").then((m) => m.AiSilenceRemoverStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Silence Remover...</span>
      </div>
    ),
  }
);

const AiTextToSpeechStudio = dynamic(
  () => import("@/components/tools/tts/AiTextToSpeechStudio").then((m) => m.AiTextToSpeechStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Voiceover Studio...</span>
      </div>
    ),
  }
);

const AiTextToVideoStudio = dynamic(
  () => import("@/components/tools/text-to-video/AiTextToVideoStudio").then((m) => m.AiTextToVideoStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Text to Video Studio...</span>
      </div>
    ),
  }
);

const AiAudioDenoiserStudio = dynamic(
  () => import("@/components/tools/denoiser/AiAudioDenoiserStudio").then((m) => m.AiAudioDenoiserStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Audio Denoiser Studio...</span>
      </div>
    ),
  }
);

const AiVocalRemoverStudio = dynamic(
  () => import("@/components/tools/vocal-remover/AiVocalRemoverStudio").then((m) => m.AiVocalRemoverStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Vocal Remover Studio...</span>
      </div>
    ),
  }
);

const AiEyeContactStudio = dynamic(
  () => import("@/components/tools/eye-contact/AiEyeContactStudio").then((m) => m.AiEyeContactStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Eye Contact Studio...</span>
      </div>
    ),
  }
);

const AiVideoCensorStudio = dynamic(
  () => import("@/components/tools/censor/AiVideoCensorStudio").then((m) => m.AiVideoCensorStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
        <span className="text-xs text-slate-600 font-medium">Loading AI Video Censor Studio...</span>
      </div>
    ),
  }
);

interface ToolStudioHostProps {
  tool: ToolMetadata;
}

export const ToolStudioHost: React.FC<ToolStudioHostProps> = ({ tool }) => {
  if (tool.id === "auto-subtitles") {
    return <AiSubtitlesStudio tool={tool} />;
  }
  if (tool.id === "video-background-remover") {
    return <AiBackgroundRemoverStudio tool={tool} />;
  }
  if (tool.id === "auto-reframe") {
    return <AiAutoReframeStudio tool={tool} />;
  }
  if (tool.id === "silence-remover") {
    return <AiSilenceRemoverStudio tool={tool} />;
  }
  if (tool.id === "text-to-speech") {
    return <AiTextToSpeechStudio tool={tool} />;
  }
  if (tool.id === "text-to-video") {
    return <AiTextToVideoStudio tool={tool} />;
  }
  if (tool.id === "audio-denoiser") {
    return <AiAudioDenoiserStudio tool={tool} />;
  }
  if (tool.id === "vocal-remover") {
    return <AiVocalRemoverStudio tool={tool} />;
  }
  if (tool.id === "eye-contact-fixer") {
    return <AiEyeContactStudio tool={tool} />;
  }
  if (tool.id === "video-censor") {
    return <AiVideoCensorStudio tool={tool} />;
  }

  return <ToolRunner tool={tool} />;
};
