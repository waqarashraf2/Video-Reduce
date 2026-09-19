"use client";

import React, { useState, useRef } from "react";
import {
  ToolMetadata,
  ToolId,
  AnyToolOptions,
  CompressionOptions,
  GifOptions,
  ReverseOptions,
  ProcessProgress,
  ProcessResult,
} from "@/lib/ffmpeg/types";
import { useFFmpeg } from "@/lib/ffmpeg/ffmpeg-provider";
import { buildFFmpegJob } from "@/lib/ffmpeg/commands";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import { ToolControls } from "./ToolControls";
import { LiveScreenView } from "@/components/ui/LiveScreenView";
import { ProcessingProgress } from "@/components/ui/ProcessingProgress";
import { ResultPreview } from "@/components/ui/ResultPreview";
import {
  Sparkles,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useWebCodecsCompressor } from "@/lib/webcodecs/useWebCodecsCompressor";

interface ToolRunnerProps {
  tool: ToolMetadata;
}

function getDefaultOptions(toolId: ToolId): AnyToolOptions {
  switch (toolId) {
    case "video-compressor":
      return {
        compressionMode: "percentage",
        targetPercent: 50,
        crf: 28,
        preset: "ultrafast",
        resolution: "original",
        muteAudio: false,
      };
    case "video-to-gif":
      return { fps: 15, width: 480, speed: 1.0, loop: 0 };
    case "audio-extractor":
      return { format: "mp3", bitrate: "192k" };
    case "video-trimmer":
      return { startTime: 0, endTime: 10, precise: false };
    case "speed-controller":
      return { speed: 2.0, adjustPitch: true };
    case "video-mute":
      return { fastCopy: true };
    case "format-converter":
      return { targetFormat: "mp4", quality: "medium" };
    case "aspect-ratio-resizer":
      return { ratio: "9:16", mode: "crop", padColor: "black" };
    case "video-watermark":
      return {
        type: "text",
        text: "VideoReduce.com",
        fontSize: 32,
        fontColor: "white",
        position: "bottom-right",
        opacity: 0.8,
      };
    case "video-rotate":
      return { rotation: "90" };
    case "video-reverse":
      return { reverseAudio: true, muteAudio: false };
    case "frame-extractor":
      return { timestampSecs: 1.0, format: "png" };
    case "video-filters":
      return { preset: "none", brightness: 0, contrast: 1, saturation: 1, gamma: 1 };
    case "gif-to-video":
      return { loopCount: 0, crf: 22 };
    case "volume-booster":
      return { mode: "multiplier", volumeMultiplier: 2.0 };
    case "audio-denoiser":
      return { noiseFloor: -25 };
    case "metadata-stripper":
      return { cleanAll: true };
    case "ffmpeg-terminal":
      return { customCommand: "-vcodec libx264 -preset veryfast -crf 22" };
    default:
      return { format: "mp3", bitrate: "192k" };
  }
}

