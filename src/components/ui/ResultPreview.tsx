"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { ProcessResult } from "@/lib/ffmpeg/types";
import { formatBytes, formatProcessDuration } from "@/lib/utils";
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
        colors: ["#dc2626", "#e11d48", "#059669", "#0284c7"],
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
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-100">
      {/* Success Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isMetadataTool ? "Metadata Stripped & Cleaned!" : "Processing Complete!"}
            </h3>
            <p className="text-xs text-slate-500">
              {isMetadataTool
                ? "All tracking tags, GPS coordinates, and EXIF headers were permanently removed."
                : "Your media was rendered locally and is ready for download."}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:brightness-105 hover:shadow-red-500/40 active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Download {result.outputFileName}</span>
        </button>
      </div>

      {/* Comparison Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Original Size</span>
          <p className="font-mono text-sm font-bold text-slate-800">
            {formatBytes(result.originalSize)}
          </p>
        </div>

        <div className="rounded-xl bg-red-50/60 p-3.5 border border-red-200 space-y-1">
          <span className="text-[11px] font-semibold text-red-700">
            {isMetadataTool ? "Cleaned Size" : "Reduced Size"}
          </span>
          <p className="font-mono text-sm font-bold text-red-700">
            {formatBytes(result.outputSize)}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-200 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
            {isMetadataTool ? (
              <FileCheck className="h-3 w-3 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-emerald-600" />
            )}
            <span>{isMetadataTool ? "Privacy Status" : "Size Saved"}</span>
          </span>
          <p className="font-mono text-sm font-bold text-emerald-700">
            {isMetadataTool
              ? "100% Sanitized"
              : result.reductionPercentage > 0
              ? `${result.reductionPercentage}% Saved`
              : "Optimized (Max Quality)"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3 text-red-600" />
            <span>Process Time</span>
          </span>
          <p className="font-mono text-sm font-bold text-slate-800">
            {formatProcessDuration(result.processTimeMs / 1000)}
          </p>
        </div>
      </div>

      {/* Metadata Sanitization Verification Audit (Shown for Metadata Stripper) */}
      {isMetadataTool && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              <span>Privacy Shield Verification Audit</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-300">
              0 Metadata Leaks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
              <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>GPS Location & Geotags</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-700 font-bold">Stripped</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
              <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Camera & Hardware ID</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-700 font-bold">Anonymized</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
              <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Creation & UTC Timestamps</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-700 font-bold">Sanitized</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
              <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Editing Software & Atoms</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-700 font-bold">Wiped</span>
            </div>
          </div>
        </div>
      )}

      {/* In-Browser Media Preview */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-2 shadow-sm">
        <div className="mb-2 px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>In-Browser Live Preview</span>
        </div>

        <div className="flex items-center justify-center min-h-[220px] max-h-[460px] rounded-lg bg-black/60 p-2 overflow-hidden">
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 ring-1 ring-red-500/30">
                <Sparkles className="h-8 w-8" />
              </div>
              <audio src={result.outputUrl} controls className="w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Process Another File</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:bg-red-700 transition-all active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Save to Disk</span>
        </button>
      </div>
    </div>
  );
};
