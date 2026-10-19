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
  Sliders,
  Download,
  Film,
  Check,
  Loader2,
  Scissors,
  Clock,
  Zap,
  TrendingDown,
  Layers,
  AlertCircle,
  Eye,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface AiSilenceRemoverStudioProps {
  tool: ToolMetadata;
}

export interface SilenceSegment {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  duration: number; // in seconds
  enabled: boolean; // true = cut out, false = keep
}

export interface SpeechSegment {
  start: number;
  end: number;
  duration: number;
}

export type PresetKey = "podcast" | "vlog" | "lecture" | "aggressive" | "custom";

interface PresetConfig {
  name: string;
  description: string;
  thresholdDb: number;
  minDuration: number;
  padding: number;
}

const PRESETS: Record<Exclude<PresetKey, "custom">, PresetConfig> = {
  podcast: {
    name: "Podcast / Interview",
    description: "Tight pacing for conversations & talk shows",
    thresholdDb: -33,
    minDuration: 0.45,
    padding: 0.1,
  },
  vlog: {
    name: "YouTube Vlog",
    description: "Natural flow with balanced speech pauses",
    thresholdDb: -36,
    minDuration: 0.6,
    padding: 0.14,
  },
  lecture: {
    name: "Tutorial / Lecture",
    description: "Gentle trimmer preserving breathing pauses",
    thresholdDb: -40,
    minDuration: 0.8,
    padding: 0.2,
  },
  aggressive: {
    name: "Fast-Paced Shorts",
    description: "Zero dead-air jump-cut for TikTok & Reels",
    thresholdDb: -30,
    minDuration: 0.3,
    padding: 0.08,
  },
};

