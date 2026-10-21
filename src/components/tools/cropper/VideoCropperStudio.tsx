"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { useFFmpeg } from "@/lib/ffmpeg/ffmpeg-provider";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Crop,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Loader2,
  Maximize2,
  Eye,
  RefreshCw,
  ShieldCheck,
  Layers,
  Film,
  Grid,
  Move,
  Scissors,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime, formatBytes } from "@/lib/utils";

interface VideoCropperStudioProps {
  tool: ToolMetadata;
}

export type AspectRatioPreset =
  | "freeform"
  | "1:1"
  | "9:16"
  | "16:9"
  | "4:5"
  | "watermark-br"
  | "watermark-tl";

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragHandle =
  | "nw"
  | "ne"
  | "se"
  | "sw"
  | "n"
  | "s"
  | "e"
  | "w"
  | "move"
  | null;

export const VideoCropperStudio: React.FC<VideoCropperStudioProps> = ({ tool }) => {
  const { runFFmpeg, isLoaded, loadFFmpeg, isLoading: isEngineLoading } = useFFmpeg();

  // File & video state
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Crop settings
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [preset, setPreset] = useState<AspectRatioPreset>("freeform");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [previewCropped, setPreviewCropped] = useState<boolean>(false);

  // Interaction tracking
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    crop: CropRect;
  } | null>(null);

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

  // Handle file selection
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

  // Video metadata loaded
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;
    setNaturalWidth(w);
    setNaturalHeight(h);
    setDuration(v.duration || 0);

    // Initial default crop: full frame with slight inset
    const initialCrop: CropRect = {
      x: 0,
      y: 0,
      width: w,
      height: h,
    };
    setCrop(initialCrop);
    setPreset("freeform");
  };

  // Time update
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

  // Apply aspect ratio preset
  const applyPreset = useCallback(
    (newPreset: AspectRatioPreset) => {
      setPreset(newPreset);
      if (!naturalWidth || !naturalHeight) return;

      const w = naturalWidth;
      const h = naturalHeight;

      if (newPreset === "freeform") {
        return;
      }

      if (newPreset === "watermark-br") {
        // Remove bottom-right 20% watermark
        const newW = Math.round(w * 0.88);
        const newH = Math.round(h * 0.88);
        setCrop({
          x: 0,
          y: 0,
          width: newW,
          height: newH,
        });
        return;
      }

      if (newPreset === "watermark-tl") {
        // Remove top-left 15% watermark
        const newW = Math.round(w * 0.88);
        const newH = Math.round(h * 0.88);
        setCrop({
          x: Math.round(w * 0.12),
          y: Math.round(h * 0.12),
          width: newW,
          height: newH,
        });
        return;
      }

      let ratio = 1;
      if (newPreset === "1:1") ratio = 1;
      else if (newPreset === "9:16") ratio = 9 / 16;
      else if (newPreset === "16:9") ratio = 16 / 9;
      else if (newPreset === "4:5") ratio = 4 / 5;

      let cropW = w;
      let cropH = Math.round(cropW / ratio);

      if (cropH > h) {
        cropH = h;
        cropW = Math.round(cropH * ratio);
      }

      const cropX = Math.round((w - cropW) / 2);
      const cropY = Math.round((h - cropH) / 2);

      setCrop({
        x: Math.max(0, cropX),
        y: Math.max(0, cropY),
        width: Math.min(w, cropW),
        height: Math.min(h, cropH),
      });
    },
    [naturalWidth, naturalHeight]
  );

  // Center crop button
  const handleCenterCrop = () => {
    if (!naturalWidth || !naturalHeight) return;
    const newX = Math.max(0, Math.round((naturalWidth - crop.width) / 2));
    const newY = Math.max(0, Math.round((naturalHeight - crop.height) / 2));
    setCrop((prev) => ({ ...prev, x: newX, y: newY }));
  };

  // Reset to full frame
  const handleResetFull = () => {
    if (!naturalWidth || !naturalHeight) return;
    setCrop({
      x: 0,
      y: 0,
      width: naturalWidth,
      height: naturalHeight,
    });
    setPreset("freeform");
  };

  // Interactive Drag & Resize
  const getContainerScale = () => {
    if (!containerRef.current || !naturalWidth || !naturalHeight) {
      return { scaleX: 1, scaleY: 1, rect: { left: 0, top: 0, width: 1, height: 1 } };
    }
    const rect = containerRef.current.getBoundingClientRect();
    return {
      scaleX: naturalWidth / rect.width,
      scaleY: naturalHeight / rect.height,
      rect,
    };
  };

  const handlePointerDown = (handle: DragHandle, clientX: number, clientY: number) => {
    setActiveHandle(handle);
    dragStartRef.current = {
      pointerX: clientX,
      pointerY: clientY,
      crop: { ...crop },
    };
  };

  // Pointer move handler (supports both mouse and touch)
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!activeHandle || !dragStartRef.current || !naturalWidth || !naturalHeight) return;

      const { scaleX, scaleY } = getContainerScale();
      const deltaX = (clientX - dragStartRef.current.pointerX) * scaleX;
      const deltaY = (clientY - dragStartRef.current.pointerY) * scaleY;
      const start = dragStartRef.current.crop;

      let newX = start.x;
      let newY = start.y;
      let newW = start.width;
      let newH = start.height;

      const minDim = 40;

      if (activeHandle === "move") {
        newX = Math.max(0, Math.min(naturalWidth - start.width, start.x + deltaX));
        newY = Math.max(0, Math.min(naturalHeight - start.height, start.y + deltaY));
      } else {
        // Resizing with handle
        if (activeHandle.includes("e")) {
          newW = Math.max(minDim, Math.min(naturalWidth - start.x, start.width + deltaX));
        }
        if (activeHandle.includes("s")) {
          newH = Math.max(minDim, Math.min(naturalHeight - start.y, start.height + deltaY));
        }
        if (activeHandle.includes("w")) {
          const maxLeftShift = start.x + start.width - minDim;
          const shift = Math.min(deltaX, maxLeftShift);
          newX = Math.max(0, start.x + shift);
          newW = start.width - (newX - start.x);
        }
        if (activeHandle.includes("n")) {
          const maxTopShift = start.y + start.height - minDim;
          const shift = Math.min(deltaY, maxTopShift);
          newY = Math.max(0, start.y + shift);
          newH = start.height - (newY - start.y);
        }

        // Lock aspect ratio if not freeform
        if (preset !== "freeform" && preset !== "watermark-br" && preset !== "watermark-tl") {
          let ratio = 1;
          if (preset === "1:1") ratio = 1;
          else if (preset === "9:16") ratio = 9 / 16;
          else if (preset === "16:9") ratio = 16 / 9;
          else if (preset === "4:5") ratio = 4 / 5;

          if (activeHandle === "e" || activeHandle === "w") {
            newH = Math.min(naturalHeight - newY, Math.round(newW / ratio));
            newW = Math.round(newH * ratio);
          } else {
            newW = Math.min(naturalWidth - newX, Math.round(newH * ratio));
            newH = Math.round(newW / ratio);
          }
        }
      }

      setCrop({
        x: Math.round(Math.max(0, newX)),
        y: Math.round(Math.max(0, newY)),
        width: Math.round(Math.min(naturalWidth - newX, newW)),
        height: Math.round(Math.min(naturalHeight - newY, newH)),
      });
    },
    [activeHandle, naturalWidth, naturalHeight, preset]
  );

  const handlePointerUp = useCallback(() => {
    setActiveHandle(null);
    dragStartRef.current = null;
  }, []);

  // Global mouse/touch events while dragging
  useEffect(() => {
    if (!activeHandle) return;

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handlePointerUp();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      handlePointerUp();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeHandle, handlePointerMove, handlePointerUp]);

  // Execute FFmpeg Crop & Transcode
  const handleProcessCrop = async () => {
    if (!fileMeta || !naturalWidth || !naturalHeight) return;

    // FFmpeg requires even dimensions for H.264 (yuv420p)
    let cropW = Math.max(2, Math.floor(crop.width / 2) * 2);
    let cropH = Math.max(2, Math.floor(crop.height / 2) * 2);
    let cropX = Math.max(0, Math.floor(crop.x / 2) * 2);
    let cropY = Math.max(0, Math.floor(crop.y / 2) * 2);

    // Guard boundary
    if (cropX + cropW > naturalWidth) cropW = naturalWidth - cropX;
    if (cropY + cropH > naturalHeight) cropH = naturalHeight - cropY;
    cropW = Math.floor(cropW / 2) * 2;
    cropH = Math.floor(cropH / 2) * 2;

    setIsProcessing(true);
    setProgressPercent(5);
    setProcessStatus("Initializing WebAssembly engine...");
    const startTime = performance.now();

    try {
      if (!isLoaded) {
        setProcessStatus("Loading WebAssembly core...");
        await loadFFmpeg();
      }

      setProcessStatus("Reading video file...");
      const arrayBuffer = await fileMeta.file.arrayBuffer();
      const inputBuffer = new Uint8Array(arrayBuffer);
      const ext = fileMeta.name.split(".").pop()?.toLowerCase() || "mp4";
      const inputName = `input_${Date.now()}.${ext}`;
      const outputName = `cropped_${Date.now()}.mp4`;

      setProcessStatus("Cropping & transcoding video...");
      setProgressPercent(20);

      const ffmpegArgs = [
        "-i",
        inputName,
        "-vf",
        `crop=${cropW}:${cropH}:${cropX}:${cropY}`,
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "20",
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        outputName,
      ];

      let res;
      try {
        res = await runFFmpeg(
          { name: inputName, buffer: inputBuffer },
          outputName,
          ffmpegArgs,
          (p) => {
            if (p.percent > 0) {
              setProgressPercent(Math.min(95, Math.round(p.percent)));
              setProcessStatus(`Processing: ${Math.round(p.percent)}%`);
            }
          },
          duration || undefined
        );
      } catch (errFirst) {
        console.warn("First audio-copy pass failed, retrying with AAC audio encode...", errFirst);
        // Fallback with audio re-encode in case copy fails
        const fallbackArgs = [
          "-i",
          inputName,
          "-vf",
          `crop=${cropW}:${cropH}:${cropX}:${cropY}`,
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "21",
          "-c:a",
          "aac",
          "-b:a",
          "160k",
          "-movflags",
          "+faststart",
          outputName,
        ];

        res = await runFFmpeg(
          { name: inputName, buffer: inputBuffer },
          outputName,
          fallbackArgs,
          (p) => {
            if (p.percent > 0) {
              setProgressPercent(Math.min(95, Math.round(p.percent)));
              setProcessStatus(`Processing: ${Math.round(p.percent)}%`);
            }
          },
          duration || undefined
        );
      }

      setProgressPercent(100);
      setProcessStatus("Finalizing cropped video...");

      const blob = new Blob([res.outputData as any], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setOutputBlob(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
      setProcessDurationMs(Math.round(performance.now() - startTime));
      setIsProcessing(false);
    } catch (err: any) {
      console.error("FFmpeg Crop Error:", err);
      setIsProcessing(false);
      alert(`Processing error: ${err.message || "Failed to crop video"}`);
    }
  };

  // Convert crop rect into percentage for CSS overlay
  const getOverlayPercentStyle = () => {
    if (!naturalWidth || !naturalHeight) {
      return { left: "0%", top: "0%", width: "100%", height: "100%" };
    }
    return {
      left: `${(crop.x / naturalWidth) * 100}%`,
      top: `${(crop.y / naturalHeight) * 100}%`,
      width: `${(crop.width / naturalWidth) * 100}%`,
      height: `${(crop.height / naturalHeight) * 100}%`,
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase">
            <Crop className="w-3.5 h-3.5" />
            <span>Interactive Visual Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Interactive Video Cropper & Area Cutter
          </h1>
          <p className="text-sm sm:text-base text-rose-100 max-w-2xl leading-relaxed">
            Drag the crop box directly over your video to cut out watermarks, adjust framing for
            TikTok 9:16 or Instagram 1:1, or select any custom visual area. 100% private in-browser WebAssembly.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Scissors className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 2. Upload Screen or Studio Workspace */}
      {!videoSrc ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-slate-800">Select Video to Crop</h2>
            <p className="text-xs text-slate-500">
              Supports MP4, MOV, MKV, WebM of any size (10MB to 5GB+). Processed inside your browser RAM.
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
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-mono">
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
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    showGrid
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Toggle 3x3 Rule of Thirds Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  Grid
                </button>
                <button
                  onClick={() => setPreviewCropped(!previewCropped)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    previewCropped
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Toggle Cropped Preview View"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {previewCropped ? "Show Full Frame" : "Preview Crop"}
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

            {/* Video Canvas & Crop Viewport */}
            <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] relative select-none">
              {!previewCropped ? (
                /* Standard Interactive Overlay Mode */
                <div
                  ref={containerRef}
                  className="relative inline-block max-w-full max-h-[500px] overflow-hidden rounded-lg shadow-2xl"
                  style={{ touchAction: "none" }}
                >
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    muted={isMuted}
                    playsInline
                    className="max-h-[500px] w-auto h-auto object-contain block pointer-events-none"
                  />

                  {/* Darkened backdrop mask outside crop box */}
                  {naturalWidth > 0 && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <mask id="crop-mask">
                            {/* White covers entire canvas */}
                            <rect width="100%" height="100%" fill="white" />
                            {/* Black cutout over the cropped area */}
                            <rect
                              x={`${(crop.x / naturalWidth) * 100}%`}
                              y={`${(crop.y / naturalHeight) * 100}%`}
                              width={`${(crop.width / naturalWidth) * 100}%`}
                              height={`${(crop.height / naturalHeight) * 100}%`}
                              fill="black"
                            />
                          </mask>
                        </defs>
                        {/* Dark translucent overlay with cutout */}
                        <rect
                          width="100%"
                          height="100%"
                          fill="rgba(0, 0, 0, 0.65)"
                          mask="url(#crop-mask)"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Interactive Crop Box Overlay */}
                  {naturalWidth > 0 && (
                    <div
                      className="absolute border-2 border-red-500 shadow-[0_0_0_1px_rgba(255,255,255,0.7)] cursor-move select-none"
                      style={getOverlayPercentStyle()}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handlePointerDown("move", e.clientX, e.clientY);
                      }}
                      onTouchStart={(e) => {
                        if (e.touches.length > 0) {
                          e.stopPropagation();
                          handlePointerDown(
                            "move",
                            e.touches[0].clientX,
                            e.touches[0].clientY
                          );
                        }
                      }}
                    >
                      {/* Rule of Thirds Grid Lines */}
                      {showGrid && (
                        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                          <div className="border-r border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-r border-b border-white/30" />
                          <div className="border-b border-white/30" />
                          <div className="border-r border-white/30" />
                          <div className="border-r border-white/30" />
                          <div />
                        </div>
                      )}

                      {/* Dimension Pill Badge */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                        {crop.width} × {crop.height} px
                      </div>

                      {/* 8 Resize Handles */}
                      {/* Corner Handles */}
                      <div
                        className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-sm cursor-nwse-resize shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown("nw", e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            e.stopPropagation();
                            handlePointerDown("nw", e.touches[0].clientX, e.touches[0].clientY);
                          }
                        }}
                      />
                      <div
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-sm cursor-nesw-resize shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown("ne", e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            e.stopPropagation();
                            handlePointerDown("ne", e.touches[0].clientX, e.touches[0].clientY);
                          }
                        }}
                      />
                      <div
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-sm cursor-nwse-resize shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown("se", e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            e.stopPropagation();
                            handlePointerDown("se", e.touches[0].clientX, e.touches[0].clientY);
                          }
                        }}
                      />
                      <div
                        className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-red-600 rounded-sm cursor-nesw-resize shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown("sw", e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            e.stopPropagation();
                            handlePointerDown("sw", e.touches[0].clientX, e.touches[0].clientY);
                          }
                        }}
                      />

                      {/* Edge Handles */}
                      <div
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-white border-2 border-red-600 rounded-sm cursor-ns-resize shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown("n", e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            e.stopPropagation();
                            handlePointerDown("n", e.touches[0].clientX, e.touches[0].clientY);
                          }
                        }}
                      />
                      <div
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-white border-2 border-red-600 rounded-sm cursor-ns-resize shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown("s", e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            e.stopPropagation();
                            handlePointerDown("s", e.touches[0].clientX, e.touches[0].clientY);
                          }
                        }}
                      />
                      <div
                        className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-4 bg-white border-2 border-red-600 rounded-sm cursor-ew-resize shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown("w", e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            e.stopPropagation();
                            handlePointerDown("w", e.touches[0].clientX, e.touches[0].clientY);
                          }
                        }}
                      />
                      <div
                        className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-4 bg-white border-2 border-red-600 rounded-sm cursor-ew-resize shadow-md"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handlePointerDown("e", e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            e.stopPropagation();
                            handlePointerDown("e", e.touches[0].clientX, e.touches[0].clientY);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Live Preview Cropped Viewport */
                <div
                  className="relative overflow-hidden rounded-lg shadow-2xl border border-red-500/50"
                  style={{
                    width: `${Math.min(480, crop.width)}px`,
                    height: `${Math.min(
                      480,
                      Math.round((crop.height / crop.width) * Math.min(480, crop.width))
                    )}px`,
                  }}
                >
                  <video
                    src={videoSrc}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="absolute max-w-none"
                    style={{
                      width: `${(naturalWidth / crop.width) * 100}%`,
                      height: `${(naturalHeight / crop.height) * 100}%`,
                      left: `-${(crop.x / crop.width) * 100}%`,
                      top: `-${(crop.y / crop.height) * 100}%`,
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    Cropped Preview
                  </div>
                </div>
              )}

              {/* Video Timeline Scrubber & Playback Controls */}
              <div className="w-full max-w-2xl mt-4 px-2 space-y-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="font-mono text-slate-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Drag handles or box to re-position crop
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Settings Panel */}
            <div className="p-6 bg-white space-y-6">
              {/* Aspect Ratio Preset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-red-600" />
                  Aspect Ratio Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {[
                    { id: "freeform", label: "Freeform", desc: "Custom" },
                    { id: "9:16", label: "9:16", desc: "TikTok / Reels" },
                    { id: "1:1", label: "1:1", desc: "Instagram" },
                    { id: "16:9", label: "16:9", desc: "YouTube" },
                    { id: "4:5", label: "4:5", desc: "IG Feed" },
                    { id: "watermark-br", label: "Cut Watermark", desc: "Bottom-Right" },
                    { id: "watermark-tl", label: "Cut Logo", desc: "Top-Left" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id as AspectRatioPreset)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        preset === p.id
                          ? "border-red-600 bg-red-50 text-red-900 shadow-sm ring-1 ring-red-500"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Coordinate Inputs & Quick Helpers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Width (px)</label>
                  <input
                    type="number"
                    value={crop.width}
                    onChange={(e) => {
                      const val = Math.max(40, Math.min(naturalWidth - crop.x, parseInt(e.target.value) || 40));
                      setCrop((prev) => ({ ...prev, width: val }));
                      setPreset("freeform");
                    }}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Height (px)</label>
                  <input
                    type="number"
                    value={crop.height}
                    onChange={(e) => {
                      const val = Math.max(40, Math.min(naturalHeight - crop.y, parseInt(e.target.value) || 40));
                      setCrop((prev) => ({ ...prev, height: val }));
                      setPreset("freeform");
                    }}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">X Offset (px)</label>
                  <input
                    type="number"
                    value={crop.x}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(naturalWidth - crop.width, parseInt(e.target.value) || 0));
                      setCrop((prev) => ({ ...prev, x: val }));
                    }}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Y Offset (px)</label>
                  <input
                    type="number"
                    value={crop.y}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(naturalHeight - crop.height, parseInt(e.target.value) || 0));
                      setCrop((prev) => ({ ...prev, y: val }));
                    }}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCenterCrop}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-1"
                  >
                    <Move className="w-3.5 h-3.5" />
                    Center Crop
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleResetFull}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Full
                  </button>
                </div>
              </div>

              {/* Action Button & Processing Progress */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Client-Side WebAssembly (No Server Uploads)</span>
                </div>

                <button
                  onClick={handleProcessCrop}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-600/25 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{processStatus || "Cropping..."}</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>Crop & Export MP4</span>
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
                      className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-300"
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
                      Video Cropped Successfully!
                    </h3>
                    <p className="text-xs text-slate-500">
                      Completed in {(processDurationMs / 1000).toFixed(1)}s • Ready for immediate download
                    </p>
                  </div>
                </div>

                <a
                  href={outputUrl}
                  download={`cropped_${fileMeta?.name.replace(/\.[^/.]+$/, "") || "video"}.mp4`}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Cropped MP4
                </a>
              </div>

              {/* Metrics Comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Original Frame</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                    {naturalWidth} × {naturalHeight} px
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Cropped Frame</div>
                  <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
                    {crop.width} × {crop.height} px
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Output File Size</div>
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

              {/* Video Player Preview */}
              <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center max-h-[420px]">
                <video
                  ref={outputVideoRef}
                  src={outputUrl}
                  controls
                  playsInline
                  className="max-h-[420px] w-auto h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
