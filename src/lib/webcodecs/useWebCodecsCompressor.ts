"use client";

import { useState, useEffect, useCallback } from "react";
import { isWebCodecsSupported, isWebCodecsEligible } from "./detector";
import { compressVideoWebCodecs } from "./webcodecs-compressor";
import { CompressionOptions, ProcessProgress, ProcessResult } from "@/lib/ffmpeg/types";

export function useWebCodecsCompressor() {
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    setSupported(isWebCodecsSupported());
  }, []);

  const isEligible = useCallback((toolId: string, file: File | null) => {
    if (!file) return false;
    return isWebCodecsEligible(toolId, file);
  }, []);

  const compress = useCallback(
    async (
      file: File,
      options: CompressionOptions,
      onProgress?: (progress: ProcessProgress) => void
    ): Promise<ProcessResult> => {
      const duration = Math.max(1, options.durationSecs || 30);
      const originalSize = file.size;

      // 1. Calculate Target Bitrate based on compression mode
      let targetBytes: number;
      if (options.compressionMode === "target-size" && options.targetSizeMB && options.targetSizeMB > 0) {
        targetBytes = Math.min(originalSize * 0.95, options.targetSizeMB * 1024 * 1024);
      } else if (options.compressionMode === "percentage") {
        const percent = Math.max(10, Math.min(90, options.targetPercent || 50));
        targetBytes = originalSize * (1 - percent / 100);
      } else {
        // CRF-like proportional bitrate mapping
        const crf = options.crf || 28;
        const factor = Math.max(0.15, Math.min(0.85, 1 - (crf - 18) * 0.04));
        targetBytes = originalSize * factor;
      }

      const totalBitrateKbps = Math.max(120, Math.floor((targetBytes * 8) / (duration * 1000)));
      const audioBitrateKbps = options.muteAudio ? 0 : 128;
      const videoBitrateKbps = Math.max(80, totalBitrateKbps - audioBitrateKbps);

      // 2. Execute Hardware WebCodecs Pipeline
      const res = await compressVideoWebCodecs(
        file,
        {
          targetBitrateKbps: videoBitrateKbps,
          resolution: options.resolution,
          muteAudio: options.muteAudio,
          framerate: 30,
          hardwareAcceleration: "prefer-hardware",
        },
        (p) => {
          if (onProgress) {
            onProgress({
              ratio: p.ratio,
              percent: p.percent,
              time: p.time || 0,
              estimatedRemainingSecs: p.estimatedRemainingSecs,
              speed: p.fps ? `${p.fps} fps (GPU)` : "GPU Hardware",
            });
          }
        }
      );

      const outputUrl = URL.createObjectURL(res.outputBlob);
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "video";
      const outputFileName = `${baseName}_compressed.mp4`;

      return {
        outputUrl,
        outputBlob: res.outputBlob,
        outputFileName,
        originalSize: res.originalSize,
        outputSize: res.outputSize,
        durationSecs: res.durationSecs,
        processTimeMs: res.processTimeMs,
        reductionPercentage: res.reductionPercentage,
        mimeType: res.mimeType,
      };
    },
    []
  );

  return {
    isSupported: supported,
    isEligible,
    compress,
  };
}
