import MP4Box from "mp4box";
import { Muxer, ArrayBufferTarget, TransformationMatrix } from "mp4-muxer";
import {
  WebCodecsCompressionOptions,
  WebCodecsProgress,
  WebCodecsCompressResult,
} from "./types";

const getMP4Box = () => {
  if (typeof window !== "undefined" && (window as any).MP4Box) {
    return (window as any).MP4Box;
  }
  if ((MP4Box as any)?.createFile) {
    return MP4Box;
  }
  if ((MP4Box as any)?.default?.createFile) {
    return (MP4Box as any).default;
  }
  return MP4Box;
};

/**
 * Extracts codec private data (AVC Parameter Sets: SPS / PPS) from MP4Box metadata.
 */
function getTrackDescription(mp4boxfile: any, track: any): Uint8Array | null {
  try {
    const mp4box = getMP4Box();
    const DataStreamClass = mp4box.DataStream || (window as any).DataStream;

    if (!mp4boxfile?.moov?.traks) return null;

    for (const entry of mp4boxfile.moov.traks) {
      if (entry.tkhd?.track_id === track.id) {
        const stsdEntry = entry.mdia?.minf?.stbl?.stsd?.entries?.[0];
        if (!stsdEntry) continue;
        const box = stsdEntry.avcC || stsdEntry.hvcC || stsdEntry.vpcC;
        if (box && DataStreamClass) {
          const stream = new DataStreamClass(undefined, 0, DataStreamClass.BIG_ENDIAN ?? false);
          box.write(stream);
          const endPos = stream.position || stream.buffer.byteLength;
          if (endPos > 8) {
            return new Uint8Array(stream.buffer.slice(8, endPos));
          }
        }
      }
    }
  } catch (e) {
    console.warn("[WebCodecs] Track description extract warning:", e);
  }
  return null;
}

/**
 * Extracts AudioSpecificConfig bytes for AAC from MP4Box metadata if available.
 */
function getAudioTrackDescription(mp4boxfile: any, track: any): Uint8Array | null {
  try {
    for (const entry of mp4boxfile.moov.traks) {
      if (entry.tkhd.track_id === track.id) {
        const stsdEntry = entry.mdia.minf.stbl.stsd.entries[0];
        if (stsdEntry?.esds?.esd) {
          const esd = stsdEntry.esds.esd;
          const findTag = (desc: any, tag: number): any => {
            if (!desc) return null;
            if (desc.tag === tag) return desc;
            if (Array.isArray(desc.descs)) {
              for (const child of desc.descs) {
                const res = findTag(child, tag);
                if (res) return res;
              }
            }
            return null;
          };
          const specInfo = findTag(esd, 5); // DecSpecificInfoTag (0x05)
          if (specInfo && specInfo.data) {
            return new Uint8Array(specInfo.data);
          }
        }
      }
    }
  } catch (e) {
    console.warn("[WebCodecs] Audio track description extract warning:", e);
  }
  return null;
}

/**
 * Extracts video display rotation metadata (matrix or angle) from MP4Box metadata.
 * Crucial for mobile / portrait / TikTok / Reels / Shorts videos so they are not rotated sideways.
 */
function getVideoRotation(
  mp4boxfile: any,
  track: any
): 0 | 90 | 180 | 270 | TransformationMatrix | undefined {
  try {
    let rawMatrix: any = track?.matrix;
    if ((!rawMatrix || rawMatrix.length !== 9) && mp4boxfile?.moov?.traks) {
      for (const entry of mp4boxfile.moov.traks) {
        if (entry.tkhd?.track_id === track.id) {
          rawMatrix = entry.tkhd.matrix;
          break;
        }
      }
    }

    if (rawMatrix && rawMatrix.length === 9) {
      const a = rawMatrix[0] / 65536;
      const b = rawMatrix[1] / 65536;
      const c = rawMatrix[3] / 65536;
      const d = rawMatrix[4] / 65536;

      // Calculate rotation angle in degrees:
      let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
      angle = (angle + 360) % 360;

      if (angle === 90 || angle === 180 || angle === 270) {
        console.log(`📱 [WebCodecs] Detected mobile video rotation: ${angle}°`);
        const tx = rawMatrix[6] / 65536;
        const ty = rawMatrix[7] / 65536;
        // If the original matrix has translation coordinates (iPhone / Android)
        if (tx !== 0 || ty !== 0) {
          return [
            a,
            b,
            rawMatrix[2] / (2 ** 30),
            c,
            d,
            rawMatrix[5] / (2 ** 30),
            tx,
            ty,
            rawMatrix[8] / (2 ** 30),
          ] as TransformationMatrix;
        }
        return angle as 90 | 180 | 270;
      }
    }
  } catch (e) {
    console.warn("[WebCodecs] Rotation detection warning:", e);
  }
  return undefined;
}

