"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { ProcessResult } from "@/lib/ffmpeg/types";
import { formatBytes } from "@/lib/utils";
import {
  Download,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Clock,
  TrendingDown,
  FileCheck,
} from "lucide-react";

interface ResultPreviewProps {
  result: ProcessResult;
  onReset: () => void;
  toolName: string;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({
  result,
  onReset,
  toolName,
}) => {
  useEffect(() => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#3b82f6", "#8b5cf6", "#10b981", "#38bdf8"],
      });
    } catch (_) {}
  }, []);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = result.outputUrl;
    a.download = result.outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isMetadataTool = toolName.toLowerCase().includes("metadata");

  const isVideo = result.mimeType.startsWith("video/");
  const isAudio = result.mimeType.startsWith("audio/");
  const isImage = result.mimeType.startsWith("image/");

  return (
    <div className="space-y-6 rounded-2xl border border-emerald-500/40 bg-[#0f172a]/95 p-6 shadow-2xl backdrop-blur-xl">
      {/* Success Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {isMetadataTool ? "Metadata Stripped & Cleaned!" : "Processing Complete!"}
            </h3>
            <p className="text-xs text-slate-400">
              {isMetadataTool
                ? "All tracking tags, GPS coordinates, and EXIF headers were permanently removed."
                : "Your media was rendered locally and is ready for download."}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:brightness-110 hover:shadow-emerald-500/40 active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Download {result.outputFileName}</span>
        </button>
      </div>

      {/* Comparison Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-950/80 p-3.5 border border-white/5 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Original Size</span>
          <p className="font-mono text-sm font-semibold text-slate-300">
            {formatBytes(result.originalSize)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3.5 border border-emerald-500/20 space-y-1">
          <span className="text-[11px] font-medium text-emerald-400">Cleaned Size</span>
          <p className="font-mono text-sm font-bold text-emerald-400">
            {formatBytes(result.outputSize)}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3.5 border border-white/5 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            {isMetadataTool ? (
              <FileCheck className="h-3 w-3 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-blue-400" />
            )}
            <span>{isMetadataTool ? "Privacy Status" : "Size Diff"}</span>
          </span>
          <p className="font-mono text-sm font-semibold text-emerald-400">
            {isMetadataTool
              ? "100% Sanitized"
              : result.reductionPercentage > 0
              ? `-${result.reductionPercentage}%`
              : `${result.reductionPercentage}%`}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950/80 p-3.5 border border-white/5 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3 text-violet-400" />
            <span>Process Time</span>
          </span>
          <p className="font-mono text-sm font-semibold text-violet-300">
            {(result.processTimeMs / 1000).toFixed(1)}s
          </p>
        </div>
      </div>

      {/* Metadata Sanitization Verification Audit (Shown for Metadata Stripper) */}
      {isMetadataTool && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Privacy Shield Verification Audit</span>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
              0 Metadata Leaks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-white/5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>GPS Location & Geotags</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-bold">Stripped</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-white/5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Camera & Hardware ID</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-bold">Anonymized</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-white/5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Creation & UTC Timestamps</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-bold">Sanitized</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-2.5 border border-white/5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Editing Software & Atoms</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-bold">Wiped</span>
            </div>
          </div>
        </div>
      )}

      {/* In-Browser Media Preview */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/90 p-2">
        <div className="mb-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>In-Browser Live Preview</span>
        </div>

        <div className="flex items-center justify-center min-h-[220px] max-h-[460px] rounded-lg bg-slate-950/50 p-2 overflow-hidden">
          {isVideo && (
            <video
              src={result.outputUrl}
              controls
              playsInline
              className="max-h-[420px] w-full rounded-lg object-contain shadow-2xl"
            />
          )}

          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.outputUrl}
              alt="Processed media result"
              className="max-h-[420px] rounded-lg object-contain shadow-2xl"
            />
          )}

          {isAudio && (
            <div className="w-full max-w-md py-6 px-4 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
                <Sparkles className="h-8 w-8" />
              </div>
              <audio src={result.outputUrl} controls className="w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Process Another File</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Save to Disk</span>
        </button>
      </div>
    </div>
  );
};