export const AiSilenceRemoverStudio: React.FC<AiSilenceRemoverStudioProps> = ({ tool }) => {
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isJumpCutMode, setIsJumpCutMode] = useState<boolean>(true);
  const [isSkippingNow, setIsSkippingNow] = useState<boolean>(false);

  // Silence Detection Tuning
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>("podcast");
  const [thresholdDb, setThresholdDb] = useState<number>(-33);
  const [minSilenceDuration, setMinSilenceDuration] = useState<number>(0.45);
  const [paddingSecs, setPaddingSecs] = useState<number>(0.1);

  // Audio Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [audioPeaks, setAudioPeaks] = useState<Float32Array | null>(null);
  const [silenceSegments, setSilenceSegments] = useState<SilenceSegment[]>([]);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Apply Preset
  const handleSelectPreset = (key: PresetKey) => {
    setSelectedPreset(key);
    if (key !== "custom") {
      const preset = PRESETS[key];
      setThresholdDb(preset.thresholdDb);
      setMinSilenceDuration(preset.minDuration);
      setPaddingSecs(preset.padding);
    }
  };

  // Handle Video Selection
  const handleFileSelected = (meta: FileMetadata) => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    const url = URL.createObjectURL(meta.file);
    setVideoUrl(url);
    setFileMeta(meta);
    setSilenceSegments([]);
    setAudioPeaks(null);
    setExportedVideoUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const handleClear = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setFileMeta(null);
    setSilenceSegments([]);
    setAudioPeaks(null);
    setExportedVideoUrl(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  // Video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      if (fileMeta?.file && (!audioPeaks || !audioBufferRef.current)) {
        analyzeAudioTrack(fileMeta.file, dur);
      }
    }
  };

  // 1. Audio Decoding & Analysis Pipeline (Web Audio API)
  const analyzeAudioTrack = async (file: File, videoDuration: number) => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setAnalysisProgress(40);

      // Web Audio Context decode
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      setAnalysisProgress(75);

      // Generate waveform peak summary for visualization (1000 points across duration)
      const rawChannel = audioBuffer.getChannelData(0);
      const totalSamples = rawChannel.length;
      const numBuckets = 800;
      const bucketSize = Math.floor(totalSamples / numBuckets);
      const peaks = new Float32Array(numBuckets);

      for (let i = 0; i < numBuckets; i++) {
        let maxVal = 0;
        const start = i * bucketSize;
        const end = Math.min(start + bucketSize, totalSamples);
        for (let j = start; j < end; j += 4) {
          const val = Math.abs(rawChannel[j]);
          if (val > maxVal) maxVal = val;
        }
        peaks[i] = maxVal;
      }
      setAudioPeaks(peaks);
      setAnalysisProgress(90);

      // Run silence segment detector on decoded buffer
      detectSilenceInAudio(audioBuffer, thresholdDb, minSilenceDuration, paddingSecs);
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    } catch (err: any) {
      console.error("Audio analysis failed:", err);
      setAnalysisError("Could not extract audio track directly. This video might not have an audio stream.");
      setIsAnalyzing(false);
    }
  };

  // 2. Silence Detection Engine
  const detectSilenceInAudio = useCallback(
    (
      audioBuffer: AudioBuffer,
      thresholdInDb: number,
      minDuration: number,
      padding: number
    ) => {
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      const totalDuration = audioBuffer.duration;

      // Slice into 30ms evaluation windows
      const windowMs = 30;
      const windowSamples = Math.floor((sampleRate * windowMs) / 1000);
      const totalWindows = Math.floor(channelData.length / windowSamples);

      // Linear amplitude threshold from dB
      // thresholdDb = 20 * log10(amp) => amp = 10^(thresholdDb/20)
      const linearThreshold = Math.pow(10, thresholdInDb / 20);

      const isSilentWindow = new Uint8Array(totalWindows);

      for (let w = 0; w < totalWindows; w++) {
        const startIdx = w * windowSamples;
        let sumSquares = 0;
        for (let s = 0; s < windowSamples; s += 2) {
          const amp = channelData[startIdx + s];
          sumSquares += amp * amp;
        }
        const rms = Math.sqrt((sumSquares * 2) / windowSamples);
        isSilentWindow[w] = rms < linearThreshold ? 1 : 0;
      }

      // Group consecutive silent windows
      const rawGaps: { start: number; end: number }[] = [];
      let inSilence = false;
      let gapStartWindow = 0;

      for (let w = 0; w < totalWindows; w++) {
        if (isSilentWindow[w] === 1 && !inSilence) {
          inSilence = true;
          gapStartWindow = w;
        } else if (isSilentWindow[w] === 0 && inSilence) {
          inSilence = false;
          const startTime = (gapStartWindow * windowMs) / 1000;
          const endTime = (w * windowMs) / 1000;
          if (endTime - startTime >= minDuration) {
            rawGaps.push({ start: startTime, end: endTime });
          }
        }
      }

      if (inSilence) {
        const startTime = (gapStartWindow * windowMs) / 1000;
        const endTime = totalDuration;
        if (endTime - startTime >= minDuration) {
          rawGaps.push({ start: startTime, end: endTime });
        }
      }

      // Apply safety padding to preserve word endings and breath
      const paddedGaps: SilenceSegment[] = [];
      let idCounter = 1;

      for (const gap of rawGaps) {
        // Silence shrinks inwards by padding (keeping more surrounding speech)
        const paddedStart = Math.min(gap.end, gap.start + padding);
        const paddedEnd = Math.max(paddedStart, gap.end - padding);
        const effectiveDur = paddedEnd - paddedStart;

        // Only keep if meaningful silence remains after padding
        if (effectiveDur >= 0.15) {
          paddedGaps.push({
            id: idCounter++,
            start: Math.round(paddedStart * 100) / 100,
            end: Math.round(paddedEnd * 100) / 100,
            duration: Math.round(effectiveDur * 100) / 100,
            enabled: true, // Cut out by default
          });
        }
      }

      setSilenceSegments(paddedGaps);
    },
    []
  );

  // Re-detect whenever sliders change if audio buffer is already cached
  useEffect(() => {
    if (audioBufferRef.current) {
      detectSilenceInAudio(audioBufferRef.current, thresholdDb, minSilenceDuration, paddingSecs);
    }
  }, [thresholdDb, minSilenceDuration, paddingSecs, detectSilenceInAudio]);

  // Derived: Active Cuts and Speech Segments (Clips to Keep)
  const activeSilenceGaps = useMemo(() => {
    return silenceSegments.filter((seg) => seg.enabled).sort((a, b) => a.start - b.start);
  }, [silenceSegments]);

  const speechSegments = useMemo<SpeechSegment[]>(() => {
    if (!duration || duration <= 0) return [];
    if (activeSilenceGaps.length === 0) {
      return [{ start: 0, end: duration, duration }];
    }

    const result: SpeechSegment[] = [];
    let currentPos = 0;

    for (const gap of activeSilenceGaps) {
      if (gap.start > currentPos) {
        result.push({
          start: currentPos,
          end: gap.start,
          duration: gap.start - currentPos,
        });
      }
      currentPos = Math.max(currentPos, gap.end);
    }

    if (currentPos < duration) {
      result.push({
        start: currentPos,
        end: duration,
        duration: duration - currentPos,
      });
    }

    return result;
  }, [duration, activeSilenceGaps]);

  // Calculation Metrics: Time Saved & Cleaned Duration
  const totalSilenceRemoved = useMemo(() => {
    return activeSilenceGaps.reduce((acc, seg) => acc + seg.duration, 0);
  }, [activeSilenceGaps]);

  const cleanedDuration = useMemo(() => {
    return Math.max(0, duration - totalSilenceRemoved);
  }, [duration, totalSilenceRemoved]);

  const percentageSaved = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.round((totalSilenceRemoved / duration) * 100));
  }, [duration, totalSilenceRemoved]);

  // 3. Smart Jump-Cut Real-Time Playback Engine
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // If Jump-Cut preview is active, detect if inside a silent gap and jump immediately!
    if (isJumpCutMode && isPlaying) {
      const activeGap = activeSilenceGaps.find(
        (gap) => time >= gap.start && time < gap.end
      );

      if (activeGap) {
        setIsSkippingNow(true);
        videoRef.current.currentTime = activeGap.end + 0.01;
        setTimeout(() => setIsSkippingNow(false), 200);
      }
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
    setCurrentTime(newTime);
  };

  const toggleGapStatus = (id: number) => {
    setSilenceSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, enabled: !seg.enabled } : seg))
    );
  };

  const enableAllGaps = () => {
    setSilenceSegments((prev) => prev.map((seg) => ({ ...seg, enabled: true })));
  };

  const disableAllGaps = () => {
    setSilenceSegments((prev) => prev.map((seg) => ({ ...seg, enabled: false })));
  };

  // 4. Render Interactive Audio Waveform with Red Silence Overlays
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || !audioPeaks || duration <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background track
    ctx.fillStyle = "#0f172a"; // Dark slate
    ctx.fillRect(0, 0, width, height);

    // Center guideline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const barCount = audioPeaks.length;
    const barWidth = width / barCount;

    // Draw Waveform Bars
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const peak = audioPeaks[i];
      const barHeight = Math.max(2, peak * (height * 0.85));
      const y = (height - barHeight) / 2;

      const barTime = (i / barCount) * duration;
      const isInsideSilence = activeSilenceGaps.some(
        (gap) => barTime >= gap.start && barTime <= gap.end
      );

      if (isInsideSilence) {
        // Red / Dead Air muted bar
        ctx.fillStyle = "rgba(239, 68, 68, 0.7)";
      } else {
        // Crisp Emerald/Cyan Speech bar
        ctx.fillStyle = "#10b981";
      }

      ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
    }

    // Draw Silence Zone Shaded Boxes with Cut Icons
    for (const gap of activeSilenceGaps) {
      const startX = (gap.start / duration) * width;
      const endX = (gap.end / duration) * width;
      const gapWidth = Math.max(2, endX - startX);

      // Red translucent strip
      ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
      ctx.fillRect(startX, 0, gapWidth, height);

      // Border markers
      ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(startX, 0, gapWidth, height);
    }

    // Draw Playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Playhead top marker
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(playheadX, 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [audioPeaks, duration, activeSilenceGaps, currentTime]);

  // Click on waveform to scrub
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || duration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = fraction * duration;
    handleSeek(targetTime);
  };

  // 5. Jump-Cut Video Export (Client-side MediaRecorder pipeline)
  const exportJumpCutVideo = async () => {
    if (!videoRef.current || speechSegments.length === 0) return;
    const video = videoRef.current;

    setIsExporting(true);
    setExportProgress(0);
    video.pause();
    setIsPlaying(false);

    try {
      // Create offscreen canvas for frame capture
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = video.videoWidth || 1280;
      exportCanvas.height = video.videoHeight || 720;
      const ctx = exportCanvas.getContext("2d")!;

      // Setup Canvas stream & Audio capture
      const canvasStream = exportCanvas.captureStream(30);

      // Try capturing audio track safely
      let combinedStream = canvasStream;
      try {
        const videoStream = (video as any).captureStream
          ? (video as any).captureStream()
          : (video as any).mozCaptureStream
          ? (video as any).mozCaptureStream()
          : null;

        if (videoStream && videoStream.getAudioTracks().length > 0) {
          videoStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
            combinedStream.addTrack(track);
          });
        }
      } catch (err) {
        console.warn("Direct stream audio capture not permitted, continuing video render", err);
      }

      // Configure MediaRecorder
      let mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000, // 6 Mbps high quality
      });
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setExportedVideoUrl(url);
        setIsExporting(false);
        setExportProgress(100);
      };

      recorder.start(250);

      // Sequentially play through only speech segments (skipping all silence!)
      let currentSegIndex = 0;
      let totalCleanedDuration = speechSegments.reduce((a, b) => a + b.duration, 0);
      let recordedSpeechSecs = 0;

      const playNextSegment = async () => {
        if (currentSegIndex >= speechSegments.length) {
          recorder.stop();
          return;
        }

        const seg = speechSegments[currentSegIndex];
        video.currentTime = seg.start;

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          video.addEventListener("seeked", onSeeked);
        });

        await video.play();

        const checkEndInterval = setInterval(() => {
          if (!recorder || recorder.state !== "recording") {
            clearInterval(checkEndInterval);
            return;
          }

          // Draw active video frame to canvas
          ctx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);

          // Calculate overall export progress
          const progressInSeg = Math.max(0, video.currentTime - seg.start);
          const currentTotal = recordedSpeechSecs + progressInSeg;
          const pct = Math.min(99, Math.round((currentTotal / totalCleanedDuration) * 100));
          setExportProgress(pct);

          if (video.currentTime >= seg.end || video.ended) {
            clearInterval(checkEndInterval);
            video.pause();
            recordedSpeechSecs += seg.duration;
            currentSegIndex++;
            playNextSegment();
          }
        }, 33); // ~30 fps
      };

      playNextSegment();
    } catch (err: any) {
      console.error("Export jump-cut failed:", err);
      setIsExporting(false);
      setAnalysisError("Export failed: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header / Dropzone */}
      {!videoUrl ? (
        <div className="space-y-6">
          <FileDropzone
            acceptedTypes={["video/*"]}
            acceptedExtensions={[".mp4", ".mov", ".mkv", ".webm"]}
            onFileSelected={handleFileSelected}
            selectedFile={fileMeta}
            onClear={handleClear}
            title="Upload Video to Auto-Remove Dead Air & Silence"
            subtitle="AI analyzes your voice track, spots hesitation pauses, and jump-cuts dead air with zero quality loss"
          />

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600 font-bold shrink-0">
                <Scissors className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Automatic Jump-Cuts</p>
                <p className="text-slate-500">Eliminate awkward gaps instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold shrink-0">
                <TrendingDown className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Save 20% to 40% Time</p>
                <p className="text-slate-500">Packs videos with dynamic energy</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">100% In-Browser Privacy</p>
                <p className="text-slate-500">Audio stays entirely on your device</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info Bar & Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white font-bold shadow-md shadow-red-500/20">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {fileMeta?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {duration > 0 ? `Original Duration: ${formatTime(duration)}` : "Loading audio..."}
                </p>
              </div>
            </div>

            <button
              onClick={handleClear}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
            >
              Change Video
            </button>
          </div>

          {/* Analysis Progress Banner */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  Analyzing Audio Waveform & Detecting Silence Gaps...
                </span>
                <span>{analysisProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          )}

          {analysisError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Audio Notice:</p>
                <p>{analysisError}</p>
              </div>
            </div>
          )}

          {/* Efficiency Summary KPI Cards */}
          {duration > 0 && !isAnalyzing && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-sm">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Original Length
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-slate-100 mt-0.5">
                  {formatTime(duration)}
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  Cleaned Length
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-emerald-800 mt-0.5">
                  {formatTime(cleanedDuration)}
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50 border border-red-200 shadow-sm">
                <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">
                  Dead Air Removed
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-red-700 mt-0.5 flex items-center gap-1">
                  <span>-{formatTime(totalSilenceRemoved)}</span>
                  <span className="text-xs font-bold text-red-500">(-{percentageSaved}%)</span>
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm">
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                  Cuts Detected
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-blue-900 mt-0.5">
                  {activeSilenceGaps.length} Pauses
                </p>
              </div>
            </div>
          )}

          {/* Main Studio Interactive Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Video Preview & Interactive Waveform */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl aspect-video flex items-center justify-center group">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                  playsInline
                />

                {/* Jump-cut Skip Overlay Badge */}
                {isSkippingNow && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-md text-white text-xs font-bold shadow-lg animate-pulse">
                    <Zap className="h-3.5 w-3.5 fill-white" />
                    <span>Jump Cut (-Silence)</span>
                  </div>
                )}

                {/* Center Play/Pause button on hover */}
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 duration-200 z-10 shadow-xl"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </button>
              </div>

              {/* Playback Controls & Jump Cut Preview Switch */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 text-white shadow-md">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-sm"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => handleSeek(0)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <div className="text-xs font-mono font-medium text-slate-300 ml-1">
                    <span className="text-white font-bold">{formatTime(currentTime)}</span>
                    <span className="text-slate-500"> / {formatTime(duration)}</span>
                  </div>
                </div>

                {/* Jump-Cut Preview Toggle */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors">
                    <input
                      type="checkbox"
                      checked={isJumpCutMode}
                      onChange={(e) => setIsJumpCutMode(e.target.checked)}
                      className="rounded border-slate-600 text-red-600 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                    />
                    <span className={isJumpCutMode ? "text-emerald-400 font-bold" : "text-slate-400"}>
                      {isJumpCutMode ? "⚡ Preview With Jump-Cuts" : "Play Normal (Raw)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Interactive Audio Waveform Canvas */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-red-600" />
                    Interactive Audio Waveform (Click to Scrub)
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                      Speech
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                      Cut Silence
                    </span>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-950">
                  <canvas
                    ref={waveformCanvasRef}
                    width={900}
                    height={110}
                    onClick={handleWaveformClick}
                    className="w-full h-24 sm:h-28 block cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Presets & Silence Threshold Tuning */}
            <div className="lg:col-span-5 space-y-5">
              {/* Preset Selector */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-red-600" />
                    Pacing Presets
                  </h3>
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    AI Auto-Tuned
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PRESETS) as Array<Exclude<PresetKey, "custom">>).map((key) => {
                    const preset = PRESETS[key];
                    const isSelected = selectedPreset === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectPreset(key)}
                        className={`p-3 text-left rounded-2xl border transition-all ${
                          isSelected
                            ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-500/25"
                            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-xs font-extrabold">{preset.name}</p>
                        <p
                          className={`text-[10px] mt-0.5 leading-tight ${
                            isSelected ? "text-red-100" : "text-slate-500"
                          }`}
                        >
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fine-Tuning Sliders */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                  <span>Fine-Tuning Controls</span>
                  {selectedPreset !== "custom" && (
                    <button
                      onClick={() => setSelectedPreset("custom")}
                      className="text-[11px] text-red-600 font-bold hover:underline"
                    >
                      Unlock Custom
                    </button>
                  )}
                </h3>

                {/* 1. Threshold dB */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">Volume Threshold</span>
                    <span className="font-mono font-bold text-red-600">{thresholdDb} dB</span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={-20}
                    step={1}
                    value={thresholdDb}
                    onChange={(e) => {
                      setSelectedPreset("custom");
                      setThresholdDb(Number(e.target.value));
                    }}
                    className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>-50 dB (Quiet Room)</span>
                    <span>-20 dB (Aggressive)</span>
                  </div>
                </div>

                {/* 2. Min Silence Duration */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">Minimum Pause Duration</span>
                    <span className="font-mono font-bold text-red-600">{minSilenceDuration}s</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={1.5}
                    step={0.05}
                    value={minSilenceDuration}
                    onChange={(e) => {
                      setSelectedPreset("custom");
                      setMinSilenceDuration(Number(e.target.value));
                    }}
                    className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.2s (Rapid Cut)</span>
                    <span>1.5s (Long Pauses Only)</span>
                  </div>
                </div>

                {/* 3. Safety Padding Buffer */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">Safety Word Padding</span>
                    <span className="font-mono font-bold text-red-600">{Math.round(paddingSecs * 1000)}ms</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.3}
                    step={0.01}
                    value={paddingSecs}
                    onChange={(e) => {
                      setSelectedPreset("custom");
                      setPaddingSecs(Number(e.target.value));
                    }}
                    className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    Keeps natural breath before and after speech so word endings never sound clipped.
                  </p>
                </div>
              </div>

              {/* Individual Silence Gap Manager Accordion */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    Detected Silence Gaps ({silenceSegments.length})
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      onClick={enableAllGaps}
                      className="text-red-600 font-bold hover:underline"
                    >
                      Cut All
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={disableAllGaps}
                      className="text-slate-500 font-bold hover:underline"
                    >
                      Keep All
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {silenceSegments.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      No silence gaps detected at current volume threshold.
                    </p>
                  ) : (
                    silenceSegments.map((seg) => (
                      <div
                        key={seg.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs border transition-colors ${
                          seg.enabled
                            ? "bg-red-50/70 border-red-200 text-red-900"
                            : "bg-white border-slate-200 text-slate-500 line-through"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px]">
                            {formatTime(seg.start)} → {formatTime(seg.end)}
                          </span>
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                            {seg.duration.toFixed(2)}s
                          </span>
                        </div>

                        <button
                          onClick={() => toggleGapStatus(seg.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            seg.enabled
                              ? "bg-red-600 text-white"
                              : "bg-slate-200 text-slate-700 no-underline"
                          }`}
                        >
                          {seg.enabled ? "Cut" : "Keep"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Export Button Section */}
              <div className="space-y-3 pt-1">
                {isExporting ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-red-900">
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        Exporting Jump-Cut Video...
                      </span>
                      <span>{exportProgress}%</span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-red-600 h-2 transition-all duration-200"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                  </div>
                ) : exportedVideoUrl ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Jump-Cut Video Rendered Successfully!
                    </div>
                    <a
                      href={exportedVideoUrl}
                      download={`${fileMeta?.name.replace(/\.[^/.]+$/, "") || "video"}-jumpcut-clean.webm`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Download Clean Video ({formatTime(cleanedDuration)})
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={exportJumpCutVideo}
                    disabled={activeSilenceGaps.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-red-600/25 transition-all hover:scale-[1.01]"
                  >
                    <Scissors className="h-4 w-4" />
                    <span>
                      Export Video Without Silence (-{formatTime(totalSilenceRemoved)})
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
