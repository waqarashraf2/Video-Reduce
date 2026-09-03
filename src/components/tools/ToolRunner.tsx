"use client";

import React, { useState, useRef } from "react";
import {
  ToolMetadata,
  ToolId,
  AnyToolOptions,
  CompressionOptions,
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
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

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

  const [mounted, setMounted] = React.useState(false);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [options, setOptions] = useState<AnyToolOptions>(() => getDefaultOptions(tool.id));
  const [status, setStatus] = useState<"idle" | "ready" | "processing" | "completed" | "error">("idle");
  const [progress, setProgress] = useState<ProcessProgress>({ ratio: 0, percent: 0, time: 0 });
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileSelected = (meta: FileMetadata) => {
    setFileMeta(meta);

    if (tool.id === "video-compressor") {
      const isMobile = typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isLarge = meta.size > 200 * 1024 * 1024;

      setOptions((prev) => {
        const comp = prev as CompressionOptions;
        return {
          ...comp,
          durationSecs: meta.durationSecs,
          fileSizeBytes: meta.size,
          preset: "ultrafast",
          resolution: isMobile || isLarge ? "720p" : comp.resolution || "1080p",
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

    const startTime = Date.now();
    const isMobile =
      typeof window !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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

      const { outputData } = await runFFmpeg(
        { name: job.inputName, buffer: inputBuffer },
        job.outputName,
        job.args,
        (p) => setProgress(p),
        fileMeta.durationSecs
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
    } catch (err: any) {
      console.error("Processing failed:", err);
      setErrorMessage(
        err?.message || "An unexpected error occurred during processing. Please try again with different settings."
      );
      setStatus("error");
    }
  };

  return (
    <div className="space-y-6">
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
            <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Processing Failed</h4>
                <p className="text-xs">{errorMessage}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleStartProcessing}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:brightness-110 hover:shadow-blue-500/40 active:scale-[0.99] disabled:opacity-50"
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
