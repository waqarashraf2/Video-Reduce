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
  return MP4Box;
};

/**
 * Extracts codec private data (AVC Parameter Sets: SPS / PPS) from MP4Box metadata.
 */
function getTrackDescription(mp4boxfile: any, track: any): Uint8Array | null {
  try {
    const mp4box = getMP4Box();
    const DataStreamClass = mp4box.DataStream || (window as any).DataStream;

    for (const entry of mp4boxfile.moov.traks) {
      if (entry.tkhd.track_id === track.id) {
        const stsdEntry = entry.mdia.minf.stbl.stsd.entries[0];
        const box = stsdEntry.avcC || stsdEntry.hvcC || stsdEntry.vpcC;
        if (box && DataStreamClass) {
          const stream = new DataStreamClass(undefined, 0, DataStreamClass.BIG_ENDIAN ?? false);
          box.write(stream);
          return new Uint8Array(stream.buffer, 8); // Strip 8-byte box header
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

    mp4boxfile.onReady = (info: any) => {
      try {
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

        // H.264 requires even width and height
        const width = videoTrack.video.width - (videoTrack.video.width % 2);
        const height = videoTrack.video.height - (videoTrack.video.height % 2);

        // Track description extract karein (AVC Parameter Sets)
        trackDescription = getTrackDescription(mp4boxfile, videoTrack);

        // Detect video rotation (for TikTok / mobile portrait videos)
        const videoRotation = getVideoRotation(mp4boxfile, videoTrack);

        // 1. Muxer Setup (Strictly in-memory FastStart)
        muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: {
            codec: "avc",
            width: width,
            height: height,
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
          codedWidth: width,
          codedHeight: height,
          description: trackDescription || undefined,
          colorSpace: {
            primaries: "bt709",
            transfer: "bt709",
            matrix: "bt709",
            fullRange: false,
          },
        };

        let isFirstOutputChunk = true;

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
              // For all subsequent chunks, pass metadata directly (usually undefined)
              meta = metadata;
            }

            muxer.addVideoChunk(chunk, meta);
          },
          error: (e) => {
            console.error("❌ [WebCodecs] Encoder Error:", e);
            cleanup();
            reject(e);
          },
        });

        const targetBitrate = Math.max(100_000, options.targetBitrateKbps * 1000);

        // Level 5.2 (avc1.640034) supports up to 4K resolution
        videoEncoder.configure({
          codec: "avc1.640034",
          width: width,
          height: height,
          bitrate: targetBitrate,
          framerate: options.framerate || 30,
          hardwareAcceleration: "prefer-hardware",
        });

        // 3. Hardware VideoDecoder (Zero-copy GPU direct to encoder)
        videoDecoder = new VideoDecoder({
          output: (videoFrame) => {
            try {
              // Har 60 frames par keyframe generate karein
              const keyFrame = processedSamples === 0 || processedSamples % 60 === 0;
              videoEncoder.encode(videoFrame, { keyFrame });
              videoFrame.close();

              processedSamples++;
              if (onProgress && totalSamples > 0) {
                const ratio = Math.min(0.99, processedSamples / totalSamples);
                const elapsedSecs = (performance.now() - startTime) / 1000;
                const estimatedTotal = elapsedSecs / (ratio || 0.01);
                const remainingSecs = Math.max(0, Math.round(estimatedTotal - elapsedSecs));

                onProgress({
                  ratio,
                  percent: Math.round(ratio * 100),
                  fps: Math.round(processedSamples / (elapsedSecs || 1)),
                  estimatedRemainingSecs: remainingSecs,
                });
              }
            } catch (frameErr) {
              console.error("❌ [WebCodecs] Frame Error:", frameErr);
              cleanup();
              reject(frameErr);
            }
          },
          error: (e) => {
            console.error("❌ [WebCodecs] Decoder Error:", e);
            cleanup();
            reject(e);
          },
        });

        videoDecoder.configure({
          codec: videoTrack.codec,
          codedWidth: width,
          codedHeight: height,
          description: trackDescription || undefined,
          hardwareAcceleration: "prefer-hardware",
        });

        mp4boxfile.setExtractionOptions(videoTrack.id, null, { nbSamples: 100 });
        if (audioTrack) {
          mp4boxfile.setExtractionOptions(audioTrack.id, null, { nbSamples: 100 });
        }
        mp4boxfile.start();
      } catch (initErr) {
        console.error("❌ [WebCodecs] Init Error:", initErr);
        cleanup();
        reject(initErr);
      }
    };

    mp4boxfile.onSamples = (trackId: number, ref: any, samples: any[]) => {
      if (videoTrack && trackId === videoTrack.id) {
        for (const sample of samples) {
          const type: EncodedVideoChunkType = sample.is_sync ? "key" : "delta";
          const chunk = new EncodedVideoChunk({
            type: type,
            timestamp: (sample.cts * 1_000_000) / sample.timescale,
            duration: (sample.duration * 1_000_000) / sample.timescale,
            data: sample.data,
          });
          videoDecoder?.decode(chunk);
        }
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
        const { done, value } = await reader.read();
        if (done) {
          mp4boxfile.flush();
          break;
        }
        const buf: any = value.buffer;
        buf.fileStart = offset;
        offset += buf.byteLength;
        mp4boxfile.appendBuffer(buf);
      }

      console.log("⏳ [WebCodecs] File streaming finished, flushing decoders...");

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
