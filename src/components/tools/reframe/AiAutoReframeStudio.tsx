"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Smartphone,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Film,
  Check,
  Loader2,
  Scan,
  Maximize2,
  Layers,
  Crop,
  AlertCircle,
  Eye,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface AiAutoReframeStudioProps {
  tool: ToolMetadata;
}

export type TargetRatio = "9:16" | "1:1" | "4:5";
export type FramingMode = "fill" | "blur-fit" | "color-fit";

// Dynamically load Google MediaPipe Selfie Segmentation script with fallback
function loadMediaPipeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if ((window as any).SelfieSegmentation) return resolve();

    const existing = document.getElementById("mediapipe-selfie-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load MediaPipe")));
      return;
    }

    const script = document.createElement("script");
    script.id = "mediapipe-selfie-script";
    script.src = "/mediapipe/selfie_segmentation/selfie_segmentation.js";
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => {
      const fallbackScript = document.createElement("script");
      fallbackScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
      fallbackScript.onload = () => resolve();
      fallbackScript.onerror = () => reject(new Error("Could not load MediaPipe AI model"));
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  });
}

export const AiAutoReframeStudio: React.FC<AiAutoReframeStudioProps> = ({ tool }) => {
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reframe Configuration
  const [targetRatio, setTargetRatio] = useState<TargetRatio>("9:16");
  const [framingMode, setFramingMode] = useState<FramingMode>("fill");
  const [isAiTracking, setIsAiTracking] = useState<boolean>(true);
  const [manualCropX, setManualCropX] = useState<number>(50); // 0% to 100%
  const [smoothSpeed, setSmoothSpeed] = useState<number>(0.12); // Panning damping
  const [bgColor, setBgColor] = useState<string>("#000000");

  // AI Tracking Engine State
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmenterRef = useRef<any>(null);
  const isProcessingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Tracking position memory (smooth interpolation)
  const currentPanXRef = useRef<number>(50); // 0 to 100 percent
  const targetPanXRef = useRef<number>(50);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch (_) {}
      }
      if (segmenterRef.current) {
        try {
          segmenterRef.current.close();
        } catch (_) {}
      }
    };
  }, [videoUrl, exportedVideoUrl]);

  // Compute aspect ratio dimensions
  const getOutputDimensions = useCallback((videoW: number, videoH: number) => {
    let aspect = 9 / 16;
    if (targetRatio === "1:1") aspect = 1;
    if (targetRatio === "4:5") aspect = 4 / 5;

    // Standardize vertical output height to video height (e.g. 1080 or 720)
    const outH = videoH;
    const outW = Math.round(outH * aspect);
    return { outW, outH };
  }, [targetRatio]);

  // Process MediaPipe segmentation results to find subject center
  const handleAiResults = useCallback((results: any) => {
    if (!results.segmentationMask) return;

    // Use a small downsampled canvas to compute center of mass of the detected subject
    const mask = results.segmentationMask;
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 64;
    sampleCanvas.height = 36;
    const sCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!sCtx) return;

    sCtx.drawImage(mask, 0, 0, 64, 36);
    const imgData = sCtx.getImageData(0, 0, 64, 36);
    const data = imgData.data;

    let sumX = 0;
    let count = 0;

    for (let y = 0; y < 36; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = (y * 64 + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 80) {
          sumX += x;
          count++;
        }
      }
    }

    if (count > 20) {
      const avgX = (sumX / count / 64) * 100;
      targetPanXRef.current = Math.max(0, Math.min(100, avgX));
    }
  }, []);

  // Initialize MediaPipe AI Model
  const initMediaPipe = useCallback(async () => {
    try {
      setIsModelLoading(true);
      setModelError(null);

      await loadMediaPipeScript();

      const SelfieClass = (window as any).SelfieSegmentation;
      if (!SelfieClass) {
        throw new Error("Could not initialize MediaPipe runtime");
      }

      if (segmenterRef.current) {
        try {
          segmenterRef.current.close();
        } catch (_) {}
      }

      const segmenter = new SelfieClass({
        locateFile: (file: string) => `/mediapipe/selfie_segmentation/${file}`,
      });

      segmenter.setOptions({
        modelSelection: 1, // Landscape / wide scene
        selfieMode: false,
      });

      segmenter.onResults(handleAiResults);
      await segmenter.initialize();

      segmenterRef.current = segmenter;
      setIsModelReady(true);
      setIsModelLoading(false);
    } catch (err: any) {
      console.warn("MediaPipe Auto-Reframe notice:", err);
      setModelError("AI Face tracking fallback to Smart Center Cropping");
      setIsModelLoading(false);
    }
  }, [handleAiResults]);

  const handleFileSelected = (meta: FileMetadata) => {
    setFileMeta(meta);
    const url = URL.createObjectURL(meta.file);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setExportedVideoUrl(null);
    currentPanXRef.current = 50;
    targetPanXRef.current = 50;
    initMediaPipe();
  };

  const handleClear = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setFileMeta(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setExportedVideoUrl(null);
  };

  // Draw reframed video frame onto canvas
  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const videoW = video.videoWidth || 1280;
    const videoH = video.videoHeight || 720;
    const { outW, outH } = getOutputDimensions(videoW, videoH);

    if (canvas.width !== outW || canvas.height !== outH) {
      canvas.width = outW;
      canvas.height = outH;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Smooth camera panning towards targetPanX
    const desiredX = isAiTracking ? targetPanXRef.current : manualCropX;
    currentPanXRef.current += (desiredX - currentPanXRef.current) * smoothSpeed;
    const panRatio = currentPanXRef.current / 100;

    ctx.save();
    ctx.clearRect(0, 0, outW, outH);

    if (framingMode === "fill") {
      // Dynamic Zoom & Center Crop to fill the full vertical frame
      // Source crop box:
      const srcW = Math.min(videoW, (videoH * outW) / outH);
      const srcH = videoH;
      const maxLeft = videoW - srcW;
      const srcX = Math.max(0, Math.min(maxLeft, panRatio * maxLeft));

      ctx.drawImage(video, srcX, 0, srcW, srcH, 0, 0, outW, outH);
    } else if (framingMode === "blur-fit") {
      // Draw blurred zoomed video to fill top and bottom
      ctx.save();
      ctx.filter = "blur(20px)";
      const scaleBg = Math.max(outW / videoW, outH / videoH) * 1.15;
      const bgW = videoW * scaleBg;
      const bgH = videoH * scaleBg;
      ctx.drawImage(video, (outW - bgW) / 2, (outH - bgH) / 2, bgW, bgH);
      ctx.restore();

      // Dark subtle vignette over blur
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, outW, outH);

      // Draw original video centered without cropping
      const fitScale = Math.min(outW / videoW, outH / videoH);
      const fitW = videoW * fitScale;
      const fitH = videoH * fitScale;
      ctx.drawImage(video, (outW - fitW) / 2, (outH - fitH) / 2, fitW, fitH);
    } else {
      // Color-fit letterbox/pillarbox
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outW, outH);

      const fitScale = Math.min(outW / videoW, outH / videoH);
      const fitW = videoW * fitScale;
      const fitH = videoH * fitScale;
      ctx.drawImage(video, (outW - fitW) / 2, (outH - fitH) / 2, fitW, fitH);
    }

    ctx.restore();
  }, [getOutputDimensions, framingMode, isAiTracking, manualCropX, smoothSpeed, bgColor]);

  // Main playback and frame rendering loop
  useEffect(() => {
    let isCancelled = false;

    const loop = async () => {
      const video = videoRef.current;
      if (isCancelled || !video || video.paused || video.ended) return;

      // Send to AI tracker periodically (every 3 frames)
      if (isAiTracking && segmenterRef.current && !isProcessingRef.current && video.readyState >= 2) {
        isProcessingRef.current = true;
        segmenterRef.current.send({ image: video }).catch(() => {}).finally(() => {
          isProcessingRef.current = false;
        });
      }

      drawFrame();

      if ("requestVideoFrameCallback" in video) {
        (video as any).requestVideoFrameCallback(loop);
      } else {
        animFrameIdRef.current = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      loop();
    } else {
      drawFrame();
    }

    return () => {
      isCancelled = true;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, isAiTracking, drawFrame]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSeeked = () => {
    if (videoRef.current && !isPlaying) {
      if (isAiTracking && segmenterRef.current) {
        segmenterRef.current.send({ image: videoRef.current }).catch(() => {});
      }
      drawFrame();
    }
  };

  // Export 9:16 vertical video
  const handleExport = async () => {
    if (!videoRef.current || !canvasRef.current || !fileMeta) return;

    setIsExporting(true);
    setExportProgress(0);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    video.pause();
    setIsPlaying(false);
    video.currentTime = 0;

    await new Promise((r) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        r(true);
      };
      video.addEventListener("seeked", onSeeked);
      setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        r(true);
      }, 500);
    });

    const stream = canvas.captureStream(30);

    // Audio stream capture
    try {
      if ((video as any).captureStream) {
        const vStream = (video as any).captureStream();
        const aTracks = vStream.getAudioTracks();
        if (aTracks.length > 0) {
          stream.addTrack(aTracks[0]);
        }
      }
    } catch (_) {}

    if (stream.getAudioTracks().length === 0) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioCtxClass();
          }
          const actx = audioContextRef.current;
          if (actx.state === "suspended") {
            await actx.resume();
          }
          if (!mediaSourceNodeRef.current) {
            mediaSourceNodeRef.current = actx.createMediaElementSource(video);
          }
          const dest = actx.createMediaStreamDestination();
          mediaSourceNodeRef.current.disconnect();
          mediaSourceNodeRef.current.connect(dest);
          mediaSourceNodeRef.current.connect(actx.destination);
          if (dest.stream.getAudioTracks().length > 0) {
            stream.addTrack(dest.stream.getAudioTracks()[0]);
          }
        }
      } catch (e) {
        console.warn("Audio capture notice:", e);
      }
    }

    let mimeType = "video/webm;codecs=vp9";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : "video/webm";
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6_500_000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const outputBlob = new Blob(chunks, { type: mimeType });
      const outUrl = URL.createObjectURL(outputBlob);
      setExportedVideoUrl(outUrl);
      setIsExporting(false);
      setExportProgress(100);
      video.currentTime = 0;
    };

    recorder.start(100);
    try {
      await video.play();
      setIsPlaying(true);
    } catch (_) {
      video.muted = true;
      await video.play();
      setIsPlaying(true);
    }

    const exportTimer = setInterval(() => {
      if (video.ended || video.currentTime >= video.duration - 0.05) {
        clearInterval(exportTimer);
        if (recorder.state === "recording") {
          recorder.stop();
        }
        video.pause();
        setIsPlaying(false);
      } else {
        setExportProgress(Math.min(99, Math.round((video.currentTime / video.duration) * 100)));
      }
    }, 100);
  };

  return (
    <div className="space-y-8">
      {!videoUrl ? (
        <FileDropzone
          acceptedTypes={["video/*"]}
          acceptedExtensions={[".mp4", ".mov", ".webm", ".mkv", ".avi"]}
          onFileSelected={handleFileSelected}
          selectedFile={fileMeta}
          onClear={handleClear}
          title="Upload 16:9 video to auto-reframe for TikTok, Shorts & Reels"
          subtitle="AI speaker tracking keeps the subject centered automatically with zero keyframing"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Phone Mockup Vertical Preview */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-[40px] overflow-hidden bg-slate-950 border-[6px] border-slate-900 shadow-2xl flex items-center justify-center select-none group">
              {/* Hidden Video Source */}
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onSeeked={handleSeeked}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
                playsInline
              />

              {/* Vertical Reframe Canvas */}
              <canvas ref={canvasRef} className="w-full h-full object-contain" />

              {/* Top Status Pill */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 shadow-md">
                  {isAiTracking ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      <span className="text-emerald-300">AI Speaker Tracking</span>
                    </>
                  ) : (
                    <>
                      <Crop className="h-3.5 w-3.5 text-amber-400" />
                      <span>Manual Crop</span>
                    </>
                  )}
                </span>
              </div>

              {/* Aspect Ratio Badge */}
              <div className="absolute top-4 right-4 z-20">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/75 backdrop-blur-md text-white border border-white/10">
                  {targetRatio}
                </span>
              </div>

              {/* Bottom Scrub Controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent p-5 opacity-90 group-hover:opacity-100 transition-opacity flex flex-col gap-2.5 z-20">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.05}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full accent-red-600 h-1.5 rounded-lg cursor-pointer bg-slate-700/80"
                />

                <div className="flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors shadow-sm"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleSeek(0)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <span className="font-mono text-slate-300 font-medium">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <button
                    onClick={handleClear}
                    className="text-xs text-slate-400 hover:text-red-400 px-2 py-1"
                  >
                    Change Video
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Export Button under Phone Preview */}
            <div className="w-full max-w-[360px] space-y-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20 transition-all disabled:opacity-50 active:scale-98"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rendering Vertical Video ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" />
                    <span>Export {targetRatio} Shorts Video</span>
                  </>
                )}
              </button>

              {exportedVideoUrl && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-semibold">✓ Ready to download!</span>
                  <a
                    href={exportedVideoUrl}
                    download={`vertical-reframe-${targetRatio.replace(":", "x")}.webm`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Video
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Reframe Controls & Settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scan className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Auto-Reframe Studio</h3>
                </div>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  AI Smart Crop
                </span>
              </div>

              {/* Target Aspect Ratio */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Target Platform Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "9:16", name: "9:16 Shorts", sub: "TikTok, Reels, Shorts" },
                    { id: "1:1", name: "1:1 Square", sub: "Instagram / Feed" },
                    { id: "4:5", name: "4:5 Portrait", sub: "FB & IG Feed" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setTargetRatio(r.id as TargetRatio)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        targetRatio === r.id
                          ? "border-red-600 bg-red-50/60 ring-2 ring-red-500/20 text-red-700 font-bold"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{r.name}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Framing Style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Framing & Background Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "fill", name: "Dynamic Fill", desc: "Full Screen Crop" },
                    { id: "blur-fit", name: "Bokeh Blur Fit", desc: "Blurred Backing" },
                    { id: "color-fit", name: "Letterbox", desc: "Pillarbox Color" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setFramingMode(m.id as FramingMode)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        framingMode === m.id
                          ? "border-red-600 bg-red-50/60 ring-2 ring-red-500/20 text-red-700 font-bold"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{m.name}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI vs Manual Tracking Mode */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-bold text-slate-900">AI Active Speaker Tracking</span>
                  </div>
                  <button
                    onClick={() => setIsAiTracking(!isAiTracking)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      isAiTracking ? "bg-red-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isAiTracking ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Automatically detects the speaker using MediaPipe Neural Network and smoothly keeps them centered in the vertical frame.
                </p>

                {/* Manual Pan Slider (when AI is off or for offset) */}
                {!isAiTracking && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Manual Crop Pan Position</span>
                      <span className="font-mono text-red-600">{manualCropX}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={manualCropX}
                      onChange={(e) => setManualCropX(Number(e.target.value))}
                      className="w-full accent-red-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-1">
                      <button onClick={() => setManualCropX(15)} className="hover:text-red-600">Left (15%)</button>
                      <button onClick={() => setManualCropX(50)} className="hover:text-red-600">Center (50%)</button>
                      <button onClick={() => setManualCropX(85)} className="hover:text-red-600">Right (85%)</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Panning Smoothness */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Camera Panning Smoothness</span>
                  <span className="font-mono text-red-600">
                    {smoothSpeed < 0.1 ? "Cinematic Slow" : smoothSpeed > 0.2 ? "Fast Snap" : "Natural Smooth"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.35}
                  step={0.01}
                  value={smoothSpeed}
                  onChange={(e) => setSmoothSpeed(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Controls how quickly the virtual cameraman glides when the speaker moves across the room.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
