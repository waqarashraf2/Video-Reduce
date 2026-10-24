import React from "react";
import { UploadCloud } from "lucide-react";

interface ToolRunnerSkeletonProps {
  title?: string;
  subtitle?: string;
}

export const ToolRunnerSkeleton: React.FC<ToolRunnerSkeletonProps> = ({
  title = "Drop your media file here",
  subtitle = "or browse from your device (100% private, runs in-browser)",
}) => {
  return (
    <div
      className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 sm:p-12 text-center min-h-[280px] shadow-sm select-none"
      aria-busy="true"
      aria-label="Loading tool engine..."
    >
      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#060D17] via-[#0B192C] to-[#1e3a8a] text-white/80 shadow-md ring-1 ring-blue-500/20">
        <UploadCloud className="h-8 w-8 text-white animate-pulse" />
      </div>

      <div className="h-6 w-52 max-w-full rounded-lg bg-slate-200/80 animate-pulse mb-2" />
      <div className="h-4 w-72 max-w-full rounded-md bg-slate-200/60 animate-pulse mb-4" />

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <div className="h-5 w-24 rounded bg-slate-200/70 animate-pulse" />
        <div className="h-5 w-12 rounded bg-slate-200/70 animate-pulse" />
        <div className="h-5 w-12 rounded bg-slate-200/70 animate-pulse" />
        <div className="h-5 w-12 rounded bg-slate-200/70 animate-pulse" />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Ready in browser • 100% private</span>
      </div>
    </div>
  );
};
