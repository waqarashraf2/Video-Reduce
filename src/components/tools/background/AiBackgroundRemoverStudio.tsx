"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Wand2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Image as ImageIcon,
  Check,
  Film,
  Layers,
  Loader2,
  Upload,
  AlertCircle,
  Eye,
  Camera,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface AiBackgroundRemoverStudioProps {
  tool: ToolMetadata;
}

export type BackgroundMode = "green" | "transparent" | "color" | "blur" | "image";

// Helper to dynamically load Google MediaPipe script with CDN fallback
function loadMediaPipeSelfieScript(): Promise<void> {
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
      // Fallback to high-speed CDN if local static wasm script is blocked
      const fallbackScript = document.createElement("script");
      fallbackScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js";
      fallbackScript.onload = () => resolve();
      fallbackScript.onerror = () => reject(new Error("Could not load Google MediaPipe AI model"));
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  });
}

export const AiBackgroundRemoverStudio: React.FC<AiBackgroundRemoverStudioProps> = ({ tool }) => {
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Background Removal Settings
  const [mode, setMode] = useState<BackgroundMode>("green");
  const [solidColor, setSolidColor] = useState<string>("#00FF00"); // Studio Green Screen default
  const [blurRadius, setBlurRadius] = useState<number>(16);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [customImageEl, setCustomImageEl] = useState<HTMLImageElement | null>(null);

  // MediaPipe AI State
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelSelection, setModelSelection] = useState<number>(1); // 1: Landscape/Full Body, 0: Close-up Selfie
  const [splitView, setSplitView] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const customImageInputRef = useRef<HTMLInputElement>(null);
  const segmenterRef = useRef<any>(null);
  const isProcessingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (customImageUrl) URL.revokeObjectURL(customImageUrl);
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
  }, [videoUrl, customImageUrl, exportedVideoUrl]);

  // Composite MediaPipe Segmentation Results onto Canvas
  const handleResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // 1. Draw segmentation mask (person is opaque, background is transparent)
      ctx.drawImage(results.segmentationMask, 0, 0, w, h);

      // 2. Only keep pixels of image where segmentationMask is opaque (exact person cutout)
      ctx.globalCompositeOperation = "source-in";
      ctx.drawImage(results.image, 0, 0, w, h);

      // 3. Draw replacement background behind the person
      ctx.globalCompositeOperation = "destination-over";

      if (mode === "green") {
        ctx.fillStyle = "#00FF00"; // Studio Chroma Key Green
        ctx.fillRect(0, 0, w, h);
      } else if (mode === "color") {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, w, h);
      } else if (mode === "blur") {
        // DSLR Bokeh Blur: blur original video frame behind subject
        ctx.filter = `blur(${blurRadius}px)`;
        ctx.drawImage(results.image, 0, 0, w, h);
        ctx.filter = "none";
      } else if (mode === "image" && customImageEl) {
        ctx.drawImage(customImageEl, 0, 0, w, h);
      } else if (mode === "transparent") {
        // Transparent WebM: leave destination-over empty for pure alpha transparency
      }

      ctx.restore();

      // 4. Split Comparison Slider
      if (splitView) {
        const splitX = (w * splitPos) / 100;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, h);
        ctx.clip();
        ctx.drawImage(results.image, 0, 0, w, h);
        ctx.restore();

        // White Divider line
        ctx.save();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, h);
        ctx.stroke();
        ctx.restore();
      }
    },
    [mode, solidColor, blurRadius, customImageEl, splitView, splitPos]
  );

  // Initialize MediaPipe Selfie Segmentation Neural Network
  const initMediaPipe = useCallback(async () => {
    try {
      setIsModelLoading(true);
      setModelError(null);

      await loadMediaPipeSelfieScript();

      const SelfieClass = (window as any).SelfieSegmentation;
      if (!SelfieClass) {
        throw new Error("Google MediaPipe runtime could not be initialized");
      }

      if (segmenterRef.current) {
        try {
          segmenterRef.current.close();
        } catch (_) {}
      }

      const segmenter = new SelfieClass({
        locateFile: (file: string) => {
          return `/mediapipe/selfie_segmentation/${file}`;
        },
      });

      segmenter.setOptions({
        modelSelection,
        selfieMode: false,
      });

      segmenter.onResults(handleResults);
      await segmenter.initialize();

      segmenterRef.current = segmenter;
      setIsModelReady(true);
      setIsModelLoading(false);

      // Trigger first static frame processing if video is ready
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = videoRef.current.videoWidth || 1280;
          canvas.height = videoRef.current.videoHeight || 720;
        }
        await segmenter.send({ image: videoRef.current });
      }
    } catch (err: any) {
      console.error("MediaPipe initialization error:", err);
      setModelError(err?.message || "Failed to initialize AI model. Please check network connection.");
      setIsModelLoading(false);
    }
  }, [handleResults, modelSelection]);

  // Re-register onResults callback whenever background mode changes
  useEffect(() => {
    if (segmenterRef.current) {
      segmenterRef.current.onResults(handleResults);
      // Re-render current static frame if video is paused
      if (videoRef.current && !isPlaying && videoRef.current.readyState >= 2) {
        segmenterRef.current.send({ image: videoRef.current }).catch(() => {});
      }
    }
  }, [handleResults, isPlaying]);

  // Update model selection (Landscape vs Close-up)
  useEffect(() => {
    if (segmenterRef.current) {
      segmenterRef.current.setOptions({
        modelSelection,
        selfieMode: false,
      });
      if (videoRef.current && !isPlaying && videoRef.current.readyState >= 2) {
        segmenterRef.current.send({ image: videoRef.current }).catch(() => {});
      }
    }
  }, [modelSelection, isPlaying]);

  const handleFileSelected = (meta: FileMetadata) => {
    setFileMeta(meta);
    const url = URL.createObjectURL(meta.file);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setExportedVideoUrl(null);
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

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (customImageUrl) URL.revokeObjectURL(customImageUrl);
      const url = URL.createObjectURL(file);
      setCustomImageUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setCustomImageEl(img);
        setMode("image");
      };
    }
  };

  // Video playback loop: sends decoded video frames to MediaPipe
  useEffect(() => {
    let isCancelled = false;

    const renderLoop = async () => {
      const video = videoRef.current;
      if (isCancelled || !video || video.paused || video.ended) return;

      if (segmenterRef.current && !isProcessingRef.current && video.readyState >= 2) {
        isProcessingRef.current = true;
        try {
          await segmenterRef.current.send({ image: video });
        } catch (_) {}
        isProcessingRef.current = false;
      }

      if ("requestVideoFrameCallback" in video) {
        (video as any).requestVideoFrameCallback(renderLoop);
      } else {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    if (isPlaying) {
      renderLoop();
    }

    return () => {
      isCancelled = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying]);

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

  const handleVideoSeeked = () => {
    if (videoRef.current && segmenterRef.current && !isPlaying) {
      segmenterRef.current.send({ image: videoRef.current }).catch(() => {});
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = videoRef.current.videoWidth || 1280;
        canvas.height = videoRef.current.videoHeight || 720;
      }
      if (segmenterRef.current) {
        segmenterRef.current.send({ image: videoRef.current }).catch(() => {});
      }
    }
  };

  // Export processed video with new background
  const handleExport = async () => {
    if (!videoRef.current || !canvasRef.current || !fileMeta || !segmenterRef.current) return;

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

    // Capture audio tracks cleanly
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
        console.warn("Audio capture note:", e);
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
      videoBitsPerSecond: 6_000_000,
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

    const exportCheck = setInterval(() => {
      if (video.ended || video.currentTime >= video.duration - 0.05) {
        clearInterval(exportCheck);
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
          acceptedExtensions={[".mp4", ".mov", ".webm", ".mkv"]}
          onFileSelected={handleFileSelected}
          selectedFile={fileMeta}
          onClear={handleClear}
          title="Upload video to isolate subject and replace background"
          subtitle="Google MediaPipe Neural Network: 100% in-browser green screen, cinematic bokeh blur, or custom backdrops"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live AI Composited Canvas & Playback */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-video flex items-center justify-center group select-none">
              {/* Hidden Video Source Element */}
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={handleLoadedMetadata}
                onSeeked={handleVideoSeeked}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
                playsInline
              />

              {/* Live Composited Canvas (Subject Cutout + New Background) */}
              <canvas ref={canvasRef} className="w-full h-full object-contain" />

              {/* Loading Overlay */}
              {isModelLoading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white z-20">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                  <div className="text-center">
                    <p className="text-sm font-bold">Loading Google MediaPipe AI Model...</p>
                    <p className="text-xs text-slate-400 mt-1">Lightweight in-browser neural network for real-time person isolation</p>
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {modelError && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 text-white p-6 z-20 text-center">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                  <p className="text-sm font-bold text-amber-300">{modelError}</p>
                  <button
                    onClick={initMediaPipe}
                    className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                  >
                    Retry Loading AI Model
                  </button>
                </div>
              )}

              {/* AI Status Pill Overlay */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 shadow-md">
                  {isModelReady ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      <span className="text-emerald-300">MediaPipe AI Active</span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                      <span>Initializing AI...</span>
                    </>
                  )}
                </span>
              </div>

              {/* Bottom Scrub Controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 opacity-90 group-hover:opacity-100 transition-opacity flex flex-col gap-2 z-10">
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
                  <div className="flex items-center gap-3">
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSplitView(!splitView)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        splitView ? "bg-red-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {splitView ? "Hide Comparison" : "Split Comparison"}
                    </button>
                    <button
                      onClick={handleClear}
                      className="text-xs text-slate-400 hover:text-red-400 px-2 py-1"
                    >
                      Change Video
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Comparison Slider (when enabled) */}
            {splitView && (
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-4 text-xs">
                <span className="font-bold text-slate-700 whitespace-nowrap">Original Video (Left)</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={splitPos}
                  onChange={(e) => setSplitPos(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <span className="font-bold text-red-600 whitespace-nowrap">AI Replaced Background (Right)</span>
              </div>
            )}

            {/* Export Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Export Processed Video
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> 100% In-Browser & Private
                </span>
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting || !isModelReady}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-bold hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rendering with AI Background ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Film className="h-4 w-4" />
                    <span>Export Video with New Background</span>
                  </>
                )}
              </button>

              {exportedVideoUrl && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-semibold">
                    ✓ Video with isolated subject exported successfully!
                  </span>
                  <a
                    href={exportedVideoUrl}
                    download="video-new-background.webm"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Video
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Replacement Controls & Settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Background Replacement</h3>
                </div>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  Google MediaPipe AI
                </span>
              </div>

              {/* Modes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Choose New Background</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "green", name: "🟢 Green Screen", desc: "Studio Chroma Key" },
                    { id: "blur", name: "📷 DSLR Blur", desc: "Cinematic Bokeh" },
                    { id: "transparent", name: "🔲 Transparent", desc: "Alpha WebM" },
                    { id: "color", name: "🎨 Solid Color", desc: "Custom Studio" },
                    { id: "image", name: "🖼️ Custom Photo", desc: "Upload Backdrop" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id as BackgroundMode)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        mode === m.id
                          ? "border-red-600 bg-red-50/60 ring-2 ring-red-500/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{m.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Mode Settings */}
              {mode === "blur" && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Cinematic Bokeh Blur Intensity</span>
                    <span className="font-mono text-red-600">{blurRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={36}
                    value={blurRadius}
                    onChange={(e) => setBlurRadius(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
              )}

              {mode === "color" && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Select Studio Backdrop Color</span>
                  <div className="flex items-center gap-2">
                    {["#FFFFFF", "#000000", "#0B192C", "#1E293B", "#3B82F6", "#8B5CF6", "#EF4444"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setSolidColor(c)}
                        style={{ backgroundColor: c }}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${
                          solidColor === c ? "scale-110 border-red-600 ring-2 ring-red-400" : "border-slate-300"
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              )}

              {mode === "image" && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Custom Backdrop Photo</span>
                  <input
                    ref={customImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => customImageInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-red-500 hover:text-red-600 transition-colors shadow-sm"
                  >
                    <Upload className="h-4 w-4 text-red-600" />
                    <span>{customImageEl ? "Change Backdrop Image" : "Upload Image (.jpg / .png)"}</span>
                  </button>
                </div>
              )}

              {/* AI Neural Network Mode Settings */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>AI Segmentation Scope</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Deep Learning
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModelSelection(1)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      modelSelection === 1
                        ? "border-red-600 bg-red-50 text-red-700 font-bold ring-1 ring-red-500"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold">Wide / Full Body</div>
                    <div className="text-[10px] opacity-75">General scenes & office videos</div>
                  </button>

                  <button
                    onClick={() => setModelSelection(0)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      modelSelection === 0
                        ? "border-red-600 bg-red-50 text-red-700 font-bold ring-1 ring-red-500"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold">Portrait / Selfie</div>
                    <div className="text-[10px] opacity-75">Close-up headshots & talking heads</div>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Uses Google MediaPipe convolutional neural network. 100% runs on your device inside the browser without uploading video files to any server.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
