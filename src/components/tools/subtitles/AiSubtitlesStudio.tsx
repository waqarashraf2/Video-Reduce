"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Type,
  Palette,
  Sliders,
  Download,
  FileText,
  FileCode,
  Plus,
  Trash2,
  Clock,
  Check,
  Wand2,
  Film,
  Layers,
  ArrowRight,
  Maximize2,
  Loader2,
  Upload,
  Mic,
  AlertCircle,
  FileUp,
  Move,
  Scissors,
  Flame,
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CornerDownRight,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

export interface SubtitleSegment {
  id: string;
  start: number;
  end: number;
  text: string;
}

export type CreatorPreset =
  | "hormozi"
  | "beast"
  | "submagic"
  | "abdaal"
  | "comic"
  | "minimal"
  | "custom";

export type FontChoice =
  | "Anton"
  | "Bebas Neue"
  | "Bangers"
  | "Montserrat"
  | "Poppins"
  | "Outfit"
  | "Inter";

export type AnimationMode = "karaoke" | "bounce" | "fade" | "classic";

export function getFontConfig(font: FontChoice) {
  switch (font) {
    case "Bangers":
      return { weight: "400", fallback: "Impact, 'Arial Black', sans-serif" };
    case "Anton":
      return { weight: "400", fallback: "Impact, 'Arial Black', sans-serif" };
    case "Bebas Neue":
      return { weight: "400", fallback: "Impact, 'Arial Black', sans-serif" };
    case "Montserrat":
      return { weight: "900", fallback: "'Arial Black', sans-serif" };
    case "Poppins":
      return { weight: "900", fallback: "'Arial Black', sans-serif" };
    case "Outfit":
      return { weight: "900", fallback: "'Arial Black', sans-serif" };
    case "Inter":
      return { weight: "800", fallback: "sans-serif" };
    default:
      return { weight: "800", fallback: "sans-serif" };
  }
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}

interface AiSubtitlesStudioProps {
  tool: ToolMetadata;
}

// Robust parser for both standard .SRT and .VTT files
function parseSrtOrVtt(content: string): SubtitleSegment[] {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const segments: SubtitleSegment[] = [];
  let currentStart = 0;
  let currentEnd = 0;
  let currentText: string[] = [];
  let isParsing = false;

  const timeRegex = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (isParsing && currentText.length > 0) {
        segments.push({
          id: String(Date.now() + segments.length + Math.random()),
          start: currentStart,
          end: currentEnd,
          text: currentText.join(" "),
        });
        currentText = [];
        isParsing = false;
      }
      continue;
    }

    const match = line.match(timeRegex);
    if (match) {
      if (isParsing && currentText.length > 0) {
        segments.push({
          id: String(Date.now() + segments.length + Math.random()),
          start: currentStart,
          end: currentEnd,
          text: currentText.join(" "),
        });
        currentText = [];
      }

      const parseSecs = (h: string | undefined, m: string, s: string, ms: string) => {
        const hours = h ? parseInt(h, 10) : 0;
        const mins = parseInt(m, 10);
        const secs = parseInt(s, 10);
        const millis = parseInt(ms, 10);
        return hours * 3600 + mins * 60 + secs + millis / 1000;
      };

      currentStart = parseSecs(match[1], match[2], match[3], match[4]);
      currentEnd = parseSecs(match[5], match[6], match[7], match[8]);
      isParsing = true;
    } else if (isParsing) {
      const cleanLine = line.replace(/<[^>]+>/g, "").trim();
      if (cleanLine && isNaN(Number(cleanLine))) {
        currentText.push(cleanLine);
      }
    }
  }

  if (isParsing && currentText.length > 0) {
    segments.push({
      id: String(Date.now() + segments.length + Math.random()),
      start: currentStart,
      end: currentEnd,
      text: currentText.join(" "),
    });
  }

  return segments;
}

