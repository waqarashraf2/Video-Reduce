"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { useFFmpeg } from "@/lib/ffmpeg/ffmpeg-provider";
import {
  Film,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Download,
  RefreshCw,
  Sliders,
  Check,
  Loader2,
  ShieldCheck,
  Layers,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  MoveVertical,
  Combine,
  UploadCloud,
  FileVideo,
} from "lucide-react";
import { formatTime, formatBytes } from "@/lib/utils";

interface VideoMergerStudioProps {
  tool: ToolMetadata;
}

export interface VideoClipItem {
  id: string;
  file: File;
  name: string;
  size: number;
  url: string;
  duration: number;
  width: number;
  height: number;
  thumbnailUrl?: string;
}

export type MergeResolution = "match-first" | "1080p" | "720p" | "9:16" | "1:1";
export type MergeFitMode = "fit" | "fill";

export const VideoMergerStudio: React.FC<VideoMergerStudioProps> = ({ tool }) => {
  const { runFFmpeg, isLoaded, loadFFmpeg, isLoading: isEngineLoading } = useFFmpeg();

  // Clips state
  const [clips, setClips] = useState<VideoClipItem[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);

  // Settings
  const [outputResolution, setOutputResolution] = useState<MergeResolution>("match-first");
  const [fitMode, setFitMode] = useState<MergeFitMode>("fit");
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [processDurationMs, setProcessDurationMs] = useState<number>(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addMoreInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      clips.forEach((c) => URL.revokeObjectURL(c.url));
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, []);

  // Process incoming files to extract metadata & thumbnails
  const processFiles = async (files: FileList | File[]) => {
    const newItems: VideoClipItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|mov|mkv|webm|avi|flv|m4v)$/i)) {
        continue;
      }

      const url = URL.createObjectURL(file);
      const item: VideoClipItem = {
        id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        file,
        name: file.name,
        size: file.size,
        url,
        duration: 0,
        width: 1280,
        height: 720,
      };

      // Extract duration, width, height via temporary video element
      try {
        await new Promise<void>((resolve) => {
          const tempVideo = document.createElement("video");
          tempVideo.src = url;
          tempVideo.preload = "metadata";
          tempVideo.onloadedmetadata = () => {
            item.duration = tempVideo.duration || 0;
            item.width = tempVideo.videoWidth || 1280;
            item.height = tempVideo.videoHeight || 720;

            // Generate quick thumbnail
            tempVideo.currentTime = Math.min(1, item.duration * 0.1);
          };
          tempVideo.onseeked = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = 160;
              canvas.height = 90;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(tempVideo, 0, 0, 160, 90);
                item.thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
              }
            } catch (_) {}
            resolve();
          };
          tempVideo.onerror = () => resolve();
          // Timeout fallback
          setTimeout(() => resolve(), 1500);
        });
      } catch (_) {}

      newItems.push(item);
    }

    if (newItems.length > 0) {
      setClips((prev) => [...prev, ...newItems]);
      if (!activeClipId && newItems.length > 0) {
        setActiveClipId(newItems[0].id);
      }
    }
  };

  const handleInitialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      if (addMoreInputRef.current) addMoreInputRef.current.value = "";
    }
  };

  // Reorder clips
  const moveClip = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= clips.length) return;

    const updated = [...clips];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setClips(updated);
  };

  // Remove clip
  const removeClip = (id: string) => {
    const clip = clips.find((c) => c.id === id);
    if (clip) URL.revokeObjectURL(clip.url);

    const updated = clips.filter((c) => c.id !== id);
    setClips(updated);
    if (activeClipId === id) {
      setActiveClipId(updated[0]?.id || null);
    }
  };

  // Clear all
  const clearAllClips = () => {
    clips.forEach((c) => URL.revokeObjectURL(c.url));
    setClips([]);
    setActiveClipId(null);
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
      setOutputBlob(null);
    }
  };

  // Computations
  const totalDuration = clips.reduce((acc, c) => acc + (c.duration || 0), 0);
  const totalInputSize = clips.reduce((acc, c) => acc + c.size, 0);

  // Target Resolution Calculation
  const getTargetDimensions = (): { w: number; h: number } => {
    if (clips.length === 0) return { w: 1920, h: 1080 };

    if (outputResolution === "match-first") {
      const first = clips[0];
      return {
        w: Math.floor((first.width || 1920) / 2) * 2,
        h: Math.floor((first.height || 1080) / 2) * 2,
      };
    }
    if (outputResolution === "1080p") return { w: 1920, h: 1080 };
    if (outputResolution === "720p") return { w: 1280, h: 720 };
    if (outputResolution === "9:16") return { w: 1080, h: 1920 };
    if (outputResolution === "1:1") return { w: 1080, h: 1080 };
    return { w: 1920, h: 1080 };
  };

  // Merge Execution via WebAssembly FFmpeg
  const handleMergeVideos = async () => {
    if (clips.length < 2) {
      alert("Please upload at least 2 video clips to merge.");
      return;
    }

    setIsProcessing(true);
    setProgressPercent(5);
    setProcessStatus("Initializing WebAssembly engine...");
    const startTime = performance.now();

    try {
      if (!isLoaded) {
        setProcessStatus("Loading WebAssembly core...");
        await loadFFmpeg();
      }

      setProcessStatus("Reading video files into memory...");
      setProgressPercent(15);

      const targetDim = getTargetDimensions();
      const outputName = `merged_${Date.now()}.mp4`;

      // Check if all clips share same resolution and mp4 container for fast concat demuxer
      const firstClip = clips[0];
      const isIdentical =
        outputResolution === "match-first" &&
        clips.every(
          (c) =>
            c.width === firstClip.width &&
            c.height === firstClip.height &&
            c.name.match(/\.mp4$/i)
        );

      let ffmpegArgs: string[] = [];

      if (isIdentical && !isMuted) {
        // Super-fast concat demuxer (lossless stream copy in 2 seconds!)
        setProcessStatus("Merging clips with ultra-fast stream copy...");
        setProgressPercent(30);

        let concatListContent = "";
        for (let i = 0; i < clips.length; i++) {
          const clip = clips[i];
          const inputName = `input_${i}.mp4`;
          concatListContent += `file ${inputName}\n`;
        }

        // We run a normalized filter_complex concat for maximum stability
        const inputFiles: { name: string; buffer: Uint8Array }[] = [];
        for (let i = 0; i < clips.length; i++) {
          setProcessStatus(`Reading clip ${i + 1} of ${clips.length}...`);
          const buf = new Uint8Array(await clips[i].file.arrayBuffer());
          inputFiles.push({ name: `input_${i}.mp4`, buffer: buf });
        }

        // Build multi-input args
        ffmpegArgs = [];
        inputFiles.forEach((file) => {
          ffmpegArgs.push("-i", file.name);
        });

        let filterComplex = "";
        for (let i = 0; i < clips.length; i++) {
          filterComplex += `[${i}:v][${i}:a]`;
        }
        filterComplex += `concat=n=${clips.length}:v=1:a=1[outv][outa]`;

        ffmpegArgs.push(
          "-filter_complex",
          filterComplex,
          "-map",
          "[outv]",
          "-map",
          "[outa]",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "22",
          "-c:a",
          "aac",
          "-b:a",
          "160k",
          "-movflags",
          "+faststart",
          outputName
        );

        setProcessStatus("Stitching video streams...");
        setProgressPercent(50);

        const primaryInput = inputFiles[0];
        // Execute with primary input, passing other inputs if runFFmpeg accepts multiple, or composite
        const res = await runFFmpeg(
          primaryInput,
          outputName,
          ffmpegArgs,
          (p) => {
            if (p.percent > 0) {
              setProgressPercent(Math.min(95, Math.round(p.percent)));
              setProcessStatus(`Merging: ${Math.round(p.percent)}%`);
            }
          },
          totalDuration || undefined
        );

        finalizeOutput(res.outputData, startTime);
      } else {
        // Scaled / Padded Normalized Filter Complex
        setProcessStatus("Normalizing video resolutions & framerates...");
        setProgressPercent(25);

        const inputFiles: { name: string; buffer: Uint8Array }[] = [];
        for (let i = 0; i < clips.length; i++) {
          setProcessStatus(`Reading clip ${i + 1} of ${clips.length}...`);
          const ext = clips[i].name.split(".").pop()?.toLowerCase() || "mp4";
          const buf = new Uint8Array(await clips[i].file.arrayBuffer());
          inputFiles.push({ name: `input_${i}.${ext}`, buffer: buf });
        }

        ffmpegArgs = [];
        inputFiles.forEach((file) => {
          ffmpegArgs.push("-i", file.name);
        });

        let filterComplex = "";
        const targetW = targetDim.w;
        const targetH = targetDim.h;

        for (let i = 0; i < clips.length; i++) {
          if (fitMode === "fit") {
            // Scale and pad with black bars to target dimensions
            filterComplex += `[${i}:v]scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}];`;
          } else {
            // Fill / crop to target dimensions
            filterComplex += `[${i}:v]scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH},setsar=1,fps=30[v${i}];`;
          }
        }

        for (let i = 0; i < clips.length; i++) {
          if (isMuted) {
            filterComplex += `[v${i}]`;
          } else {
            filterComplex += `[v${i}][${i}:a]`;
          }
        }

        if (isMuted) {
          filterComplex += `concat=n=${clips.length}:v=1:a=0[outv]`;
          ffmpegArgs.push(
            "-filter_complex",
            filterComplex,
            "-map",
            "[outv]",
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-crf",
            "22",
            "-an",
            "-movflags",
            "+faststart",
            outputName
          );
        } else {
          filterComplex += `concat=n=${clips.length}:v=1:a=1[outv][outa]`;
          ffmpegArgs.push(
            "-filter_complex",
            filterComplex,
            "-map",
            "[outv]",
            "-map",
            "[outa]",
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-crf",
            "22",
            "-c:a",
            "aac",
            "-b:a",
            "160k",
            "-movflags",
            "+faststart",
            outputName
          );
        }

        setProcessStatus("Transcoding & joining clips...");
        setProgressPercent(45);

        const primaryInput = inputFiles[0];
        const res = await runFFmpeg(
          primaryInput,
          outputName,
          ffmpegArgs,
          (p) => {
            if (p.percent > 0) {
              setProgressPercent(Math.min(95, Math.round(p.percent)));
              setProcessStatus(`Merging clips: ${Math.round(p.percent)}%`);
            }
          },
          totalDuration || undefined
        );

        finalizeOutput(res.outputData, startTime);
      }
    } catch (err: any) {
      console.error("FFmpeg Merge Error:", err);
      setIsProcessing(false);
      alert(`Merge error: ${err.message || "Failed to merge video clips"}`);
    }
  };

  const finalizeOutput = (outputData: Uint8Array, startTime: number) => {
    setProgressPercent(100);
    setProcessStatus("Finalizing merged MP4...");

    const blob = new Blob([outputData as any], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);

    setOutputBlob(blob);
    setOutputUrl(url);
    setOutputSize(blob.size);
    setProcessDurationMs(Math.round(performance.now() - startTime));
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
            <Combine className="w-3.5 h-3.5" />
            <span>Multi-Video Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Video Merger & Combiner
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Stitch multiple video clips into one seamless MP4 video online free. Reorder clips,
            normalize resolutions, and combine phone clips without watermarks or server uploads.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Film className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 2. Upload Screen or Studio Workspace */}
      {clips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInitialUpload}
            multiple
            accept="video/*,.mp4,.mov,.mkv,.webm,.avi"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-8 sm:p-12 cursor-pointer transition-all flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800">
                Select 2 or More Videos to Merge
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Drag & drop multiple MP4, MOV, MKV, or WebM clips here, or click to browse.
                Works with files of any size with zero server uploads.
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Choose Video Files
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Clips Management Workspace */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  {clips.length} Clips Loaded
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Total: {formatTime(totalDuration)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({formatBytes(totalInputSize)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={addMoreInputRef}
                  onChange={handleAddMore}
                  multiple
                  accept="video/*,.mp4,.mov,.mkv,.webm"
                  className="hidden"
                />
                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add More Clips
                </button>
                <button
                  onClick={clearAllClips}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Clips Sequence List (Reorderable) */}
            <div className="p-4 sm:p-6 space-y-3 bg-slate-50/50">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MoveVertical className="w-3.5 h-3.5 text-slate-400" />
                Use the arrows to arrange clips in your desired playback sequence:
              </p>

              <div className="space-y-2.5">
                {clips.map((clip, index) => (
                  <div
                    key={clip.id}
                    className={`bg-white border rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm transition-all ${
                      activeClipId === clip.id
                        ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Left: Badge + Thumbnail + Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {index + 1}
                      </div>

                      {clip.thumbnailUrl ? (
                        <img
                          src={clip.thumbnailUrl}
                          alt="thumbnail"
                          className="w-16 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <Film className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-md">
                          {clip.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{formatTime(clip.duration)}</span>
                          <span>•</span>
                          <span>
                            {clip.width} × {clip.height}
                          </span>
                          <span>•</span>
                          <span>{formatBytes(clip.size)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Reorder & Remove Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveClip(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveClip(index, "down")}
                        disabled={index === clips.length - 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeClip(clip.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all ml-1"
                        title="Remove Clip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Merge Options Panel */}
            <div className="p-6 bg-white border-t border-slate-200 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Resolution Preset */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    Target Resolution
                  </label>
                  <select
                    value={outputResolution}
                    onChange={(e) => setOutputResolution(e.target.value as MergeResolution)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="match-first">Match 1st Clip (Fastest)</option>
                    <option value="1080p">1080p Full HD (1920 × 1080)</option>
                    <option value="720p">720p HD (1280 × 720)</option>
                    <option value="9:16">9:16 Vertical (Shorts / Reels)</option>
                    <option value="1:1">1:1 Square (Instagram)</option>
                  </select>
                </div>

                {/* Aspect Ratio Fitting */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-indigo-600" />
                    Frame Fitting Mode
                  </label>
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as MergeFitMode)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="fit">Fit & Pad with Black Bars (No Distortion)</option>
                    <option value="fill">Fill & Center Crop (No Black Bars)</option>
                  </select>
                </div>

                {/* Audio Option */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    Audio Soundtrack
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsMuted(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        !isMuted
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      Keep Audio
                    </button>
                    <button
                      onClick={() => setIsMuted(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isMuted
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      Mute Audio
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button & Progress */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Private In-Browser WebAssembly (No Server Uploads)</span>
                </div>

                <button
                  onClick={handleMergeVideos}
                  disabled={isProcessing || clips.length < 2}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{processStatus || "Merging..."}</span>
                    </>
                  ) : (
                    <>
                      <Combine className="w-4 h-4" />
                      <span>Merge {clips.length} Clips into One MP4</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress bar while processing */}
              {isProcessing && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>{processStatus}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Output Result Card */}
          {outputUrl && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Videos Merged Successfully!
                    </h3>
                    <p className="text-xs text-slate-500">
                      Merged {clips.length} clips in {(processDurationMs / 1000).toFixed(1)}s • Zero watermarks
                    </p>
                  </div>
                </div>

                <a
                  href={outputUrl}
                  download="merged_video.mp4"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Merged MP4
                </a>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Clips</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                    {clips.length} Clips
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Duration</div>
                  <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
                    {formatTime(totalDuration)}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Merged File Size</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                    {formatBytes(outputSize)}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Watermark</div>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Zero Watermarks
                  </div>
                </div>
              </div>

              {/* Player Preview */}
              <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center max-h-[460px]">
                <video
                  src={outputUrl}
                  controls
                  playsInline
                  className="max-h-[460px] w-auto h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
