"use client";

import React, { useState, useEffect } from "react";
import { ProcessProgress } from "@/lib/ffmpeg/types";
import { formatStopwatch, formatDurationOnly } from "@/lib/utils";
import {
  Cpu,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ProcessingProgressProps {
  progress: ProcessProgress;
  toolName: string;
  logs?: string[];
  engineMode?: "webcodecs" | "ffmpeg";
  onCancel?: () => void;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  progress,
  toolName,
  logs = [],
  engineMode = "webcodecs",
  onCancel,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Live stopwatch (Minutes & Seconds)
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const stopwatch = formatStopwatch(elapsedMs); // e.g. "00:08", "01:24"
  const elapsedSecsTotal = Math.floor(elapsedMs / 1000);
  const formattedDuration = formatDurationOnly(elapsedSecsTotal); // e.g. "8s", "1m 24s"

  const isGpu = engineMode === "webcodecs";

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-100">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${isGpu ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25" : "bg-red-600 text-white shadow-lg shadow-red-500/25"}`}>
            {isGpu ? <Zap className="h-5 w-5 animate-pulse" /> : <Cpu className="h-5 w-5 animate-pulse" />}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${isGpu ? "bg-emerald-400" : "bg-red-400"} opacity-75`}></span>
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isGpu ? "bg-emerald-500" : "bg-red-500"}`}></span>
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Processing {toolName}...
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className={`flex items-center gap-1 font-semibold ${isGpu ? "text-emerald-700" : "text-red-600"}`}>
                {isGpu ? <Zap className="h-3.5 w-3.5 text-emerald-600" /> : <ShieldCheck className="h-3.5 w-3.5 text-red-600" />}
                {isGpu ? "⚡ GPU Hardware Accelerated" : "🚀 Multi-Threaded WebAssembly"}
              </span>
            </div>
          </div>
        </div>

        {/* Live Elapsed Time & Percentage Badge */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50/60 border border-blue-200/80 px-3 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase tracking-wider text-[#0B192C] font-sans font-bold">
              Elapsed Time
            </div>
            <div className="text-base font-bold text-slate-900 flex items-center justify-end gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#0B192C] animate-spin" />
              <span>{stopwatch}</span>
              <span className="text-xs text-slate-500 font-sans font-normal">({formattedDuration})</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-black text-[#0B192C]">
              {progress.percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Modern Glowing Progress Bar */}
      <div className="space-y-1.5">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 transition-[width] duration-200 ease-out"
            style={{ width: `${Math.max(3, Math.min(100, progress.percent))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-red-600" />
            {progress.estimatedRemainingSecs !== undefined ? (
              <span>
                Estimated remaining: ~
                {progress.estimatedRemainingSecs >= 60
                  ? formatDurationOnly(progress.estimatedRemainingSecs)
                  : `${progress.estimatedRemainingSecs}s`}
              </span>
            ) : (
              <span>Encoding streams...</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <Zap className={`h-3.5 w-3.5 ${isGpu ? "text-emerald-600" : "text-red-600"}`} />
            <span>{progress.speed || (isGpu ? "Hardware GPU Active" : "Multi-Threaded CPU")}</span>
          </div>
        </div>
      </div>

      {/* Terminal Log Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowLogs(!showLogs)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-red-600" />
            <span>Show {isGpu ? "Hardware GPU Engine" : "WebAssembly"} Logs ({logs.length})</span>
          </span>
          {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showLogs && (
          <div className="mt-2 max-h-44 overflow-y-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-200 border border-slate-800 space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-400 italic">
                {isGpu ? "⚡ WebCodecs Hardware GPU Pipeline active (zero-copy hardware acceleration)..." : "Initializing FFmpeg WASM core pipeline..."}
              </div>
            ) : (
              logs.slice(-25).map((log, idx) => (
                <div key={idx} className="leading-tight break-all text-slate-300">
                  <span className="text-red-400 select-none mr-1.5">&gt;</span>
                  {log}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
