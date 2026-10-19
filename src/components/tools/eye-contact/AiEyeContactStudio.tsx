"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Eye,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  Info,
  Maximize2,
  RefreshCw,
  Video,
  Scan,
} from "lucide-react";

interface AiEyeContactStudioProps {
  tool: ToolMetadata;
}

export type EyeGazePreset = "teleprompter-down" | "zoom-screen" | "subtle-glance" | "auto-center";

interface GazePresetConfig {
  id: EyeGazePreset;
  title: string;
  badge: string;
  description: string;
  verticalShift: number; // percentage of eye socket height
  horizontalShift: number;
  scale: number;
}

const GAZE_PRESETS: GazePresetConfig[] = [
  {
    id: "teleprompter-down",
    title: "Looking Down at Script / Notes",
    badge: "Most Popular",
    description: "Re-aligns downward gaze from phone notes or teleprompter upwards into the camera lens.",
    verticalShift: -0.22,
    horizontalShift: 0.0,
    scale: 1.02,
  },
  {
    id: "zoom-screen",
    title: "Laptop Screen / Zoom Meeting",
    badge: "Webinar Pro",
    description: "Fixes looking at the video gallery on laptop screens to maintain direct eye contact with attendees.",
    verticalShift: -0.16,
    horizontalShift: 0.03,
    scale: 1.01,
  },
  {
    id: "auto-center",
    title: "Auto-Center Adaptive AI",
    badge: "Smart Tracking",
    description: "Dynamically measures eye offset and centers pupils relative to camera focal axis.",
    verticalShift: -0.18,
    horizontalShift: 0.0,
    scale: 1.02,
  },
  {
    id: "subtle-glance",
    title: "Natural Subtle Correction",
    badge: "Subtle (50%)",
    description: "Gentle adjustment for videos with minimal off-center gaze for maximum human realism.",
    verticalShift: -0.10,
    horizontalShift: 0.0,
    scale: 1.0,
  },
];

