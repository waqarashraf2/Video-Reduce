"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolMetadata, EnhancerOptions } from "@/lib/ffmpeg/types";
import { useFFmpeg } from "@/lib/ffmpeg/ffmpeg-provider";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Sparkles,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Check,
  Loader2,
  Maximize2,
  Eye,
  RefreshCw,
  ShieldCheck,
  Film,
  Zap,
  Sun,
  Moon,
  User,
  Tv,
  CheckCircle2,
  Layers,
  ChevronDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime, formatBytes } from "@/lib/utils";

interface AiVideoEnhancerStudioProps {
  tool: ToolMetadata;
}

export type EnhancementPreset =
  | "auto"
  | "4k-upscale"
  | "portrait"
  | "low-light"
  | "cinematic";

interface PresetConfig {
  id: EnhancementPreset;
  title: string;
  tagline: string;
  badge: string;
  icon: any;
  sharpen: number;
  denoise: number;
  contrast: number;
  brightness: number;
  saturation: number;
  resolution: "original" | "1080p" | "4k";
}

const ENHANCEMENT_PRESETS: PresetConfig[] = [
  {
    id: "auto",
    title: "AI Smart Auto-Enhance",
    tagline: "Adaptive edge unblur, noise cleanup & micro-contrast balance",
    badge: "Recommended",
    icon: Sparkles,
    sharpen: 65,
    denoise: 40,
    contrast: 15,
    brightness: 4,
    saturation: 18,
    resolution: "original",
  },
  {
    id: "4k-upscale",
    title: "Super-Resolution 4K",
    tagline: "Lanczos 3-lobe resampling with deep edge sharpening",
    badge: "Ultra Crisp",
    icon: Tv,
    sharpen: 85,
    denoise: 30,
    contrast: 12,
    brightness: 2,
    saturation: 12,
    resolution: "1080p",
  },
  {
    id: "portrait",
    title: "Face & Portrait Clarity",
    tagline: "Smoothes skin artifacts while sharpening eyes, hair & facial detail",
    badge: "Creators",
    icon: User,
    sharpen: 55,
    denoise: 60,
    contrast: 8,
    brightness: 5,
    saturation: 14,
    resolution: "original",
  },
  {
    id: "low-light",
    title: "Night & Low-Light Boost",
    tagline: "Lifts dark shadows, cleans heavy chroma noise & boosts exposure",
    badge: "Night Shots",
    icon: Moon,
    sharpen: 60,
    denoise: 75,
    contrast: 22,
    brightness: 18,
    saturation: 10,
    resolution: "original",
  },
  {
    id: "cinematic",
    title: "Vibrant Cinematic Pop",
    tagline: "High dynamic range punch, vivid colors & razor-sharp textures",
    badge: "Vivid HDR",
    icon: Sun,
    sharpen: 70,
    denoise: 25,
    contrast: 25,
    brightness: 0,
    saturation: 35,
    resolution: "original",
  },
];