export const ToolRunner: React.FC<ToolRunnerProps> = ({ tool }) => {
  const { runFFmpeg, isLoaded, isLoading, loadProgress, loadFFmpeg, logs } = useFFmpeg();
  const { isEligible: isWebCodecsEligible, compress: compressWebCodecs } = useWebCodecsCompressor();
  const [engineMode, setEngineMode] = useState<"webcodecs" | "ffmpeg">("webcodecs");

  const [mounted, setMounted] = React.useState(false);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [options, setOptions] = useState<AnyToolOptions>(() => getDefaultOptions(tool.id));
  const [status, setStatus] = useState<"idle" | "ready" | "processing" | "completed" | "error">("idle");
  const [progress, setProgress] = useState<ProcessProgress>({ ratio: 0, percent: 0, time: 0 });
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<any>(null);
  const audioHeartbeatRef = useRef<AudioContext | null>(null);

  const scrollToToolContainer = () => {
    if (typeof window !== "undefined") {
      if (containerRef.current) {
        const yOffset = -90;
        const y = containerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Screen Wake Lock & Background Media Heartbeat (Prevents Screen Sleep & Background Tab Throttling)
  React.useEffect(() => {
    let isSubscribed = true;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator && !wakeLockRef.current) {
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
        }
      } catch (_) {}
    };

    const startAudioHeartbeat = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx && !audioHeartbeatRef.current) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.value = 0.00001; // Silent background audio heartbeat keeps WebAssembly worker prioritized
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          audioHeartbeatRef.current = ctx;
        }
      } catch (_) {}
    };

    const releaseWakeLockAndHeartbeat = () => {
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch (_) {}
        wakeLockRef.current = null;
      }
      if (audioHeartbeatRef.current) {
        try {
          audioHeartbeatRef.current.close();
        } catch (_) {}
        audioHeartbeatRef.current = null;
      }
    };

    if (status === "processing") {
      requestWakeLock();
      startAudioHeartbeat();
    } else {
      releaseWakeLockAndHeartbeat();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "processing" && isSubscribed) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLockAndHeartbeat();
    };
  }, [status]);

  // 2. Prevent Accidental Tab Close / Navigation During Encoding
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "processing") {
        e.preventDefault();
        e.returnValue = "Video processing is currently in progress. Leaving will cancel rendering.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  // 3. Live Tab Title Progress for Background Tabs
  React.useEffect(() => {
    if (status === "processing") {
      document.title = `(${Math.round(progress.percent)}%) Compressing... | VideoReduce`;
    } else if (status === "completed") {
      document.title = `(✓ Complete) ${tool.name} | VideoReduce`;
    } else {
      document.title = `${tool.name} | VideoReduce`;
    }
  }, [status, progress.percent, tool.name]);

  const handleFileSelected = (meta: FileMetadata) => {
    setFileMeta(meta);

    if (tool.id === "video-compressor") {
      const originalMB = Number((meta.size / (1024 * 1024)).toFixed(1));
      let initialTargetMB = Number((originalMB * 0.5).toFixed(1));
      // For large videos (>120MB), default target is set to safe 50MB for smooth mobile hardware encoding
      if (initialTargetMB > 60) {
        initialTargetMB = 50;
      }
      initialTargetMB = Math.max(1, initialTargetMB);

      setOptions((prev) => {
        const comp = prev as CompressionOptions;
        return {
          ...comp,
          compressionMode: "target-size",
          targetPercent: 50,
          targetSizeMB: initialTargetMB,
          durationSecs: meta.durationSecs,
          fileSizeBytes: meta.size,
          preset: "veryfast",
          resolution: comp.resolution || "original",
        };
      });
    } else if (tool.id === "video-to-gif") {
      setOptions((prev) => {
        const gif = prev as GifOptions;
        return {
          ...gif,
          startTime: 0,
          duration: meta.durationSecs ? Math.min(meta.durationSecs, 6) : 6,
          fps: gif.fps || 15,
          width: gif.width || 480,
          quality: gif.quality || "high",
          speed: gif.speed || 1.0,
          loop: gif.loop ?? 0,
        };
      });
    } else if (tool.id === "video-reverse") {
      setOptions((prev) => {
        const rev = prev as ReverseOptions;
        const dur = meta.durationSecs || 8;
        return {
          ...rev,
          reverseAudio: rev.reverseAudio ?? true,
          muteAudio: rev.muteAudio ?? false,
          quality: rev.quality || "turbo",
          maxDuration: rev.maxDuration || (dur <= 8 ? Math.round(dur) : 8),
        };
      });
    } else if (tool.id === "video-trimmer" && meta.durationSecs) {
      setOptions({
        startTime: 0,
        endTime: Math.min(meta.durationSecs, 15),
        precise: false,
      });
    } else if (tool.id === "frame-extractor" && meta.durationSecs) {
      setOptions({
        timestampSecs: Math.min(1.0, meta.durationSecs),
        format: "png",
      });
    }
    setStatus("ready");
    setErrorMessage(null);
  };

  const handleClear = () => {
    setFileMeta(null);
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  };

  const handleScrubPreview = (time: number) => {
    if (videoPreviewRef.current) {
      videoPreviewRef.current.currentTime = time;
    }
  };

  const handleStartProcessing = async () => {
    if (!fileMeta) return;

    setStatus("processing");
    setProgress({ ratio: 0, percent: 0, time: 0 });
    setErrorMessage(null);
    scrollToToolContainer();

    const startTime = Date.now();
    const isMobile =
      typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const isGpuEligible = isWebCodecsEligible(tool.id, fileMeta.file);

    // ⚡ 1. Ultra-Fast WebCodecs Hardware Acceleration Pipeline (GPU Engine)
    if (isGpuEligible) {
      console.log("⚡ [WebCodecs GPU] Initiating hardware-accelerated compression for:", fileMeta.file.name);
      try {
        setEngineMode("webcodecs");
        const compOptions: CompressionOptions = {
          ...(options as CompressionOptions),
          durationSecs: fileMeta.durationSecs,
          fileSizeBytes: fileMeta.size,
        };
        const res = await compressWebCodecs(
          fileMeta.file,
          compOptions,
          (p) => setProgress(p)
        );
        console.log("✅ [WebCodecs GPU] Finished successfully in", res.processTimeMs, "ms!");
        setResult(res);
        setStatus("completed");
        scrollToToolContainer();
        return;
      } catch (gpuErr) {
        console.error("❌ [WebCodecs GPU] Error encountered, falling back to FFmpeg Wasm:", gpuErr);
        // Gracefully continue to standard FFmpeg Wasm pipeline below
      }
    }

    setEngineMode("ffmpeg");

    try {
      if (!isLoaded) {
        const loaded = await loadFFmpeg();
        if (!loaded) {
          throw new Error("Could not initialize WebAssembly media engine.");
        }
      }

      // 1. Release DOM video player resources to free up mobile GPU & decoder memory
      if (videoPreviewRef.current) {
        try {
          videoPreviewRef.current.pause();
        } catch (_) {}
      }

      // 2. Safe ArrayBuffer reading with graceful memory allocation
      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = await fileMeta.file.arrayBuffer();
      } catch (memErr: any) {
        throw new Error(
          `Memory Notice: Could not allocate memory for this ${formatBytes(fileMeta.size)} file. If your device has low free RAM, try closing other background tabs or process on a desktop computer.`
        );
      }

      const inputBuffer = new Uint8Array(arrayBuffer);

      const currentOptions: AnyToolOptions = {
        ...options,
        ...(tool.id === "video-compressor"
          ? { durationSecs: fileMeta.durationSecs, fileSizeBytes: fileMeta.size }
          : {}),
      };

      const job = buildFFmpegJob(tool.id, fileMeta.file, currentOptions);
      const targetDuration =
        tool.id === "video-to-gif"
          ? (currentOptions as any).duration || 6
          : tool.id === "video-reverse"
          ? (currentOptions as any).maxDuration || 8
          : fileMeta.durationSecs;

      const { outputData } = await runFFmpeg(
        { name: job.inputName, buffer: inputBuffer },
        job.outputName,
        job.multiCommands || job.args,
        (p) => setProgress(p),
        targetDuration
      );

      const processTimeMs = Date.now() - startTime;
      const outputBlob = new Blob([outputData as unknown as BlobPart], { type: job.outputMimeType });
      const outputUrl = URL.createObjectURL(outputBlob);

      const outputSize = outputBlob.size;
      const originalSize = fileMeta.size;
      const reductionPercentage = Math.round(((originalSize - outputSize) / originalSize) * 100);

      setResult({
        outputUrl,
        outputBlob,
        outputFileName: job.outputName,
        originalSize,
        outputSize,
        durationSecs: fileMeta.durationSecs,
        processTimeMs,
        reductionPercentage,
        mimeType: job.outputMimeType,
      });

      setStatus("completed");
      scrollToToolContainer();
    } catch (err: any) {
      console.error("Processing failed:", err);
      const msg =
        typeof err === "string"
          ? err
          : err?.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
      setErrorMessage(
        msg && msg !== "{}"
          ? msg
          : "An unexpected error occurred during processing. Please try again with different settings."
      );
      setStatus("error");
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {status === "idle" && (
        <FileDropzone
          acceptedTypes={tool.acceptedTypes}
          acceptedExtensions={tool.acceptedExtensions}
          onFileSelected={handleFileSelected}
          selectedFile={fileMeta}
          onClear={handleClear}
          title={`Drop ${tool.shortName} file here`}
          subtitle="All processing runs 100% in your browser. 0 Server uploads."
        />
      )}

      {(status === "ready" || status === "error") && fileMeta && (
        <div className="space-y-6 animate-in fade-in">
          <FileDropzone
            acceptedTypes={tool.acceptedTypes}
            acceptedExtensions={tool.acceptedExtensions}
            onFileSelected={handleFileSelected}
            selectedFile={fileMeta}
            onClear={handleClear}
          />

          {/* Universal Live Screen View with Real-time Color Grading, Filter & Transform Preview */}
          {fileMeta && (
            <LiveScreenView
              toolId={tool.id}
              fileMeta={fileMeta}
              options={options}
              videoRef={videoPreviewRef}
              onScrub={handleScrubPreview}
            />
          )}

          <ToolControls
            toolId={tool.id}
            options={options}
            setOptions={setOptions}
            fileMeta={fileMeta}
            onScrubPreview={handleScrubPreview}
          />

          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Processing Failed</h4>
                <p className="text-xs">{errorMessage}</p>
              </div>
            </div>
          )}

          {isWebCodecsEligible(tool.id, fileMeta.file) && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 shadow-sm">
              <span className="flex items-center gap-2 font-semibold">
                <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Hardware Acceleration Ready (GPU Engine)</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                10x Faster
              </span>
            </div>
          )}

          <button
            onClick={handleStartProcessing}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 p-4 text-base font-bold text-white shadow-xl shadow-red-500/25 transition-all hover:brightness-105 hover:shadow-red-500/40 active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading WebAssembly Core ({loadProgress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Start {tool.shortName}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      )}

      {status === "processing" && (
        <ProcessingProgress
          progress={progress}
          toolName={tool.shortName}
          logs={logs}
          engineMode={engineMode}
          onCancel={() => setStatus("ready")}
        />
      )}

      {status === "completed" && result && (
        <ResultPreview
          result={result}
          onReset={handleClear}
          toolName={tool.shortName}
        />
      )}
    </div>
  );
};
