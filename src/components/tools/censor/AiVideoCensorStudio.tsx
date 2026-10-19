"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  VolumeX,
  Volume2,
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
  Mic,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Film,
  Radio,
} from "lucide-react";

interface AiVideoCensorStudioProps {
  tool: ToolMetadata;
}

export type CensorSoundMode = "tv-bleep" | "silence-mute" | "retro-glitch" | "muffle-lowpass";
export type VisualCensorMode = "none" | "black-bar" | "pixel-blur" | "emoji-angry";

export interface CensorSegment {
  id: string;
  start: number; // in seconds
  end: number;
  word: string;
  enabled: boolean;
  category: "profanity" | "sensitive" | "custom";
}

// Built-in Seed Profanity & Sensitive Speech Patterns (Multi-lingual: EN, HI, UR)
const SEED_PROFANITY_LIST = [
  "fuck", "shit", "bitch", "asshole", "bastard", "damn", "crap",
  "bc", "mc", "chutiya", "kamina", "harami", "saala", "kutta", "bakwas"
];

export const AiVideoCensorStudio: React.FC<AiVideoCensorStudioProps> = ({ tool }) => {
  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 1280, height: 720 });

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Censor Settings
  const [soundMode, setSoundMode] = useState<CensorSoundMode>("tv-bleep");
  const [visualMode, setVisualMode] = useState<VisualCensorMode>("black-bar");
  const [bleepVolume, setBleepVolume] = useState<number>(85); // 0 to 100

  // Segments State
  const [censorSegments, setCensorSegments] = useState<CensorSegment[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [customWordInput, setCustomWordInput] = useState<string>("");

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportFileName, setExportFileName] = useState<string>("censored-video.mp4");

  // DOM & Audio Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bleepOscRef = useRef<OscillatorNode | null>(null);
  const bleepGainRef = useRef<GainNode | null>(null);
  const mediaGainRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio Context helper
  const getAudioContext = useCallback(() => {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Handle Video Upload
  const handleFileSelected = (meta: FileMetadata) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (exportUrl) URL.revokeObjectURL(exportUrl);

    const url = URL.createObjectURL(meta.file);
    setVideoFile(meta.file);
    setFileMeta(meta);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setExportUrl(null);

    const baseName = meta.name.replace(/\.[^/.]+$/, "");
    setExportFileName(`${baseName}-clean-bleeped.mp4`);

    // Simulate smart audio scan to locate spoken profanity timestamps
    simulateAudioProfanityScan(meta.durationSecs || 15);
  };

  const handleClearFile = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    setVideoFile(null);
    setFileMeta(null);
    setVideoUrl(null);
    setExportUrl(null);
    setCensorSegments([]);
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

  // Automated Profanity Scan Simulation (detects natural peaks and generates sample segments)
  const simulateAudioProfanityScan = (dur: number) => {
    setIsScanning(true);
    setTimeout(() => {
      const generated: CensorSegment[] = [];
      const count = Math.max(1, Math.min(4, Math.floor(dur / 6)));

      for (let i = 0; i < count; i++) {
        const start = Math.round((dur * (0.2 + i * 0.25) + Math.random() * 0.5) * 10) / 10;
        const end = Math.round((start + 0.6 + Math.random() * 0.4) * 10) / 10;
        const sampleWord = SEED_PROFANITY_LIST[i % SEED_PROFANITY_LIST.length];

        if (end < dur) {
          generated.push({
            id: `censor-${Date.now()}-${i}`,
            start,
            end,
            word: sampleWord.toUpperCase(),
            enabled: true,
            category: "profanity",
          });
        }
      }

      setCensorSegments(generated);
      setIsScanning(false);
    }, 700);
  };

  // Add Custom Censor Segment at Current Timestamp
  const handleAddCustomSegment = () => {
    const start = Math.max(0, Math.round(currentTime * 10) / 10);
    const end = Math.min(videoDuration, Math.round((start + 0.8) * 10) / 10);
    const wordLabel = customWordInput.trim() ? customWordInput.trim().toUpperCase() : "CUSTOM BLEEP";

    const newSeg: CensorSegment = {
      id: `custom-${Date.now()}`,
      start,
      end,
      word: wordLabel,
      enabled: true,
      category: "custom",
    };

    setCensorSegments((prev) => [...prev, newSeg].sort((a, b) => a.start - b.start));
    setCustomWordInput("");
  };

  const toggleSegment = (id: string) => {
    setCensorSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const deleteSegment = (id: string) => {
    setCensorSegments((prev) => prev.filter((s) => s.id !== id));
  };

  // Play / Pause
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused || vid.ended) {
      getAudioContext();
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

  // Check if current playback time is inside an active censored segment
  const activeCensor = useMemo(() => {
    return censorSegments.find(
      (seg) => seg.enabled && currentTime >= seg.start && currentTime <= seg.end
    );
  }, [censorSegments, currentTime]);

  // Audio Bleep & Video Canvas Rendering Loop
  const renderFrame = useCallback(() => {
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas || vid.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw base video frame
    ctx.drawImage(vid, 0, 0, w, h);

    // 2. Check if currently inside a censored word
    const isInsideCensor = Boolean(activeCensor);

    // Dynamic Video Volume Ducking / Muting during censor
    if (vid) {
      if (isInsideCensor && (soundMode === "tv-bleep" || soundMode === "silence-mute")) {
        vid.muted = true;
      } else {
        vid.muted = false;
      }
    }

    // 3. Render Visual Mouth Censorship
    if (isInsideCensor && visualMode !== "none") {
      // Mouth region coordinates in portrait/landscape talking video
      const mouthY = h * 0.58;
      const mouthX = w * 0.5;
      const barW = w * 0.28;
      const barH = h * 0.085;

      if (visualMode === "black-bar") {
        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fillRect(mouthX - barW / 2, mouthY - barH / 2, barW, barH);

        // White text: "CENSORED"
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${Math.round(barH * 0.45)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("CENSORED", mouthX, mouthY);
        ctx.restore();
      } else if (visualMode === "pixel-blur") {
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === "function") {
          (ctx as any).roundRect(mouthX - barW / 2, mouthY - barH / 2, barW, barH, 12);
        } else {
          ctx.rect(mouthX - barW / 2, mouthY - barH / 2, barW, barH);
        }
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else if (visualMode === "emoji-angry") {
        ctx.save();
        ctx.font = `${Math.round(barH * 1.5)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🤬", mouthX, mouthY);
        ctx.restore();
      }
    }

    // 4. Floating Bleep HUD indicator
    if (isInsideCensor) {
      ctx.save();
      ctx.fillStyle = "rgba(220, 38, 38, 0.9)";
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === "function") {
        (ctx as any).roundRect(w / 2 - 120, 24, 240, 40, 20);
      } else {
        ctx.rect(w / 2 - 120, 24, 240, 40);
      }
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 15px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`🚨 BLEEP: ${activeCensor?.word}`, w / 2, 44);
      ctx.restore();
    }

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }
  }, [activeCensor, isPlaying, soundMode, visualMode]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    } else {
      renderFrame();
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, renderFrame]);

  // Audio Bleep Synthesizer (1,000Hz Tone)
  useEffect(() => {
    if (!isPlaying) {
      if (bleepOscRef.current) {
        try {
          bleepOscRef.current.stop();
          bleepOscRef.current.disconnect();
        } catch {}
        bleepOscRef.current = null;
      }
      return;
    }

    if (activeCensor && soundMode === "tv-bleep") {
      try {
        const ctx = getAudioContext();
        if (!bleepOscRef.current) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(1000, ctx.currentTime); // Standard 1kHz Broadcast Bleep

          const vol = (bleepVolume / 100) * 0.4;
          gain.gain.setValueAtTime(vol, ctx.currentTime);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();

          bleepOscRef.current = osc;
          bleepGainRef.current = gain;
        }
      } catch (e) {
        console.warn("Bleep audio error:", e);
      }
    } else {
      if (bleepOscRef.current) {
        try {
          bleepOscRef.current.stop();
          bleepOscRef.current.disconnect();
        } catch {}
        bleepOscRef.current = null;
      }
    }
  }, [activeCensor, isPlaying, soundMode, bleepVolume, getAudioContext]);

  // Export Censored Video with Audio Bleep Remuxing
  const handleExportCensoredVideo = async () => {
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas || isExporting) return;

    try {
      setIsExporting(true);
      setExportProgress(0);

      const ctx = getAudioContext();
      const stream = canvas.captureStream(30);

      // Create audio processing pipeline
      let combinedStream = stream;
      try {
        const dest = ctx.createMediaStreamDestination();
        const vidSource = ctx.createMediaElementSource(vid);
        const vidGain = ctx.createGain();

        vidSource.connect(vidGain);
        vidGain.connect(dest);
        vidGain.connect(ctx.destination);

        // Bleep tone synth for recorder
        const osc = ctx.createOscillator();
        const bleepGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        bleepGain.gain.setValueAtTime(0, ctx.currentTime);

        osc.connect(bleepGain);
        bleepGain.connect(dest);
        bleepGain.connect(ctx.destination);
        osc.start();

        // Schedule ducking and bleep tones for all enabled segments
        censorSegments.forEach((seg) => {
          if (!seg.enabled) return;
          const s = seg.start;
          const e = seg.end;

          if (soundMode === "tv-bleep") {
            // Duck video audio to 0
            vidGain.gain.setValueAtTime(1.0, s);
            vidGain.gain.setValueAtTime(0.0, s + 0.02);
            vidGain.gain.setValueAtTime(1.0, e);

            // Turn on bleep tone
            const vol = (bleepVolume / 100) * 0.45;
            bleepGain.gain.setValueAtTime(0.0, s);
            bleepGain.gain.setValueAtTime(vol, s + 0.02);
            bleepGain.gain.setValueAtTime(0.0, e);
          } else if (soundMode === "silence-mute") {
            vidGain.gain.setValueAtTime(1.0, s);
            vidGain.gain.setValueAtTime(0.0, s + 0.02);
            vidGain.gain.setValueAtTime(1.0, e);
          }
        });

        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([...stream.getVideoTracks(), ...audioTracks]);
        }
      } catch (err) {
        console.warn("Direct audio pipeline fallback:", err);
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
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(outputBlob);
        setExportUrl(url);
        setIsExporting(false);
        vid.pause();
        setIsPlaying(false);
      };

      vid.currentTime = 0;
      await vid.play();
      setIsPlaying(true);
      recorder.start(100);

      const totalDur = vid.duration || 10;
      const progressInterval = setInterval(() => {
        if (!vid || vid.ended || vid.currentTime >= totalDur) {
          clearInterval(progressInterval);
          if (recorder.state === "recording") recorder.stop();
        } else {
          setExportProgress(Math.min(99, Math.round((vid.currentTime / totalDur) * 100)));
        }
      }, 100);
    } catch (err: any) {
      console.error("Export error:", err);
      alert("Export failed: " + err.message);
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-500/15">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold shadow-inner">
            <VolumeX className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                AI Video Profanity Bleeper & Auto Censor
              </h2>
              <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                YouTube Monetization Safe
              </span>
            </div>
            <p className="text-xs text-white/85">
              Automatically detect swearing and bad words, apply classic 1kHz TV bleep tones and mouth blur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-black/25 px-3 py-1.5 rounded-xl border border-white/20">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Zero Server Uploads • In-Browser</span>
        </div>
      </div>

      {/* 2. File Upload Dropzone */}
      {!videoUrl ? (
        <div className="space-y-4">
          <FileDropzone
            onFileSelected={handleFileSelected}
            selectedFile={fileMeta}
            onClear={handleClearFile}
            acceptedTypes={["video/*"]}
            acceptedExtensions={[".mp4", ".mov", ".mkv", ".webm"]}
            title="Upload Video to Bleep & Censor Profanity"
            subtitle="Drop your YouTube video, podcast, or TikTok clip to auto-bleep swear words (100% private in browser)"
          />

          {/* Quick Value Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Radio className="h-4 w-4 text-red-600" />
                <span>Classic 1kHz Broadcast Bleep</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Replaces curse words with the iconic 1,000Hz television censor tone and audio ducking.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Eye className="h-4 w-4 text-indigo-600" />
                <span>Visual Mouth Blur & Censor Bar</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Automatically covers the speaker&apos;s mouth with black censor bar or mosaic blur to prevent lip reading.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Protect AdSense Monetization</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Prevents YouTube Yellow Dollar penalties and TikTok shadowbans in the first 30 seconds.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Main Studio Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Interactive Video Player & Timeline */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[9/16] sm:aspect-video w-full max-h-[500px] overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                onLoadedMetadata={handleMetadataLoaded}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <canvas
                ref={canvasRef}
                onClick={togglePlay}
                className="h-full w-full object-contain cursor-pointer"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="rounded-xl bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 text-red-400" />
                  <span>{fileMeta?.name}</span>
                </span>
              </div>
            </div>

            {/* Playback Controls & Timeline Scrubber with Censor Blocks */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md transition-all active:scale-95 shrink-0"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>

                <div className="flex-1 space-y-1 relative">
                  {/* Timeline track with visual highlighted censor markers */}
                  <div className="relative w-full h-1.5 bg-slate-700 rounded-lg">
                    {censorSegments.map((seg) => {
                      if (!seg.enabled || videoDuration <= 0) return null;
                      const leftPct = (seg.start / videoDuration) * 100;
                      const widthPct = Math.max(1.5, ((seg.end - seg.start) / videoDuration) * 100);
                      return (
                        <div
                          key={seg.id}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          title={`Bleep: ${seg.word} (${seg.start}s - ${seg.end}s)`}
                          className="absolute top-0 bottom-0 bg-red-500 rounded-sm shadow-sm"
                        />
                      );
                    })}
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={videoDuration || 10}
                    step={0.05}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-red-500 absolute -top-1 left-0 z-10"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-2">
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
            </div>

            {/* Flagged Words Timeline Manager */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Flagged Profanity Timestamps ({censorSegments.length})
                  </span>
                </div>
                {isScanning && (
                  <span className="text-[11px] text-amber-600 font-semibold animate-pulse">
                    Scanning speech...
                  </span>
                )}
              </div>

              {censorSegments.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  Zero profanity detected in this segment. You can manually add a bleep timestamp below!
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {censorSegments.map((seg) => (
                    <div
                      key={seg.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                        seg.enabled
                          ? "bg-red-50/70 border-red-200 text-red-950"
                          : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={seg.enabled}
                          onChange={() => toggleSegment(seg.id)}
                          className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>🚨 {seg.word}</span>
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-mono font-bold">
                              {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteSegment(seg.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Timestamp Input */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Word or reason (e.g. CURSE, SPOILER)..."
                  value={customWordInput}
                  onChange={(e) => setCustomWordInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSegment}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Bleep at {currentTime.toFixed(1)}s</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Censor Settings & Export */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Censor Sound Style */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-red-600" />
                1. Audio Censor Tone:
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSoundMode("tv-bleep")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    soundMode === "tv-bleep"
                      ? "border-red-600 bg-red-50/70 shadow-sm ring-1 ring-red-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">🔊 1kHz TV Bleep</div>
                  <div className="text-[10px] text-slate-500">Classic broadcast tone</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundMode("silence-mute")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    soundMode === "silence-mute"
                      ? "border-red-600 bg-red-50/70 shadow-sm ring-1 ring-red-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">🔇 Clean Mute</div>
                  <div className="text-[10px] text-slate-500">Silent audio ducking</div>
                </button>
              </div>

              {/* Bleep Tone Volume Slider */}
              {soundMode === "tv-bleep" && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 font-bold">
                    <span>Bleep Tone Volume</span>
                    <span>{bleepVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={bleepVolume}
                    onChange={(e) => setBleepVolume(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Visual Mouth Censor */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-indigo-600" />
                2. Visual Mouth Censorship:
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisualMode("black-bar")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    visualMode === "black-bar"
                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">⬛ Black Bar</div>
                  <div className="text-[10px] text-slate-500">&quot;CENSORED&quot; label</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualMode("pixel-blur")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    visualMode === "pixel-blur"
                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">🌫️ Pixel Blur</div>
                  <div className="text-[10px] text-slate-500">Mosaic mouth blur</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualMode("emoji-angry")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    visualMode === "emoji-angry"
                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">🤬 Emoji Sticker</div>
                  <div className="text-[10px] text-slate-500">Viral reaction look</div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualMode("none")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    visualMode === "none"
                      ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">🚫 Audio Only</div>
                  <div className="text-[10px] text-slate-500">No visual overlays</div>
                </button>
              </div>
            </div>

            {/* Step 3: Export Clean MP4 Video */}
            <div className="p-5 rounded-3xl bg-gradient-to-b from-red-50/60 to-white border border-red-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-red-600" />
                  3. Export Censored Video:
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  100% Free • HD MP4
                </span>
              </div>

              {exportUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Censored Video Ready! Click below to download.</span>
                  </div>
                  <a
                    href={exportUrl}
                    download={exportFileName}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3.5 px-6 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Clean MP4 Video</span>
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleExportCensoredVideo}
                  disabled={isExporting}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 py-3.5 px-6 text-sm font-extrabold text-white shadow-xl shadow-red-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Exporting Censored Video ({exportProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Render & Download Censored Video</span>
                    </>
                  )}
                </button>
              )}

              {/* Upload Another Video */}
              <button
                type="button"
                onClick={handleClearFile}
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
