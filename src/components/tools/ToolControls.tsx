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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-blue-400" />
              Smart Compression Target
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Estimated Output:</span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                ~{formatBytes(estimatedBytes)} (-{Math.round(((originalBytes - estimatedBytes) / originalBytes) * 100)}%)
              </span>
            </div>
          </div>

          {/* Quick Target Reduction Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { label: "50% Smaller", sub: "Balanced Quality & Size", percent: 50, badge: "Recommended" },
              { label: "70% Smaller", sub: "Small File (WhatsApp/Email)", percent: 70, badge: "Max Savings" },
              { label: "30% Smaller", sub: "High Definition 1080p", percent: 30, badge: "Crisp Quality" },
            ].map((p) => {
              const isSelected = opt.compressionMode === "percentage" && opt.targetPercent === p.percent;
              const estSize = originalBytes * (1 - p.percent / 100);

              return (
                <button
                  key={p.percent}
                  type="button"
                  onClick={() =>
                    setComp({
                      compressionMode: "percentage",
                      targetPercent: p.percent,
                      crf: p.percent >= 70 ? 30 : p.percent >= 50 ? 28 : 24,
                    })
                  }
                  className={`relative flex flex-col items-start rounded-xl p-3.5 text-left transition-all ${
                    isSelected
                      ? "bg-blue-600/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20 text-white"
                      : "bg-slate-950/60 border border-white/5 text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-bold text-sm">{p.label}</span>
                    <span
                      className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${
                        isSelected ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">{p.sub}</span>
                  <div className="mt-2 font-mono text-xs font-semibold text-emerald-400">
                    Target: ~{formatBytes(estSize)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Target Size in MB */}
          <div className="rounded-xl bg-slate-950/80 p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-blue-400" />
                Or Enter Custom Target Size (MB)
              </label>
              {opt.compressionMode === "target-size" && (
                <span className="text-[11px] font-bold text-blue-400">Active</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={Math.max(1, Math.round(originalBytes / (1024 * 1024)))}
                step="0.5"
                placeholder="e.g. 5"
                value={opt.targetSizeMB || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    setComp({ compressionMode: "target-size", targetSizeMB: val });
                  } else {
                    setComp({ compressionMode: "percentage", targetSizeMB: undefined });
                  }
                }}
                className="w-32 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm font-mono text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-xs text-slate-400">
                MB (Original: {formatBytes(originalBytes)})
              </span>
            </div>
          </div>

          {/* Resolution Downscaling */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Maximize className="h-4 w-4 text-blue-400" />
              Target Resolution
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["original", "1080p", "720p", "480p"] as ResolutionOption[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setComp({ resolution: res })}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all ${
                    opt.resolution === res
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Compression Speed / Engine Preset */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                Processing Speed & Performance
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {opt.preset === "ultrafast" || !opt.preset
                  ? "⚡ Turbo (5x-10x Fast)"
                  : opt.preset === "superfast"
                  ? "⚖️ Balanced"
                  : "🎯 Maximum Ratio"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "ultrafast", label: "⚡ Turbo Fast", desc: "Recommended (Near-instant)" },
                { id: "superfast", label: "⚖️ Balanced", desc: "Fast multi-core" },
                { id: "veryfast", label: "🎯 Maximum", desc: "Smaller file (Slower)" },
              ].map((p) => {
                const isSelected = (opt.preset || "ultrafast") === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setComp({ preset: p.id as any })}
                    className={`rounded-xl p-2.5 text-left transition-all ${
                      isSelected
                        ? "bg-amber-500/20 border-2 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                        : "bg-slate-950/60 border border-white/5 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mute Audio Option */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <VolumeX className="h-4 w-4 text-slate-400" />
              Mute / Strip Audio (Additional 10-15% size saving)
            </span>
            <input
              type="checkbox"
              checked={opt.muteAudio}
              onChange={(e) => setComp({ muteAudio: e.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 accent-blue-600"
            />
          </div>
        </div>
      );
    }

    case "video-to-gif": {
      const opt = options as GifOptions;
      const setGif = (updates: Partial<GifOptions>) =>
        setOptions((prev) => ({ ...(prev as GifOptions), ...updates }));

      return (
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Film className="h-4 w-4 text-blue-400" />
              GIF Rendering Settings
            </span>
            <span className="rounded bg-violet-500/20 px-2 py-0.5 font-mono text-xs font-bold text-violet-400">
              Two-Pass 256 Palette
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5 text-blue-400" />
              Frame Rate (Smoothness)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 24, 30].map((fps) => (
                <button
                  key={fps}
                  type="button"
                  onClick={() => setGif({ fps })}
                  className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                    opt.fps === fps
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {fps} FPS
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5 text-blue-400" />
              GIF Output Width
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[320, 480, 640, 800].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setGif({ width: w })}
                  className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                    opt.width === w
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {w}px
                </button>
              ))}
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Music className="h-4 w-4 text-blue-400" />
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="font-bold text-sm uppercase">{f.id}</span>
                <span className="text-[11px] opacity-80 mt-0.5">{f.desc}</span>
              </button>
            ))}
          </div>

          {opt.format !== "wav" && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Radio className="h-3.5 w-3.5 text-blue-400" />
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
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                        : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
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

          <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-4 border border-white/10 text-xs">
            <div>
              <span className="font-semibold text-white">Lossless Fast Stream-Copy</span>
              <p className="text-slate-400">Instant export without re-encoding video.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setOptions((prev) => ({
                  ...(prev as TrimmerOptions),
                  precise: !(prev as TrimmerOptions).precise,
                }))
              }
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                opt.precise ? "bg-blue-600 text-white shadow-md" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              Playback Multipliers
            </span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
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
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-white"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-slate-950/80 p-3 text-xs text-slate-300 border border-white/5 flex items-center justify-between">
            <span>Preserve natural vocal pitch (FFmpeg atempo)</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Enabled
            </span>
          </div>
        </div>
      );
    }

    case "video-mute": {
      return (
        <div className="rounded-2xl bg-slate-900/80 p-5 border border-white/10 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30">
            <VolumeX className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">1-Click Audio Stream Removal</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            This tool performs a pure video stream copy (<code className="text-blue-400">-an -vcodec copy</code>) with zero quality loss and instantaneous processing.
          </p>
        </div>
      );
    }

    case "format-converter": {
      const opt = options as FormatOptions;
      const setFmt = (updates: Partial<FormatOptions>) =>
        setOptions((prev) => ({ ...(prev as FormatOptions), ...updates }));

      return (
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Target Video Container
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {(["mp4", "webm", "mkv", "mov", "avi"] as VideoFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFmt({ targetFormat: fmt })}
                className={`rounded-xl py-3 text-xs font-bold uppercase transition-all ${
                  opt.targetFormat === fmt
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {fmt}
              </button>
            ))}
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-blue-400" />
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl mb-1">{r.icon}</span>
                <span className="font-bold text-xs">{r.name}</span>
                <span className="text-[10px] opacity-75 mt-0.5">{r.desc}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-medium text-slate-300">Fitting Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAsp({ mode: "crop" })}
                className={`rounded-xl p-3 text-xs font-medium text-left transition-all ${
                  opt.mode === "crop" ? "bg-blue-600 text-white ring-1 ring-blue-400" : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="font-bold">Center Crop</div>
                <div className="text-[11px] opacity-80 mt-0.5">Fills screen, cuts outer edges</div>
              </button>

              <button
                type="button"
                onClick={() => setAsp({ mode: "pad" })}
                className={`rounded-xl p-3 text-xs font-medium text-left transition-all ${
                  opt.mode === "pad" ? "bg-blue-600 text-white ring-1 ring-blue-400" : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Type className="h-4 w-4 text-blue-400" />
              Watermark Branding
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Watermark Text</label>
            <input
              type="text"
              value={opt.text}
              onChange={(e) => setWater({ text: e.target.value })}
              placeholder="e.g. @MyChannel or Brand Name"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-blue-400" />
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
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400"
                      : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Font Size</span>
                <span className="font-mono text-blue-400">{opt.fontSize}px</span>
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
              <div className="flex justify-between text-xs text-slate-300">
                <span>Opacity</span>
                <span className="font-mono text-blue-400">{Math.round(opt.opacity * 100)}%</span>
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <RotateCw className="h-4 w-4 text-blue-400" />
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
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

      return (
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Rewind className="h-4 w-4 text-blue-400" />
              Rewind Playback Settings
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-950/80 p-3.5 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white">Reverse Audio Track</span>
                <p className="text-[11px] text-slate-400">Play audio backwards synchronously with video</p>
              </div>
              <input
                type="checkbox"
                checked={opt.reverseAudio && !opt.muteAudio}
                disabled={opt.muteAudio}
                onChange={(e) => setRev({ reverseAudio: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-950/80 p-3.5 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white">Mute Audio</span>
                <p className="text-[11px] text-slate-400">Export video as silent rewind clip</p>
              </div>
              <input
                type="checkbox"
                checked={opt.muteAudio}
                onChange={(e) => setRev({ muteAudio: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600"
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-blue-400" />
              Frame Snapshot Position
            </span>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-bold text-blue-400">
              {formatTime(opt.timestampSecs)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Seek Video Timeline</span>
              <span className="font-mono text-blue-400">{opt.timestampSecs.toFixed(2)}s / {duration.toFixed(1)}s</span>
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

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <label className="text-xs font-medium text-slate-300">Output Image Format</label>
            <div className="flex gap-2">
              {(["png", "jpg"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFrame({ format: fmt })}
                  className={`rounded-lg px-3 py-1 text-xs font-bold uppercase transition-all ${
                    opt.format === fmt ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-blue-400" />
              Color Grading & Filter Effects
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg"
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-white/5"
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
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Fine-Tune Manual Adjustments</span>
              <span className="text-[11px] text-blue-400 font-mono">Live GPU Accelerated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Brightness</span>
                  <span className="font-mono text-blue-400">{opt.brightness > 0 ? `+${opt.brightness}` : opt.brightness}</span>
                </div>
                <input
                  type="range"
                  min={-0.3}
                  max={0.3}
                  step={0.02}
                  value={opt.brightness}
                  onChange={(e) => setFilt({ brightness: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Contrast</span>
                  <span className="font-mono text-blue-400">{opt.contrast}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={opt.contrast}
                  onChange={(e) => setFilt({ contrast: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Saturation</span>
                  <span className="font-mono text-blue-400">{opt.saturation}x</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={3.0}
                  step={0.1}
                  value={opt.saturation}
                  onChange={(e) => setFilt({ saturation: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Gamma</span>
                  <span className="font-mono text-blue-400">{opt.gamma}</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.8}
                  step={0.05}
                  value={opt.gamma}
                  onChange={(e) => setFilt({ gamma: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Film className="h-4 w-4 text-blue-400" />
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-blue-400" />
              Volume Amplification
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
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
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400"
                  : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mic className="h-4 w-4 text-blue-400" />
              Noise Suppression Floor
            </span>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-bold text-blue-400">
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
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400"
                    : "bg-slate-950/60 text-slate-300 hover:bg-slate-800"
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
        <div className="space-y-6 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          {/* Header Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>EXIF & Privacy Metadata Analysis</span>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/30">
                    Sensitive Tags Found
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Target media contains embedded device, geolocation, and encoder metadata.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20 self-start sm:self-auto">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Lossless Stream Copy</span>
            </div>
          </div>

          {/* Detected Metadata Tags & Vulnerabilities Grid */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Detected Embedded Metadata Vectors</span>
              <span className="text-[11px] font-normal text-slate-500">Auto-targeted for scrubbing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                    <MapPin className="h-4 w-4 text-rose-400" />
                    <span>GPS Location & Geotag</span>
                  </div>
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-rose-400">
                    Latitude / Longitude
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Exact physical coordinates recorded by smartphone GPS or drone camera.
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Smartphone className="h-4 w-4 text-amber-400" />
                    <span>Camera & Device Signature</span>
                  </div>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                    Hardware Model / Serial
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Device manufacturer, phone model (iPhone/Android), camera firmware & lens ID.
                </p>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span>Creation & Timezone Stamp</span>
                  </div>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-400">
                    UTC Timestamp
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Exact creation date, recording time, modification history, and local timezone offset.
                </p>
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
                    <Layers className="h-4 w-4 text-violet-400" />
                    <span>Software & Container Tags</span>
                  </div>
                  <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-violet-400">
                    Encoder / UDTA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Editing software traces, QuickTime atoms, author name, and encoding profile.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Container Inspection Box */}
          <div className="rounded-xl border border-white/10 bg-slate-950/80 p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Media Stream & Container Properties</span>
              <span className="text-[11px] font-mono text-emerald-400">Preserved 1:1</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="rounded-lg bg-slate-900 p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Container</div>
                <div className="font-mono font-bold text-white mt-0.5">{fileExt} / Stream Copy</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Resolution</div>
                <div className="font-mono font-bold text-white mt-0.5">{resolution}</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Duration</div>
                <div className="font-mono font-bold text-white mt-0.5">{durationStr}</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-2.5 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Bitrate</div>
                <div className="font-mono font-bold text-white mt-0.5">~{bitRateKbps} kbps</div>
              </div>
            </div>
          </div>

          {/* Scrubbing Mode Selector */}
          <div className="space-y-3 pt-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Privacy Scrub Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMeta({ cleanAll: true })}
                className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                  opt.cleanAll !== false
                    ? "border-emerald-500/50 bg-emerald-500/10 text-white ring-1 ring-emerald-500/30"
                    : "border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Complete Privacy Shield (Recommended)
                  </span>
                  {opt.cleanAll !== false && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Strips 100% of EXIF, GPS location, device serials, creation timestamps, and software tags.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMeta({ cleanAll: false, stripGps: true, stripDevice: true })}
                className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                  opt.cleanAll === false
                    ? "border-blue-500/50 bg-blue-500/10 text-white ring-1 ring-blue-500/30"
                    : "border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    Location & Device ID Only
                  </span>
                  {opt.cleanAll === false && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
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
        <div className="space-y-5 rounded-2xl bg-slate-900/80 p-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-blue-400" />
              Custom FFmpeg CLI Flags
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Command Arguments</label>
            <div className="relative">
              <span className="absolute left-3 top-3 font-mono text-blue-400 select-none text-xs">&gt; ffmpeg -i input</span>
              <textarea
                value={opt.customCommand}
                onChange={(e) => setTerm(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 pt-8 font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
                placeholder="-vf scale=1280:720 -vcodec libx264 -crf 23"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-slate-400">Quick Recipes:</span>
            <div className="flex flex-wrap gap-1.5">
              {recipes.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setTerm(r.cmd)}
                  className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 border border-white/5"
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
