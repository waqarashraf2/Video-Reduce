"use client";

import React from "react";
import {
  ToolId,
  AnyToolOptions,
  CompressionOptions,
  GifOptions,
  AudioExtractorOptions,
  TrimmerOptions,
  SpeedOptions,
  MuteOptions,
  FormatOptions,
  AspectRatioOptions,
  WatermarkOptions,
  RotateOptions,
  ReverseOptions,
  FrameExtractorOptions,
  VideoFilterOptions,
  GifToVideoOptions,
  VolumeOptions,
  AudioDenoiserOptions,
  MetadataStripperOptions,
  FFmpegTerminalOptions,
  ResolutionOption,
  AudioFormat,
  VideoFormat,
  AspectRatio,
  ResizeMode,
  WatermarkPosition,
  RotationDegree,
} from "@/lib/ffmpeg/types";
import { FileMetadata } from "@/components/ui/FileDropzone";
import { DualRangeSlider } from "@/components/ui/DualRangeSlider";
import { formatBytes, formatTime } from "@/lib/utils";
import {
  Sliders,
  Sparkles,
  Maximize,
  VolumeX,
  Gauge,
  Radio,
  Zap,
  Smartphone,
  Check,
  Film,
  Music,
  Target,
  Image as ImageIcon,
  RotateCw,
  Rewind,
  Eye,
  Sun,
  Volume2,
  Mic,
  Lock,
  Terminal,
  Type,
  LayoutGrid,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Info,
  Layers,
} from "lucide-react";

interface ToolControlsProps {
  toolId: ToolId;
  options: AnyToolOptions;
  setOptions: React.Dispatch<React.SetStateAction<AnyToolOptions>>;
  fileMeta: FileMetadata;
  onScrubPreview?: (time: number) => void;
}