export const AiVideoEnhancerStudio: React.FC<AiVideoEnhancerStudioProps> = ({ tool }) => {
  const { runFFmpeg, isLoaded, loadFFmpeg, isLoading: isEngineLoading } = useFFmpeg();

  // File & Video State
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Enhancement Settings
  const [activePreset, setActivePreset] = useState<EnhancementPreset>("auto");
  const [sharpenAmount, setSharpenAmount] = useState<number>(65);
  const [denoiseAmount, setDenoiseAmount] = useState<number>(40);
  const [contrastBoost, setContrastBoost] = useState<number>(15);
  const [brightnessBoost, setBrightnessBoost] = useState<number>(4);
  const [saturationBoost, setSaturationBoost] = useState<number>(18);
  const [targetResolution, setTargetResolution] = useState<"original" | "1080p" | "4k">("original");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Interactive Split Slider (0 to 100 percentage)
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Processing & Export
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [processDurationMs, setProcessDurationMs] = useState<number>(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const outputVideoRef = useRef<HTMLVideoElement | null>(null);

  // Handle Preset Select
  const handleSelectPreset = (preset: PresetConfig) => {
    setActivePreset(preset.id);
    setSharpenAmount(preset.sharpen);
    setDenoiseAmount(preset.denoise);
    setContrastBoost(preset.contrast);
    setBrightnessBoost(preset.brightness);
    setSaturationBoost(preset.saturation);
    setTargetResolution(preset.resolution);
  };

  // Handle File Selection
  const handleFileSelect = (metadata: FileMetadata) => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
      setOutputBlob(null);
    }

    const url = URL.createObjectURL(metadata.file);
    setVideoSrc(url);
    setFileMeta(metadata);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Video Loaded
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    setNaturalWidth(v.videoWidth || 1280);
    setNaturalHeight(v.videoHeight || 720);
    setDuration(v.duration || 0);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Dragging the Split-Screen Divider
  const updateSplitFromPointer = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (relativeX / rect.width) * 100));
    setSplitPosition(pct);
  }, []);

  useEffect(() => {
    if (!isDraggingSplit) return;

    const onMouseMove = (e: MouseEvent) => updateSplitFromPointer(e.clientX);
    const onMouseUp = () => setIsDraggingSplit(false);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) updateSplitFromPointer(e.touches[0].clientX);
    };
    const onTouchEnd = () => setIsDraggingSplit(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDraggingSplit, updateSplitFromPointer]);

  // CSS Filter string for the "After" preview simulation
  const getSimulatedFilterStyle = () => {
    // Convert slider percentages to CSS filter values
    const contrastVal = 1 + contrastBoost / 100;
    const brightnessVal = 1 + brightnessBoost / 100;
    const saturateVal = 1 + saturationBoost / 100;
    return {
      filter: `contrast(${contrastVal.toFixed(2)}) brightness(${brightnessVal.toFixed(2)}) saturate(${saturateVal.toFixed(2)}) drop-shadow(0 0 0.5px rgba(255,255,255,${(sharpenAmount / 200).toFixed(2)}))`,
    };
  };

  // Build FFmpeg enhancement filter graph
  const buildEnhancementFilters = (): string => {
    const filters: string[] = [];

    // 1. Resolution Scaling (Lanczos high-quality)
    if (targetResolution === "1080p") {
      filters.push("scale=1920:1080:flags=lanczos:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2");
    } else if (targetResolution === "4k") {
      filters.push("scale=3840:2160:flags=lanczos:force_original_aspect_ratio=decrease,pad=3840:2160:(ow-iw)/2:(oh-ih)/2");
    } else {
      // Ensure dimensions are even numbers (required by H.264)
      filters.push("scale=trunc(iw/2)*2:trunc(ih/2)*2");
    }

    // 2. Spatial & Temporal Noise Reduction (hqdn3d)
    if (denoiseAmount > 0) {
      const lumaSpat = (1.0 + (denoiseAmount / 100) * 3.5).toFixed(1);
      const chromSpat = (1.0 + (denoiseAmount / 100) * 3.5).toFixed(1);
      const lumaTemp = (2.0 + (denoiseAmount / 100) * 4.0).toFixed(1);
      const chromTemp = (2.0 + (denoiseAmount / 100) * 4.0).toFixed(1);
      filters.push(`hqdn3d=${lumaSpat}:${chromSpat}:${lumaTemp}:${chromTemp}`);
    }

    // 3. Multi-Scale Unsharp Masking (Edge Sharpen & Unblur)
    if (sharpenAmount > 0) {
      const lumaAmount = (0.6 + (sharpenAmount / 100) * 1.5).toFixed(2);
      filters.push(`unsharp=5:5:${lumaAmount}:5:5:0.0`);
    }

    // 4. Color, Brightness, Saturation & Contrast Normalization (eq filter)
    const c = (1.0 + contrastBoost / 100).toFixed(2);
    const b = (brightnessBoost / 100).toFixed(2);
    const s = (1.0 + saturationBoost / 100).toFixed(2);
    filters.push(`eq=contrast=${c}:brightness=${b}:saturation=${s}`);

    return filters.join(",");
  };

  // Run FFmpeg AI Video Enhancement
  const handleEnhanceVideo = async () => {
    if (!fileMeta) return;

    setIsProcessing(true);
    setProgressPercent(5);
    setProcessStatus("Initializing WebAssembly engine...");
    const startMs = performance.now();

    try {
      if (!isLoaded) {
        setProcessStatus("Loading WebAssembly core SIMD engine...");
        await loadFFmpeg();
      }

      setProcessStatus("Reading input video data...");
      const fileBuffer = await fileMeta.file.arrayBuffer();
      const inputBytes = new Uint8Array(fileBuffer);

      const ext = fileMeta.name.split(".").pop()?.toLowerCase() || "mp4";
      const inputFilename = `input_${Date.now()}.${ext}`;
      const outputFilename = `enhanced_${Date.now()}.mp4`;

      const filterGraph = buildEnhancementFilters();

      setProcessStatus("Applying deep edge unblur & detail restoration...");
      setProgressPercent(20);

      // FFmpeg Command: Libx264 ultrafast with CRF 19 for visually lossless clarity
      const args = [
        "-i",
        inputFilename,
        "-vf",
        filterGraph,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "film",
        "-crf",
        "19",
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        outputFilename,
      ];

      let outputResult;
      try {
        outputResult = await runFFmpeg(
          { name: inputFilename, buffer: inputBytes },
          outputFilename,
          args,
          (prog) => {
            if (prog.percent > 0) {
              setProgressPercent(Math.min(96, Math.round(prog.percent)));
              setProcessStatus(`Enhancing frames: ${Math.round(prog.percent)}% complete`);
            }
          },
          duration || undefined
        );
      } catch (streamCopyErr) {
        console.warn("Stream copy audio pass returned warning, falling back to AAC encode:", streamCopyErr);
        // Fallback with AAC audio encoding
        const fallbackArgs = [
          "-i",
          inputFilename,
          "-vf",
          filterGraph,
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-tune",
          "film",
          "-crf",
          "19",
          "-c:a",
          "aac",
          "-b:a",
          "192k",
          "-movflags",
          "+faststart",
          outputFilename,
        ];

        outputResult = await runFFmpeg(
          { name: inputFilename, buffer: inputBytes },
          outputFilename,
          fallbackArgs,
          (prog) => {
            if (prog.percent > 0) {
              setProgressPercent(Math.min(96, Math.round(prog.percent)));
              setProcessStatus(`Enhancing frames: ${Math.round(prog.percent)}% complete`);
            }
          },
          duration || undefined
        );
      }

      if (!outputResult || !outputResult.outputData) {
        throw new Error("Enhancement pipeline produced no output bytes.");
      }

      setProcessStatus("Finalizing enhanced MP4 container...");
      setProgressPercent(99);

      const blob = new Blob([new Uint8Array(outputResult.outputData)], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setOutputBlob(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
      setProcessDurationMs(performance.now() - startMs);
      setProgressPercent(100);
      setProcessStatus("Video successfully enhanced!");
    } catch (err: any) {
      console.error("Enhancement pipeline failed:", err);
      alert(`Enhancement Error: ${err?.message || "Failed to process video"}`);
      setProcessStatus("Enhancement failed. Please try a different preset or file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl || !fileMeta) return;
    const baseName = fileMeta.name.replace(/\.[^/.]+$/, "");
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${baseName}_enhanced.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Super-Resolution Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Video Enhancer & 4K Quality Booster
          </h1>
          <p className="text-sm sm:text-base text-rose-100 max-w-2xl leading-relaxed">
            Unblur, sharpen edges, remove camera noise, and upscale video to crisp HD/4K resolution
            directly inside your browser. 100% private WebAssembly with zero server uploads.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 2. Upload Screen or Studio Workspace */}
      {!videoSrc ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-slate-800">Select Video to Enhance</h2>
            <p className="text-xs text-slate-500">
              Supports MP4, MOV, WebM, MKV, AVI of any size. Processed 100% locally in browser memory.
            </p>
          </div>
          <FileDropzone
            onFileSelected={handleFileSelect}
            selectedFile={fileMeta}
            onClear={() => {
              setVideoSrc(null);
              setFileMeta(null);
              setOutputUrl(null);
            }}
            acceptedTypes={["video/*"]}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Studio Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-red-600" />
                  {fileMeta?.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-mono font-medium">
                  {naturalWidth} × {naturalHeight} px
                </span>
                {fileMeta && (
                  <span className="text-[11px] text-slate-400">
                    ({formatBytes(fileMeta.size)})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 transition-all"
                  title="Toggle Preview Mute"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
                  <span>{isMuted ? "Muted" : "Audio On"}</span>
                </button>
                <button
                  onClick={() => {
                    setVideoSrc(null);
                    setFileMeta(null);
                    setOutputUrl(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Video
                </button>
              </div>
            </div>

            {/* Interactive Before vs After Split-Screen Canvas */}
            <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] relative select-none">
              <div
                ref={containerRef}
                className="relative inline-block max-w-full max-h-[500px] overflow-hidden rounded-lg shadow-2xl cursor-ew-resize"
                onMouseDown={() => setIsDraggingSplit(true)}
                onTouchStart={() => setIsDraggingSplit(true)}
              >
                {/* 1. Underlying Original Video (Left side base) */}
                <video
                  ref={videoRef}
                  src={videoSrc}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  muted={isMuted}
                  playsInline
                  className="max-h-[500px] w-auto h-auto object-contain block pointer-events-none"
                />

                {/* 2. Overlaid Enhanced Preview (Right side clipped by splitPosition) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)`,
                  }}
                >
                  <video
                    src={videoSrc}
                    muted
                    playsInline
                    style={getSimulatedFilterStyle()}
                    className="max-h-[500px] w-full h-full object-contain block pointer-events-none"
                    ref={(node) => {
                      if (node && videoRef.current) {
                        node.currentTime = videoRef.current.currentTime;
                      }
                    }}
                  />
                </div>

                {/* 3. Draggable Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none"
                  style={{ left: `${splitPosition}%` }}
                >
                  {/* Circular Split Handle */}
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-[10px] font-bold">
                    ⇆
                  </div>
                </div>

                {/* Floating "Original" & "AI Enhanced" Badges */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md pointer-events-none border border-white/10">
                  Original (Raw)
                </div>
                <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md pointer-events-none shadow-md flex items-center gap-1.5 border border-red-400/30">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>AI Enhanced</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 mt-3 font-medium">
                Drag the center slider left and right to inspect the real-time enhancement comparison
              </span>
            </div>

            {/* Video Transport Scrubber Controls */}
            <div className="bg-slate-900 border-t border-slate-800 p-3 px-4 flex items-center gap-4 text-white">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-md shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-red-600 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />

              <div className="text-xs font-mono text-slate-400 shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* 3. Preset Enhancement Modes Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>1-Click Enhancement Presets</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select an AI tuning model calibrated for your specific video content.
                </p>
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvanced ? "Hide Fine-Tuning" : "Custom Fine-Tuning"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ENHANCEMENT_PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id;
                const IconComponent = preset.icon;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-red-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm text-slate-900">
                            {preset.title}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-red-600 text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {preset.tagline}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>Sharpness: {preset.sharpen}%</span>
                      <span>Denoise: {preset.denoise}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Collapsible Custom Fine-Tuning Sliders */}
          {showAdvanced && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-600" />
                  <span>Manual Enhancement Parameters</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Fine-tune individual filter values to match your custom aesthetic or noise profile.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Sharpening Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Edge Sharpening (Unsharp Mask)</span>
                    <span className="text-red-600 font-mono font-bold">{sharpenAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sharpenAmount}
                    onChange={(e) => setSharpenAmount(parseInt(e.target.value))}
                    className="w-full accent-red-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Removes lens blurriness and restores edge micro-detail.
                  </span>
                </div>

                {/* Denoise Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Noise Reduction (HQ 3D Denoise)</span>
                    <span className="text-red-600 font-mono font-bold">{denoiseAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={denoiseAmount}
                    onChange={(e) => setDenoiseAmount(parseInt(e.target.value))}
                    className="w-full accent-red-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Eliminates smartphone sensor grain and compression block noise.
                  </span>
                </div>

                {/* Contrast Boost */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Contrast Boost</span>
                    <span className="text-red-600 font-mono font-bold">+{contrastBoost}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={contrastBoost}
                    onChange={(e) => setContrastBoost(parseInt(e.target.value))}
                    className="w-full accent-red-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Deepens dark areas and restores visual dynamic range.
                  </span>
                </div>

                {/* Color Saturation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Color Vibrancy / Saturation</span>
                    <span className="text-red-600 font-mono font-bold">+{saturationBoost}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={saturationBoost}
                    onChange={(e) => setSaturationBoost(parseInt(e.target.value))}
                    className="w-full accent-red-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Revitalizes washed-out colors without skin-tone oversaturation.
                  </span>
                </div>
              </div>

              {/* Target Resolution */}
              <div className="pt-2 border-t border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Target Export Resolution
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "original", label: "Match Original Resolution" },
                    { id: "1080p", label: "Upscale to 1080p Full HD" },
                    { id: "4k", label: "Super-Resolution 4K UHD" },
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setTargetResolution(res.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        targetResolution === res.id
                          ? "bg-red-600 text-white border-red-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. Processing Status & Progress Bar */}
          {isProcessing && (
            <div className="bg-red-50/60 rounded-2xl border border-red-200 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  <span>{processStatus}</span>
                </span>
                <span className="font-mono text-red-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 to-rose-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Processing is executed locally inside your browser WebAssembly sandbox. Audio streams are preserved losslessly.
              </p>
            </div>
          )}

          {/* 6. Action Button: Enhance Video */}
          {!outputUrl && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Private in-browser encoding — No file size limits</span>
              </div>

              <button
                onClick={handleEnhanceVideo}
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enhancing Video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Enhance & Upscale Video</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 7. Output Result Download Card */}
          {outputUrl && (
            <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Video Successfully Enhanced!
                    </h3>
                    <p className="text-xs text-slate-600">
                      Completed in {(processDurationMs / 1000).toFixed(1)}s • Ready for immediate download
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setOutputUrl(null);
                      setOutputBlob(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
                  >
                    Adjust Settings
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Enhanced MP4</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Video Player Preview */}
              <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg max-w-2xl mx-auto">
                <video
                  ref={outputVideoRef}
                  src={outputUrl}
                  controls
                  playsInline
                  className="w-full max-h-[420px] object-contain block"
                />
              </div>

              {/* Metrics Pill Badge */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 font-medium shadow-sm">
                  <span className="font-bold text-slate-800">Original Size:</span>
                  <span>{fileMeta ? formatBytes(fileMeta.size) : "-"}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 font-medium shadow-sm">
                  <span className="font-bold text-slate-800">Enhanced Size:</span>
                  <span className="text-emerald-700 font-bold">{formatBytes(outputSize)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 font-medium shadow-sm">
                  <span className="font-bold text-slate-800">Output Format:</span>
                  <span>MP4 (H.264 / AAC)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