/**
 * Pure client-side hardware-accelerated video compression matching HTML prototype 1:1.
 */
export async function compressVideoWebCodecs(
  file: File,
  options: WebCodecsCompressionOptions,
  onProgress?: (progress: WebCodecsProgress) => void
): Promise<WebCodecsCompressResult> {
  const startTime = performance.now();
  const originalSize = file.size;
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return new Promise(async (resolve, reject) => {
    let mp4boxfile: any;
    try {
      const mp4box = getMP4Box();
      mp4boxfile = mp4box.createFile();
    } catch (e) {
      return reject(new Error(`Failed to create MP4Box file: ${e}`));
    }

    let videoTrack: any = null;
    let audioTrack: any = null;
    let audioCodec: "aac" | "opus" | null = null;
    let audioChannels = 2;
    let audioSampleRate = 44100;
    let audioTrackDescription: Uint8Array | null = null;
    let isFirstAudioChunk = true;
    let lastAudioTimestamp = -1;
    let audioChunkCount = 0;

    let isReady = false;
    let lastReadProgressTime = 0;

    let totalSamples = 0;
    let processedSamples = 0;
    let encodedCount = 0;

    let muxer: any = null;
    let videoEncoder: any = null;
    let videoDecoder: any = null;
    let trackDescription: Uint8Array | null = null;
    let fallbackConfig: any = null;

    let isCleanedUp = false;
    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      try {
        if (videoDecoder && videoDecoder.state !== "closed") videoDecoder.close();
      } catch (_) {}
      try {
        if (videoEncoder && videoEncoder.state !== "closed") videoEncoder.close();
      } catch (_) {}
    };

    mp4boxfile.onError = (e: any) => {
      console.error("❌ [WebCodecs] MP4Box error:", e);
      cleanup();
      reject(new Error(`MP4Box error: ${e?.message || e}`));
    };

    mp4boxfile.onReady = async (info: any) => {
      try {
        isReady = true;
        console.log("📦 [WebCodecs] MP4Box onReady triggered. Tracks:", info.tracks?.length);
        videoTrack = info.videoTracks?.[0];
        if (!videoTrack) {
          cleanup();
          return reject(new Error("File ke andar video track nahi mila!"));
        }

        totalSamples = videoTrack.nb_samples || 0;
        console.log("🎞️ [WebCodecs] Video Track:", videoTrack.codec, `${videoTrack.video.width}x${videoTrack.video.height}`, "Samples:", totalSamples);

        // Check if audio track exists and user did not request muteAudio
        const rawAudioTrack = info.audioTracks?.[0];
        if (!options.muteAudio && rawAudioTrack) {
          const codecLower = (rawAudioTrack.codec || "").toLowerCase();
          if (codecLower.startsWith("mp4a")) {
            audioTrack = rawAudioTrack;
            audioCodec = "aac";
          } else if (codecLower.includes("opus")) {
            audioTrack = rawAudioTrack;
            audioCodec = "opus";
          } else {
            console.warn(`[WebCodecs] Audio codec "${rawAudioTrack.codec}" is not AAC/Opus, skipping audio remux.`);
          }

          if (audioTrack && audioCodec) {
            audioChannels = (audioTrack.audio && audioTrack.audio.channel_count > 0) ? audioTrack.audio.channel_count : 2;
            audioSampleRate = (audioTrack.audio && audioTrack.audio.sample_rate > 0) ? audioTrack.audio.sample_rate : 44100;
            audioTrackDescription = getAudioTrackDescription(mp4boxfile, audioTrack);
            console.log("🔊 [WebCodecs] Preserving Audio Track:", audioCodec, `${audioSampleRate}Hz`, `${audioChannels}ch`);
          }
        } else if (options.muteAudio) {
          console.log("🔇 [WebCodecs] Audio muted as requested by user options.");
        }

        // Original video dimensions (H.264 requires even width and height)
        const originalWidth = videoTrack.video.width - (videoTrack.video.width % 2);
        const originalHeight = videoTrack.video.height - (videoTrack.video.height % 2);

        // 1. Calculate Target Dimensions (Aspect Ratio Preserved & GPU friendly)
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        // Check if resolution is >1080p (e.g. 4K 3840x2160) or mobile device
        const is4KOrHigher = originalWidth > 1920 || originalHeight > 1920;
        const isMobileDevice =
          typeof window !== "undefined" &&
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (options.resolution === "720p") {
          if (originalHeight > 720 || originalWidth > 1280) {
            const scale = Math.min(1280 / originalWidth, 720 / originalHeight);
            targetWidth = Math.max(2, Math.round((originalWidth * scale) / 2) * 2);
            targetHeight = Math.max(2, Math.round((originalHeight * scale) / 2) * 2);
          }
        } else if (options.resolution === "480p") {
          if (originalHeight > 480 || originalWidth > 854) {
            const scale = Math.min(854 / originalWidth, 480 / originalHeight);
            targetWidth = Math.max(2, Math.round((originalWidth * scale) / 2) * 2);
            targetHeight = Math.max(2, Math.round((originalHeight * scale) / 2) * 2);
          }
        } else if (
          options.resolution === "1080p" ||
          (is4KOrHigher && (options.resolution === "original" || !options.resolution)) ||
          (isMobileDevice && (originalWidth > 1920 || originalHeight > 1080))
        ) {
          // On mobile or when input is 4K, scale to 1080p so mobile GPU hardware encoders NEVER reject it!
          if (originalHeight > 1080 || originalWidth > 1920) {
            const scale = Math.min(1920 / originalWidth, 1080 / originalHeight);
            targetWidth = Math.max(2, Math.round((originalWidth * scale) / 2) * 2);
            targetHeight = Math.max(2, Math.round((originalHeight * scale) / 2) * 2);
          }
        } else {
          // "original": Direct GPU Zero-Copy Pass
          targetWidth = originalWidth;
          targetHeight = originalHeight;
        }

        const needsScaling = targetWidth !== originalWidth || targetHeight !== originalHeight;
        console.log(`🎬 [WebCodecs] Dimensions: ${originalWidth}x${originalHeight} -> ${targetWidth}x${targetHeight} (Scaling: ${needsScaling})`);

        // OffscreenCanvas for GPU hardware downscaling
        let offscreenCanvas: OffscreenCanvas | null = null;
        let offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;
        if (needsScaling && typeof OffscreenCanvas !== "undefined") {
          try {
            offscreenCanvas = new OffscreenCanvas(targetWidth, targetHeight);
            offscreenCtx = offscreenCanvas.getContext("2d", {
              alpha: false,
              desynchronized: true,
              willReadFrequently: false,
            });
          } catch (scaleErr) {
            console.warn("[WebCodecs] OffscreenCanvas init failed, using original dimensions:", scaleErr);
            targetWidth = originalWidth;
            targetHeight = originalHeight;
          }
        }

        // Track description extract karein (AVC Parameter Sets)
        trackDescription = getTrackDescription(mp4boxfile, videoTrack);

        // Detect video rotation (for TikTok / mobile portrait videos)
        const videoRotation = getVideoRotation(mp4boxfile, videoTrack);

        // 1. Muxer Setup (Strictly in-memory FastStart)
        muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: {
            codec: "avc",
            width: targetWidth,
            height: targetHeight,
            ...(videoRotation !== undefined ? { rotation: videoRotation } : {}),
          },
          ...(audioTrack && audioCodec
            ? {
                audio: {
                  codec: audioCodec,
                  numberOfChannels: audioChannels,
                  sampleRate: audioSampleRate,
                },
              }
            : {}),
          fastStart: "in-memory",
          firstTimestampBehavior: "offset",
        });

        // Fallback decoder config agar browser na bhejay
        fallbackConfig = {
          codec: "avc1.640034",
          codedWidth: targetWidth,
          codedHeight: targetHeight,
          description: trackDescription || undefined,
          colorSpace: {
            primaries: "bt709",
            transfer: "bt709",
            matrix: "bt709",
            fullRange: false,
          },
        };

        let isFirstOutputChunk = true;
        let lastProgressTime = 0;
        let lastVideoTimestamp = -1;

        // Smooth metrics tracking (Rolling FPS & EMA Remaining Time)
        let encodingStartTime = 0;
        let windowStartTime = 0;
        let windowStartCount = 0;
        let rollingFps = 0;
        let smoothedRemainingSecs: number | null = null;

        // 2. Hardware VideoEncoder
        videoEncoder = new VideoEncoder({
          output: (chunk, metadata) => {
            encodedCount++;
            let meta: any = metadata;

            // Only on the very first output chunk, ensure decoderConfig & colorSpace exist
            if (isFirstOutputChunk) {
              isFirstOutputChunk = false;
              if (!meta || !meta.decoderConfig) {
                meta = { decoderConfig: fallbackConfig };
              } else if (!meta.decoderConfig.colorSpace) {
                meta = {
                  ...meta,
                  decoderConfig: {
                    ...meta.decoderConfig,
                    colorSpace: fallbackConfig.colorSpace,
                  },
                };
              }
            } else {
              meta = metadata;
            }

            // Enforce strictly monotonic timestamps to prevent mp4-muxer DTS validation aborts
            let videoTimestamp = Math.round(chunk.timestamp);
            if (videoTimestamp <= lastVideoTimestamp) {
              videoTimestamp = lastVideoTimestamp + 1000; // at least 1ms advance
            }
            lastVideoTimestamp = videoTimestamp;

            try {
              muxer.addVideoChunk(chunk, meta, videoTimestamp);
            } catch (muxErr) {
              console.warn("Muxer video chunk warning:", muxErr);
            }

            // ⚡ Real-Time Rolling FPS & Smooth EMA Time Estimation
            const now = performance.now();
            if (encodingStartTime === 0) {
              encodingStartTime = now;
              windowStartTime = now;
              windowStartCount = encodedCount;
            }

            // Update rolling FPS every 500ms
            const windowDt = (now - windowStartTime) / 1000;
            if (windowDt >= 0.5) {
              const windowFrames = encodedCount - windowStartCount;
              const instantFps = Math.round(windowFrames / windowDt);
              if (rollingFps === 0) {
                rollingFps = instantFps;
              } else {
                rollingFps = Math.round(rollingFps * 0.7 + instantFps * 0.3);
              }
              windowStartCount = encodedCount;
              windowStartTime = now;
            }

            // Throttled UI Progress: Updates React every 180ms (~5 fps UI refresh) for buttery smooth display
            if (onProgress && totalSamples > 0 && (now - lastProgressTime > 180 || encodedCount === totalSamples)) {
              lastProgressTime = now;
              const ratio = Math.min(0.99, encodedCount / totalSamples);
              const percent = Math.min(99, Math.round(ratio * 100));

              const displayFps = rollingFps > 0 ? rollingFps : Math.max(1, Math.round(encodedCount / ((now - encodingStartTime) / 1000 || 1)));
              const remainingFrames = Math.max(0, totalSamples - encodedCount);
              const rawRemainingSecs = Math.round(remainingFrames / displayFps);

              if (smoothedRemainingSecs === null) {
                smoothedRemainingSecs = rawRemainingSecs;
              } else {
                // Exponential moving average prevents jumpy estimated remaining time
                smoothedRemainingSecs = Math.round(smoothedRemainingSecs * 0.85 + rawRemainingSecs * 0.15);
              }

              onProgress({
                ratio,
                percent,
                fps: displayFps,
                estimatedRemainingSecs: smoothedRemainingSecs,
                speed: `${displayFps} fps (GPU)`,
              });
            }
          },
          error: (e) => {
            console.error("❌ [WebCodecs] Encoder Error:", e);
            cleanup();
            reject(e);
          },
        });

        // Accurate actual duration from track or timescale
        const actualDurationSecs =
          videoTrack.duration && videoTrack.timescale && videoTrack.timescale > 0
            ? videoTrack.duration / videoTrack.timescale
            : options.durationSecs || 30;

        // Calculate original video bitrate
        const originalBitrateKbps = Math.max(
          100,
          Math.floor((originalSize * 8) / (actualDurationSecs * 1000))
        );

        // Minimum safe hardware bitrate floor based on resolution
        const minHardwareBitrateKbps =
          targetHeight <= 480 ? 300 : targetHeight <= 720 ? 450 : 600;

        // STRICT BITRATE CEILING:
        // 1. Must never exceed mobile GPU hardware encoder ceiling (5500 kbps)
        // 2. Must never drop below hardware safe minimum to avoid MediaCodec stalls
        const maxHardwareBitrateKbps = 5500;
        const maxAllowedBitrateKbps = Math.min(
          maxHardwareBitrateKbps,
          Math.max(minHardwareBitrateKbps, Math.floor(originalBitrateKbps * 0.75))
        );
        const finalTargetBitrateKbps = Math.min(
          maxAllowedBitrateKbps,
          Math.max(minHardwareBitrateKbps, options.targetBitrateKbps)
        );
        const targetBitrate = Math.max(minHardwareBitrateKbps * 1000, finalTargetBitrateKbps * 1000);

        console.log(
          `📊 [WebCodecs] Original Bitrate: ${originalBitrateKbps} kbps, Target Bitrate: ${finalTargetBitrateKbps} kbps (Duration: ${actualDurationSecs.toFixed(1)}s, Res: ${targetWidth}x${targetHeight})`
        );

        // Mobile GPUs (Qualcomm Snapdragon, MediaTek, Exynos, Apple A-series) require "realtime"
        // latency mode to avoid internal multi-frame lookahead buffering deadlocks.
        const isMobile =
          typeof window !== "undefined" &&
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Select appropriate AVC Level according to target resolution:
        // - Level 3.1 (0x1f): Max 720p (1280x720 = 921,600 coded area)
        // - Level 4.0 / 4.2 (0x28 / 0x2a): Max 1080p (1920x1080 = 2,073,600 coded area)
        // - Level 5.1 (0x33): Max 4K (3840x2160)
        // Ensure dimensions are strictly even (macroblock divisible by 2)
        targetWidth = Math.floor(targetWidth / 2) * 2;
        targetHeight = Math.floor(targetHeight / 2) * 2;

        const is4K = targetWidth > 1920 || targetHeight > 1080;
        const is1080p = targetWidth > 1280 || targetHeight > 720;

        const originalCodec = videoTrack.codec ? videoTrack.codec.toLowerCase() : "";

        let candidateCodecs: string[] = [];
        // Prioritize the container's exact native codec if it's AVC/H.264
        if (originalCodec.startsWith("avc1.")) {
          candidateCodecs.push(originalCodec);
        }

        if (is4K) {
          candidateCodecs.push("avc1.640033", "avc1.4d0033", "avc1.420033");
        } else if (is1080p) {
          candidateCodecs.push(
            "avc1.4d0029", // Main Profile Level 4.1 (Standard 1080p across Intel/NVIDIA/AMD)
            "avc1.640029", // High Profile Level 4.1
            "avc1.420029", // Baseline Profile Level 4.1
            "avc1.4d002a", // Main Profile Level 4.2
            "avc1.64002a", // High Profile Level 4.2
            "avc1.42002a", // Baseline Profile Level 4.2
            "avc1.4d0028", // Main Profile Level 4.0
            "avc1.420028"  // Baseline Profile Level 4.0
          );
        } else {
          candidateCodecs.push(
            "avc1.4d001f", // Main Profile Level 3.1 (720p)
            "avc1.42001f", // Baseline Profile Level 3.1 (720p)
            "avc1.4d0029", // Main Profile Level 4.1
            "avc1.640029",
            "avc1.4d0028"  // Main Profile Level 4.0
          );
        }

        // Deduplicate candidates
        candidateCodecs = Array.from(new Set(candidateCodecs));

        let encoderConfig: any = {
          codec: candidateCodecs[0],
          width: targetWidth,
          height: targetHeight,
          bitrate: targetBitrate,
          bitrateMode: "variable",
          latencyMode: "quality",
          hardwareAcceleration: "prefer-hardware",
        };

        // Search combination of acceleration, latency modes, and candidate codecs
        if (typeof VideoEncoder !== "undefined" && "isConfigSupported" in VideoEncoder) {
          let foundSupported = false;

          for (const accel of ["prefer-hardware", "no-preference"] as const) {
            encoderConfig.hardwareAcceleration = accel;
            // "quality" enables unthrottled maximum-throughput offline GPU hardware encoding (100-300+ FPS)
            for (const latency of ["quality", "realtime"] as const) {
              encoderConfig.latencyMode = latency;
              for (const codec of candidateCodecs) {
                try {
                  encoderConfig.codec = codec;
                  const check = await (VideoEncoder as any).isConfigSupported(encoderConfig);
                  if (check && check.supported) {
                    foundSupported = true;
                    console.log(`🎯 [WebCodecs] Selected verified encoder codec: ${codec} (${accel}, ${latency})`);
                    break;
                  }
                } catch (_) {}
              }
              if (foundSupported) break;
            }
            if (foundSupported) break;
          }

          if (!foundSupported) {
            console.warn("⚠️ [WebCodecs] No verified codec returned from isConfigSupported, using native track codec:", candidateCodecs[0]);
            encoderConfig.codec = candidateCodecs[0];
            encoderConfig.latencyMode = "quality";
          }
        } else {
          encoderConfig.latencyMode = "quality";
        }

        videoEncoder.configure(encoderConfig);

        // 3. Hardware VideoDecoder (Zero-copy GPU direct or GPU OffscreenCanvas scale to encoder)
        videoDecoder = new VideoDecoder({
          output: (videoFrame) => {
            try {
              // Keyframe every 150 frames to minimize I-frame size overhead
              const keyFrame = processedSamples === 0 || processedSamples % 150 === 0;

              if (needsScaling && offscreenCanvas && offscreenCtx) {
                offscreenCtx.drawImage(videoFrame, 0, 0, targetWidth, targetHeight);
                const scaledFrame = new VideoFrame(offscreenCanvas, {
                  timestamp: videoFrame.timestamp,
                  duration: videoFrame.duration || undefined,
                });
                try {
                  videoEncoder.encode(scaledFrame, { keyFrame });
                } finally {
                  scaledFrame.close();
                }
              } else {
                videoEncoder.encode(videoFrame, { keyFrame });
              }

              processedSamples++;
            } catch (frameErr) {
              console.error("❌ [WebCodecs] Frame Error:", frameErr);
              cleanup();
              reject(frameErr);
            } finally {
              // Always guarantee videoFrame is released to prevent GPU VRAM leak & OOM crash
              try {
                videoFrame.close();
              } catch (_) {}
            }
          },
          error: (e) => {
            console.error("❌ [WebCodecs] Decoder Error:", e);
            cleanup();
            reject(e);
          },
        });

        let decoderCodec = videoTrack.codec;
        if (!decoderCodec || decoderCodec === "avc1") {
          decoderCodec = "avc1.640034";
        }

        videoDecoder.configure({
          codec: decoderCodec,
          codedWidth: originalWidth,
          codedHeight: originalHeight,
          description: trackDescription || undefined,
          hardwareAcceleration: "prefer-hardware",
        });

        // Use larger extraction batch size to keep hardware pipeline saturated at high FPS
        const sampleBatchSize = isMobile ? 16 : 64;
        mp4boxfile.setExtractionOptions(videoTrack.id, null, { nbSamples: sampleBatchSize });
        if (audioTrack) {
          mp4boxfile.setExtractionOptions(audioTrack.id, null, { nbSamples: sampleBatchSize });
        }
        mp4boxfile.start();
      } catch (initErr) {
        console.error("❌ [WebCodecs] Init Error:", initErr);
        cleanup();
        reject(initErr);
      }
    };

    const pendingSamples: any[] = [];
    let isStreamingComplete = false;
    let isPumping = false;
    let pumpResolve: (() => void) | null = null;

    async function pumpSamples() {
      if (isPumping) return;
      isPumping = true;

      const maxQueue = isMobile ? 16 : 96;
      const drainQueue = isMobile ? 4 : 24;

      try {
        while (!isCleanedUp) {
          if (pendingSamples.length === 0) {
            if (isStreamingComplete) break;
            await new Promise((r) => setTimeout(r, 4));
            continue;
          }

          // GPU Queue Backpressure: Wait if decoder or encoder is full
          if (
            (videoDecoder && videoDecoder.decodeQueueSize > maxQueue) ||
            (videoEncoder && videoEncoder.encodeQueueSize > maxQueue)
          ) {
            await new Promise<void>((resolve) => {
              let resolved = false;
              let timer: any = null;
              const finish = () => {
                if (!resolved) {
                  resolved = true;
                  if (timer) clearInterval(timer);
                  if (videoDecoder) videoDecoder.ondequeue = null;
                  if (videoEncoder) videoEncoder.ondequeue = null;
                  resolve();
                }
              };

              const check = () => {
                const dec = videoDecoder ? videoDecoder.decodeQueueSize : 0;
                const enc = videoEncoder ? videoEncoder.encodeQueueSize : 0;
                if (dec <= drainQueue && enc <= drainQueue) {
                  finish();
                }
              };

              if (videoDecoder) videoDecoder.ondequeue = check;
              if (videoEncoder) videoEncoder.ondequeue = check;
              timer = setInterval(check, 8);
              setTimeout(finish, 800); // Safety unblock
            });
          }

          // Feed high-throughput batch of samples to hardware decoder
          const batchSize = isMobile ? 8 : 24;
          const batch = pendingSamples.splice(0, Math.min(batchSize, pendingSamples.length));
          for (const sample of batch) {
            const type: EncodedVideoChunkType = sample.is_sync ? "key" : "delta";
            const chunk = new EncodedVideoChunk({
              type: type,
              timestamp: (sample.cts * 1_000_000) / sample.timescale,
              duration: (sample.duration * 1_000_000) / sample.timescale,
              data: sample.data,
            });
            videoDecoder?.decode(chunk);
          }

          if (batch.length > 0 && typeof mp4boxfile.releaseUsedSamples === "function") {
            try {
              mp4boxfile.releaseUsedSamples(videoTrack.id, batch[batch.length - 1].number);
            } catch (_) {}
          }
          if (mp4boxfile.stream && typeof mp4boxfile.stream.cleanBuffers === "function") {
            try {
              mp4boxfile.stream.cleanBuffers();
            } catch (_) {}
          }
        }
      } finally {
        isPumping = false;
        if (pumpResolve) {
          pumpResolve();
          pumpResolve = null;
        }
      }
    }

    mp4boxfile.onSamples = (trackId: number, ref: any, samples: any[]) => {
      if (videoTrack && trackId === videoTrack.id) {
        for (const sample of samples) {
          pendingSamples.push(sample);
        }
        pumpSamples();
      } else if (audioTrack && trackId === audioTrack.id && muxer) {
        try {
          for (const sample of samples) {
            const cts = typeof sample.cts !== "undefined" ? sample.cts : (sample.dts || 0);
            let timestamp = (cts * 1_000_000) / sample.timescale;
            const duration = (sample.duration * 1_000_000) / sample.timescale;
            const type: "key" | "delta" = sample.is_sync === false ? "delta" : "key";

            if (timestamp <= lastAudioTimestamp) {
              timestamp = lastAudioTimestamp + 1000;
            }
            lastAudioTimestamp = timestamp;

            let meta: any = undefined;
            if (isFirstAudioChunk) {
              isFirstAudioChunk = false;
              if (audioTrackDescription) {
                meta = {
                  decoderConfig: {
                    codec: audioCodec || "aac",
                    description: audioTrackDescription,
                    numberOfChannels: audioChannels,
                    sampleRate: audioSampleRate,
                  },
                };
              }
            }

            muxer.addAudioChunkRaw(sample.data, type, timestamp, duration, meta);
            audioChunkCount++;
          }
          if (samples.length > 0 && typeof mp4boxfile.releaseUsedSamples === "function") {
            try {
              mp4boxfile.releaseUsedSamples(trackId, samples[samples.length - 1].number);
            } catch (_) {}
          }
          if (mp4boxfile.stream && typeof mp4boxfile.stream.cleanBuffers === "function") {
            try {
              mp4boxfile.stream.cleanBuffers();
            } catch (_) {}
          }
        } catch (audioErr) {
          console.warn("⚠️ [WebCodecs] Audio mux warning:", audioErr);
        }
      }
    };

    // File chunks feed karna stream reader ke sath
    try {
      const reader = file.stream().getReader();
      let offset = 0;

      while (true) {
        // Prevent sample queue from growing excessively in memory
        while (pendingSamples.length > 64 && !isCleanedUp) {
          await new Promise((r) => setTimeout(r, 15));
        }

        const { done, value } = await reader.read();
        if (done) {
          mp4boxfile.flush();
          break;
        }

        const buf: any = value.buffer;
        buf.fileStart = offset;
        offset += buf.byteLength;
        mp4boxfile.appendBuffer(buf);

        // Immediate buffer cleanup
        if (mp4boxfile.stream && typeof mp4boxfile.stream.cleanBuffers === "function") {
          try {
            mp4boxfile.stream.cleanBuffers();
          } catch (_) {}
        }

        // Active Reading & Preparing Feedback during startup
        if (!isReady && onProgress) {
          const now = performance.now();
          if (now - lastReadProgressTime > 150) {
            lastReadProgressTime = now;
            const mbRead = (offset / (1024 * 1024)).toFixed(0);
            const mbTotal = (originalSize / (1024 * 1024)).toFixed(0);
            const readPercent = Math.min(5, Math.round((offset / originalSize) * 5));
            onProgress({
              ratio: (offset / originalSize) * 0.05,
              percent: readPercent,
              speed: `Reading & Preparing (${mbRead}/${mbTotal} MB)`,
            });
          }
        }
      }

      console.log("⏳ [WebCodecs] File streaming finished, pumping remaining frames...");
      isStreamingComplete = true;
      pumpSamples();

      // Wait until all pending video samples have been fed into decoder
      if (pendingSamples.length > 0 || isPumping) {
        await new Promise<void>((resolve) => {
          pumpResolve = resolve;
          pumpSamples();
        });
      }

      console.log("⏳ [WebCodecs] All samples dispatched to decoder, flushing decoders...");

      // Encoding mukammal hone ka intezar
      if (videoDecoder && videoDecoder.state !== "closed") {
        await videoDecoder.flush();
      }
      if (videoEncoder && videoEncoder.state !== "closed") {
        await videoEncoder.flush();
      }

      console.log("🏁 [WebCodecs] Flushed! Total encoded chunks:", encodedCount, "Audio chunks:", audioChunkCount);

      // Safe finalize call
      setTimeout(() => {
        try {
          if (encodedCount === 0) {
            throw new Error("Zero video frames were produced by hardware encoder.");
          }
          muxer.finalize();
          const buffer = muxer.target.buffer;
          const outputBlob = new Blob([buffer], { type: "video/mp4" });
          const totalTimeMs = Math.round(performance.now() - startTime);
          const outputSize = outputBlob.size;
          const reductionPercentage = Math.round(
            ((originalSize - outputSize) / originalSize) * 100
          );

          if (onProgress) {
            onProgress({ ratio: 1.0, percent: 100, estimatedRemainingSecs: 0 });
          }

          cleanup();
          resolve({
            outputBlob,
            outputSize,
            originalSize,
            durationSecs: (videoTrack?.duration || 0) / (videoTrack?.timescale || 1),
            processTimeMs: totalTimeMs,
            reductionPercentage,
            mimeType: "video/mp4",
          });
        } catch (finErr) {
          console.error("❌ [WebCodecs] Finalize Error:", finErr);
          cleanup();
          reject(finErr);
        }
      }, 60);
    } catch (err) {
      console.error("❌ [WebCodecs] Stream loop error:", err);
      cleanup();
      reject(err);
    }
  });
}
