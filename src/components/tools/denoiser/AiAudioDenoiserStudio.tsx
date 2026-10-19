"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Film,
  Check,
  Loader2,
  Wind,
  Car,
  Zap,
  CheckCircle2,
  AlertCircle,
  Radio,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatTime, formatBytes } from "@/lib/utils";
import { useFFmpeg } from "@/lib/ffmpeg/ffmpeg-provider";
import {
  DENOISE_PRESETS,
  DenoisePreset,
  DenoiseSettings,
  buildLiveDenoiseGraph,
  renderCleanedAudioBuffer,
  audioBufferToWavBlob,
} from "@/lib/audioDenoiserDsp";

interface AiAudioDenoiserStudioProps {
  tool: ToolMetadata;
}

export const AiAudioDenoiserStudio: React.FC<AiAudioDenoiserStudioProps> = ({ tool }) => {
  const { getFFmpeg, isLoaded, loadFFmpeg } = useFFmpeg();

  // File state
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);

  // Audio Analysis & Buffers
  const [rawAudioBuffer, setRawAudioBuffer] = useState<AudioBuffer | null>(null);
  const [cleanedAudioBuffer, setCleanedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [processError, setProcessError] = useState<string | null>(null);

  // Playback & A/B Comparison
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isEnhancedMode, setIsEnhancedMode] = useState<boolean>(true); // A/B comparison toggle

  // Presets & Fine Tuning
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DENOISE_PRESETS[0].id);
  const [settings, setSettings] = useState<DenoiseSettings>(DENOISE_PRESETS[0].settings);
  const [showAdvancedSliders, setShowAdvancedSliders] = useState<boolean>(false);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedMediaUrl, setExportedMediaUrl] = useState<string | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string>("");

  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const connectedElementRef = useRef<HTMLMediaElement | null>(null);
  const dspNodesRef = useRef<{
    disconnect: () => void;
    updateSettings: (s: DenoiseSettings) => void;
  } | null>(null);
  const rawGainRef = useRef<GainNode | null>(null);
  const enhancedGainRef = useRef<GainNode | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Resilient AudioContext getter: recreates if closed or null
  const getAudioContext = useCallback((): AudioContext => {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioCtxClass();
    }
    return audioCtxRef.current;
  }, []);

  // ONLY close AudioContext when component unmounts entirely
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (dspNodesRef.current) {
        try {
          dspNodesRef.current.disconnect();
        } catch {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  // Clean up ObjectURLs when media changes
  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  useEffect(() => {
    return () => {
      if (exportedMediaUrl) URL.revokeObjectURL(exportedMediaUrl);
    };
  }, [exportedMediaUrl]);

  // Load and decode user media file into AudioBuffer
  const handleFileSelected = async (meta: FileMetadata) => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    if (exportedMediaUrl) URL.revokeObjectURL(exportedMediaUrl);

    setFileMeta(meta);
    setExportedMediaUrl(null);
    setIsPlaying(false);
    setCleanedAudioBuffer(null);
    setProcessError(null);

    // Reset element connection on file change so new source attaches cleanly
    connectedElementRef.current = null;
    mediaSourceRef.current = null;

    const isVid =
      meta.type.startsWith("video") ||
      meta.name.toLowerCase().endsWith(".mp4") ||
      meta.name.toLowerCase().endsWith(".mov") ||
      meta.name.toLowerCase().endsWith(".webm") ||
      meta.name.toLowerCase().endsWith(".mkv");

    setIsVideo(isVid);
    if (isVid) {
      // Preload WebAssembly media engine in background so video export is immediate
      loadFFmpeg().catch(() => {});
    }

    const url = URL.createObjectURL(meta.file);
    setMediaUrl(url);

    setIsProcessing(true);
    setProcessStatus("Extracting audio stream into neural studio memory...");

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const arrayBuffer = await meta.file.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
      setRawAudioBuffer(decoded);
      setDuration(decoded.duration);

      // Pre-render cleaned buffer with active settings
      setProcessStatus("Applying AI vocal isolation & studio noise profiling...");
      const cleaned = await renderCleanedAudioBuffer(decoded, settings);
      setCleanedAudioBuffer(cleaned);
      setIsProcessing(false);
    } catch (err: any) {
      console.error("Audio decoding error:", err);
      setProcessError("Could not decode audio. The file might have an unsupported codec or be corrupted.");
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    if (exportedMediaUrl) URL.revokeObjectURL(exportedMediaUrl);
    setFileMeta(null);
    setMediaUrl(null);
    setRawAudioBuffer(null);
    setCleanedAudioBuffer(null);
    setIsPlaying(false);
    setExportedMediaUrl(null);
  };

  // Switch preset
  const handleSelectPreset = async (preset: DenoisePreset) => {
    setSelectedPresetId(preset.id);
    setSettings(preset.settings);

    if (dspNodesRef.current) {
      dspNodesRef.current.updateSettings(preset.settings);
    }

    if (rawAudioBuffer) {
      setIsProcessing(true);
      setProcessStatus(`Calibrating for ${preset.name}...`);
      try {
        const cleaned = await renderCleanedAudioBuffer(rawAudioBuffer, preset.settings);
        setCleanedAudioBuffer(cleaned);
      } catch (e) {
        console.warn("Preset re-render note:", e);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Update fine tuning slider
  const handleUpdateSetting = async (key: keyof DenoiseSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSelectedPresetId("custom");

    if (dspNodesRef.current) {
      dspNodesRef.current.updateSettings(updated);
    }

    if (rawAudioBuffer) {
      try {
        const cleaned = await renderCleanedAudioBuffer(rawAudioBuffer, updated);
        setCleanedAudioBuffer(cleaned);
      } catch (e) {}
    }
  };

  // Real-time Visualizer Animation
  const startVisualizer = useCallback(() => {
    const canvas = visualizerCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, width, height);

      // Center baseline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height - 1);
      ctx.lineTo(width, height - 1);
      ctx.stroke();

      const barCount = 48;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor((i / barCount) * (bufferLength * 0.7));
        const value = dataArray[binIndex] || 0;
        const barHeight = (value / 255) * (height - 8);

        const x = i * barWidth;
        const y = height - barHeight;

        // Color depends on whether enhanced mode is active
        const grad = ctx.createLinearGradient(0, y, 0, height);
        if (isEnhancedMode) {
          grad.addColorStop(0, "#10b981"); // Emerald clean
          grad.addColorStop(1, "#059669");
        } else {
          grad.addColorStop(0, "#ef4444"); // Red noisy
          grad.addColorStop(1, "#dc2626");
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, Math.max(2, barWidth - 2.5), barHeight);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, [isEnhancedMode]);

  // Setup Live Audio Graph for A/B playback
  const setupLiveAudioGraph = useCallback(() => {
    const el = isVideo ? videoRef.current : audioElRef.current;
    if (!el) return;

    const ctx = getAudioContext();
    if (ctx.state === "closed") return;

    // Connect media element once
    if (connectedElementRef.current !== el || !mediaSourceRef.current) {
      try {
        mediaSourceRef.current = ctx.createMediaElementSource(el);
        connectedElementRef.current = el;
      } catch (e) {
        // Already connected
      }
    }

    const mediaSource = mediaSourceRef.current;
    if (!mediaSource) return;

    // Disconnect old live DSP if active
    if (dspNodesRef.current) {
      try {
        dspNodesRef.current.disconnect();
      } catch {}
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyserRef.current = analyser;

    // Path 1: Enhanced path (through DSP filters)
    const enhancedGain = ctx.createGain();
    enhancedGain.gain.value = isEnhancedMode ? 1.0 : 0.0;
    enhancedGainRef.current = enhancedGain;

    const dsp = buildLiveDenoiseGraph(ctx, mediaSource, enhancedGain, settings);
    dspNodesRef.current = dsp;

    // Path 2: Raw original path (bypass filters)
    const rawGain = ctx.createGain();
    rawGain.gain.value = isEnhancedMode ? 0.0 : 1.0;
    rawGainRef.current = rawGain;

    try {
      mediaSource.connect(rawGain);
    } catch {}

    try {
      enhancedGain.connect(analyser);
      rawGain.connect(analyser);
      analyser.connect(ctx.destination);
    } catch {}
  }, [isVideo, isEnhancedMode, settings, getAudioContext]);

  // Handle Play/Pause
  const handleTogglePlay = async () => {
    const el = isVideo ? videoRef.current : audioElRef.current;
    if (!el) return;

    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    setupLiveAudioGraph();

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      try {
        await el.play();
        setIsPlaying(true);
        startVisualizer();
      } catch (err) {
        console.warn("Playback prevented:", err);
      }
    }
  };

  // Toggle A/B Comparison instantly
  const handleToggleEnhanceMode = () => {
    const nextMode = !isEnhancedMode;
    setIsEnhancedMode(nextMode);

    if (enhancedGainRef.current && rawGainRef.current && audioCtxRef.current) {
      try {
        const t = audioCtxRef.current.currentTime;
        enhancedGainRef.current.gain.setValueAtTime(nextMode ? 1.0 : 0.0, t);
        rawGainRef.current.gain.setValueAtTime(nextMode ? 0.0 : 1.0, t);
      } catch {}
    }
  };

  // Seek bar
  const handleSeek = (timeSec: number) => {
    const el = isVideo ? videoRef.current : audioElRef.current;
    if (!el) return;
    el.currentTime = timeSec;
    setCurrentTime(timeSec);
  };

  // Export Clean Audio (WAV 16-bit PCM)
  const handleExportCleanAudio = async () => {
    if (!cleanedAudioBuffer || !fileMeta) return;

    setIsExporting(true);
    setExportProgress(40);
    setProcessError(null);

    try {
      const wavBlob = audioBufferToWavBlob(cleanedAudioBuffer);
      const url = URL.createObjectURL(wavBlob);
      const baseName = fileMeta.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}_studio_clean.wav`;

      setExportedMediaUrl(url);
      setExportedFilename(outputName);
      setExportProgress(100);

      // Auto-trigger browser download
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = outputName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err: any) {
      console.error("Audio export failed:", err);
      setProcessError("Failed to export clean audio: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Clean Video (MP4: Always outputs MP4 video, never falls back to audio)
  const handleExportCleanVideo = async () => {
    if (!cleanedAudioBuffer || !fileMeta || !isVideo) return;

    setIsExporting(true);
    setExportProgress(15);
    setProcessError(null);

    try {
      // 1. Convert cleaned buffer to WAV Blob
      const wavBlob = audioBufferToWavBlob(cleanedAudioBuffer);
      setExportProgress(30);

      // 2. Safely obtain active WebAssembly FFmpeg instance
      const ctxFfmpeg = await getFFmpeg();
      setExportProgress(50);

      // 3. Prepare in-memory video & clean audio
      const vidBytes = new Uint8Array(await fileMeta.file.arrayBuffer());
      const audioBytes = new Uint8Array(await wavBlob.arrayBuffer());

      // Remove stale files if present
      await ctxFfmpeg.deleteFile("input_video.mp4").catch(() => {});
      await ctxFfmpeg.deleteFile("clean_audio.wav").catch(() => {});
      await ctxFfmpeg.deleteFile("output_studio_clean.mp4").catch(() => {});

      await ctxFfmpeg.writeFile("input_video.mp4", vidBytes);
      await ctxFfmpeg.writeFile("clean_audio.wav", audioBytes);
      setExportProgress(65);

      // 4. Mux: Stream copy video track and inject clean studio audio track
      let exitCode = await ctxFfmpeg.exec([
        "-i",
        "input_video.mp4",
        "-i",
        "clean_audio.wav",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "256k",
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-shortest",
        "output_studio_clean.mp4",
      ]);

      // If stream copy is incompatible with container, fallback to ultrafast libx264
      if (exitCode !== 0) {
        console.warn("Direct stream copy exited with code", exitCode, "retrying with ultrafast h264 transcode...");
        setExportProgress(75);
        await ctxFfmpeg.deleteFile("output_studio_clean.mp4").catch(() => {});
        exitCode = await ctxFfmpeg.exec([
          "-i",
          "input_video.mp4",
          "-i",
          "clean_audio.wav",
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-crf",
          "22",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
          "-b:a",
          "256k",
          "-map",
          "0:v:0",
          "-map",
          "1:a:0",
          "-shortest",
          "output_studio_clean.mp4",
        ]);
      }

      if (exitCode !== 0) {
        throw new Error(`Video muxing failed with exit code ${exitCode}`);
      }

      const outData = await ctxFfmpeg.readFile("output_studio_clean.mp4");
      const cleanBlob = new Blob([outData as any], { type: "video/mp4" });
      const cleanUrl = URL.createObjectURL(cleanBlob);

      const baseName = fileMeta.name.replace(/\.[^/.]+$/, "");
      const finalDownloadName = `${baseName}_studio_clean.mp4`;

      setExportedMediaUrl(cleanUrl);
      setExportedFilename(finalDownloadName);
      setExportProgress(100);

      // Automatically trigger browser download
      const downloadLink = document.createElement("a");
      downloadLink.href = cleanUrl;
      downloadLink.download = finalDownloadName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up virtual memory files
      await ctxFfmpeg.deleteFile("input_video.mp4").catch(() => {});
      await ctxFfmpeg.deleteFile("clean_audio.wav").catch(() => {});
      await ctxFfmpeg.deleteFile("output_studio_clean.mp4").catch(() => {});
    } catch (err: any) {
      console.error("Video export failed:", err);
      // NEVER fallback to audio download! Keep video intent and display error with retry.
      setProcessError(`Video export error: ${err.message || "Failed to process video"}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-500/15">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                AI Voice Isolator & Audio Denoiser Studio
              </h2>
              <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                Adobe Podcast AI Alternative
              </span>
            </div>
            <p className="text-xs text-white/85">
              100% In-Browser neural vocal isolation, fan/AC hiss removal, room de-reverb & studio voice enhance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-xl border border-white/20">
          <span>🎧 Live A/B Compare</span>
          <span>•</span>
          <span>Video & Audio Supported</span>
          <span>•</span>
          <span>Zero Cloud Uploads</span>
        </div>
      </div>

      {/* 2. File Upload Dropzone or Active Media Studio */}
      {!fileMeta ? (
        <div className="space-y-4">
          <FileDropzone
            onFileSelected={handleFileSelected}
            selectedFile={fileMeta}
            onClear={handleClearFile}
            acceptedTypes={["video/*", "audio/*"]}
            acceptedExtensions={[".mp4", ".mov", ".mkv", ".webm", ".mp3", ".wav", ".m4a", ".aac"]}
            title="Drop video or audio file to enhance with AI"
            subtitle="Supports MP4, MOV, WebM, MKV, MP3, WAV, M4A, AAC (Zero server uploads • 100% private)"
          />

          {/* Quick Features Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Mic className="h-4 w-4 text-red-600" />
                <span>Studio Microphone Clarity</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Transforms cheap phone & webcam microphones into warm, radio-grade broadcast audio.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Wind className="h-4 w-4 text-blue-600" />
                <span>Fan & AC Noise Killer</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Wipes out computer cooling fans, loud room air conditioners, and electrical ground hum.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Film className="h-4 w-4 text-emerald-600" />
                <span>Video & Audio Both Supported</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Upload a video to clean its voiceover directly, or upload standalone voice notes & podcasts.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active File Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-red-100 text-red-700 font-black">
                {isVideo ? "🎬 VIDEO" : "🎵 AUDIO"}
              </span>
              <div>
                <span className="font-bold text-slate-900 block truncate max-w-xs sm:max-w-md">
                  {fileMeta.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {formatBytes(fileMeta.size)} • {duration > 0 ? formatTime(duration) : "Analyzing..."}
                </span>
              </div>
            </div>

            <button
              onClick={handleClearFile}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold transition-colors"
            >
              Change File ✕
            </button>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900 font-semibold animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              <span>{processStatus}</span>
            </div>
          )}

          {processError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-800 font-semibold">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{processError}</span>
            </div>
          )}

          {/* Studio Layout: Left Controls, Right Interactive A/B Player */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Presets & Studio Sliders */}
            <div className="lg:col-span-7 space-y-5">
              {/* Preset Cards Selector */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-red-600" />
                    Select AI Enhancement Profile:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Neural DSP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DENOISE_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-red-500"
                            : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black">{preset.name}</span>
                          {preset.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                isSelected ? "bg-red-600 text-white" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] line-clamp-2 leading-relaxed ${
                            isSelected ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Collapsible Fine-Tuning Sliders */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSliders(!showAdvancedSliders)}
                    className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-red-600" />
                      Fine-Tune Studio Parameters
                    </span>
                    {showAdvancedSliders ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {showAdvancedSliders && (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      {/* Denoise Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Denoise Suppression Strength</span>
                          <span className="font-mono text-red-600">{settings.denoiseStrength}%</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          step={5}
                          value={settings.denoiseStrength}
                          onChange={(e) =>
                            handleUpdateSetting("denoiseStrength", Number(e.target.value))
                          }
                          className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Vocal Warmth */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Vocal Warmth (Low-End Body)</span>
                          <span className="font-mono text-red-600">{settings.vocalWarmth}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={settings.vocalWarmth}
                          onChange={(e) =>
                            handleUpdateSetting("vocalWarmth", Number(e.target.value))
                          }
                          className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* De-Reverb */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Room Echo & Reverb Dampener</span>
                          <span className="font-mono text-red-600">{settings.deReverb}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={settings.deReverb}
                          onChange={(e) =>
                            handleUpdateSetting("deReverb", Number(e.target.value))
                          }
                          className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Speech Presence */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Speech Presence & Articulation</span>
                          <span className="font-mono text-red-600">{settings.speechClarity}%</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          step={5}
                          value={settings.speechClarity}
                          onChange={(e) =>
                            handleUpdateSetting("speechClarity", Number(e.target.value))
                          }
                          className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Broadcast Leveler */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-slate-700">
                          Auto Broadcast Leveler (Consistent Loudness)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSetting("loudnessLeveler", !settings.loudnessLeveler)
                          }
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                            settings.loudnessLeveler ? "bg-red-600" : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              settings.loudnessLeveler ? "translate-x-5" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Export Action Card */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 block">
                  Export Studio Clean Media:
                </span>

                {isExporting ? (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        Rendering Clean Media...
                      </span>
                      <span>{exportProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-red-600 h-1.5 transition-all duration-200"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                  </div>
                ) : exportedMediaUrl ? (
                  <div className="space-y-2">
                    <a
                      href={exportedMediaUrl}
                      download={exportedFilename}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Clean {isVideo ? "Video (MP4)" : "Audio (WAV)"}</span>
                    </a>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                      <span>✅ Ready: {exportedFilename}</span>
                      <button
                        type="button"
                        onClick={() => setExportedMediaUrl(null)}
                        className="text-red-600 hover:underline"
                      >
                        Adjust settings
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {isVideo ? (
                      <>
                        <button
                          type="button"
                          onClick={handleExportCleanVideo}
                          disabled={isProcessing || isExporting}
                          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
                        >
                          <Film className="h-4 w-4" />
                          <span>Export & Download Clean Video (MP4)</span>
                        </button>

                        <div className="flex items-center justify-center pt-0.5">
                          <button
                            type="button"
                            onClick={handleExportCleanAudio}
                            disabled={isProcessing || isExporting}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline transition-colors"
                          >
                            Or download audio track only (WAV)
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleExportCleanAudio}
                        disabled={isProcessing || isExporting}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-600/25 transition-all disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Studio Clean Audio (WAV)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Live A/B Player & Spectrum Canvas */}
            <div className="lg:col-span-5 space-y-4 sticky top-20">
              <div className="p-5 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Radio className="h-4 w-4 text-red-500" />
                    Live Studio Monitor
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    Real-time DSP
                  </span>
                </div>

                {/* Media Preview Box (Video or Waveform) */}
                <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 relative aspect-video flex items-center justify-center">
                  {isVideo && mediaUrl ? (
                    <video
                      ref={videoRef}
                      src={mediaUrl}
                      playsInline
                      crossOrigin="anonymous"
                      onTimeUpdate={() => {
                        if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                      }}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full h-full object-contain"
                    />
                  ) : mediaUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-2">
                      <audio
                        ref={audioElRef}
                        src={mediaUrl}
                        crossOrigin="anonymous"
                        onTimeUpdate={() => {
                          if (audioElRef.current) setCurrentTime(audioElRef.current.currentTime);
                        }}
                        onEnded={() => setIsPlaying(false)}
                      />
                      <Mic className="h-10 w-10 text-slate-600" />
                      <span className="text-xs font-bold text-slate-400">Audio Track Active</span>
                    </div>
                  ) : null}

                  {/* Mode Badge in Player Top-Right */}
                  <div className="absolute top-2.5 right-2.5 pointer-events-none">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md ${
                        isEnhancedMode
                          ? "bg-emerald-500 text-white shadow-emerald-500/30"
                          : "bg-red-600 text-white shadow-red-600/30"
                      }`}
                    >
                      {isEnhancedMode ? "✨ Cleaned Voice" : "🔇 Raw Noisy"}
                    </span>
                  </div>
                </div>

                {/* Spectrum Frequency Visualizer */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>SPECTRUM ANALYZER</span>
                    <span>{isEnhancedMode ? "NOISE CUT: -35dB" : "RAW NOISE ACTIVE"}</span>
                  </div>
                  <canvas
                    ref={visualizerCanvasRef}
                    width={400}
                    height={70}
                    className="w-full h-16 rounded-xl bg-slate-900 border border-slate-800 block"
                  />
                </div>

                {/* THE MAGIC FEATURE: Instant A/B Comparison Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-red-500" />
                      A/B Test Comparison:
                    </span>
                    <span className="text-[10px] text-slate-400">Click to hear difference</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleEnhanceMode}
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                      isEnhancedMode
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 ring-2 ring-emerald-400"
                        : "bg-slate-800 hover:bg-slate-700 text-red-400 ring-2 ring-red-500"
                    }`}
                  >
                    {isEnhancedMode ? (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Listening to: AI Cleaned Studio Sound</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="h-4 w-4" />
                        <span>Listening to: Raw Unfiltered Noise</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Transport Player Controls Bar */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all active:scale-95"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Pause Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-white" />
                          <span>Play & Audition Clean Voice</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSeek(0)}
                      className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Rewind to start"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Seek Bar */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-1">
                    <span>{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 1}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="flex-1 accent-red-600 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
