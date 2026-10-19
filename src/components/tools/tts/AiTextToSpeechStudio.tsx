"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Mic,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Film,
  Check,
  Loader2,
  Sparkles,
  Globe,
  Radio,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  VolumeX,
  Share2,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import {
  ELEVENLABS_VOICES,
  ElevenLabsVoice,
  generateElevenLabsSpeech,
} from "@/lib/elevenlabs";
import {
  getBestMediaRecorderMimeType,
  decodeAudioBlob,
} from "@/lib/videoAudioMixer";

interface AiTextToSpeechStudioProps {
  tool: ToolMetadata;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction?: "ltr" | "rtl";
  sampleText: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: "ur",
    name: "Urdu (Pakistan)",
    nativeName: "اردو",
    flag: "🇵🇰",
    direction: "rtl",
    sampleText: "السلام علیکم! ویڈیو ریڈیوس میں خوش آمدید۔ یہاں آپ اپنے یوٹیوب اور ٹک ٹاک ویڈیوز کے لیے بہترین اے آئی وائس اوور بنا سکتے ہیں۔",
  },
  {
    code: "hi",
    name: "Hindi (India)",
    nativeName: "हिंदी",
    flag: "🇮🇳",
    direction: "ltr",
    sampleText: "नमस्ते दोस्तों! वीडियो रिड्यूस एआई वॉइसओवर स्टूडियो में आपका स्वागत है। यहां आप आसानी से नैचुरल आवाज बना सकते हैं।",
  },
  {
    code: "en-US",
    name: "English (United States)",
    nativeName: "English (US)",
    flag: "🇺🇸",
    direction: "ltr",
    sampleText: "Hey everyone! Welcome back to the channel. Today we're exploring how to create high-retention viral voiceovers without expensive microphones.",
  },
  {
    code: "en-GB",
    name: "English (United Kingdom)",
    nativeName: "British English",
    flag: "🇬🇧",
    direction: "ltr",
    sampleText: "Welcome to VideoReduce. This is a classic British voiceover, ideal for documentary narratives and professional presentations.",
  },
  {
    code: "en-IN",
    name: "English (India)",
    nativeName: "Indian English",
    flag: "🇮🇳",
    direction: "ltr",
    sampleText: "Hello friends, welcome to today's tech tutorial. In this guide, we will learn how to automate our content creation process.",
  },
  {
    code: "en-AU",
    name: "English (Australia)",
    nativeName: "Aussie English",
    flag: "🇦🇺",
    direction: "ltr",
    sampleText: "G'day mates! Check out this awesome browser-based AI voice generator. Fast, free, and super easy to use.",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    direction: "rtl",
    sampleText: "مرحباً بكم في استوديو الذكاء الاصطناعي لتحويل النص إلى صوت طبيعي بجودة عالية.",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    direction: "ltr",
    sampleText: "¡Hola a todos! Bienvenidos a nuestro canal. Hoy aprenderemos a generar locuciones con inteligencia artificial de forma gratuita.",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    direction: "ltr",
    sampleText: "Bonjour à tous! Bienvenue sur notre chaîne. Découvrez comment créer des voix off professionnelles en quelques secondes.",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    direction: "ltr",
    sampleText: "Hallo und herzlich willkommen! Erstellen Sie natürliche KI-Stimmen für Ihre Videos direkt in Ihrem Webbrowser.",
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    direction: "ltr",
    sampleText: "Herkese merhaba! Videolarınız için yapay zeka ile profesyonel seslendirme oluşturun.",
  },
];

// Helper: Split text into natural sentence chunks for high-fidelity audio streaming
export function splitTextIntoTtsChunks(text: string, maxLength = 160): string[] {
  if (!text || !text.trim()) return [];
  // Split on sentence punctuation (both English and Urdu/Arabic/Hindi: ۔ ، ؟ ! ? \n . ;)
  const sentences = text.match(/[^۔!؟?\n.,;،]+[۔!؟?\n.,;،]*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current ? current + " " + trimmed : trimmed).length <= maxLength) {
      current = current ? current + " " + trimmed : trimmed;
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxLength) {
        const words = trimmed.split(/\s+/);
        let sub = "";
        for (const w of words) {
          if ((sub ? sub + " " + w : w).length <= maxLength) {
            sub = sub ? sub + " " + w : w;
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) current = sub;
        else current = "";
      } else {
        current = trimmed;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text.slice(0, maxLength)];
}

