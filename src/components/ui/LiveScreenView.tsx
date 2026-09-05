"use client";

import React, { useRef, useState, useEffect } from "react";
import { ToolId, AnyToolOptions } from "@/lib/ffmpeg/types";
import { FileMetadata } from "@/components/ui/FileDropzone";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Eye,
  Sparkles,
  RotateCw,
} from "lucide-react";

interface LiveScreenViewProps {
  toolId: ToolId;
  fileMeta: FileMetadata;
  options: AnyToolOptions;
  videoRef: React.RefObject<HTMLVideoElement>;
  onScrub?: (time: number) => void;
}

export const LiveScreenView: React.FC<LiveScreenViewProps> = ({
  toolId,
  fileMeta,
  options,
  videoRef,
  onScrub,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fileMeta.durationSecs || 0);

  const isVideo = fileMeta.type.startsWith("video/") || fileMeta.name.match(/\.(mp4|mov|mkv|webm|avi|flv|wmv)$/i);
  const isAudio = fileMeta.type.startsWith("audio/") || fileMeta.name.match(/\.(mp3|wav|aac|m4a|ogg|flac)$/i);
  const isImage = fileMeta.type.startsWith("image/") || fileMeta.name.match(/\.(png|jpg|jpeg|gif|webp)$/i);

  // Compute live CSS filter style based on tool and options
  const getFilterStyle = (): React.CSSProperties => {
    if (toolId === "video-filters") {
      const f = options as any;
      let filterString = `brightness(${1 + (f.brightness || 0)}) contrast(${f.contrast || 1}) saturate(${f.saturation || 1})`;

      switch (f.preset) {
        case "cyberpunk":
          filterString += " hue-rotate(290deg) contrast(1.4) saturate(2.0)";
          break;
        case "sepia":
          filterString += " sepia(0.85) contrast(1.1) brightness(0.95)";
          break;
        case "vintage":
          filterString += " sepia(0.35) contrast(1.2) saturate(1.3) brightness(1.05)";
          break;
        case "bw":
          filterString += " grayscale(1) contrast(1.3) brightness(1.05)";
          break;
        case "warm":
          filterString += " sepia(0.2) saturate(1.5) hue-rotate(-15deg)";
          break;
        case "cool":
          filterString += " saturate(1.2) hue-rotate(30deg) brightness(1.05)";
          break;
        default:
          break;
      }
      return { filter: filterString };
    }
    return {};
  };

  // Compute live transform style (Rotate / Flip)
  const getTransformStyle = (): React.CSSProperties => {
    if (toolId === "video-rotate") {
      const r = options as any;
      switch (r.rotation) {
        case "90":
          return { transform: "rotate(90deg)" };
        case "180":
          return { transform: "rotate(180deg)" };
        case "270":
          return { transform: "rotate(270deg)" };
        case "hflip":
          return { transform: "scaleX(-1)" };
        case "vflip":
          return { transform: "scaleY(-1)" };
        default:
          return {};
      }
    }
    return {};
  };

  // Compute Aspect Ratio container style
  const getAspectRatioClass = () => {
    if (toolId === "aspect-ratio-resizer") {
      const a = options as any;
      switch (a.ratio) {
        case "9:16":
          return "aspect-[9/16] max-h-[420px]";
        case "1:1":
          return "aspect-square max-h-[380px]";
        case "4:5":
          return "aspect-[4/5] max-h-[400px]";
        case "16:9":
          return "aspect-video max-h-[340px]";
        default:
          return "max-h-[360px]";
      }
    }
    return "max-h-[220px] sm:max-h-[300px]";
  };

  // Compute Watermark overlay
  const renderWatermarkOverlay = () => {
    if (toolId !== "video-watermark") return null;
    const w = options as any;

    const posClasses: Record<string, string> = {
      "top-left": "top-4 left-4",
      "top-right": "top-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "bottom-right": "bottom-4 right-4",
      center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    };

    const positionClass = posClasses[w.position] || posClasses["bottom-right"];

    return (
      <div
        className={`pointer-events-none absolute ${positionClass} z-20 transition-all`}
        style={{ opacity: w.opacity ?? 0.8 }}
      >
        {w.type === "text" ? (
          <span
            className="font-bold tracking-wide drop-shadow-md select-none rounded bg-black/30 px-2 py-0.5"
            style={{
              fontSize: `${Math.max(12, Math.min(48, (w.fontSize || 32) * 0.7))}px`,
              color: w.fontColor || "white",
            }}
          >
            {w.text || "VideoReduce.com"}
          </span>
        ) : (
          <div className="rounded bg-black/20 p-1">
            <span className="text-xs font-bold text-white uppercase bg-blue-600/80 px-2 py-1 rounded">
              Logo Watermark
            </span>
          </div>
        )}
      </div>
    );
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || fileMeta.durationSecs || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    if (onScrub) {
      onScrub(time);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  if (!fileMeta.previewUrl && !isAudio) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-500/30 bg-[#070b14] shadow-2xl space-y-0">
      {/* Screen View Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-400" />
          <span className="font-bold text-white">Live Screen View Preview</span>
          {toolId === "video-filters" && (
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 animate-pulse">
              Real-time Color Grading Active
            </span>
          )}
          {toolId === "video-watermark" && (
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
              Live Watermark Position
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Screen Canvas / Video Player Viewport */}
      <div className="relative flex items-center justify-center bg-black/90 p-2 overflow-hidden">
        {isVideo && fileMeta.previewUrl && (
          <div className={`relative flex items-center justify-center w-full mx-auto ${getAspectRatioClass()}`}>
            <video
              ref={videoRef}
              src={fileMeta.previewUrl}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              style={{
                ...getFilterStyle(),
                ...getTransformStyle(),
              }}
              className="h-full w-full object-contain rounded-xl transition-all duration-150"
            />
            {renderWatermarkOverlay()}
          </div>
        )}

        {isAudio && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3 w-full">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
              <Volume2 className="h-8 w-8 animate-pulse" />
            </div>
            <audio
              ref={videoRef as any}
              src={fileMeta.previewUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
            <span className="text-xs text-slate-300 font-mono font-medium">{fileMeta.name}</span>
          </div>
        )}

        {isImage && fileMeta.previewUrl && (
          <div className="relative max-h-[380px] w-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileMeta.previewUrl}
              alt="Live Screen View"
              style={getFilterStyle()}
              className="max-h-[340px] w-auto object-contain rounded-xl"
            />
            {renderWatermarkOverlay()}
          </div>
        )}
      </div>

      {/* Interactive Player Controls & Timeline Scrubber */}
      {(isVideo || isAudio) && (
        <div className="border-t border-white/10 bg-slate-950/90 px-4 py-3 space-y-2">
          {/* Timeline Scrubber */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.05}
              value={currentTime}
              onChange={handleSeek}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-blue-500 hover:bg-slate-700"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-500 active:scale-95 transition-all"
                aria-label={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <span className="text-xs font-mono text-slate-300">
                {formatTime(currentTime)} <span className="text-slate-500">/</span> {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Real-time Hardware GPU Canvas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