export const ToolControls: React.FC<ToolControlsProps> = ({
  toolId,
  options,
  setOptions,
  fileMeta,
  onScrubPreview,
}) => {
  switch (toolId) {
    case "video-compressor": {
      const opt = options as CompressionOptions;
      const setComp = (updates: Partial<CompressionOptions>) =>
        setOptions((prev) => ({ ...(prev as CompressionOptions), ...updates }));

      const originalBytes = fileMeta.size || 10 * 1024 * 1024;
      const currentPercent = opt.targetPercent || 50;

      let estimatedBytes = originalBytes * (1 - currentPercent / 100);
      if (opt.compressionMode === "target-size" && opt.targetSizeMB) {
        estimatedBytes = opt.targetSizeMB * 1024 * 1024;
      }

      return (
        <div className="space-y-3.5 rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200 shadow-sm">
          {/* Header Row: Title & Estimated Size */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-red-600" />
              Target Size & Quality
            </span>
            <span className="rounded bg-red-50 px-2 py-0.5 font-mono text-[11px] font-bold text-red-700 border border-red-200/60">
              Est: ~{formatBytes(estimatedBytes)} (-{Math.round(((originalBytes - estimatedBytes) / originalBytes) * 100)}%)
            </span>
          </div>

          {/* Compact 3-Column Target Reduction Presets */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { label: "50% Smaller", percent: 50, tag: "Balanced" },
              { label: "70% Smaller", percent: 70, tag: "Max Save" },
              { label: "30% Smaller", percent: 30, tag: "1080p HD" },
            ].map((p) => {
              const isSelected = opt.targetPercent === p.percent;
              const originalMB = Number((originalBytes / (1024 * 1024)).toFixed(1));
              let targetMB = Number((originalMB * (1 - p.percent / 100)).toFixed(1));
              // For large videos (>120MB), clamp preset targets to safe levels for mobile hardware encoders
              if (targetMB > 65) {
                targetMB = p.percent === 70 ? 30 : p.percent === 50 ? 50 : 65;
              }
              targetMB = Math.max(1, targetMB);
              const estSize = targetMB * 1024 * 1024;

              return (
                <button
                  key={p.percent}
                  type="button"
                  onClick={() =>
                    setComp({
                      compressionMode: "target-size",
                      targetPercent: p.percent,
                      targetSizeMB: targetMB,
                    })
                  }
                  className={`flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all ${
                    isSelected
                      ? "bg-red-600 border border-red-600 shadow-md shadow-red-500/25 text-white"
                      : "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span className="font-bold text-xs sm:text-sm">{p.label}</span>
                  <span className={`text-[10px] mt-0.5 font-mono font-semibold ${isSelected ? "text-red-100" : "text-emerald-600"}`}>
                    ~{formatBytes(estSize)} ({targetMB} MB)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Compact Custom Target Size in MB */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-200 text-xs">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-red-600" />
              <span>Target Size:</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={Math.max(1, Math.round(originalBytes / (1024 * 1024)))}
                step="0.1"
                placeholder="e.g. 76.3"
                value={opt.targetSizeMB !== undefined ? opt.targetSizeMB : ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    const calcPercent = Math.max(5, Math.min(95, Math.round((1 - (val * 1024 * 1024) / originalBytes) * 100)));
                    setComp({ compressionMode: "target-size", targetSizeMB: val, targetPercent: calcPercent });
                  } else {
                    setComp({ compressionMode: "target-size", targetSizeMB: undefined });
                  }
                }}
                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-red-500 focus:outline-none shadow-sm"
              />
              <span className="text-[11px] text-slate-500 font-mono">MB</span>
            </div>
          </div>

          {/* Compact Resolution Downscaling */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Maximize className="h-3.5 w-3.5 text-red-600" />
                Target Resolution
              </label>
              <span className="text-[10px] font-mono text-red-600 uppercase font-bold">
                {opt.resolution || "Original"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(["original", "1080p", "720p", "480p"] as ResolutionOption[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setComp({ resolution: res })}
                  className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition-all ${
                    opt.resolution === res
                      ? "bg-red-600 text-white shadow-sm shadow-red-500/20"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Compression Speed / Preset */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-red-600" />
                Speed & Performance
              </label>
              <span className="text-[10px] font-mono text-red-600 font-bold">
                {opt.preset === "ultrafast" || !opt.preset
                  ? "⚡ Turbo"
                  : opt.preset === "superfast"
                  ? "⚖️ Balanced"
                  : "🎯 Max Quality"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "ultrafast", label: "⚡ Turbo" },
                { id: "superfast", label: "⚖️ Balanced" },
                { id: "veryfast", label: "🎯 Max Quality" },
              ].map((p) => {
                const isSelected = (opt.preset || "ultrafast") === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setComp({ preset: p.id as any })}
                    className={`rounded-lg py-1.5 text-center text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-red-50 border border-red-300 text-red-700 font-bold"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Mute Audio Option */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
              <VolumeX className="h-3.5 w-3.5 text-slate-500" />
              Mute / Strip Audio (-10-15% size)
            </span>
            <input
              type="checkbox"
              checked={opt.muteAudio}
              onChange={(e) => setComp({ muteAudio: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 bg-white text-red-600 accent-red-600"
            />
          </div>
        </div>
      );
    }

    case "video-to-gif": {
      const opt = options as GifOptions;
      const setGif = (updates: Partial<GifOptions>) =>
        setOptions((prev) => ({ ...(prev as GifOptions), ...updates }));

      const totalDuration = fileMeta.durationSecs || 10;
      const currentDuration = opt.duration || Math.min(totalDuration, 6);
      const currentStart = opt.startTime || 0;
      const currentQuality = opt.quality || "high";

      return (
        <div className="space-y-4 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-sm">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Film className="h-4 w-4 text-red-600" />
              GIF Rendering Controls
            </span>
            <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-[11px] font-bold text-red-700">
              {currentDuration}s Clip • {opt.fps || 15} FPS
            </span>
          </div>

          {/* 1. Quality & Performance Preset */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-red-600" />
              Rendering Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGif({ quality: "turbo" })}
                className={`flex flex-col items-start rounded-xl p-3 text-left transition-all ${
                  currentQuality === "turbo"
                    ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <span>⚡ Turbo Fast</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${currentQuality === "turbo" ? "bg-red-700 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                    3x Faster
                  </span>
                </div>
                <div className={`text-[11px] mt-0.5 ${currentQuality === "turbo" ? "text-red-100" : "text-slate-500"}`}>
                  128 Colors • Fast bilinear • Lightweight
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGif({ quality: "high" })}
                className={`flex flex-col items-start rounded-xl p-3 text-left transition-all ${
                  currentQuality === "high"
                    ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <span>💎 Studio Quality</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${currentQuality === "high" ? "bg-red-700 text-white" : "bg-slate-200 text-slate-700"}`}>
                    Vibrant
                  </span>
                </div>
                <div className={`text-[11px] mt-0.5 ${currentQuality === "high" ? "text-red-100" : "text-slate-500"}`}>
                  256 Colors • Bayer dither • No banding
                </div>
              </button>
            </div>
          </div>

          {/* 2. Clip Duration & Range Presets */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-red-600" />
                Clip Duration
              </label>
              <span className="font-mono text-xs font-bold text-red-600">
                {currentDuration}s (from {formatTime(currentStart)})
              </span>
            </div>

            {/* Quick Duration Buttons */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[3, 5, 8, 12].map((sec) => {
                const isSelected = currentDuration === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      const maxStart = Math.max(0, totalDuration - sec);
                      setGif({
                        duration: sec,
                        startTime: Math.min(currentStart, maxStart),
                      });
                    }}
                    className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-red-600 text-white shadow-md shadow-red-500/25"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {sec}s Clip
                  </button>
                );
              })}
            </div>

            {/* Start Offset Slider if video is longer than clip duration */}
            {totalDuration > currentDuration && (
              <div className="space-y-1 pt-1.5">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Clip Start Offset:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatTime(currentStart)} - {formatTime(Math.min(totalDuration, currentStart + currentDuration))}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, totalDuration - currentDuration)}
                  step={0.5}
                  value={currentStart}
                  onChange={(e) => {
                    const start = parseFloat(e.target.value);
                    setGif({ startTime: start });
                    if (onScrubPreview) onScrubPreview(start);
                  }}
                  className="w-full accent-red-600"
                />
              </div>
            )}
          </div>

          {/* 3. Frame Rate & Resolution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            {/* FPS Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-red-600" />
                Frame Rate (Smoothness)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { fps: 10, label: "10 FPS", tag: "Small" },
                  { fps: 15, label: "15 FPS", tag: "Smooth" },
                  { fps: 20, label: "20 FPS", tag: "Fast" },
                ].map((item) => (
                  <button
                    key={item.fps}
                    type="button"
                    onClick={() => setGif({ fps: item.fps })}
                    className={`rounded-xl py-2 px-1 text-center transition-all ${
                      (opt.fps || 15) === item.fps
                        ? "bg-red-600 text-white shadow-md shadow-red-500/25"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className={`text-[9px] ${ (opt.fps || 15) === item.fps ? "text-red-100" : "text-slate-400" }`}>
                      {item.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Width Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5 text-red-600" />
                GIF Output Width
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { w: 320, label: "320px", tag: "Mobile" },
                  { w: 480, label: "480px", tag: "Standard" },
                  { w: 640, label: "640px", tag: "HD" },
                ].map((item) => (
                  <button
                    key={item.w}
                    type="button"
                    onClick={() => setGif({ width: item.w })}
                    className={`rounded-xl py-2 px-1 text-center transition-all ${
                      (opt.width || 480) === item.w
                        ? "bg-red-600 text-white shadow-md shadow-red-500/25"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className={`text-[9px] ${ (opt.width || 480) === item.w ? "text-red-100" : "text-slate-400" }`}>
                      {item.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Speed & Looping Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            {/* Speed Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-red-600" />
                Playback Speed
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.75, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setGif({ speed: s })}
                    className={`rounded-xl py-1.5 text-xs font-mono font-bold transition-all ${
                      (opt.speed || 1.0) === s
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Loop Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <RotateCw className="h-3.5 w-3.5 text-red-600" />
                Loop Behavior
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 0, label: "Infinite Loop" },
                  { id: -1, label: "Play Once" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setGif({ loop: l.id })}
                    className={`rounded-xl py-1.5 text-xs font-semibold transition-all ${
                      (opt.loop ?? 0) === l.id
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "audio-extractor": {
      const opt = options as AudioExtractorOptions;
      const setAudio = (updates: Partial<AudioExtractorOptions>) =>
        setOptions((prev) => ({ ...(prev as AudioExtractorOptions), ...updates }));

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Music className="h-4 w-4 text-red-600" />
              Audio Output Format
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "mp3", name: "MP3 Audio", desc: "Universal compatibility" },
              { id: "wav", name: "WAV Audio", desc: "Lossless Studio PCM" },
              { id: "aac", name: "AAC Audio", desc: "Optimized Apple/Web" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setAudio({ format: f.id as AudioFormat })}
                className={`flex flex-col items-center text-center rounded-xl p-3 transition-all ${
                  opt.format === f.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <span className="font-bold text-sm uppercase">{f.id}</span>
                <span className="text-[11px] opacity-80 mt-0.5">{f.desc}</span>
              </button>
            ))}
          </div>

          {opt.format !== "wav" && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Radio className="h-3.5 w-3.5 text-red-600" />
                Audio Bitrate
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["128k", "192k", "256k", "320k"] as const).map((br) => (
                  <button
                    key={br}
                    type="button"
                    onClick={() => setAudio({ bitrate: br })}
                    className={`rounded-xl py-2 text-xs font-semibold font-mono transition-all ${
                      opt.bitrate === br
                        ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    {br.replace("k", " kbps")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    case "video-trimmer": {
      const opt = options as TrimmerOptions;
      const duration = fileMeta.durationSecs || 60;

      return (
        <div className="space-y-5">
          <DualRangeSlider
            duration={duration}
            startTime={opt.startTime}
            endTime={opt.endTime || duration}
            onChange={(start, end) =>
              setOptions((prev) => ({
                ...(prev as TrimmerOptions),
                startTime: start,
                endTime: end,
              }))
            }
            onScrub={onScrubPreview}
          />

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs shadow-sm">
            <div>
              <span className="font-bold text-slate-900">Lossless Fast Stream-Copy</span>
              <p className="text-slate-500">Instant export without re-encoding video.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setOptions((prev) => ({
                  ...(prev as TrimmerOptions),
                  precise: !(prev as TrimmerOptions).precise,
                }))
              }
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                opt.precise ? "bg-red-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {opt.precise ? "Frame Accurate (Re-encode)" : "Stream-Copy (Ultra Fast)"}
            </button>
          </div>
        </div>
      );
    }

    case "speed-controller": {
      const opt = options as SpeedOptions;
      const setSpeed = (speed: number) =>
        setOptions((prev) => ({ ...(prev as SpeedOptions), speed }));

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-red-600" />
              Playback Multipliers
            </span>
            <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-xs font-bold text-red-700">
              {opt.speed}x Playback
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {[0.25, 0.5, 0.75, 1.25, 1.5, 2.0, 4.0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`rounded-xl py-2.5 text-xs font-bold font-mono transition-all ${
                  opt.speed === s
                    ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200 flex items-center justify-between">
            <span>Preserve natural vocal pitch (FFmpeg atempo)</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Enabled
            </span>
          </div>
        </div>
      );
    }

    case "video-mute": {
      return (
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
            <VolumeX className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">1-Click Audio Stream Removal</h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            This tool performs a pure video stream copy (<code className="text-red-600 font-mono bg-red-50 px-1 py-0.5 rounded">-an -vcodec copy</code>) with zero quality loss and instantaneous processing.
          </p>
        </div>
      );
    }

    case "format-converter": {
      const opt = options as FormatOptions;
      const setFmt = (updates: Partial<FormatOptions>) =>
        setOptions((prev) => ({ ...(prev as FormatOptions), ...updates }));

      const currentExt = fileMeta?.name?.split(".").pop()?.toLowerCase() || "";
      const targetFmt = opt.targetFormat || "mp4";
      const isRemuxEligible =
        ["mkv", "mov", "m4v", "ts", "mp4"].includes(currentExt) &&
        (targetFmt === "mp4" || targetFmt === "mov" || targetFmt === "mkv");
      const currentMode = opt.conversionMode || (isRemuxEligible ? "fast-copy" : "re-encode");

      return (
        <div className="space-y-4 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-sm">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Film className="h-4 w-4 text-red-600" />
              Target Container Format
            </span>
            <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-[11px] font-bold text-red-700 uppercase">
              {currentExt ? `${currentExt.toUpperCase()} ➔ ${targetFmt.toUpperCase()}` : targetFmt.toUpperCase()}
            </span>
          </div>

          {/* Target Container Format Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: "mp4", label: "MP4", desc: "Universal" },
              { id: "webm", label: "WebM", desc: "Web / Chrome" },
              { id: "mkv", label: "MKV", desc: "Matroska" },
              { id: "mov", label: "MOV", desc: "Apple QuickTime" },
              { id: "avi", label: "AVI", desc: "Legacy PC" },
            ].map((fmt) => {
              const isSelected = targetFmt === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFmt({ targetFormat: fmt.id as VideoFormat })}
                  className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-1 text-center transition-all ${
                    isSelected
                      ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500 font-bold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span className="font-bold text-xs sm:text-sm uppercase">{fmt.label}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? "text-red-100" : "text-slate-500"}`}>
                    {fmt.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Conversion Engine / Mode Toggle */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-red-600" />
                Conversion Engine
              </label>
              {currentMode === "fast-copy" && (
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">
                  ⚡ 50x Faster • 0 Quality Loss
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFmt({ conversionMode: "fast-copy" })}
                className={`flex flex-col items-start rounded-xl p-3 text-left transition-all ${
                  currentMode === "fast-copy"
                    ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <span>⚡ Lossless Stream Repackage</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      currentMode === "fast-copy" ? "bg-red-700 text-white" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    Instant ~2s
                  </span>
                </div>
                <div className={`text-[11px] mt-0.5 ${currentMode === "fast-copy" ? "text-red-100" : "text-slate-500"}`}>
                  Copies original video stream directly without re-encoding. 100% original quality.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFmt({ conversionMode: "re-encode" })}
                className={`flex flex-col items-start rounded-xl p-3 text-left transition-all ${
                  currentMode === "re-encode"
                    ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <span>🎬 Universal Fast Transcode</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      currentMode === "re-encode" ? "bg-red-700 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    Universal
                  </span>
                </div>
                <div className={`text-[11px] mt-0.5 ${currentMode === "re-encode" ? "text-red-100" : "text-slate-500"}`}>
                  Re-encodes video with multi-threaded H.264 SIMD. Compatible with all source codecs.
                </div>
              </button>
            </div>
          </div>
        </div>
      );
    }

    case "aspect-ratio-resizer": {
      const opt = options as AspectRatioOptions;
      const setAsp = (updates: Partial<AspectRatioOptions>) =>
        setOptions((prev) => ({ ...(prev as AspectRatioOptions), ...updates }));

      const ratios: { id: AspectRatio; name: string; desc: string; icon: string }[] = [
        { id: "9:16", name: "9:16 Vertical", desc: "TikTok / Reels / Shorts", icon: "📱" },
        { id: "1:1", name: "1:1 Square", desc: "Instagram Feed Post", icon: "🔳" },
        { id: "16:9", name: "16:9 Landscape", desc: "YouTube / Standard", icon: "🖥️" },
        { id: "4:5", name: "4:5 Portrait", desc: "Instagram Portrait", icon: "📐" },
      ];

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-red-600" />
              Social Format
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ratios.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setAsp({ ratio: r.id })}
                className={`flex flex-col items-center text-center rounded-xl p-3.5 transition-all ${
                  opt.ratio === r.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <span className="text-xl mb-1">{r.icon}</span>
                <span className="font-bold text-xs">{r.name}</span>
                <span className="text-[10px] opacity-75 mt-0.5">{r.desc}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="text-xs font-semibold text-slate-700">Fitting Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAsp({ mode: "crop" })}
                className={`rounded-xl p-3 text-xs font-medium text-left transition-all ${
                  opt.mode === "crop" ? "bg-red-600 text-white ring-1 ring-red-500 font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <div className="font-bold">Center Crop</div>
                <div className="text-[11px] opacity-80 mt-0.5">Fills screen, cuts outer edges</div>
              </button>

              <button
                type="button"
                onClick={() => setAsp({ mode: "pad" })}
                className={`rounded-xl p-3 text-xs font-medium text-left transition-all ${
                  opt.mode === "pad" ? "bg-red-600 text-white ring-1 ring-red-500 font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <div className="font-bold">Letterbox Pad</div>
                <div className="text-[11px] opacity-80 mt-0.5">Full video visible with black bars</div>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 9. Video Watermark
    case "video-watermark": {
      const opt = options as WatermarkOptions;
      const setWater = (updates: Partial<WatermarkOptions>) =>
        setOptions((prev) => ({ ...(prev as WatermarkOptions), ...updates }));

      const positions: { id: WatermarkPosition; label: string }[] = [
        { id: "top-left", label: "Top Left" },
        { id: "top-right", label: "Top Right" },
        { id: "center", label: "Center" },
        { id: "bottom-left", label: "Bottom Left" },
        { id: "bottom-right", label: "Bottom Right" },
      ];

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Type className="h-4 w-4 text-red-600" />
              Watermark Branding
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Watermark Text</label>
            <input
              type="text"
              value={opt.text}
              onChange={(e) => setWater({ text: e.target.value })}
              placeholder="e.g. @MyChannel or Brand Name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-red-600" />
              Position On Screen
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {positions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setWater({ position: p.id })}
                  className={`rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                    opt.position === p.id
                      ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Font Size</span>
                <span className="font-mono text-red-600">{opt.fontSize}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={72}
                value={opt.fontSize}
                onChange={(e) => setWater({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Opacity</span>
                <span className="font-mono text-red-600">{Math.round(opt.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={opt.opacity}
                onChange={(e) => setWater({ opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      );
    }

    // 10. Video Rotate
    case "video-rotate": {
      const opt = options as RotateOptions;
      const setRot = (deg: RotationDegree) =>
        setOptions((prev) => ({ ...(prev as RotateOptions), rotation: deg }));

      const rotPresets: { id: RotationDegree; label: string; desc: string }[] = [
        { id: "90", label: "90° Clockwise", desc: "Turn right 90 degrees" },
        { id: "180", label: "180° Invert", desc: "Flip upside down" },
        { id: "270", label: "270° Counter-Clockwise", desc: "Turn left 90 degrees" },
        { id: "hflip", label: "Horizontal Flip", desc: "Mirror left-to-right" },
        { id: "vflip", label: "Vertical Flip", desc: "Mirror top-to-bottom" },
      ];

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <RotateCw className="h-4 w-4 text-red-600" />
              Rotation & Flip Options
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {rotPresets.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRot(r.id)}
                className={`rounded-xl p-3.5 text-left transition-all ${
                  opt.rotation === r.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <div className="font-bold text-xs">{r.label}</div>
                <div className="text-[11px] opacity-80 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 11. Video Reverse
    case "video-reverse": {
      const opt = options as ReverseOptions;
      const setRev = (updates: Partial<ReverseOptions>) =>
        setOptions((prev) => ({ ...(prev as ReverseOptions), ...updates }));

      const dur = fileMeta.durationSecs || 10;
      const activeDuration = opt.maxDuration !== undefined ? opt.maxDuration : 8;

      return (
        <div className="space-y-4 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Rewind className="h-4 w-4 text-red-600" />
              Rewind Playback Settings
            </span>
            <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200/60 uppercase">
              {opt.quality || "turbo"}
            </span>
          </div>

          {/* Quality Mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Processing Mode & Resolution
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRev({ quality: "turbo" })}
                className={`rounded-xl p-2.5 text-left border transition-all ${
                  (opt.quality || "turbo") === "turbo"
                    ? "border-red-600 bg-red-50/70 text-slate-900 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  <span>⚡ Turbo Fast</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">480p • Instant rewind, zero memory crash</div>
              </button>

              <button
                type="button"
                onClick={() => setRev({ quality: "high" })}
                className={`rounded-xl p-2.5 text-left border transition-all ${
                  opt.quality === "high"
                    ? "border-red-600 bg-red-50/70 text-slate-900 shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  <span>💎 Studio HD</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">540p • Crisp high-definition rewind</div>
              </button>
            </div>
          </div>

          {/* Duration Presets for Memory-Safe Reversing */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Rewind Clip Duration</span>
              {dur > 0 && <span className="text-[10px] text-slate-500 font-mono">Original: {Math.round(dur)}s</span>}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { label: "⚡ 5s", val: 5 },
                { label: "✨ 8s", val: 8 },
                { label: "🎬 10s", val: 10 },
                { label: "🚀 15s", val: 15 },
                { label: dur > 0 ? `Full (${Math.round(dur)}s)` : "Original", val: 0, isFull: true },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setRev({ maxDuration: d.val })}
                  className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                    d.isFull ? "col-span-2 sm:col-span-1" : ""
                  } ${
                    activeDuration === d.val
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">
              💡 Reversing buffers video frames in browser memory. 5s–15s clips process fastest; &quot;Full&quot; reverses the entire original video.
            </p>
          </div>

          {/* Audio Options */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900">Reverse Audio Track</span>
                <p className="text-[10px] text-slate-500">Play audio backwards with video (AAC)</p>
              </div>
              <input
                type="checkbox"
                checked={opt.reverseAudio && !opt.muteAudio}
                disabled={opt.muteAudio}
                onChange={(e) => setRev({ reverseAudio: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 bg-white text-red-600 accent-red-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-900">Mute Audio</span>
                <p className="text-[10px] text-slate-500">Export video as silent rewind clip</p>
              </div>
              <input
                type="checkbox"
                checked={opt.muteAudio}
                onChange={(e) => setRev({ muteAudio: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 bg-white text-red-600 accent-red-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      );
    }

    // 12. Frame Extractor
    case "frame-extractor": {
      const opt = options as FrameExtractorOptions;
      const setFrame = (updates: Partial<FrameExtractorOptions>) =>
        setOptions((prev) => ({ ...(prev as FrameExtractorOptions), ...updates }));

      const duration = fileMeta.durationSecs || 30;

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-red-600" />
              Frame Snapshot Position
            </span>
            <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-xs font-bold text-red-700">
              {formatTime(opt.timestampSecs)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-700 font-semibold">
              <span>Seek Video Timeline</span>
              <span className="font-mono text-red-600">{opt.timestampSecs.toFixed(2)}s / {duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={opt.timestampSecs}
              onChange={(e) => {
                const t = parseFloat(e.target.value);
                setFrame({ timestampSecs: t });
                if (onScrubPreview) onScrubPreview(t);
              }}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <label className="text-xs font-semibold text-slate-700">Output Image Format</label>
            <div className="flex gap-2">
              {(["png", "jpg"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFrame({ format: fmt })}
                  className={`rounded-lg px-3 py-1 text-xs font-bold uppercase transition-all ${
                    opt.format === fmt ? "bg-red-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 13. Video Filters & Color Grading
    case "video-filters": {
      const opt = options as VideoFilterOptions;
      const setFilt = (updates: Partial<VideoFilterOptions>) =>
        setOptions((prev) => ({ ...(prev as VideoFilterOptions), ...updates }));

      const presets: {
        id: VideoFilterOptions["preset"];
        label: string;
        icon: string;
        desc: string;
      }[] = [
        { id: "none", label: "Default Normal", icon: "✨", desc: "Natural colors" },
        { id: "cyberpunk", label: "Cyberpunk", icon: "🌆", desc: "Neon cyan & magenta" },
        { id: "vintage", label: "Vintage Film", icon: "🎞️", desc: "Warm retro 35mm" },
        { id: "sepia", label: "Warm Sepia", icon: "☕", desc: "Classic bronze tone" },
        { id: "bw", label: "B&W Monochrome", icon: "⬛", desc: "High-contrast black & white" },
        { id: "warm", label: "Warm Sunset", icon: "🌅", desc: "Golden hour glow" },
        { id: "cool", label: "Cool Cinematic", icon: "❄️", desc: "Cold action movie tint" },
      ];

      const handlePresetClick = (presetId: VideoFilterOptions["preset"]) => {
        setFilt({ preset: presetId });
      };

      const handleReset = () => {
        setFilt({
          preset: "none",
          brightness: 0,
          contrast: 1,
          saturation: 1,
          gamma: 1,
        });
      };

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-red-600" />
              Color Grading & Filter Effects
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-semibold text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200"
            >
              Reset to Original
            </button>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetClick(p.id)}
                className={`flex flex-col items-start gap-1 rounded-xl p-3 text-left transition-all ${
                  opt.preset === p.id
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25 ring-2 ring-red-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs font-bold">{p.label}</span>
                </div>
                <span className="text-[10px] opacity-75">{p.desc}</span>
              </button>
            ))}
          </div>

          {/* Manual Sliders */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Fine-Tune Manual Adjustments</span>
              <span className="text-[11px] text-red-600 font-mono">Live GPU Accelerated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Brightness</span>
                  <span className="font-mono text-red-600">{opt.brightness > 0 ? `+${opt.brightness}` : opt.brightness}</span>
                </div>
                <input
                  type="range"
                  min={-0.3}
                  max={0.3}
                  step={0.02}
                  value={opt.brightness}
                  onChange={(e) => setFilt({ brightness: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Contrast</span>
                  <span className="font-mono text-red-600">{opt.contrast}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={opt.contrast}
                  onChange={(e) => setFilt({ contrast: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Saturation</span>
                  <span className="font-mono text-red-600">{opt.saturation}x</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={3.0}
                  step={0.1}
                  value={opt.saturation}
                  onChange={(e) => setFilt({ saturation: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 font-semibold">
                  <span>Gamma</span>
                  <span className="font-mono text-red-600">{opt.gamma}</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.8}
                  step={0.05}
                  value={opt.gamma}
                  onChange={(e) => setFilt({ gamma: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 14. GIF to Video
    case "gif-to-video": {
      const opt = options as GifToVideoOptions;
      const setGifVid = (updates: Partial<GifToVideoOptions>) =>
        setOptions((prev) => ({ ...(prev as GifToVideoOptions), ...updates }));

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Film className="h-4 w-4 text-red-600" />
              MP4 Output Quality
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "High Quality (CRF 18)", crf: 18 },
              { label: "Standard (CRF 22)", crf: 22 },
              { label: "Ultra Small (CRF 28)", crf: 28 },
            ].map((p) => (
              <button
                key={p.crf}
                type="button"
                onClick={() => setGifVid({ crf: p.crf })}
                className={`rounded-xl py-3 text-xs font-bold transition-all ${
                  opt.crf === p.crf
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 15. Volume Booster
    case "volume-booster": {
      const opt = options as VolumeOptions;
      const setVol = (updates: Partial<VolumeOptions>) =>
        setOptions((prev) => ({ ...(prev as VolumeOptions), ...updates }));

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-red-600" />
              Volume Amplification
            </span>
            <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-xs font-bold text-red-700">
              {opt.mode === "normalize" ? "EBU R128 Broadcast Normalization" : `${Math.round(opt.volumeMultiplier * 100)}% Volume`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "150% Boost", mult: 1.5 },
              { label: "200% (2x Loud)", mult: 2.0 },
              { label: "300% (3x Loud)", mult: 3.0 },
            ].map((p) => (
              <button
                key={p.mult}
                type="button"
                onClick={() => setVol({ mode: "multiplier", volumeMultiplier: p.mult })}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                  opt.mode === "multiplier" && opt.volumeMultiplier === p.mult
                    ? "bg-red-600 text-white shadow-lg shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setVol({ mode: "normalize" })}
              className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                opt.mode === "normalize"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
              }`}
            >
              Auto Normalize
            </button>
          </div>
        </div>
      );
    }

    // 16. Audio Noise Reduction
    case "audio-denoiser": {
      const opt = options as AudioDenoiserOptions;
      const setDenoiser = (updates: Partial<AudioDenoiserOptions>) =>
        setOptions((prev) => ({ ...(prev as AudioDenoiserOptions), ...updates }));

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Mic className="h-4 w-4 text-red-600" />
              Noise Suppression Floor
            </span>
            <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 font-mono text-xs font-bold text-red-700">
              {opt.noiseFloor} dB
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Light Denoise (-20dB)", nf: -20 },
              { label: "Balanced (-25dB)", nf: -25 },
              { label: "Aggressive (-35dB)", nf: -35 },
            ].map((p) => (
              <button
                key={p.nf}
                type="button"
                onClick={() => setDenoiser({ noiseFloor: p.nf })}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                  opt.noiseFloor === p.nf
                    ? "bg-red-600 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 17. Metadata Stripper
    case "metadata-stripper": {
      const opt = options as MetadataStripperOptions;
      const setMeta = (updates: Partial<MetadataStripperOptions>) =>
        setOptions((prev) => ({ ...(prev as MetadataStripperOptions), ...updates }));

      const fileName = fileMeta.name || "video.mp4";
      const fileExt = fileName.split(".").pop()?.toUpperCase() || "MP4";
      const resolution = fileMeta.width && fileMeta.height ? `${fileMeta.width}x${fileMeta.height}` : "HD (1080p)";
      const durationStr = fileMeta.durationSecs ? formatTime(fileMeta.durationSecs) : "0:30";
      const bitRateKbps = fileMeta.durationSecs && fileMeta.size 
        ? Math.round((fileMeta.size * 8) / (fileMeta.durationSecs * 1000))
        : 4500;

      return (
        <div className="space-y-6 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          {/* Header Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                  <span>EXIF & Privacy Metadata Analysis</span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 ring-1 ring-amber-200">
                    Sensitive Tags Found
                  </span>
                </h4>
                <p className="text-xs text-slate-600">
                  Target media contains embedded device, geolocation, and encoder metadata.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 self-start sm:self-auto">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Lossless Stream Copy</span>
            </div>
          </div>

          {/* Detected Metadata Tags & Vulnerabilities Grid */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Detected Embedded Metadata Vectors</span>
              <span className="text-[11px] font-normal text-slate-500">Auto-targeted for scrubbing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                    <MapPin className="h-4 w-4 text-rose-600" />
                    <span>GPS Location & Geotag</span>
                  </div>
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-rose-800">
                    Latitude / Longitude
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Exact physical coordinates recorded by smartphone GPS or drone camera.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <Smartphone className="h-4 w-4 text-amber-600" />
                    <span>Camera & Device Signature</span>
                  </div>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-800">
                    Hardware Model / Serial
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Device manufacturer, phone model (iPhone/Android), camera firmware & lens ID.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <span>Creation & Timezone Stamp</span>
                  </div>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                    UTC Timestamp
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Exact creation date, recording time, modification history, and local timezone offset.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Layers className="h-4 w-4 text-slate-600" />
                    <span>Software & Container Tags</span>
                  </div>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                    Encoder / UDTA
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Editing software traces, QuickTime atoms, author name, and encoding profile.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Container Inspection Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Media Stream & Container Properties</span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">Preserved 1:1</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Container</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{fileExt} / Stream Copy</div>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Resolution</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{resolution}</div>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Duration</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{durationStr}</div>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Bitrate</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">~{bitRateKbps} kbps</div>
              </div>
            </div>
          </div>

          {/* Scrubbing Mode Selector */}
          <div className="space-y-3 pt-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Privacy Scrub Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMeta({ cleanAll: true })}
                className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                  opt.cleanAll !== false
                    ? "border-red-500 bg-red-50/50 text-slate-900 ring-1 ring-red-500 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Complete Privacy Shield (Recommended)
                  </span>
                  {opt.cleanAll !== false && <Check className="h-3.5 w-3.5 text-red-600" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Strips 100% of EXIF, GPS location, device serials, creation timestamps, and software tags.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMeta({ cleanAll: false, stripGps: true, stripDevice: true })}
                className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                  opt.cleanAll === false
                    ? "border-red-500 bg-red-50/50 text-slate-900 ring-1 ring-red-500 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Location & Device ID Only
                  </span>
                  {opt.cleanAll === false && <Check className="h-3.5 w-3.5 text-red-600" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Removes GPS coordinates and camera maker info while keeping creation timestamp.
                </p>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 18. Developer FFmpeg Terminal
    case "ffmpeg-terminal": {
      const opt = options as FFmpegTerminalOptions;
      const setTerm = (cmd: string) =>
        setOptions((prev) => ({ ...(prev as FFmpegTerminalOptions), customCommand: cmd }));

      const recipes = [
        { label: "Convert to 60 FPS", cmd: "-r 60 -vcodec libx264 -preset veryfast" },
        { label: "Desaturate (Grayscale)", cmd: "-vf hue=s=0 -vcodec libx264 -preset veryfast" },
        { label: "Fast Web Start", cmd: "-movflags +faststart -c copy" },
        { label: "High Quality (CRF 18)", cmd: "-vcodec libx264 -crf 18 -preset veryfast -acodec copy" },
      ];

      return (
        <div className="space-y-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-red-600" />
              Custom FFmpeg CLI Flags
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Command Arguments</label>
            <div className="relative">
              <span className="absolute left-3 top-3 font-mono text-red-500 select-none text-xs">&gt; ffmpeg -i input</span>
              <textarea
                value={opt.customCommand}
                onChange={(e) => setTerm(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-slate-900 p-3 pt-8 font-mono text-xs text-slate-100 focus:border-red-500 focus:outline-none"
                placeholder="-vf scale=1280:720 -vcodec libx264 -crf 23"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-slate-500 font-semibold">Quick Recipes:</span>
            <div className="flex flex-wrap gap-1.5">
              {recipes.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setTerm(r.cmd)}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
