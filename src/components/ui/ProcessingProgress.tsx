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
  onCancel?: () => void;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  progress,
  toolName,
  logs = [],
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

  return (
    <div className="space-y-5 rounded-2xl border border-blue-500/40 bg-[#0f172a]/95 p-6 shadow-2xl backdrop-blur-xl">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Cpu className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Processing {toolName}...
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                In-Memory WebAssembly
              </span>
            </div>
          </div>
        </div>

        {/* Live Elapsed Time & Percentage Badge */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900/90 border border-white/10 px-3 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-sans">
              Elapsed Time
            </div>
            <div className="text-base font-bold text-amber-300 flex items-center justify-end gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" />
              <span>{stopwatch}</span>
              <span className="text-xs text-slate-400 font-sans">({formattedDuration})</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-black text-blue-400">
              {progress.percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Modern Glowing Progress Bar */}
      <div className="space-y-1.5">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-900 ring-1 ring-white/10">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${Math.max(3, Math.min(100, progress.percent))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
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
          <div className="flex items-center gap-1 text-slate-400">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>High Priority Worker</span>
          </div>
        </div>
      </div>

      {/* Terminal Log Toggle */}
      <div className="pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowLogs(!showLogs)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-blue-400" />
            <span>Show WebAssembly Engine Logs ({logs.length})</span>
          </span>
          {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showLogs && (
          <div className="mt-2 max-h-44 overflow-y-auto rounded-xl bg-black/80 p-3 font-mono text-[11px] text-slate-300 border border-white/5 space-y-1">
            {logs.length === 0 ? (
              <div className="text-slate-500 italic">Initializing FFmpeg WASM core pipeline...</div>
            ) : (
              logs.slice(-25).map((log, idx) => (
                <div key={idx} className="leading-tight break-all text-slate-300">
                  <span className="text-blue-500 select-none mr-1.5">&gt;</span>
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
