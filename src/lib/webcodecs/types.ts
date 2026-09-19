export interface WebCodecsCompressionOptions {
  targetBitrateKbps: number;
  resolution?: "original" | "1080p" | "720p" | "480p" | "360p";
  muteAudio?: boolean;
  durationSecs?: number;
  framerate?: number;
  keyFrameInterval?: number;
  hardwareAcceleration?: "prefer-hardware" | "prefer-software" | "no-preference";
}

export interface WebCodecsProgress {
  ratio: number;
  percent: number;
  time?: number;
  fps?: number;
  estimatedRemainingSecs?: number;
  speed?: string;
}

export interface WebCodecsCompressResult {
  outputBlob: Blob;
  outputSize: number;
  originalSize: number;
  durationSecs: number;
  processTimeMs: number;
  reductionPercentage: number;
  mimeType: string;
}
