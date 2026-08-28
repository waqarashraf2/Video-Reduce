export type ToolId =
  | "video-compressor"
  | "video-to-gif"
  | "audio-extractor"
  | "video-trimmer"
  | "speed-controller"
  | "video-mute"
  | "format-converter"
  | "aspect-ratio-resizer"
  | "video-watermark"
  | "video-rotate"
  | "video-reverse"
  | "video-merger"
  | "frame-extractor"
  | "video-filters"
  | "gif-to-video"
  | "volume-booster"
  | "audio-denoiser"
  | "metadata-stripper"
  | "ffmpeg-terminal";

export type ResolutionOption = "original" | "1080p" | "720p" | "480p" | "360p";
export type AudioFormat = "mp3" | "wav" | "aac";
export type VideoFormat = "mp4" | "mkv" | "webm" | "mov" | "avi" | "flv";
export type AspectRatio = "9:16" | "1:1" | "16:9" | "4:5" | "21:9";
export type ResizeMode = "crop" | "pad";
export type CompressionMode = "percentage" | "target-size" | "manual-crf";

export type WatermarkPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export type RotationDegree = "90" | "180" | "270" | "hflip" | "vflip";

export interface CompressionOptions {
  compressionMode: CompressionMode;
  targetPercent: number; // 30, 50, 70, 80 (% size reduction)
  targetSizeMB?: number;
  crf: number;
  preset: "ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium";
  resolution: ResolutionOption;
  muteAudio: boolean;
  fileSizeBytes?: number;
  durationSecs?: number;
}

export interface GifOptions {
  fps: number;
  width: number;
  speed: number;
  loop: number;
}

export interface AudioExtractorOptions {
  format: AudioFormat;
  bitrate: "128k" | "192k" | "256k" | "320k";
}

export interface TrimmerOptions {
  startTime: number;
  endTime: number;
  precise: boolean;
}

export interface SpeedOptions {
  speed: number;
  adjustPitch: boolean;
}

export interface MuteOptions {
  fastCopy: boolean;
}

export interface FormatOptions {
  targetFormat: VideoFormat;
  quality: "high" | "medium" | "low";
}

export interface AspectRatioOptions {
  ratio: AspectRatio;
  mode: ResizeMode;
  padColor: string;
}

export interface WatermarkOptions {
  type: "text" | "image";
  text: string;
  fontSize: number;
  fontColor: string;
  position: WatermarkPosition;
  opacity: number; // 0.1 to 1.0
  imageFile?: File;
  imageScalePercent?: number; // 10 to 100
}

export interface RotateOptions {
  rotation: RotationDegree;
}

export interface ReverseOptions {
  reverseAudio: boolean;
  muteAudio: boolean;
}

export interface MergerOptions {
  transition: "none" | "fade";
}

export interface FrameExtractorOptions {
  timestampSecs: number;
  format: "png" | "jpg";
}

export interface VideoFilterOptions {
  preset: "none" | "cyberpunk" | "sepia" | "vintage" | "bw" | "warm" | "cool";
  brightness: number; // -0.5 to 0.5
  contrast: number; // 0.5 to 2.0
  saturation: number; // 0.0 to 3.0
  gamma: number; // 0.5 to 2.0
}

export interface GifToVideoOptions {
  loopCount: number;
  crf: number;
}

export interface VolumeOptions {
  mode: "multiplier" | "normalize";
  volumeMultiplier: number; // 0.5 to 3.0
}

export interface AudioDenoiserOptions {
  noiseFloor: number; // -15 to -40 dB
}

export interface MetadataStripperOptions {
  cleanAll: boolean;
}

export interface FFmpegTerminalOptions {
  customCommand: string;
}

export type AnyToolOptions =
  | CompressionOptions
  | GifOptions
  | AudioExtractorOptions
  | TrimmerOptions
  | SpeedOptions
  | MuteOptions
  | FormatOptions
  | AspectRatioOptions
  | WatermarkOptions
  | RotateOptions
  | ReverseOptions
  | MergerOptions
  | FrameExtractorOptions
  | VideoFilterOptions
  | GifToVideoOptions
  | VolumeOptions
  | AudioDenoiserOptions
  | MetadataStripperOptions
  | FFmpegTerminalOptions;

export interface ToolMetadata {
  id: ToolId;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  category: "Video" | "Audio" | "Conversion" | "Optimization" | "Privacy & Pro";
  iconName: string;
  badge?: string;
  acceptedTypes: string[];
  acceptedExtensions: string[];
  outputExtension: string;
  outputMimeType: string;
  estimatedSpeed: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  steps: {
    step: number;
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export interface ProcessProgress {
  ratio: number;
  percent: number;
  time: number;
  estimatedRemainingSecs?: number;
  speed?: string;
}

export interface ProcessResult {
  outputUrl: string;
  outputBlob: Blob;
  outputFileName: string;
  originalSize: number;
  outputSize: number;
  durationSecs?: number;
  processTimeMs: number;
  reductionPercentage: number;
  mimeType: string;
}