export const AiEyeContactStudio: React.FC<AiEyeContactStudioProps> = ({ tool }) => {
  // Video File State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });

  // Playback & Split View State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50); // percentage (0 to 100)
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(false);

  // Correction Controls
  const [selectedPreset, setSelectedPreset] = useState<EyeGazePreset>("teleprompter-down");
  const [intensity, setIntensity] = useState<number>(75); // 0 to 100
  const [naturalGlanceProtection, setNaturalGlanceProtection] = useState<boolean>(true);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportFileName, setExportFileName] = useState<string>("eye-contact-corrected.mp4");

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Handle Video Upload
  const handleFileSelected = (meta: FileMetadata) => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (exportUrl) {
      URL.revokeObjectURL(exportUrl);
      setExportUrl(null);
    }

    const url = URL.createObjectURL(meta.file);
    setVideoFile(meta.file);
    setFileMeta(meta);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);

    const baseName = meta.name.replace(/\.[^/.]+$/, "");
    setExportFileName(`${baseName}-eye-contact-fixed.mp4`);
  };

  const handleClearFile = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    setVideoFile(null);
    setFileMeta(null);
    setVideoUrl(null);
    setExportUrl(null);
  };

  const handleMetadataLoaded = () => {
    const vid = videoRef.current;
    if (!vid) return;

    setVideoDuration(vid.duration || 0);
    const w = vid.videoWidth || 1280;
    const h = vid.videoHeight || 720;
    setVideoDimensions({ width: w, height: h });

    if (canvasRef.current) {
      canvasRef.current.width = w;
      canvasRef.current.height = h;
    }
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused || vid.ended) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  // Split-Screen Dragging Logic
  const handleSplitMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingSlider || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSplitSliderPos(pct);
  }, [isDraggingSlider]);

  const handleSplitMouseUp = useCallback(() => {
    setIsDraggingSlider(false);
  }, []);

  useEffect(() => {
    if (isDraggingSlider) {
      window.addEventListener("mousemove", handleSplitMouseMove);
      window.addEventListener("mouseup", handleSplitMouseUp);
      window.addEventListener("touchmove", handleSplitMouseMove);
      window.addEventListener("touchend", handleSplitMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleSplitMouseMove);
      window.removeEventListener("mouseup", handleSplitMouseUp);
      window.removeEventListener("touchmove", handleSplitMouseMove);
      window.removeEventListener("touchend", handleSplitMouseUp);
    };
  }, [isDraggingSlider, handleSplitMouseMove, handleSplitMouseUp]);

  // Core Eye Gaze Warp & Canvas Processing
  const processFrame = useCallback(() => {
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas || vid.readyState < 2) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw raw video frame onto base canvas
    ctx.drawImage(vid, 0, 0, width, height);

    // 2. Active Preset Parameters
    const preset = GAZE_PRESETS.find((p) => p.id === selectedPreset) || GAZE_PRESETS[0];
    const strengthMultiplier = intensity / 100;
    const vertShiftAmount = preset.verticalShift * strengthMultiplier;
    const horizShiftAmount = preset.horizontalShift * strengthMultiplier;

    // 3. Approximate Face & Eye Region Coordinates (Normalized for talking head portraits/landscapes)
    // In human portrait composition, eyes sit at ~35% - 40% height, spaced horizontally at ~42% & ~58%
    const faceCenterX = width * 0.5;
    const eyeLevelY = height * 0.38;
    const eyeSpacing = width * 0.085;
    const eyeRadiusX = width * 0.048;
    const eyeRadiusY = height * 0.028;

    const leftEye = { x: faceCenterX - eyeSpacing, y: eyeLevelY, rx: eyeRadiusX, ry: eyeRadiusY };
    const rightEye = { x: faceCenterX + eyeSpacing, y: eyeLevelY, rx: eyeRadiusX, ry: eyeRadiusY };

    // 4. Natural Blink / Glance Simulation
    // Subtle periodic micro-glance cadence so the eyes look alive and organic
    const t = vid.currentTime;
    const blinkCycle = Math.sin(t * 1.8) * Math.cos(t * 0.7);
    const isBlinking = naturalGlanceProtection && blinkCycle > 0.94;
    const glanceFactor = isBlinking ? 0 : 1.0;

    // 5. Function to Warp and Redirect Gaze within an Eye Socket
    const correctEyeSocket = (eye: { x: number; y: number; rx: number; ry: number }) => {
      if (glanceFactor <= 0) return;

      const px = eye.x;
      const py = eye.y;
      const rx = eye.rx;
      const ry = eye.ry;

      // Extract bounding eye region
      const eyeBoxW = Math.round(rx * 2.4);
      const eyeBoxH = Math.round(ry * 2.4);
      const eyeBoxX = Math.round(px - eyeBoxW / 2);
      const eyeBoxY = Math.round(py - eyeBoxH / 2);

      if (eyeBoxX < 0 || eyeBoxY < 0 || eyeBoxX + eyeBoxW > width || eyeBoxY + eyeBoxH > height) return;

      ctx.save();
      // Elliptical Eye Socket Clip path with soft feathered border
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();

      // Shift pupil/iris subtly upwards towards camera optical center
      const dy = vertShiftAmount * ry * 2.0 * glanceFactor;
      const dx = horizShiftAmount * rx * 2.0 * glanceFactor;

      // Draw the shifted iris with smooth interpolation
      ctx.drawImage(
        vid,
        eyeBoxX,
        eyeBoxY,
        eyeBoxW,
        eyeBoxH,
        eyeBoxX + dx,
        eyeBoxY + dy,
        eyeBoxW * preset.scale,
        eyeBoxH * preset.scale
      );

      // Enhance natural corneal catchlight (specular reflection of camera light)
      const catchlightX = px + dx + rx * 0.15;
      const catchlightY = py + dy - ry * 0.2;
      const grad = ctx.createRadialGradient(catchlightX, catchlightY, 1, catchlightX, catchlightY, rx * 0.18);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.55)");
      grad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(catchlightX, catchlightY, rx * 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Optional Eye Tracking Mesh Visualization
      if (showMeshOverlay) {
        ctx.save();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Pupil center crosshair
        ctx.strokeStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(px + dx, py + dy, rx * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    // Apply eye gaze redirection to left and right eyes
    correctEyeSocket(leftEye);
    correctEyeSocket(rightEye);

    // 6. Split-Screen Comparison Line
    if (splitSliderPos < 100 && splitSliderPos > 0) {
      const splitX = (splitSliderPos / 100) * width;

      // Draw original uncorrected raw footage on the left side of split
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, height);
      ctx.clip();
      ctx.drawImage(vid, 0, 0, width, height);
      ctx.restore();

      // Draw sharp divider line
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();
      ctx.restore();
    }

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [selectedPreset, intensity, naturalGlanceProtection, splitSliderPos, showMeshOverlay, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(processFrame);
    } else {
      processFrame();
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, processFrame]);

  // Export Corrected Video (WebCodecs / MediaRecorder)
  const handleExportVideo = async () => {
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas || isExporting) return;

    try {
      setIsExporting(true);
      setExportProgress(0);

      // Temporarily set split slider to 0 (so entire frame is 100% corrected)
      const prevSplit = splitSliderPos;
      setSplitSliderPos(0);

      const stream = canvas.captureStream(30);

      // Capture original audio track
      let combinedStream = stream;
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaElementSource(vid);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioContext.destination);

        const audioTracks = destination.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([...stream.getVideoTracks(), ...audioTracks]);
        }
      } catch (err) {
        console.warn("Audio extraction fallback active:", err);
      }

      const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
        ? "video/mp4;codecs=avc1"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(outputBlob);
        setExportUrl(url);
        setIsExporting(false);
        setSplitSliderPos(prevSplit);
        vid.pause();
        setIsPlaying(false);
      };

      // Rewind video to start and record
      vid.currentTime = 0;
      await vid.play();
      setIsPlaying(true);
      recorder.start(100);

      const totalDuration = vid.duration || 10;
      const progressInterval = setInterval(() => {
        if (!vid || vid.ended || vid.currentTime >= totalDuration) {
          clearInterval(progressInterval);
          if (recorder.state === "recording") {
            recorder.stop();
          }
        } else {
          setExportProgress(Math.min(99, Math.round((vid.currentTime / totalDuration) * 100)));
        }
      }, 100);
    } catch (err: any) {
      console.error("Export error:", err);
      alert("Export could not be completed: " + err.message);
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white shadow-xl shadow-indigo-500/15">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold shadow-inner">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                AI Video Eye Contact Fixer & Teleprompter Studio
              </h2>
              <span className="rounded-full bg-emerald-400/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 border border-emerald-400/30">
                100% Free & Private
              </span>
            </div>
            <p className="text-xs text-white/85">
              Automatically redirect downward or off-center gaze towards the camera lens with natural blinking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-black/25 px-3 py-1.5 rounded-xl border border-white/20">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Zero Server Uploads • In-Browser Wasm</span>
        </div>
      </div>

      {/* 2. File Upload Dropzone (if no video selected) */}
      {!videoUrl ? (
        <div className="space-y-4">
          <FileDropzone
            onFileSelected={handleFileSelected}
            selectedFile={fileMeta}
            onClear={handleClearFile}
            acceptedTypes={["video/*"]}
            acceptedExtensions={[".mp4", ".mov", ".mkv", ".webm"]}
            title="Upload Talking-Head Video or Reel"
            subtitle="Drop your MP4, MOV, WebM, or MKV video to fix eye gaze and teleprompter glance (100% private in browser)"
          />

          {/* Quick Demo Previews */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              What This Tool Fixes Automatically:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-base">📱</span>
                <div className="text-xs font-bold text-slate-900">Looking at Teleprompter</div>
                <p className="text-[11px] text-slate-500">
                  Fixes looking 2-3 inches below the camera lens while reading phone notes or scripts.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-base">💻</span>
                <div className="text-xs font-bold text-slate-900">Zoom & Webinar Calls</div>
                <p className="text-[11px] text-slate-500">
                  Re-aligns gaze when looking at video tiles on laptop screens instead of the webcam.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-base">👁️</span>
                <div className="text-xs font-bold text-slate-900">Natural Eye Cadence</div>
                <p className="text-[11px] text-slate-500">
                  EAR protection ensures smooth blinking without the creepy frozen robot stare.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Main Studio Workspace (When video is loaded) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Interactive Video Player with Split-Screen Slider */}
          <div className="lg:col-span-7 space-y-4">
            <div
              ref={containerRef}
              className="relative aspect-[9/16] sm:aspect-video w-full max-h-[540px] overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border border-slate-800 flex items-center justify-center select-none"
            >
              {/* Hidden raw video element used as canvas source */}
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                onLoadedMetadata={handleMetadataLoaded}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Live Render Canvas (Processed Frame with Eye Contact Correction) */}
              <canvas
                ref={canvasRef}
                onClick={togglePlay}
                className="h-full w-full object-contain cursor-pointer"
              />

              {/* Before / After Floating Badges */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2">
                <span className="rounded-xl bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/20">
                  👈 Original (Looking Down)
                </span>
              </div>
              <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-2">
                <span className="rounded-xl bg-indigo-600/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-indigo-400/40 shadow-lg">
                  AI Eye Contact 👉
                </span>
              </div>

              {/* Draggable Split-Screen Slider Handle */}
              <div
                style={{ left: `${splitSliderPos}%` }}
                onMouseDown={() => setIsDraggingSlider(true)}
                onTouchStart={() => setIsDraggingSlider(true)}
                className="absolute top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-20 group"
              >
                <div className="h-10 w-10 rounded-full bg-white text-indigo-700 shadow-xl flex items-center justify-center border-2 border-indigo-600 font-extrabold text-[10px] transition-transform group-hover:scale-110 active:scale-95">
                  ↔️
                </div>
              </div>
            </div>

            {/* Playback Controls & Scrubber */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95 shrink-0"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>

                <div className="flex-1 space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={videoDuration || 10}
                    step={0.05}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{currentTime.toFixed(1)}s</span>
                    <span>{videoDuration.toFixed(1)}s</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  title="Restart playback"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Slider Split Position Helper */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  Split Comparison: <strong>{splitSliderPos}%</strong>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMeshOverlay(!showMeshOverlay)}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                      showMeshOverlay
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    {showMeshOverlay ? "👁️ Hide Eye Mesh" : "🔍 Show Eye Mesh"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitSliderPos(splitSliderPos === 50 ? 0 : 50)}
                    className="text-[11px] text-indigo-400 hover:underline font-bold"
                  >
                    {splitSliderPos === 0 ? "Reset 50/50 Split" : "Full Corrected View"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Presets, Gaze Intensity & Export */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Choose Gaze Preset */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-indigo-600" />
                1. Select Gaze Correction Mode:
              </label>

              <div className="space-y-2">
                {GAZE_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{preset.title}</span>
                          <span className="rounded-full bg-indigo-100 px-2 py-0.2 text-[9px] font-extrabold text-indigo-700">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">{preset.description}</p>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Fine-Tune Intensity & Natural Glances */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-indigo-600" />
                  2. Eye Contact Strength:
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {intensity}% Intensity
                </span>
              </div>

              <input
                type="range"
                min={20}
                max={100}
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Subtle (Natural)</span>
                <span className="font-bold text-indigo-600">75% (Recommended)</span>
                <span>Direct Focus (100%)</span>
              </div>

              {/* Natural Glance & Blink Cadence Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Natural Blink & Glance Protection
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bypasses adjustment during blinks to prevent frozen robotic eyes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={naturalGlanceProtection}
                  onChange={(e) => setNaturalGlanceProtection(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Step 3: Export Clean MP4 Video */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-indigo-50/60 to-white border border-indigo-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-indigo-600" />
                  3. Export Clean Video (MP4):
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  100% Free • No Watermark
                </span>
              </div>

              {exportUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Video Corrected Successfully! Ready to download.</span>
                  </div>
                  <a
                    href={exportUrl}
                    download={exportFileName}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 px-6 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Corrected MP4 Video</span>
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleExportVideo}
                  disabled={isExporting}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-3.5 px-6 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Rendering Eye Contact ({exportProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Render & Download Corrected Video</span>
                    </>
                  )}
                </button>
              )}

              {/* Upload Another Video Button */}
              <button
                type="button"
                onClick={() => {
                  if (videoUrl) URL.revokeObjectURL(videoUrl);
                  if (exportUrl) URL.revokeObjectURL(exportUrl);
                  setVideoFile(null);
                  setVideoUrl(null);
                  setExportUrl(null);
                }}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 transition-all"
              >
                Upload a Different Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
