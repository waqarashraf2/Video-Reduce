"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Mic,
  Music,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Film,
  Sparkles,
  Loader2,
  AlertCircle,
  Radio,
  ChevronDown,
  ChevronUp,
  Volume2,
  Headphones,
  Layers,
} from "lucide-react";
import { formatTime, formatBytes } from "@/lib/utils";
import { useFFmpeg } from "@/lib/ffmpeg/ffmpeg-provider";
import {
  VOCAL_SPLIT_PRESETS,
  VocalSplitPreset,
  VocalSplitSettings,
  PlaybackTrackMode,
  buildLiveVocalSplitGraph,
  renderVocalSplitBuffers,
  audioBufferToWavBlob,
} from "@/lib/vocalRemoverDsp";

interface AiVocalRemoverStudioProps {
  tool: ToolMetadata;
}

export const AiVocalRemoverStudio: React.FC<AiVocalRemoverStudioProps> = ({ tool }) => {
  const { getFFmpeg, isLoaded, loadFFmpeg } = useFFmpeg();

  // File State
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);

  // Audio Analysis & Buffers
  const [rawAudioBuffer, setRawAudioBuffer] = useState<AudioBuffer | null>(null);
  const [instBuffer, setInstBuffer] = useState<AudioBuffer | null>(null);
  const [vocalBuffer, setVocalBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [processError, setProcessError] = useState<string | null>(null);

  // Playback & Track Modes
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [trackMode, setTrackMode] = useState<PlaybackTrackMode>("instrumental");

  // Presets & Tuning
  const [selectedPresetId, setSelectedPresetId] = useState<string>(VOCAL_SPLIT_PRESETS[0].id);
  const [settings, setSettings] = useState<VocalSplitSettings>(VOCAL_SPLIT_PRESETS[0].settings);
  const [showAdvancedSliders, setShowAdvancedSliders] = useState<boolean>(false);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedMediaUrl, setExportedMediaUrl] = useState<string | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string>("");
  const [exportedType, setExportedType] = useState<"video-inst" | "video-vocal" | "audio-inst" | "audio-vocal" | null>(null);

  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const connectedElementRef = useRef<HTMLMediaElement | null>(null);
  const liveDspRef = useRef<{
    disconnect: () => void;
    setMode: (m: PlaybackTrackMode) => void;
    updateSettings: (s: VocalSplitSettings) => void;
  } | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Re-usable AudioContext getter
  const getAudioContext = useCallback((): AudioContext => {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioCtxClass();
    }
    return audioCtxRef.current;
  }, []);

  // Unmount cleanup
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (liveDspRef.current) {
        try {
          liveDspRef.current.disconnect();
        } catch {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  // ObjectURL cleanup
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

  // Handle File Upload
  const handleFileSelected = async (meta: FileMetadata) => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    if (exportedMediaUrl) URL.revokeObjectURL(exportedMediaUrl);

    setFileMeta(meta);
    setExportedMediaUrl(null);
    setIsPlaying(false);
    setInstBuffer(null);
    setVocalBuffer(null);
    setProcessError(null);

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
      loadFFmpeg().catch(() => {});
    }

    const url = URL.createObjectURL(meta.file);
    setMediaUrl(url);

    setIsProcessing(true);
    setProcessStatus("Extracting multi-channel audio stream...");

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const arrayBuffer = await meta.file.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
      setRawAudioBuffer(decoded);
      setDuration(decoded.duration);

      setProcessStatus("Separating vocal and instrumental stems with neural DSP...");
      const { instrumental, vocals } = await renderVocalSplitBuffers(decoded, settings);
      setInstBuffer(instrumental);
      setVocalBuffer(vocals);
      setIsProcessing(false);
    } catch (err: any) {
      console.error("Audio decoding error:", err);
      setProcessError("Could not decode audio. Unsupported codec or corrupted stream.");
      setIsProcessing(false);
    }
  };

  const handleClearFile = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    if (exportedMediaUrl) URL.revokeObjectURL(exportedMediaUrl);
    setFileMeta(null);
    setMediaUrl(null);
    setRawAudioBuffer(null);
    setInstBuffer(null);
    setVocalBuffer(null);
    setIsPlaying(false);
    setExportedMediaUrl(null);
  };

  // Preset Selection
  const handleSelectPreset = async (preset: VocalSplitPreset) => {
    setSelectedPresetId(preset.id);
    setSettings(preset.settings);

    if (liveDspRef.current) {
      liveDspRef.current.updateSettings(preset.settings);
    }

    if (rawAudioBuffer) {
      setIsProcessing(true);
      setProcessStatus(`Calibrating for ${preset.name}...`);
      try {
        const { instrumental, vocals } = await renderVocalSplitBuffers(rawAudioBuffer, preset.settings);
        setInstBuffer(instrumental);
        setVocalBuffer(vocals);
      } catch (e) {
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Fine-tuning Sliders
  const handleUpdateSetting = async (key: keyof VocalSplitSettings, value: number) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSelectedPresetId("custom");

    if (liveDspRef.current) {
      liveDspRef.current.updateSettings(updated);
    }

    if (rawAudioBuffer) {
      try {
        const { instrumental, vocals } = await renderVocalSplitBuffers(rawAudioBuffer, updated);
        setInstBuffer(instrumental);
        setVocalBuffer(vocals);
      } catch (e) {}
    }
  };

  // Real-Time Visualizer
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

      // Dark studio canvas
      ctx.fillStyle = "#070b12";
      ctx.fillRect(0, 0, width, height);

      // Baseline
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

        const grad = ctx.createLinearGradient(0, y, 0, height);
        if (trackMode === "instrumental") {
          grad.addColorStop(0, "#10b981"); // Emerald for Music
          grad.addColorStop(1, "#047857");
        } else if (trackMode === "vocals") {
          grad.addColorStop(0, "#f59e0b"); // Amber for Vocals
          grad.addColorStop(1, "#d97706");
        } else {
          grad.addColorStop(0, "#3b82f6"); // Blue for Original
          grad.addColorStop(1, "#1d4ed8");
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, Math.max(2, barWidth - 2.5), barHeight);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, [trackMode]);

  // Live DSP Graph
  const setupLiveAudioGraph = useCallback(() => {
    const el = isVideo ? videoRef.current : audioElRef.current;
    if (!el) return;

    const ctx = getAudioContext();
    if (ctx.state === "closed") return;

    if (connectedElementRef.current !== el || !mediaSourceRef.current) {
      try {
        mediaSourceRef.current = ctx.createMediaElementSource(el);
        connectedElementRef.current = el;
      } catch (e) {}
    }

    const mediaSource = mediaSourceRef.current;
    if (!mediaSource) return;

    if (liveDspRef.current) {
      try {
        liveDspRef.current.disconnect();
      } catch {}
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyserRef.current = analyser;

    const dsp = buildLiveVocalSplitGraph(ctx, mediaSource, analyser, settings, trackMode);
    liveDspRef.current = dsp;

    analyser.connect(ctx.destination);
  }, [isVideo, trackMode, settings, getAudioContext]);

  // Play / Pause
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

  // Track Mode Switcher (Instrumental / Vocals / Original)
  const handleSwitchTrackMode = (mode: PlaybackTrackMode) => {
    setTrackMode(mode);
    if (liveDspRef.current) {
      liveDspRef.current.setMode(mode);
    }
  };

  // Seek
  const handleSeek = (timeSec: number) => {
    const el = isVideo ? videoRef.current : audioElRef.current;
    if (!el) return;
    el.currentTime = timeSec;
    setCurrentTime(timeSec);
  };

  // Export Audio Stems
  const handleExportAudio = async (type: "instrumental" | "vocals") => {
    const targetBuffer = type === "instrumental" ? instBuffer : vocalBuffer;
    if (!targetBuffer || !fileMeta) return;

    setIsExporting(true);
    setExportProgress(40);
    setProcessError(null);

    try {
      const wavBlob = audioBufferToWavBlob(targetBuffer);
      const url = URL.createObjectURL(wavBlob);
      const baseName = fileMeta.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}_${type}.wav`;

      setExportedMediaUrl(url);
      setExportedFilename(outputName);
      setExportedType(type === "instrumental" ? "audio-inst" : "audio-vocal");
      setExportProgress(100);

      const a = document.createElement("a");
      a.href = url;
      a.download = outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      setProcessError("Audio export failed: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Video with Clean Stems (MP4)
  const handleExportVideo = async (stemType: "instrumental" | "vocals") => {
    const targetBuffer = stemType === "instrumental" ? instBuffer : vocalBuffer;
    if (!targetBuffer || !fileMeta || !isVideo) return;

    setIsExporting(true);
    setExportProgress(15);
    setProcessError(null);

    try {
      const wavBlob = audioBufferToWavBlob(targetBuffer);
      setExportProgress(30);

      const ctxFfmpeg = await getFFmpeg();
      setExportProgress(50);

      const vidBytes = new Uint8Array(await fileMeta.file.arrayBuffer());
      const audioBytes = new Uint8Array(await wavBlob.arrayBuffer());

      await ctxFfmpeg.deleteFile("input_vocal_video.mp4").catch(() => {});
      await ctxFfmpeg.deleteFile("clean_stem.wav").catch(() => {});
      await ctxFfmpeg.deleteFile("output_vocal_video.mp4").catch(() => {});

      await ctxFfmpeg.writeFile("input_vocal_video.mp4", vidBytes);
      await ctxFfmpeg.writeFile("clean_stem.wav", audioBytes);
      setExportProgress(65);

      // Mux video stream + isolated stem audio track
      let exitCode = await ctxFfmpeg.exec([
        "-i",
        "input_vocal_video.mp4",
        "-i",
        "clean_stem.wav",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "256k",
        "-ac",
        "2",
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-shortest",
        "output_vocal_video.mp4",
      ]);

      if (exitCode !== 0) {
        setExportProgress(75);
        await ctxFfmpeg.deleteFile("output_vocal_video.mp4").catch(() => {});
        exitCode = await ctxFfmpeg.exec([
          "-i",
          "input_vocal_video.mp4",
          "-i",
          "clean_stem.wav",
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
          "-ac",
          "2",
          "-map",
          "0:v:0",
          "-map",
          "1:a:0",
          "-shortest",
          "output_vocal_video.mp4",
        ]);
      }

      if (exitCode !== 0) {
        throw new Error(`Video stem muxing failed with code ${exitCode}`);
      }

      const outData = await ctxFfmpeg.readFile("output_vocal_video.mp4");
      const cleanBlob = new Blob([outData as any], { type: "video/mp4" });
      const cleanUrl = URL.createObjectURL(cleanBlob);

      const baseName = fileMeta.name.replace(/\.[^/.]+$/, "");
      const finalDownloadName = `${baseName}_${stemType === "instrumental" ? "karaoke_music" : "acapella_vocals"}.mp4`;

      setExportedMediaUrl(cleanUrl);
      setExportedFilename(finalDownloadName);
      setExportedType(stemType === "instrumental" ? "video-inst" : "video-vocal");
      setExportProgress(100);

      // Auto trigger download
      const a = document.createElement("a");
      a.href = cleanUrl;
      a.download = finalDownloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      await ctxFfmpeg.deleteFile("input_vocal_video.mp4").catch(() => {});
      await ctxFfmpeg.deleteFile("clean_stem.wav").catch(() => {});
      await ctxFfmpeg.deleteFile("output_vocal_video.mp4").catch(() => {});
    } catch (err: any) {
      console.error("Video stem export failed:", err);
      setProcessError(`Video stem export error: ${err.message || "Failed to process"}.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-xl shadow-emerald-500/15">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold shadow-inner">
            <Music className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                AI Video Vocal Remover & Karaoke Maker
              </h2>
              <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                Stem Splitter
              </span>
            </div>
            <p className="text-xs text-white/85">
              Remove vocals or isolate background music from MP4 videos & songs with 100% in-browser neural DSP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-xl border border-white/20">
          <span>🎤 Vocals Split</span>
          <span>•</span>
          <span>🎵 Karaoke Music</span>
          <span>•</span>
          <span>Zero Cloud Uploads</span>
        </div>
      </div>

      {/* 2. File Upload Dropzone */}
      {!fileMeta ? (
        <div className="space-y-4">
          <FileDropzone
            onFileSelected={handleFileSelected}
            selectedFile={fileMeta}
            onClear={handleClearFile}
            acceptedTypes={["video/*", "audio/*"]}
            acceptedExtensions={[".mp4", ".mov", ".mkv", ".webm", ".mp3", ".wav", ".m4a", ".aac"]}
            title="Drop video or audio to remove vocals or isolate music"
            subtitle="Supports MP4, MOV, WebM, MKV, MP3, WAV, M4A (100% private in browser memory)"
          />

          {/* Quick Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Music className="h-4 w-4 text-emerald-600" />
                <span>Karaoke & Music Video</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Removes singing and speech, keeping 100% of the bass, beats, and background music.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Mic className="h-4 w-4 text-amber-600" />
                <span>Acapella & Speech Isolator</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mutes background music, isolating speech and clean vocal dialogue for sampling and podcasts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Film className="h-4 w-4 text-indigo-600" />
                <span>Video Kept Intact</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Download the full video with the music-only or vocal-only track preserved in HD MP4.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active File Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-black">
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

          {/* Main Grid Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Preset Cards & Export Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Presets Card */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    Select Stem Separation Mode:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Dual Stems
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {VOCAL_SPLIT_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500"
                            : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black">{preset.name}</span>
                          {preset.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                isSelected ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"
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

                {/* Fine-Tuning Collapsible */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSliders(!showAdvancedSliders)}
                    className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                      Fine-Tune Separation Parameters
                    </span>
                    {showAdvancedSliders ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {showAdvancedSliders && (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      {/* Vocal Suppression */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Vocal Suppression Strength</span>
                          <span className="font-mono text-emerald-600">{settings.vocalSuppression}%</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={100}
                          step={2}
                          value={settings.vocalSuppression}
                          onChange={(e) => handleUpdateSetting("vocalSuppression", Number(e.target.value))}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Bass Preservation */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Bass & Kick Drum Preservation</span>
                          <span className="font-mono text-emerald-600">{settings.bassPreservation}%</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          step={5}
                          value={settings.bassPreservation}
                          onChange={(e) => handleUpdateSetting("bassPreservation", Number(e.target.value))}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Vocal Clarity */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">Isolated Vocal Articulation</span>
                          <span className="font-mono text-emerald-600">{settings.vocalClarity}%</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          step={5}
                          value={settings.vocalClarity}
                          onChange={(e) => handleUpdateSetting("vocalClarity", Number(e.target.value))}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Export Action Card (VIDEO PROMINENT) */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 block">
                  Export Separated Media:
                </span>

                {isExporting ? (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                        Rendering Clean Media...
                      </span>
                      <span>{exportProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 transition-all duration-200"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                  </div>
                ) : exportedMediaUrl ? (
                  <div className="space-y-2.5">
                    <a
                      href={exportedMediaUrl}
                      download={exportedFilename}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>
                        Download {exportedFilename.endsWith(".mp4") ? "Video (MP4)" : "Audio (WAV)"}
                      </span>
                    </a>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                      <span>✅ Ready: {exportedFilename}</span>
                      <button
                        type="button"
                        onClick={() => setExportedMediaUrl(null)}
                        className="text-emerald-600 hover:underline"
                      >
                        Export other track
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isVideo ? (
                      <>
                        {/* Primary Video Export Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleExportVideo("instrumental")}
                            disabled={isProcessing || isExporting}
                            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                          >
                            <Film className="h-4 w-4" />
                            <span>Download Music Video (MP4)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportVideo("vocals")}
                            disabled={isProcessing || isExporting}
                            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
                          >
                            <Mic className="h-4 w-4 text-amber-400" />
                            <span>Download Vocals Video (MP4)</span>
                          </button>
                        </div>

                        {/* Secondary Audio Only Options */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] text-slate-500 font-semibold">
                          <span>Or extract audio tracks:</span>
                          <button
                            type="button"
                            onClick={() => handleExportAudio("instrumental")}
                            className="text-emerald-700 hover:underline"
                          >
                            Music Track (WAV)
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleExportAudio("vocals")}
                            className="text-amber-700 hover:underline"
                          >
                            Vocals Track (WAV)
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleExportAudio("instrumental")}
                          disabled={isProcessing || isExporting}
                          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                          <Music className="h-4 w-4" />
                          <span>Download Instrumental (WAV)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportAudio("vocals")}
                          disabled={isProcessing || isExporting}
                          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all disabled:opacity-50"
                        >
                          <Mic className="h-4 w-4 text-amber-400" />
                          <span>Download Vocals (WAV)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Video Player & 3-Way Live Monitor */}
            <div className="lg:col-span-5 space-y-4 sticky top-20">
              <div className="p-5 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Radio className="h-4 w-4 text-emerald-500" />
                    Live Video Monitor
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    Real-time DSP
                  </span>
                </div>

                {/* Media Preview Box */}
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
                      <Headphones className="h-10 w-10 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-400">Audio Track Active</span>
                    </div>
                  ) : null}

                  {/* Mode Badge in Player Top-Right */}
                  <div className="absolute top-2.5 right-2.5 pointer-events-none">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md ${
                        trackMode === "instrumental"
                          ? "bg-emerald-500 text-white shadow-emerald-500/30"
                          : trackMode === "vocals"
                          ? "bg-amber-500 text-white shadow-amber-500/30"
                          : "bg-blue-600 text-white shadow-blue-600/30"
                      }`}
                    >
                      {trackMode === "instrumental"
                        ? "🎵 Music Only"
                        : trackMode === "vocals"
                        ? "🎤 Vocals Only"
                        : "🔊 Original Mix"}
                    </span>
                  </div>
                </div>

                {/* Spectrum Visualizer */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>SPECTRUM MONITOR</span>
                    <span>
                      {trackMode === "instrumental"
                        ? "VOCALS CUT: -30dB"
                        : trackMode === "vocals"
                        ? "MUSIC MUTED"
                        : "FULL STEREO"}
                    </span>
                  </div>
                  <canvas
                    ref={visualizerCanvasRef}
                    width={400}
                    height={70}
                    className="w-full h-16 rounded-xl bg-slate-900 border border-slate-800 block"
                  />
                </div>

                {/* 3-Way Stem Switcher (Music vs Vocals vs Original) */}
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 block">
                    Audition Separated Track in Live Video:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSwitchTrackMode("instrumental")}
                      className={`py-2 px-1 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                        trackMode === "instrumental"
                          ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <Music className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Music Only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwitchTrackMode("vocals")}
                      className={`py-2 px-1 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                        trackMode === "vocals"
                          ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-400"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Vocals Only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwitchTrackMode("original")}
                      className={`py-2 px-1 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                        trackMode === "original"
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-400"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span className="text-[10px]">Original</span>
                    </button>
                  </div>
                </div>

                {/* Player Transport Controls */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Pause Video</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-white" />
                          <span>Play & Audition Video</span>
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
                      className="flex-1 accent-emerald-600 h-1 bg-slate-800 rounded-lg cursor-pointer"
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
