"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { formatTime } from "@/lib/utils";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

interface DualRangeSliderProps {
  duration: number;
  startTime: number;
  endTime: number;
  onChange: (start: number, end: number) => void;
  onScrub?: (time: number) => void;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  duration,
  startTime,
  endTime,
  onChange,
  onScrub,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(null);

  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const selectedDuration = Math.max(0, endTime - startTime);

  const handlePointerDown = (handle: "start" | "end") => (e: React.PointerEvent) => {
    e.preventDefault();
    setActiveHandle(handle);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeHandle || !trackRef.current || duration <= 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newTime = (clickX / rect.width) * duration;

      if (activeHandle === "start") {
        const clampedStart = Math.max(0, Math.min(newTime, endTime - 0.2));
        onChange(clampedStart, endTime);
        if (onScrub) onScrub(clampedStart);
      } else {
        const clampedEnd = Math.min(duration, Math.max(newTime, startTime + 0.2));
        onChange(startTime, clampedEnd);
        if (onScrub) onScrub(clampedEnd);
      }
    },
    [activeHandle, duration, startTime, endTime, onChange, onScrub]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandle) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
      setActiveHandle(null);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-slate-900/90 p-5 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Clock className="h-4 w-4 text-blue-400" />
          <span>Timeline Trimmer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Selected Length:</span>
          <span className="rounded-md bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-bold text-blue-400">
            {formatTime(selectedDuration)} ({selectedDuration.toFixed(1)}s)
          </span>
        </div>
      </div>

      {/* Visual Timeline Track */}
      <div className="relative py-4 select-none">
        <div
          ref={trackRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-10 w-full cursor-pointer rounded-xl bg-slate-950 border border-white/10 overflow-hidden"
        >
          {/* Subtle timeline tick background */}
          <div className="absolute inset-0 flex justify-between px-2 opacity-20 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-full w-px bg-white" />
            ))}
          </div>

          {/* Active Highlight Range */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-600/60 via-indigo-600/60 to-blue-600/60 border-y-2 border-blue-400"
            style={{
              left: `${startPercent}%`,
              width: `${Math.max(0, endPercent - startPercent)}%`,
            }}
          />

          {/* Start Handle */}
          <div
            onPointerDown={handlePointerDown("start")}
            className="absolute top-0 bottom-0 -ml-3 flex w-6 cursor-ew-resize items-center justify-center z-10 touch-none"
            style={{ left: `${startPercent}%` }}
          >
            <div className="flex h-10 w-3.5 items-center justify-center rounded-l-lg bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50 hover:bg-blue-400 transition-colors">
              <div className="h-4 w-0.5 bg-white rounded-full opacity-80" />
            </div>
          </div>

          {/* End Handle */}
          <div
            onPointerDown={handlePointerDown("end")}
            className="absolute top-0 bottom-0 -ml-0.5 flex w-6 cursor-ew-resize items-center justify-center z-10 touch-none"
            style={{ left: `${endPercent}%` }}
          >
            <div className="flex h-10 w-3.5 items-center justify-center rounded-r-lg bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50 hover:bg-blue-400 transition-colors">
              <div className="h-4 w-0.5 bg-white rounded-full opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Fine-Tuning Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Start Point Card */}
        <div className="rounded-xl bg-slate-950/80 p-3 border border-white/5 space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400">Start Timestamp</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-bold text-white">
              {formatTime(startTime)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange(Math.max(0, startTime - 0.5), endTime)}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 active:scale-95"
              >
                -0.5s
              </button>
              <button
                type="button"
                onClick={() => onChange(Math.min(endTime - 0.2, startTime + 0.5), endTime)}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 active:scale-95"
              >
                +0.5s
              </button>
            </div>
          </div>
        </div>

        {/* End Point Card */}
        <div className="rounded-xl bg-slate-950/80 p-3 border border-white/5 space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400">End Timestamp</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-bold text-white">
              {formatTime(endTime)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange(startTime, Math.max(startTime + 0.2, endTime - 0.5))}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 active:scale-95"
              >
                -0.5s
              </button>
              <button
                type="button"
                onClick={() => onChange(startTime, Math.min(duration, endTime + 0.5))}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700 active:scale-95"
              >
                +0.5s
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