export const AiSubtitlesStudio: React.FC<AiSubtitlesStudioProps> = ({ tool }) => {
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Subtitles State
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState(0);
  const [transcribeStatus, setTranscribeStatus] = useState<string>("");
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  // Creator Presets & Styling State
  const [preset, setPreset] = useState<CreatorPreset>("comic");
  const [fontFamily, setFontFamily] = useState<FontChoice>("Bangers");
  const [fontSize, setFontSize] = useState<number>(40);
  const [textColor, setTextColor] = useState<string>("#FFFFFF");
  const [highlightColor, setHighlightColor] = useState<string>("#ffb700");
  const [strokeColor, setStrokeColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [shadowBlur, setShadowBlur] = useState<number>(8);
  const [tiltAngle, setTiltAngle] = useState<number>(3);
  const [isUppercase, setIsUppercase] = useState<boolean>(true);
  const [hasBackgroundBox, setHasBackgroundBox] = useState<boolean>(false);
  const [boxBgColor, setBoxBgColor] = useState<string>("rgba(0, 0, 0, 0.75)");
  const [animationMode, setAnimationMode] = useState<AnimationMode>("karaoke");

  // On-Screen Drag & Drop Position (Percentages 0% to 100%)
  const [posX, setPosX] = useState<number>(50); // horizontal center
  const [posY, setPosY] = useState<number>(78); // near bottom
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const subtitleOverlayRef = useRef<HTMLDivElement>(null);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const srtFileInputRef = useRef<HTMLInputElement>(null);
  const isRecordingRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Dragging mechanics on video overlay
  const dragStartRef = useRef<{ startX: number; startY: number; initPosX: number; initPosY: number }>({
    startX: 0,
    startY: 0,
    initPosX: 50,
    initPosY: 78,
  });

  // Apply Preset configurations
  const applyPreset = useCallback((p: CreatorPreset) => {
    setPreset(p);
    switch (p) {
      case "hormozi":
        setFontFamily("Anton");
        setTextColor("#FFFFFF");
        setHighlightColor("#22C55E"); // Electric lime green
        setStrokeColor("#000000");
        setStrokeWidth(5);
        setShadowBlur(6);
        setTiltAngle(-2);
        setIsUppercase(true);
        setHasBackgroundBox(false);
        setAnimationMode("karaoke");
        setFontSize(40);
        break;
      case "beast":
        setFontFamily("Bebas Neue");
        setTextColor("#FFFFFF");
        setHighlightColor("#FACC15"); // MrBeast Yellow
        setStrokeColor("#000000");
        setStrokeWidth(5);
        setShadowBlur(8);
        setTiltAngle(0);
        setIsUppercase(true);
        setHasBackgroundBox(false);
        setAnimationMode("karaoke");
        setFontSize(44);
        break;
      case "submagic":
        setFontFamily("Montserrat");
        setTextColor("#FFFFFF");
        setHighlightColor("#EC4899"); // Hot Pink
        setStrokeColor("#0B132B");
        setStrokeWidth(3);
        setShadowBlur(14);
        setTiltAngle(0);
        setIsUppercase(true);
        setHasBackgroundBox(true);
        setBoxBgColor("rgba(11, 25, 44, 0.85)");
        setAnimationMode("karaoke");
        setFontSize(36);
        break;
      case "abdaal":
        setFontFamily("Poppins");
        setTextColor("#FFFFFF");
        setHighlightColor("#FBBF24"); // Warm gold
        setStrokeColor("transparent");
        setStrokeWidth(0);
        setShadowBlur(12);
        setTiltAngle(0);
        setIsUppercase(false);
        setHasBackgroundBox(true);
        setBoxBgColor("rgba(0, 0, 0, 0.65)");
        setAnimationMode("karaoke");
        setFontSize(32);
        break;
      case "comic":
        setFontFamily("Bangers");
        setTextColor("#FFFFFF"); // Crisp white
        setHighlightColor("#ffb700"); // Energetic yellow highlight
        setStrokeColor("#000000");
        setStrokeWidth(6);
        setShadowBlur(10);
        setTiltAngle(3);
        setIsUppercase(true);
        setHasBackgroundBox(false);
        setAnimationMode("karaoke");
        setFontSize(42);
        break;
      case "minimal":
        setFontFamily("Outfit");
        setTextColor("#FFFFFF");
        setHighlightColor("#38BDF8");
        setStrokeColor("#000000");
        setStrokeWidth(2);
        setShadowBlur(0);
        setTiltAngle(0);
        setIsUppercase(true);
        setHasBackgroundBox(true);
        setBoxBgColor("rgba(15, 23, 42, 0.9)");
        setAnimationMode("karaoke");
        setFontSize(32);
        break;
      case "custom":
        break;
    }
  }, []);

  // Dynamically load viral creator Google Fonts
  useEffect(() => {
    const fontId = "google-fonts-creator-subtitles";
    if (typeof document !== "undefined" && !document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Bebas+Neue&family=Montserrat:wght@800;900&family=Outfit:wght@800;900&family=Poppins:wght@800;900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Clean up Object URLs and audio nodes on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch (_) {}
      }
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
    };
  }, [videoUrl, exportedVideoUrl]);

  const handleFileSelected = (meta: FileMetadata) => {
    setFileMeta(meta);
    const url = URL.createObjectURL(meta.file);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setSegments([]);
    setExportedVideoUrl(null);
    setTranscribeError(null);
    setDuration(meta.durationSecs || 0);
  };

  const handleClear = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setFileMeta(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setSegments([]);
    setExportedVideoUrl(null);
    setTranscribeError(null);
  };

  // Import existing .SRT or .VTT file
  const handleImportSubtitleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseSrtOrVtt(content);
        if (parsed.length > 0) {
          setSegments(parsed);
          setTranscribeError(null);
        } else {
          setTranscribeError("Could not parse subtitle timestamps from file. Please ensure standard .SRT or .VTT format.");
        }
      }
    };
    reader.readAsText(file);
    if (srtFileInputRef.current) srtFileInputRef.current.value = "";
  };

  // Split subtitles into Rapid-Fire 2-3 words chunks (Shorts/Reels High Retention Mode)
  const handleSplitToShortChunks = () => {
    if (segments.length === 0) return;

    const newChunks: SubtitleSegment[] = [];
    segments.forEach((seg) => {
      const words = seg.text.split(" ").filter(Boolean);
      if (words.length <= 3) {
        newChunks.push(seg);
        return;
      }

      const totalDuration = seg.end - seg.start;
      const groupSize = 2; // 2 words per screen
      const numGroups = Math.ceil(words.length / groupSize);
      const groupDuration = totalDuration / numGroups;

      for (let i = 0; i < words.length; i += groupSize) {
        const slice = words.slice(i, i + groupSize);
        const groupIndex = Math.floor(i / groupSize);
        const start = Number((seg.start + groupIndex * groupDuration).toFixed(2));
        const end = Number((Math.min(seg.end, start + groupDuration - 0.05)).toFixed(2));
        newChunks.push({
          id: String(Date.now() + newChunks.length + Math.random()),
          start,
          end,
          text: slice.join(" "),
        });
      }
    });

    setSegments(newChunks);
  };

  // Drag & Drop Mouse & Touch Listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPosX: posX,
      initPosY: posY,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        initPosX: posX,
        initPosY: posY,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !videoContainerRef.current) return;
      const rect = videoContainerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartRef.current.startX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.startY) / rect.height) * 100;

      const newX = Math.max(10, Math.min(90, dragStartRef.current.initPosX + deltaX));
      const newY = Math.max(10, Math.min(90, dragStartRef.current.initPosY + deltaY));

      setPosX(Number(newX.toFixed(1)));
      setPosY(Number(newY.toFixed(1)));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !videoContainerRef.current || e.touches.length !== 1) return;
      const rect = videoContainerRef.current.getBoundingClientRect();
      const deltaX = ((e.touches[0].clientX - dragStartRef.current.startX) / rect.width) * 100;
      const deltaY = ((e.touches[0].clientY - dragStartRef.current.startY) / rect.height) * 100;

      const newX = Math.max(10, Math.min(90, dragStartRef.current.initPosX + deltaX));
      const newY = Math.max(10, Math.min(90, dragStartRef.current.initPosY + deltaY));

      setPosX(Number(newX.toFixed(1)));
      setPosY(Number(newY.toFixed(1)));
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  // Video Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      const current = segments.find((s) => time >= s.start && time <= s.end);
      setActiveSegmentId(current ? current.id : null);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Real In-Browser Whisper AI Transcription
  const handleTranscribeWithWhisper = async () => {
    if (!fileMeta) return;

    setIsTranscribing(true);
    setTranscribeError(null);
    setTranscribeProgress(10);
    setTranscribeStatus("Extracting audio stream from video...");

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });

      setTranscribeProgress(25);
      setTranscribeStatus("Reading video audio track (16kHz)...");

      const arrayBuffer = await fileMeta.file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const pcmData = audioBuffer.getChannelData(0);

      setTranscribeProgress(40);
      setTranscribeStatus("Loading OpenAI Whisper neural model (WebAssembly)...");

      const { pipeline, env } = await import("@xenova/transformers");
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny.en",
        {
          progress_callback: (data: any) => {
            if (data.status === "progress" && data.progress) {
              const p = Math.round(data.progress);
              setTranscribeProgress(40 + Math.round(p * 0.35));
              setTranscribeStatus(`Downloading Whisper AI Model: ${p}%`);
            } else if (data.status === "ready") {
              setTranscribeProgress(75);
              setTranscribeStatus("Transcribing spoken speech from video...");
            }
          },
        }
      );

      setTranscribeProgress(80);
      setTranscribeStatus("Calculating word-level timestamps...");

      const output: any = await transcriber(pcmData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      });

      if (output && output.chunks && output.chunks.length > 0) {
        const realSegments: SubtitleSegment[] = output.chunks
          .map((c: any, idx: number) => {
            const start = Array.isArray(c.timestamp) ? c.timestamp[0] : idx * 3;
            let end = Array.isArray(c.timestamp) ? c.timestamp[1] : start + 2.5;
            if (end === null || end === undefined || end <= start) {
              end = start + 2.5;
            }
            return {
              id: String(Date.now() + idx),
              start: Number(Number(start).toFixed(2)),
              end: Number(Number(end).toFixed(2)),
              text: String(c.text || "").trim(),
            };
          })
          .filter((s: SubtitleSegment) => s.text.length > 0);

        if (realSegments.length > 0) {
          setSegments(realSegments);
          setTranscribeStatus(`✓ Successfully generated ${realSegments.length} real subtitles!`);
        } else {
          setTranscribeError("No spoken words detected in the audio track.");
        }
      } else if (output && typeof output.text === "string" && output.text.trim()) {
        const totalDur = audioBuffer.duration || 10;
        const sentences = output.text.split(/(?<=[.?!])\s+/).filter(Boolean);
        const perSentence = totalDur / Math.max(1, sentences.length);
        const realSegments = sentences.map((s: string, idx: number) => ({
          id: String(Date.now() + idx),
          start: Number((idx * perSentence).toFixed(2)),
          end: Number(((idx + 1) * perSentence - 0.2).toFixed(2)),
          text: s.trim(),
        }));
        setSegments(realSegments);
        setTranscribeStatus(`✓ Successfully transcribed video dialogue!`);
      } else {
        setTranscribeError("No spoken dialogue found in the video audio.");
      }

      setTranscribeProgress(100);
      audioCtx.close();
    } catch (err: any) {
      console.error("Whisper Transcription Error:", err);
      setTranscribeError(
        `Speech recognition notice: ${err?.message || "Audio decode failed. If your browser restricts in-browser models, you can also import .SRT/.VTT directly."}`
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  // Add / Edit / Delete Segments
  const updateSegmentText = (id: string, text: string) => {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));
  };

  const addSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? Number((lastSeg.end + 0.2).toFixed(2)) : Number(currentTime.toFixed(2));
    const newEnd = Number((newStart + 3.0).toFixed(2));
    const newSeg: SubtitleSegment = {
      id: String(Date.now()),
      start: newStart,
      end: newEnd,
      text: "Type subtitle here...",
    };
    setSegments((prev) => [...prev, newSeg]);
    handleSeek(newStart);
  };

  const deleteSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  // Active Subtitle Segment for live preview
  const currentActiveSegment = useMemo(() => {
    return segments.find((s) => currentTime >= s.start && currentTime <= s.end);
  }, [segments, currentTime]);

  // CSS Text Shadow generator
  const computedShadow = useMemo(() => {
    if (shadowBlur === 0) return "none";
    if (strokeWidth > 0 && strokeColor !== "transparent") {
      return `2px 2px ${shadowBlur}px rgba(0,0,0,0.85), -2px -2px 0px ${strokeColor}, 2px -2px 0px ${strokeColor}, -2px 2px 0px ${strokeColor}`;
    }
    return `0px 4px ${shadowBlur}px rgba(0,0,0,0.7)`;
  }, [shadowBlur, strokeWidth, strokeColor]);

  // Export SRT
  const handleExportSRT = () => {
    if (segments.length === 0) return;
    const srtContent = segments
      .map((seg, idx) => {
        const formatSrtTime = (seconds: number) => {
          const pad = (n: number, z = 2) => String(Math.floor(n)).padStart(z, "0");
          const hrs = pad(seconds / 3600);
          const mins = pad((seconds % 3600) / 60);
          const secs = pad(seconds % 60);
          const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, "0");
          return `${hrs}:${mins}:${secs},${ms}`;
        };
        return `${idx + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.text}\n`;
      })
      .join("\n");

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileMeta ? fileMeta.name.replace(/\.[^/.]+$/, "") : "subtitles"}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export VTT
  const handleExportVTT = () => {
    if (segments.length === 0) return;
    const vttContent =
      "WEBVTT\n\n" +
      segments
        .map((seg, idx) => {
          const formatVttTime = (seconds: number) => {
            const pad = (n: number, z = 2) => String(Math.floor(n)).padStart(z, "0");
            const hrs = pad(seconds / 3600);
            const mins = pad((seconds % 3600) / 60);
            const secs = pad(seconds % 60);
            const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, "0");
            return `${hrs}:${mins}:${secs}.${ms}`;
          };
          return `${idx + 1}\n${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}\n${seg.text}\n`;
        })
        .join("\n");

    const blob = new Blob([vttContent], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileMeta ? fileMeta.name.replace(/\.[^/.]+$/, "") : "subtitles"}.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Burned Video
  const handleExportBurnedVideo = async () => {
    if (!videoRef.current || !fileMeta || segments.length === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    const video = videoRef.current;
    const canvas = renderCanvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setIsExporting(false);
      return;
    }

    video.pause();
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

    // Ensure the selected Google Font is fully loaded into Canvas memory before recording
    const fontCfg = getFontConfig(fontFamily);
    if (typeof document !== "undefined" && document.fonts) {
      try {
        await Promise.all([
          document.fonts.load(`${fontCfg.weight} 48px "${fontFamily}"`),
          document.fonts.load(`400 48px "${fontFamily}"`),
          document.fonts.load(`700 48px "${fontFamily}"`),
          document.fonts.load(`900 48px "${fontFamily}"`),
        ]);
        await document.fonts.ready;
      } catch (_) {}
    }

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
        console.warn("Audio node capture notice:", e);
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
      isRecordingRef.current = false;
      const outputBlob = new Blob(chunks, { type: mimeType });
      const outUrl = URL.createObjectURL(outputBlob);
      setExportedVideoUrl(outUrl);
      setIsExporting(false);
      setExportProgress(100);
      video.currentTime = 0;
    };

    isRecordingRef.current = true;
    recorder.start(100);

    try {
      await video.play();
    } catch (_) {
      video.muted = true;
      await video.play();
    }

    const containerW = videoContainerRef.current?.getBoundingClientRect().width || 640;
    const scaleRatio = canvas.width / Math.max(320, containerW);
    const actualFontSize = Math.round(fontSize * scaleRatio);

    const drawFrame = () => {
      if (!isRecordingRef.current) return;

      if (video.ended || video.currentTime >= video.duration - 0.05) {
        if (recorder.state === "recording") {
          recorder.stop();
        }
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const cur = video.currentTime;
      setExportProgress(Math.min(99, Math.round((cur / video.duration) * 100)));

      const activeSeg = segments.find((s) => cur >= s.start && cur <= s.end);
      if (activeSeg) {
        const words = activeSeg.text.split(/\s+/).filter(Boolean);
        const segDuration = activeSeg.end - activeSeg.start;
        const progress = Math.max(
          0,
          Math.min(1, (cur - activeSeg.start) / Math.max(0.1, segDuration))
        );
        const activeWordIndex = Math.min(
          words.length - 1,
          Math.floor(progress * words.length)
        );

        const formattedWords = words.map((w) => (isUppercase ? w.toUpperCase() : w));

        ctx.save();
        const drawX = (canvas.width * posX) / 100;
        const drawY = (canvas.height * posY) / 100;

        ctx.translate(drawX, drawY);
        if (tiltAngle !== 0) {
          ctx.rotate((tiltAngle * Math.PI) / 180);
        }

        const fontCfgCurrent = getFontConfig(fontFamily);
        ctx.font = `${fontCfgCurrent.weight} ${actualFontSize}px "${fontFamily}", ${fontCfgCurrent.fallback}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const spaceWidth = ctx.measureText(" ").width;

        // Word-wrap into lines to fit canvas width cleanly
        const maxLineWidth = canvas.width * 0.85;
        const lines: Array<{ words: Array<{ text: string; width: number; originalIndex: number }>; width: number }> = [];
        let curLineWords: Array<{ text: string; width: number; originalIndex: number }> = [];
        let curLineWidth = 0;

        formattedWords.forEach((wordText, origIdx) => {
          const wWidth = ctx.measureText(wordText).width;
          if (curLineWords.length > 0 && curLineWidth + spaceWidth + wWidth > maxLineWidth) {
            lines.push({ words: curLineWords, width: curLineWidth });
            curLineWords = [{ text: wordText, width: wWidth, originalIndex: origIdx }];
            curLineWidth = wWidth;
          } else {
            if (curLineWords.length > 0) curLineWidth += spaceWidth;
            curLineWords.push({ text: wordText, width: wWidth, originalIndex: origIdx });
            curLineWidth += wWidth;
          }
        });
        if (curLineWords.length > 0) {
          lines.push({ words: curLineWords, width: curLineWidth });
        }

        const lineHeight = actualFontSize * 1.25;
        const totalBlockHeight = lines.length * lineHeight;
        const maxBlockWidth = Math.max(...lines.map((l) => l.width));

        // Draw Background Box if enabled
        if (hasBackgroundBox) {
          const padX = actualFontSize * 0.55;
          const padY = actualFontSize * 0.35;
          ctx.fillStyle = boxBgColor;
          drawRoundRect(
            ctx,
            -maxBlockWidth / 2 - padX,
            -totalBlockHeight / 2 - padY,
            maxBlockWidth + padX * 2,
            totalBlockHeight + padY * 2,
            actualFontSize * 0.35
          );
          ctx.fill();
        }

        // Draw each line of words
        lines.forEach((line, lineIdx) => {
          const lineY = -totalBlockHeight / 2 + lineIdx * lineHeight + lineHeight / 2;
          let wordX = -line.width / 2;

          line.words.forEach((wordObj) => {
            const isHighlighted = wordObj.originalIndex === activeWordIndex;
            const currentWordColor = isHighlighted ? highlightColor : textColor;

            // 1. Draw outer stroke outline (with shadow)
            if (strokeWidth > 0 && strokeColor !== "transparent") {
              ctx.save();
              ctx.strokeStyle = strokeColor;
              ctx.lineWidth = strokeWidth * 2.2 * scaleRatio;
              ctx.lineJoin = "round";
              ctx.miterLimit = 2;
              if (shadowBlur > 0) {
                ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
                ctx.shadowBlur = shadowBlur * scaleRatio;
                ctx.shadowOffsetX = 2 * scaleRatio;
                ctx.shadowOffsetY = 3 * scaleRatio;
              }
              ctx.strokeText(wordObj.text, wordX + wordObj.width / 2, lineY);
              ctx.restore();
            }

            // 2. Draw crisp fill text on top
            ctx.save();
            ctx.fillStyle = currentWordColor;
            if (isHighlighted) {
              ctx.shadowColor = highlightColor;
              ctx.shadowBlur = 8 * scaleRatio;
            } else if (strokeWidth === 0 && shadowBlur > 0) {
              ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
              ctx.shadowBlur = shadowBlur * scaleRatio;
            }
            ctx.fillText(wordObj.text, wordX + wordObj.width / 2, lineY);
            ctx.restore();

            wordX += wordObj.width + spaceWidth;
          });
        });

        ctx.restore();
      }

      requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);
  };

  return (
    <div className="space-y-8">
      {/* Hidden File Input for Subtitle Import */}
      <input
        ref={srtFileInputRef}
        type="file"
        accept=".srt,.vtt,text/plain"
        onChange={handleImportSubtitleFile}
        className="hidden"
      />

      {!videoUrl ? (
        <FileDropzone
          acceptedTypes={["video/*"]}
          acceptedExtensions={[".mp4", ".mov", ".webm", ".mkv", ".avi"]}
          onFileSelected={handleFileSelected}
          selectedFile={fileMeta}
          onClear={handleClear}
          title="Upload video to create viral CapCut subtitles"
          subtitle="Real AI Whisper transcription, on-screen drag & drop positioning, and iconic creator styles"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Video Preview Player with Interactive Draggable Overlay */}
          <div className="lg:col-span-7 space-y-4">
            <div
              ref={videoContainerRef}
              className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-video flex items-center justify-center select-none"
            >
              <video
                ref={videoRef}
                src={videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain pointer-events-none"
                playsInline
              />

              {/* INTERACTIVE DRAGGABLE SUBTITLE OVERLAY */}
              {currentActiveSegment && (
                <div
                  ref={subtitleOverlayRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  style={{
                    left: `${posX}%`,
                    top: `${posY}%`,
                    transform: `translate(-50%, -50%) rotate(${tiltAngle}deg)`,
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                  className={`absolute z-30 transition-transform duration-75 group/sub flex items-center justify-center p-2`}
                >
                  {/* Subtle Drag Handle Tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/sub:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none shadow-md whitespace-nowrap">
                    <Move className="h-3 w-3 text-yellow-400" />
                    <span>Drag anywhere on video</span>
                  </div>

                  <div
                    className={`inline-block text-center rounded-2xl select-none transition-all ${
                      hasBackgroundBox ? "px-6 py-2.5 shadow-2xl backdrop-blur-md" : "px-3 py-1"
                    } ${animationMode === "bounce" ? "scale-105 animate-pulse" : ""}`}
                    style={{
                      fontFamily: `"${fontFamily}", ${getFontConfig(fontFamily).fallback}`,
                      fontWeight: getFontConfig(fontFamily).weight,
                      fontSize: `${fontSize}px`,
                      color: textColor,
                      backgroundColor: hasBackgroundBox ? boxBgColor : "transparent",
                      textShadow: computedShadow,
                      WebkitTextStroke:
                        strokeWidth > 0 && strokeColor !== "transparent"
                          ? `${strokeWidth}px ${strokeColor}`
                          : undefined,
                    }}
                  >
                    {(() => {
                      const words = currentActiveSegment.text.split(/\s+/).filter(Boolean);
                      const segDuration = currentActiveSegment.end - currentActiveSegment.start;
                      const progress = Math.max(
                        0,
                        Math.min(1, (currentTime - currentActiveSegment.start) / Math.max(0.1, segDuration))
                      );
                      const activeWordIndex = Math.min(
                        words.length - 1,
                        Math.floor(progress * words.length)
                      );

                      return words.map((w, i) => {
                        const isHighlighted = i === activeWordIndex;
                        const wordText = isUppercase ? w.toUpperCase() : w;
                        return (
                          <span
                            key={i}
                            className="inline-block mx-1.5 transition-all duration-75"
                            style={{
                              color: isHighlighted ? highlightColor : textColor,
                              transform: isHighlighted ? "scale(1.18)" : "scale(1)",
                            }}
                          >
                            {wordText}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Bottom Quick Scrub Control Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 opacity-90 hover:opacity-100 transition-opacity flex flex-col gap-2 z-20">
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
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-slate-300"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <span className="font-mono text-slate-300 font-medium">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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

            {/* Quick Alignment / Snapping Bar */}
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Move className="h-4 w-4 text-red-600" />
                <span>On-Screen Position ({posX}% X, {posY}% Y)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setPosX(50); setPosY(18); }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 shadow-sm"
                >
                  Top (18%)
                </button>
                <button
                  onClick={() => { setPosX(50); setPosY(50); }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 shadow-sm"
                >
                  Center (50%)
                </button>
                <button
                  onClick={() => { setPosX(50); setPosY(78); }}
                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold shadow-sm"
                >
                  Bottom (78%)
                </button>
                <button
                  onClick={() => setPosX(50)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 shadow-sm"
                >
                  Snap Center-X
                </button>
              </div>
            </div>

            {/* AI Speech Recognition & Import Actions */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-500/25">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">
                      Audio Transcription & Subtitles
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Transcribe actual spoken speech from video or load existing subtitles.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => srtFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
                    title="Import existing .srt or .vtt subtitle file"
                  >
                    <FileUp className="h-3.5 w-3.5 text-blue-600" />
                    <span>Import .SRT / .VTT</span>
                  </button>

                  <button
                    onClick={handleTranscribeWithWhisper}
                    disabled={isTranscribing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold hover:from-red-700 hover:to-rose-700 transition-all shadow-md shadow-red-500/25 active:scale-95 disabled:opacity-50"
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Transcribing ({transcribeProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Transcribe with Whisper AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status or Progress display */}
              {isTranscribing && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>{transcribeStatus}</span>
                    <span className="font-mono text-red-600">{transcribeProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all duration-300"
                      style={{ width: `${transcribeProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {transcribeError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{transcribeError}</p>
                    <p className="text-[11px] text-amber-700">
                      💡 Pro Tip: If your file already has a subtitle file, click <strong>&quot;Import .SRT / .VTT&quot;</strong> to load it instantly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Export Actions Panel */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Export & Download ({segments.length} Lines)
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> 100% Free & Private
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleExportSRT}
                  disabled={segments.length === 0}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-red-500 hover:text-red-600 shadow-sm transition-all disabled:opacity-40"
                >
                  <FileText className="h-4 w-4 text-red-600" />
                  <span>Download .SRT</span>
                </button>

                <button
                  onClick={handleExportVTT}
                  disabled={segments.length === 0}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-red-500 hover:text-red-600 shadow-sm transition-all disabled:opacity-40"
                >
                  <FileCode className="h-4 w-4 text-blue-600" />
                  <span>Download .VTT</span>
                </button>

                <button
                  onClick={handleExportBurnedVideo}
                  disabled={isExporting || segments.length === 0}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/20 transition-all disabled:opacity-40"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Burning ({exportProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Film className="h-4 w-4" />
                      <span>Burn Subtitles Video</span>
                    </>
                  )}
                </button>
              </div>

              {exportedVideoUrl && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-semibold">
                    ✓ Video with burned animated captions is ready!
                  </span>
                  <a
                    href={exportedVideoUrl}
                    download="subtitled-video.webm"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Video
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Iconic Creator Presets, Google Fonts & Full Customization */}
          <div className="lg:col-span-5 space-y-6">
            {/* Top: Iconic Viral Creator Presets */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Iconic Creator Styles</h3>
                </div>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  Submagic & CapCut Grade
                </span>
              </div>

              {/* 6 Viral Presets Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: "hormozi",
                    name: "The Hormozi",
                    tag: "Lime Active Word",
                    bg: "bg-black text-lime-400 border-lime-500/40",
                  },
                  {
                    id: "beast",
                    name: "MrBeast Supreme",
                    tag: "Yellow + Cyan Pop",
                    bg: "bg-slate-900 text-yellow-400 border-yellow-500/40",
                  },
                  {
                    id: "submagic",
                    name: "Submagic Cyber",
                    tag: "Pink & Cyan Glow",
                    bg: "bg-blue-950 text-cyan-300 border-cyan-500/40",
                  },
                  {
                    id: "abdaal",
                    name: "Ali Abdaal Glass",
                    tag: "Frosted Dark Pill",
                    bg: "bg-slate-800 text-white border-slate-600",
                  },
                  {
                    id: "comic",
                    name: "Comic Boom!",
                    tag: "Bangers 3D Tilt",
                    bg: "bg-amber-500 text-black border-amber-600",
                  },
                  {
                    id: "minimal",
                    name: "Minimalist Mono",
                    tag: "Clean High Contrast",
                    bg: "bg-slate-100 text-slate-900 border-slate-300",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => applyPreset(item.id as CreatorPreset)}
                    className={`p-3 rounded-2xl border text-left transition-all ${item.bg} ${
                      preset === item.id
                        ? "ring-2 ring-red-500 scale-[1.02] shadow-md"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="text-xs font-black truncate">{item.name}</div>
                    <div className="text-[10px] opacity-75 mt-0.5 truncate">{item.tag}</div>
                  </button>
                ))}
              </div>

              {/* Font Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Viral Typography (Google Fonts)</span>
                  <span className="text-[11px] text-red-600 font-mono font-bold">{fontFamily}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Anton", "Bebas Neue", "Bangers", "Montserrat", "Poppins", "Outfit"] as FontChoice[]).map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setFontFamily(f);
                          setPreset("custom");
                        }}
                        style={{ fontFamily: `"${f}", sans-serif` }}
                        className={`p-2 rounded-xl border text-xs text-center transition-all ${
                          fontFamily === f
                            ? "border-red-600 bg-red-50 text-red-700 font-bold ring-1 ring-red-500"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {f}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Colors: Text & Active Word Highlight */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Base Text Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        setPreset("custom");
                      }}
                      className="h-8 w-10 cursor-pointer rounded-lg border border-slate-200"
                    />
                    <span className="font-mono text-xs text-slate-600">{textColor}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Active Highlight Word</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => {
                        setHighlightColor(e.target.value);
                        setPreset("custom");
                      }}
                      className="h-8 w-10 cursor-pointer rounded-lg border border-slate-200"
                    />
                    <span className="font-mono text-xs text-slate-600">{highlightColor}</span>
                  </div>
                </div>
              </div>

              {/* Advanced Customization Sliders */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                {/* Font Size */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Font Size</span>
                    <span className="font-mono text-red-600">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={64}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                {/* Tilt Angle */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Dynamic Tilt Angle</span>
                    <span className="font-mono text-red-600">{tiltAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min={-8}
                    max={8}
                    value={tiltAngle}
                    onChange={(e) => setTiltAngle(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                {/* Stroke Outline */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Border Stroke Width</span>
                    <span className="font-mono text-red-600">{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={8}
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-700">Frosted Glass Pill Box</span>
                  <button
                    onClick={() => setHasBackgroundBox(!hasBackgroundBox)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      hasBackgroundBox ? "bg-red-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        hasBackgroundBox ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">All Uppercase (CAPS)</span>
                  <button
                    onClick={() => setIsUppercase(!isUppercase)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      isUppercase ? "bg-red-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isUppercase ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Editable Subtitle Segment Timeline */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Timeline ({segments.length} Lines)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {segments.length > 0 && (
                    <button
                      onClick={handleSplitToShortChunks}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                      title="Split long sentences into 2-3 words per screen for TikTok/Shorts high retention"
                    >
                      <Scissors className="h-3 w-3 text-amber-600" />
                      <span>Shorts Mode (2-3 Words)</span>
                    </button>
                  )}

                  <button
                    onClick={addSegment}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Line</span>
                  </button>
                </div>
              </div>

              {segments.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No Subtitles Added Yet</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Click <strong>&quot;Transcribe with Whisper AI&quot;</strong> or <strong>&quot;Import .SRT / .VTT&quot;</strong> to load your video subtitles.
                  </p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  {segments.map((seg) => {
                    const isActive = activeSegmentId === seg.id;
                    return (
                      <div
                        key={seg.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isActive
                            ? "bg-red-50/70 border-red-400 ring-2 ring-red-400/20"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 mb-1.5">
                          <button
                            onClick={() => handleSeek(seg.start)}
                            className="hover:text-red-600 transition-colors flex items-center gap-1"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>
                              {seg.start.toFixed(2)}s ➔ {seg.end.toFixed(2)}s
                            </span>
                          </button>

                          <button
                            onClick={() => deleteSegment(seg.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Delete Segment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={seg.text}
                          onChange={(e) => updateSegmentText(seg.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-600"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