export const AiTextToSpeechStudio: React.FC<AiTextToSpeechStudioProps> = ({ tool }) => {
  // Mode: Audio only vs Video Dubbing
  const [studioMode, setStudioMode] = useState<"audio" | "video">("audio");

  // Script text state
  const [selectedLang, setSelectedLang] = useState<string>("ur");
  const [scriptText, setScriptText] = useState<string>(LANGUAGES[0].sampleText);

  // Voice Tuning
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 0.5x to 2.0x
  const [speechPitch, setSpeechPitch] = useState<number>(1.0); // 0.5 to 1.5
  const [speechVolume, setSpeechVolume] = useState<number>(1.0); // 0 to 1

  // System Voices State
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  // ElevenLabs Engine State
  const [voiceEngine, setVoiceEngine] = useState<"elevenlabs" | "natural">("elevenlabs");
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("elevenlabs_api_key") || "";
    }
    return "";
  });
  const [selectedElevenVoiceId, setSelectedElevenVoiceId] = useState<string>("pNInz6obpgDQGcFmaJgB"); // Adam
  const [isGeneratingEleven, setIsGeneratingEleven] = useState<boolean>(false);
  const [elevenAudioUrl, setElevenAudioUrl] = useState<string | null>(null);
  const [elevenAudioBlob, setElevenAudioBlob] = useState<Blob | null>(null);
  const [elevenAudioError, setElevenAudioError] = useState<string | null>(null);
  const [showElevenKeyInput, setShowElevenKeyInput] = useState<boolean>(false);
  const [elevenVoiceName, setElevenVoiceName] = useState<string | null>(null);
  const elevenAudioRef = useRef<HTMLAudioElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [activeWordCharIndex, setActiveWordCharIndex] = useState<number>(-1);
  const [activeWordLength, setActiveWordLength] = useState<number>(0);

  // Video Dubbing State
  const [videoFileMeta, setVideoFileMeta] = useState<FileMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoVolume, setVideoVolume] = useState<number>(0.3); // 30% background
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedExtension, setExportedExtension] = useState<"mp4" | "webm">("mp4");

  const videoRef = useRef<HTMLVideoElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Find active language metadata
  const currentLangMeta = useMemo(() => {
    return LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];
  }, [selectedLang]);

  // Filter matching voices for current language
  const matchingSystemVoices = useMemo(() => {
    const langPrefix = selectedLang.split("-")[0].toLowerCase();
    return availableVoices.filter(
      (v) =>
        v.lang.toLowerCase() === selectedLang.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langPrefix)
    );
  }, [availableVoices, selectedLang]);

  // Check if Edge Natural neural voices exist
  const hasEdgeNaturalVoices = useMemo(() => {
    return availableVoices.some(
      (v) =>
        v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("online")
    );
  }, [availableVoices]);

  // Check if system has an authentic Urdu voice
  const hasUrduVoiceInstalled = useMemo(() => {
    return availableVoices.some(
      (v) =>
        v.lang.toLowerCase().startsWith("ur") ||
        v.name.toLowerCase().includes("urdu")
    );
  }, [availableVoices]);

  // Load and filter device voices
  const populateVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);

    const langPrefix = selectedLang.split("-")[0].toLowerCase();
    const naturalMatch = voices.find(
      (v) =>
        (v.lang.toLowerCase() === selectedLang.toLowerCase() ||
          v.lang.toLowerCase().startsWith(langPrefix)) &&
        (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("online"))
    );
    const standardMatch = voices.find(
      (v) =>
        v.lang.toLowerCase() === selectedLang.toLowerCase() ||
        v.lang.toLowerCase().startsWith(langPrefix)
    );

    if (naturalMatch) {
      setSelectedVoiceURI(naturalMatch.voiceURI);
    } else if (standardMatch) {
      setSelectedVoiceURI(standardMatch.voiceURI);
    } else {
      setSelectedVoiceURI("");
    }
  }, [selectedLang]);

  useEffect(() => {
    populateVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, [populateVoices]);

  // When language changes, update sample text if empty or matching previous sample
  const handleLanguageChange = (newCode: string) => {
    setSelectedLang(newCode);
    const targetLang = LANGUAGES.find((l) => l.code === newCode);
    if (targetLang) {
      setScriptText(targetLang.sampleText);
    }
  };

  // Metrics
  const charCount = scriptText.length;
  const wordCount = useMemo(() => {
    const trimmed = scriptText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [scriptText]);

  const estimatedDurationSecs = useMemo(() => {
    if (wordCount === 0) return 0;
    const wordsPerSec = (140 / 60) * speechRate;
    return Math.max(1, Math.round(wordCount / wordsPerSec));
  }, [wordCount, speechRate]);

  // Stop any active speech synthesis or audio playback
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    if (elevenAudioRef.current) {
      try {
        elevenAudioRef.current.pause();
        elevenAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    setIsPlaying(false);
    setIsSynthesizing(false);
    setActiveWordCharIndex(-1);
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
      if (elevenAudioUrl) URL.revokeObjectURL(elevenAudioUrl);
    };
  }, [stopSpeech, videoUrl, exportedVideoUrl, elevenAudioUrl]);

  // Generate Ultra-Realistic Voiceover with ElevenLabs AI
  const handleGenerateElevenSpeech = async () => {
    if (!elevenLabsApiKey.trim()) {
      setShowElevenKeyInput(true);
      return;
    }

    if (!scriptText.trim()) return;

    setIsGeneratingEleven(true);
    setElevenAudioError(null);
    stopSpeech();

    try {
      const blob = await generateElevenLabsSpeech({
        text: scriptText,
        voiceId: selectedElevenVoiceId,
        apiKey: elevenLabsApiKey,
      });

      if (elevenAudioUrl) {
        URL.revokeObjectURL(elevenAudioUrl);
      }
      const audioUrl = URL.createObjectURL(blob);
      setElevenAudioBlob(blob);
      setElevenAudioUrl(audioUrl);
      const chosenVoice = ELEVENLABS_VOICES.find((v) => v.id === selectedElevenVoiceId);
      setElevenVoiceName(chosenVoice?.name || "ElevenLabs");
      localStorage.setItem("elevenlabs_api_key", elevenLabsApiKey.trim());

      // Start audio playback & waveform
      const audio = new Audio(audioUrl);
      elevenAudioRef.current = audio;
      startWaveformAnimation();
      setIsPlaying(true);

      audio.onended = () => {
        stopSpeech();
      };
      audio.onerror = () => {
        stopSpeech();
      };

      await audio.play().catch(() => {});
    } catch (err: any) {
      setElevenAudioError(err?.message || "Failed to generate ElevenLabs speech.");
    } finally {
      setIsGeneratingEleven(false);
    }
  };

  const handleDownloadElevenAudio = () => {
    if (!elevenAudioBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(elevenAudioBlob);
    a.download = `elevenlabs_${elevenVoiceName || "voiceover"}_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Animated Waveform Visualization
  const startWaveformAnimation = useCallback(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      // Draw background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // Center line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Dynamic animated bars
      const barCount = 48;
      const barWidth = width / barCount;
      phase += 0.08;

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const wave = Math.sin(phase + i * 0.3) * Math.cos(phase * 0.5 + i * 0.2);
        const barHeight = Math.max(4, Math.abs(wave) * (height * 0.75));
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, "#ef4444");
        grad.addColorStop(1, "#f97316");

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1.5, y, Math.max(2, barWidth - 3), barHeight);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();
  }, []);

  // Play Speech Synthesis (ElevenLabs or Free Neural)
  const handlePlaySpeech = () => {
    if (!scriptText.trim()) return;

    if (voiceEngine === "elevenlabs") {
      if (elevenAudioUrl && elevenAudioRef.current) {
        if (isPlaying) {
          stopSpeech();
          if (videoRef.current) videoRef.current.pause();
        } else {
          stopSpeech();
          const audio = elevenAudioRef.current;
          audio.currentTime = 0;
          startWaveformAnimation();
          setIsPlaying(true);
          audio.play().catch(() => {});
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
        }
        return;
      } else {
        handleGenerateElevenSpeech();
        return;
      }
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech Synthesis is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      stopSpeech();
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    stopSpeech();
    setIsSynthesizing(true);

    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(scriptText);
    utteranceRef.current = utterance;

    // Set parameters
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = speechVolume;

    // Smart Voice Selection:
    let chosenVoice: SpeechSynthesisVoice | undefined;
    if (selectedVoiceURI) {
      chosenVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
    }

    if (!chosenVoice) {
      const langPrefix = selectedLang.split("-")[0].toLowerCase();
      // 1. Natural / Online voice for this language (e.g. Asad / Uzma Natural in Edge)
      chosenVoice = availableVoices.find(
        (v) =>
          (v.lang.toLowerCase() === selectedLang.toLowerCase() ||
            v.lang.toLowerCase().startsWith(langPrefix)) &&
          (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("online"))
      );

      // 2. Standard matching voice
      if (!chosenVoice) {
        chosenVoice = availableVoices.find(
          (v) =>
            v.lang.toLowerCase() === selectedLang.toLowerCase() ||
            v.lang.toLowerCase().startsWith(langPrefix)
        );
      }

      // 3. For Urdu, if no Urdu voice on Chrome, fallback to Hindi (native South Asian accent)
      if (!chosenVoice && selectedLang === "ur") {
        chosenVoice = availableVoices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("hi") ||
            v.name.toLowerCase().includes("hindi")
        );
      }
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = currentLangMeta.code;
    }

    // Boundary events for word highlighting
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        setActiveWordCharIndex(event.charIndex);
        setActiveWordLength(event.charLength || 6);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsSynthesizing(false);
      startWaveformAnimation();

      // If video is loaded in video dubbing mode, sync video playback!
      if (videoRef.current && studioMode === "video") {
        videoRef.current.currentTime = 0;
        videoRef.current.volume = videoVolume;
        videoRef.current.play().catch(console.error);
      }
    };

    utterance.onend = () => {
      stopSpeech();
      if (videoRef.current && studioMode === "video") {
        videoRef.current.pause();
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      stopSpeech();
    };

    // Speak and ensure not stuck in pause state
    window.speechSynthesis.speak(utterance);
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  // Direct Audio Download Helper (.mp3 stream)
  const getDirectDownloadUrl = () => {
    const encoded = encodeURIComponent(scriptText.slice(0, 180));
    const langCode = selectedLang.split("-")[0];
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encoded}`;
  };

  // Video Dropzone handlers
  const handleFileSelected = (meta: FileMetadata) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(meta.file);
    setVideoUrl(url);
    setVideoFileMeta(meta);
    setExportedVideoUrl(null);
  };

  const handleClearVideo = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoFileMeta(null);
    setExportedVideoUrl(null);
  };

  // Export Video with Dubbing
  const handleExportDubbedVideo = async () => {
    if (!videoRef.current || !videoUrl) return;
    const video = videoRef.current;

    setIsExportingVideo(true);
    setExportProgress(10);
    video.pause();
    stopSpeech();

    try {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = video.videoWidth || 1280;
      exportCanvas.height = video.videoHeight || 720;
      const ctx = exportCanvas.getContext("2d")!;

      const canvasStream = exportCanvas.captureStream(30);

      // 1. Setup AudioContext & MediaStreamDestination (ALWAYS RESUMED)
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      const dest = audioCtx.createMediaStreamDestination();

      // 2. Route Video Original Audio if present
      try {
        const vidStream = (video as any).captureStream ? (video as any).captureStream() : null;
        if (vidStream && vidStream.getAudioTracks().length > 0) {
          const vidAudioSource = audioCtx.createMediaStreamSource(vidStream);
          const vidGain = audioCtx.createGain();
          vidGain.gain.value = videoVolume;
          vidAudioSource.connect(vidGain);
          vidGain.connect(dest);
          vidGain.connect(audioCtx.destination);
        }
      } catch (vidAudioErr) {
        console.warn("Video stream audio capture note:", vidAudioErr);
      }

      // 3. Route AI Speech Voiceover Audio
      let voiceSourceNode: AudioBufferSourceNode | null = null;
      if (elevenAudioBlob) {
        try {
          const voiceBuffer = await decodeAudioBlob(audioCtx, elevenAudioBlob);
          voiceSourceNode = audioCtx.createBufferSource();
          voiceSourceNode.buffer = voiceBuffer;
          const voiceGain = audioCtx.createGain();
          voiceGain.gain.value = speechVolume;
          voiceSourceNode.connect(voiceGain);
          voiceGain.connect(dest);
          voiceGain.connect(audioCtx.destination);
        } catch (voiceErr) {
          console.warn("Speech voiceover buffer error:", voiceErr);
        }
      }

      // 4. Negotiate Codec & Combine Canvas Video + Web Audio Tracks
      const { mimeType, extension } = getBestMediaRecorderMimeType();
      setExportedExtension(extension);

      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000,
        audioBitsPerSecond: 192000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (audioCtx) {
          try {
            audioCtx.close();
          } catch {}
        }
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setExportedVideoUrl(url);
        setIsExportingVideo(false);
        setExportProgress(100);
      };

      recorder.start(250);
      if (voiceSourceNode) voiceSourceNode.start(0);
      video.currentTime = 0;

      await new Promise<void>((resolve) => {
        const onSeek = () => {
          video.removeEventListener("seeked", onSeek);
          resolve();
        };
        video.addEventListener("seeked", onSeek);
      });

      await video.play();
      if (!elevenAudioBlob) {
        handlePlaySpeech();
      }

      const timer = setInterval(() => {
        if (video.ended || video.currentTime >= video.duration - 0.1) {
          clearInterval(timer);
          recorder.stop();
          video.pause();
          stopSpeech();
        } else {
          ctx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
          const pct = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
          setExportProgress(pct);
        }
      }, 33);
    } catch (err: any) {
      console.error("Video dub export failed:", err);
      setIsExportingVideo(false);
      alert("Export could not be completed: " + err.message);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Studio Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold shadow-lg shadow-red-500/25">
            <Mic className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>AI Voiceover & Text-to-Speech Studio</span>
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                Multi-Lingual
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Natural human voices in Urdu, Hindi, English, Arabic & 40+ languages
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => {
              setStudioMode("audio");
              stopSpeech();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              studioMode === "audio"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-red-600" />
            <span>Audio Voiceover Only</span>
          </button>
          <button
            onClick={() => {
              setStudioMode("video");
              stopSpeech();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              studioMode === "video"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Film className="h-3.5 w-3.5 text-red-600" />
            <span>Video Dubbing Mode</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Script Editor & Live Playback */}
        <div className="lg:col-span-7 space-y-5">
          {/* Language Selector Bar */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-red-600" />
                Select Voice Language & Accent
              </label>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {currentLangMeta.flag} {currentLangMeta.nativeName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LANGUAGES.slice(0, 6).map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-red-50 border-red-500 text-red-950 font-bold shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <div className="min-w-0">
                      <p className="text-xs truncate">{lang.name}</p>
                      <p className="text-[10px] text-slate-500">{lang.nativeName}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Language Dropdown for extended list */}
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Script Text Area with RTL detection */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-red-600" />
                Voiceover Script / Narration
              </span>
              <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                <span>{charCount} Chars</span>
                <span>•</span>
                <span>{wordCount} Words</span>
                <span>•</span>
                <span className="text-red-600 font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{estimatedDurationSecs}s Duration
                </span>
              </div>
            </div>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              dir={currentLangMeta.direction || "ltr"}
              placeholder="Paste or write your script here in Urdu, Hindi, English, or any language..."
              rows={6}
              className={`w-full p-4 rounded-2xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-slate-900 text-sm leading-relaxed transition-all resize-y ${
                currentLangMeta.direction === "rtl" ? "font-serif text-base" : "font-sans"
              }`}
            />

            {/* Quick Sample Script Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-400 font-medium">Quick Prompts:</span>
              <button
                onClick={() => setScriptText(LANGUAGES[0].sampleText)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                🇵🇰 Urdu Story Script
              </button>
              <button
                onClick={() => setScriptText(LANGUAGES[1].sampleText)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                🇮🇳 Hindi Tech Script
              </button>
              <button
                onClick={() => setScriptText(LANGUAGES[2].sampleText)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                🇺🇸 Viral TikTok Hook
              </button>
            </div>
          </div>

          {/* Interactive Waveform Canvas & Live Word Karaoke Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-red-600" />
                Live Speech Waveform & Acoustic Output
              </span>
              <span className={isPlaying ? "text-emerald-600 font-bold animate-pulse" : "text-slate-400"}>
                {isPlaying ? "⚡ Speaking Now..." : "Standby"}
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-950">
              <canvas
                ref={waveformCanvasRef}
                width={800}
                height={80}
                className="w-full h-20 block"
              />
            </div>
          </div>

          {/* Playback Controls & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlaySpeech}
                disabled={isSynthesizing || !scriptText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Preparing Voice...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause Speech</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Generate & Play Voiceover</span>
                  </>
                )}
              </button>

              <button
                onClick={stopSpeech}
                disabled={!isPlaying}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                title="Stop voice"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Instant MP3 Download Button */}
            {voiceEngine === "elevenlabs" && elevenAudioBlob ? (
              <button
                type="button"
                onClick={handleDownloadElevenAudio}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Studio MP3</span>
              </button>
            ) : (
              <a
                href={getDirectDownloadUrl()}
                target="_blank"
                rel="noopener noreferrer"
                download={`voiceover-${selectedLang}.mp3`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download MP3 Audio</span>
              </a>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Voice Tuning, Personas & Video Dubbing */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI Voice Persona Selection */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Mic className="h-4 w-4 text-red-600" />
                Select Voice Persona
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {voiceEngine === "elevenlabs" ? "💎 ElevenLabs AI" : `${availableVoices.length} Voices Detected`}
              </span>
            </div>

            {/* Engine Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setVoiceEngine("elevenlabs")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  voiceEngine === "elevenlabs"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>ElevenLabs AI (Studio)</span>
              </button>
              <button
                type="button"
                onClick={() => setVoiceEngine("natural")}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  voiceEngine === "natural"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Volume2 className="h-3.5 w-3.5 text-blue-400" />
                <span>Free Neural Engine</span>
              </button>
            </div>

            {/* 1. ELEVENLABS ENGINE UI */}
            {voiceEngine === "elevenlabs" ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Curated Viral Narrators (ChatGPT Quality):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowElevenKeyInput(!showElevenKeyInput)}
                    className="text-[11px] font-semibold text-red-600 hover:underline"
                  >
                    {elevenLabsApiKey ? "⚙️ Change Key" : "🔑 Set API Key"}
                  </button>
                </div>

                {/* Curated Voice Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ELEVENLABS_VOICES.map((v) => {
                    const isSelected = selectedElevenVoiceId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedElevenVoiceId(v.id);
                          if (elevenAudioUrl && elevenVoiceName !== v.name) {
                            setElevenAudioUrl(null);
                            setElevenAudioBlob(null);
                            setElevenVoiceName(null);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-red-500"
                            : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black">{v.name}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          }`}>
                            {v.gender === "male" ? "♂" : "♀"} {v.accent}
                          </span>
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                          {v.category}
                        </div>
                        {v.badge && (
                          <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected ? "bg-red-500/80 text-white" : "bg-amber-100 text-amber-800"
                          }`}>
                            {v.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* API Key Drawer */}
                {(showElevenKeyInput || !elevenLabsApiKey) && (
                  <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">ElevenLabs Free API Key:</span>
                      <a
                        href="https://elevenlabs.io"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Get Free Key (10k chars/mo) →
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={elevenLabsApiKey}
                        onChange={(e) => {
                          setElevenLabsApiKey(e.target.value);
                          localStorage.setItem("elevenlabs_api_key", e.target.value.trim());
                        }}
                        placeholder="Paste xi-api-key here (e.g. sk_...)"
                        className="flex-1 p-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem("elevenlabs_api_key", elevenLabsApiKey.trim());
                          setShowElevenKeyInput(false);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* Generate Button & Status */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isGeneratingEleven || !scriptText.trim()}
                    onClick={handleGenerateElevenSpeech}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black shadow-md shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingEleven ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Generating Studio Voice...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Generate {ELEVENLABS_VOICES.find((v) => v.id === selectedElevenVoiceId)?.name} Voiceover</span>
                      </>
                    )}
                  </button>

                  {elevenAudioBlob && elevenVoiceName && (
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{elevenVoiceName} Voice Active</span>
                    </div>
                  )}
                </div>

                {elevenAudioError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    ⚠️ {elevenAudioError}
                  </div>
                )}
              </div>
            ) : (
              /* 2. FREE NEURAL SYSTEM VOICES UI */
              <div className="space-y-3">
                {hasEdgeNaturalVoices ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Microsoft Edge Studio Voices Active!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                      Ultra-realistic human voices (<strong>Microsoft Asad</strong> & <strong>Microsoft Uzma</strong>) are ready. Select them below for natural Pakistani accent.
                    </p>
                  </div>
                ) : selectedLang === "ur" && !hasUrduVoiceInstalled ? (
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-blue-800">
                      <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                      <span>Pro Tip for Human Voice:</span>
                    </div>
                    <p className="text-[11px] text-blue-900/90 leading-relaxed">
                      Agar aap ko bilkul <strong>Real Human Studio Quality</strong> chahiye (jaise Pakistani anchor bol raha ho), to is page ko <strong>Microsoft Edge</strong> browser mein open karein! Edge mein Microsoft Asad aur Uzma built-in hain.
                    </p>
                  </div>
                ) : null}

                {/* Voice Dropdown */}
                {matchingSystemVoices.length > 0 ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Recommended {currentLangMeta.name} Voices:
                    </label>
                    <select
                      value={selectedVoiceURI}
                      onChange={(e) => setSelectedVoiceURI(e.target.value)}
                      className="w-full text-xs font-medium p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    >
                      {matchingSystemVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name.includes("Natural") || v.name.includes("Online") ? "🌟 " : ""}
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Device Voices ({availableVoices.length}):
                    </label>
                    <select
                      value={selectedVoiceURI}
                      onChange={(e) => setSelectedVoiceURI(e.target.value)}
                      className="w-full text-xs font-medium p-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                    >
                      {availableVoices.map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Voice Tuning Sliders (Speed, Pitch, Volume) */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-red-600" />
              Pacing & Pitch Controls
            </h3>

            {/* 1. Speech Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Speaking Speed</span>
                <span className="font-mono font-bold text-red-600">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.5x (Story / Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast Shorts)</span>
              </div>
            </div>

            {/* 2. Pitch Tuning */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Voice Pitch</span>
                <span className="font-mono font-bold text-red-600">{speechPitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.5}
                step={0.1}
                value={speechPitch}
                onChange={(e) => setSpeechPitch(Number(e.target.value))}
                className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Deep Baritone (0.5)</span>
                <span>Natural (1.0)</span>
                <span>High Energy (1.5)</span>
              </div>
            </div>

            {/* 3. Speech Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Voice Volume</span>
                <span className="font-mono font-bold text-red-600">
                  {Math.round(speechVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={speechVolume}
                onChange={(e) => setSpeechVolume(Number(e.target.value))}
                className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Mode 2: Video Dubbing Section */}
          {studioMode === "video" && (
            <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Film className="h-4 w-4 text-red-500" />
                  Video Dubbing Player
                </h3>
                {videoUrl && (
                  <button
                    onClick={handleClearVideo}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                  >
                    Change Video
                  </button>
                )}
              </div>

              {!videoUrl ? (
                <FileDropzone
                  acceptedTypes={["video/*"]}
                  acceptedExtensions={[".mp4", ".mov", ".webm", ".mkv"]}
                  onFileSelected={handleFileSelected}
                  selectedFile={videoFileMeta}
                  onClear={handleClearVideo}
                  title="Drop Video to Add AI Voiceover"
                  subtitle="Preview speech synchronized over your video"
                />
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      playsInline
                    />
                  </div>

                  {/* Audio Balance Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-300">Background Video Audio Volume</span>
                      <span className="font-mono font-bold text-red-400">
                        {Math.round(videoVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1.0}
                      step={0.05}
                      value={videoVolume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setVideoVolume(v);
                        if (videoRef.current) videoRef.current.volume = v;
                      }}
                      className="w-full accent-red-600 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400">
                      Ducks original video sound down to 30% so your AI voiceover is loud and clear.
                    </p>
                  </div>

                  {/* Export Dubbed Video Button */}
                  {isExportingVideo ? (
                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          Rendering Dubbed Video...
                        </span>
                        <span>{exportProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-red-600 h-1.5 transition-all duration-200"
                          style={{ width: `${exportProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : exportedVideoUrl ? (
                    <a
                      href={exportedVideoUrl}
                      download={`${videoFileMeta?.name.replace(/\.[^/.]+$/, "") || "video"}-voiceover.${exportedExtension}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Download Video (.{exportedExtension.toUpperCase()} with Voiceover)
                    </a>
                  ) : (
                    <button
                      onClick={handleExportDubbedVideo}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg shadow-red-600/25 transition-all"
                    >
                      <Film className="h-4 w-4" />
                      <span>Export Video With AI Voiceover</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
