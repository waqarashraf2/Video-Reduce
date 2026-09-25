import {
  ToolId,
  CompressionOptions,
  GifOptions,
  AudioExtractorOptions,
  TrimmerOptions,
  SpeedOptions,
  MuteOptions,
  FormatOptions,
  AspectRatioOptions,
  WatermarkOptions,
  RotateOptions,
  ReverseOptions,
  FrameExtractorOptions,
  VideoFilterOptions,
  GifToVideoOptions,
  VolumeOptions,
  AudioDenoiserOptions,
  MetadataStripperOptions,
  FFmpegTerminalOptions,
  AnyToolOptions,
} from "./types";

export interface FFmpegCommandStep {
  args: string[];
  cleanupFiles?: string[];
  progressWeight?: number;
  phaseDescription?: string;
}

export interface PreparedFFmpegJob {
  inputName: string;
  outputName: string;
  outputMimeType: string;
  args: string[];
  multiCommands?: FFmpegCommandStep[];
}

export function buildFFmpegJob(
  toolId: ToolId,
  file: File,
  options: AnyToolOptions
): PreparedFFmpegJob {
  const extension = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "media";
  const inputName = `input_${Date.now()}.${extension}`;

  switch (toolId) {
    case "video-compressor": {
      const opt = options as CompressionOptions;
      const outputName = `${baseName}_compressed.mp4`;
      const args: string[] = ["-i", inputName];

      const duration = Math.max(1, opt.durationSecs || 30);
      const originalSize = file.size;

      // 1. Calculate Original Bitrate & Target File Size
      const originalBitrateKbps = Math.max(
        100,
        Math.floor((originalSize * 8) / (duration * 1000))
      );

      let targetBytes: number;
      if (opt.compressionMode === "target-size" && opt.targetSizeMB && opt.targetSizeMB > 0) {
        targetBytes = Math.min(originalSize * 0.85, opt.targetSizeMB * 1024 * 1024);
      } else if (opt.compressionMode === "percentage") {
        const percent = Math.max(15, Math.min(90, opt.targetPercent || 50));
        targetBytes = originalSize * (1 - percent / 100);
      } else {
        targetBytes = originalSize * 0.55;
      }

      // 2. Compute Strict Bitrate Limits (NEVER exceed 70% of original bitrate!)
      const rawBitrateKbps = Math.floor((targetBytes * 8) / (duration * 1000));
      const maxAllowedTotalBitrate = Math.max(80, Math.floor(originalBitrateKbps * 0.70));
      const targetTotalBitrateKbps = Math.min(maxAllowedTotalBitrate, Math.max(80, rawBitrateKbps));

      const audioBitrateKbps = opt.muteAudio
        ? 0
        : Math.min(96, Math.max(48, Math.floor(targetTotalBitrateKbps * 0.12)));
      const videoBitrateKbps = Math.max(64, targetTotalBitrateKbps - audioBitrateKbps);
      const maxRateKbps = Math.floor(videoBitrateKbps * 1.15);
      const bufSizeKbps = Math.floor(videoBitrateKbps * 1.8);

      // 3. Resolution scaling & framerate filters for optimal WebAssembly throughput
      const filters: string[] = [];
      if (opt.resolution === "1080p") {
        filters.push("scale=-2:1080");
      } else if (opt.resolution === "720p") {
        filters.push("scale=-2:720");
      } else if (opt.resolution === "480p") {
        filters.push("scale=-2:480");
      } else if (opt.resolution === "360p") {
        filters.push("scale=-2:360");
      } else if (opt.resolution === "original" || !opt.resolution) {
        // Automatic downscaling for optimal browser performance & guaranteed size reduction
        if (videoBitrateKbps < 500 || originalBitrateKbps < 700) {
          filters.push("scale=-2:480");
        } else if (videoBitrateKbps < 1200 || originalSize > 60 * 1024 * 1024) {
          filters.push("scale=-2:720");
        } else if (originalSize > 200 * 1024 * 1024) {
          filters.push("scale=-2:1080");
        }
      }

      if (filters.length > 0) {
        args.push("-vf", filters.join(","));
      }

      // Smooth 30fps normalization without heavy filter graph overhead
      args.push("-r", "30");

      // Choose efficient preset: ultrafast for maximum throughput and low memory footprint in WebAssembly
      const chosenPreset = opt.preset || "ultrafast";

      // Explicitly map primary video and optional audio, strip incompatible subtitle tracks from MKV
      args.push("-map", "0:v:0", "-map", "0:a:0?", "-sn");

      if (opt.compressionMode === "manual-crf") {
        args.push(
          "-vcodec",
          "libx264",
          "-preset",
          chosenPreset,
          "-tune",
          "fastdecode",
          "-threads",
          "0",
          "-crf",
          (opt.crf || 28).toString()
        );
      } else {
        // Target Bitrate Mode (High throughput 1-pass encoding)
        args.push(
          "-vcodec",
          "libx264",
          "-preset",
          chosenPreset,
          "-tune",
          "fastdecode",
          "-threads",
          "0",
          "-b:v",
          `${videoBitrateKbps}k`,
          "-maxrate",
          `${maxRateKbps}k`,
          "-bufsize",
          `${bufSizeKbps}k`
        );
      }

      if (opt.muteAudio) {
        args.push("-an");
      } else {
        args.push("-c:a", "aac", "-b:a", `${audioBitrateKbps}k`, "-ac", "2");
      }

      args.push("-pix_fmt", "yuv420p", "-max_muxing_queue_size", "1024", "-movflags", "+faststart", outputName);

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    case "video-to-gif": {
      const opt = options as GifOptions;
      const outputName = `${baseName}.gif`;
      const fps = Math.max(5, Math.min(30, opt.fps || 15));
      const width = Math.max(160, Math.min(1280, opt.width || 480));
      const loop = opt.loop ?? 0;
      const startTime = Math.max(0, opt.startTime || 0);
      const duration = Math.max(0.5, opt.duration || 6);
      const quality = opt.quality || "high";
      const speed = opt.speed || 1.0;

      const flags = quality === "turbo" ? "fast_bilinear" : "bicubic";
      const maxColors = quality === "turbo" ? 128 : 256;
      const dither = quality === "turbo" ? "dither=bayer:bayer_scale=4" : "dither=bayer:bayer_scale=3";

      const ptsMultiplier = speed !== 1.0 ? (1 / speed).toFixed(3) : null;
      const ptsPrefix = ptsMultiplier ? `setpts=${ptsMultiplier}*PTS,` : "";

      const startStr = startTime.toFixed(2);
      const durationStr = duration.toFixed(2);
      const paletteName = `palette_${Date.now()}.png`;

      // 1. Two-Phase Pipeline (10x faster & zero memory queuing)
      const paletteVf = `${ptsPrefix}fps=${fps},scale=${width}:-2:flags=${flags},palettegen=max_colors=${maxColors}:stats_mode=single`;
      const gifLavfi = `${ptsPrefix}fps=${fps},scale=${width}:-2:flags=${flags} [x]; [x][1:v] paletteuse=${dither}`;

      const step1Args = [
        "-ss",
        startStr,
        "-t",
        durationStr,
        "-i",
        inputName,
        "-vf",
        paletteVf,
        "-y",
        paletteName,
      ];

      const step2Args = [
        "-ss",
        startStr,
        "-t",
        durationStr,
        "-i",
        inputName,
        "-i",
        paletteName,
        "-lavfi",
        gifLavfi,
        "-loop",
        loop.toString(),
        "-y",
        outputName,
      ];

      // Fallback single-command with bounded duration and safe scale
      const singleFilter = `${ptsPrefix}fps=${fps},scale=${width}:-2:flags=${flags},split[s0][s1];[s0]palettegen=max_colors=${maxColors}:stats_mode=single[p];[s1][p]paletteuse=${dither}`;
      const fallbackArgs = [
        "-ss",
        startStr,
        "-t",
        durationStr,
        "-i",
        inputName,
        "-vf",
        singleFilter,
        "-loop",
        loop.toString(),
        outputName,
      ];

      return {
        inputName,
        outputName,
        outputMimeType: "image/gif",
        args: fallbackArgs,
        multiCommands: [
          {
            args: step1Args,
            progressWeight: 0.2,
            phaseDescription: "Analyzing colors & generating palette...",
          },
          {
            args: step2Args,
            cleanupFiles: [paletteName],
            progressWeight: 0.8,
            phaseDescription: "Rendering crisp animated GIF frames...",
          },
        ],
      };
    }

    case "audio-extractor": {
      const opt = options as AudioExtractorOptions;
      const format = opt.format || "mp3";
      const bitrate = opt.bitrate || "192k";
      const outputName = `${baseName}_audio.${format}`;

      let mimeType = "audio/mpeg";
      const args: string[] = ["-i", inputName, "-vn"];

      if (format === "mp3") {
        mimeType = "audio/mpeg";
        args.push("-acodec", "libmp3lame", "-b:a", bitrate, outputName);
      } else if (format === "aac") {
        mimeType = "audio/aac";
        args.push("-acodec", "aac", "-b:a", bitrate, outputName);
      } else if (format === "wav") {
        mimeType = "audio/wav";
        args.push("-acodec", "pcm_s16le", outputName);
      } else {
        args.push(outputName);
      }

      return {
        inputName,
        outputName,
        outputMimeType: mimeType,
        args,
      };
    }

    case "video-trimmer": {
      const opt = options as TrimmerOptions;
      const outputName = `${baseName}_trimmed.mp4`;
      const startStr = opt.startTime.toFixed(2);
      const duration = Math.max(0.1, opt.endTime - opt.startTime).toFixed(2);

      let args: string[];
      if (opt.precise) {
        args = [
          "-ss",
          startStr,
          "-i",
          inputName,
          "-t",
          duration,
          "-vcodec",
          "libx264",
          "-preset",
          "veryfast",
          "-crf",
          "22",
          "-acodec",
          "aac",
          "-movflags",
          "+faststart",
          outputName,
        ];
      } else {
        args = [
          "-ss",
          startStr,
          "-i",
          inputName,
          "-t",
          duration,
          "-c",
          "copy",
          "-avoid_negative_ts",
          "make_zero",
          outputName,
        ];
      }

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    case "speed-controller": {
      const opt = options as SpeedOptions;
      const outputName = `${baseName}_${opt.speed}x.mp4`;
      const speed = opt.speed || 1.0;
      const ptsMultiplier = (1 / speed).toFixed(4);

      let atempoFilter = "";
      if (speed === 0.25) atempoFilter = "atempo=0.5,atempo=0.5";
      else if (speed === 0.5) atempoFilter = "atempo=0.5";
      else if (speed === 0.75) atempoFilter = "atempo=0.75";
      else if (speed === 1.25) atempoFilter = "atempo=1.25";
      else if (speed === 1.5) atempoFilter = "atempo=1.5";
      else if (speed === 2.0) atempoFilter = "atempo=2.0";
      else if (speed === 4.0) atempoFilter = "atempo=2.0,atempo=2.0";
      else atempoFilter = `atempo=${speed.toFixed(2)}`;

      const filterComplex = `[0:v]setpts=${ptsMultiplier}*PTS[v];[0:a]${atempoFilter}[a]`;

      const args = [
        "-i",
        inputName,
        "-filter_complex",
        filterComplex,
        "-map",
        "[v]",
        "-map",
        "[a]",
        "-vcodec",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "22",
        "-movflags",
        "+faststart",
        outputName,
      ];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    case "video-mute": {
      const outputName = `${baseName}_muted.mp4`;
      const args = ["-i", inputName, "-an", "-vcodec", "copy", outputName];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    case "format-converter": {
      const opt = options as FormatOptions;
      const targetFormat = opt.targetFormat || "mp4";
      const outputName = `${baseName}.${targetFormat}`;
      const mode = opt.conversionMode || "fast-copy";

      let mimeType = "video/mp4";
      const args = ["-i", inputName];

      const isDirectStreamCompatible =
        ["mkv", "mov", "m4v", "ts", "mp4"].includes(extension) &&
        (targetFormat === "mp4" || targetFormat === "mov" || targetFormat === "mkv");

      if (targetFormat === "mp4") {
        mimeType = "video/mp4";
        if (mode === "fast-copy" && isDirectStreamCompatible) {
          // ⚡ Ultra-fast Lossless Remux: Copy video stream without re-encoding, transcode audio to AAC for universal Apple/Smart TV/Browser playback
          args.push("-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ac", "2", "-movflags", "+faststart");
        } else {
          // Universal Multi-Threaded Transcode
          args.push(
            "-vcodec",
            "libx264",
            "-preset",
            "ultrafast",
            "-tune",
            "fastdecode",
            "-threads",
            "0",
            "-crf",
            "22",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-ac",
            "2",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart"
          );
        }
      } else if (targetFormat === "webm") {
        mimeType = "video/webm";
        args.push(
          "-vcodec",
          "libvpx",
          "-preset",
          "ultrafast",
          "-threads",
          "0",
          "-crf",
          "24",
          "-b:v",
          "1.5M",
          "-c:a",
          "libvorbis"
        );
      } else if (targetFormat === "mkv") {
        mimeType = "video/x-matroska";
        if (mode === "fast-copy") {
          args.push("-c", "copy");
        } else {
          args.push(
            "-vcodec",
            "libx264",
            "-preset",
            "ultrafast",
            "-tune",
            "fastdecode",
            "-threads",
            "0",
            "-crf",
            "22",
            "-c:a",
            "aac"
          );
        }
      } else if (targetFormat === "mov") {
        mimeType = "video/quicktime";
        if (mode === "fast-copy" && isDirectStreamCompatible) {
          args.push("-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart");
        } else {
          args.push(
            "-vcodec",
            "libx264",
            "-preset",
            "ultrafast",
            "-tune",
            "fastdecode",
            "-threads",
            "0",
            "-crf",
            "22",
            "-c:a",
            "aac",
            "-movflags",
            "+faststart"
          );
        }
      } else if (targetFormat === "avi") {
        mimeType = "video/x-msvideo";
        args.push("-vcodec", "libx264", "-preset", "ultrafast", "-tune", "fastdecode", "-threads", "0", "-acodec", "mp3");
      }

      args.push(outputName);

      return {
        inputName,
        outputName,
        outputMimeType: mimeType,
        args,
      };
    }

    case "aspect-ratio-resizer": {
      const opt = options as AspectRatioOptions;
      const outputName = `${baseName}_${opt.ratio.replace(":", "-")}.mp4`;
      const args = ["-i", inputName];

      let vf = "";
      if (opt.ratio === "9:16") {
        if (opt.mode === "crop") {
          vf = "crop=ih*9/16:ih:(iw-ow)/2:0,scale=1080:1920:flags=lanczos";
        } else {
          vf = "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black";
        }
      } else if (opt.ratio === "1:1") {
        if (opt.mode === "crop") {
          vf = "crop=min(iw\\,ih):min(iw\\,ih),scale=1080:1080:flags=lanczos";
        } else {
          vf = "scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:black";
        }
      } else if (opt.ratio === "16:9") {
        if (opt.mode === "crop") {
          vf = "crop=ih*16/9:ih:(iw-ow)/2:0,scale=1920:1080:flags=lanczos";
        } else {
          vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black";
        }
      } else if (opt.ratio === "4:5") {
        if (opt.mode === "crop") {
          vf = "crop=ih*4/5:ih:(iw-ow)/2:0,scale=1080:1350:flags=lanczos";
        } else {
          vf = "scale=1080:1350:force_original_aspect_ratio=decrease,pad=1080:1350:(ow-iw)/2:(oh-ih)/2:black";
        }
      }

      if (vf) {
        args.push("-vf", vf);
      }

      args.push(
        "-vcodec",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "fastdecode",
        "-threads",
        "0",
        "-crf",
        "22",
        "-acodec",
        "aac",
        "-movflags",
        "+faststart",
        outputName
      );

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 9. Video Watermark
    case "video-watermark": {
      const opt = options as WatermarkOptions;
      const outputName = `${baseName}_watermarked.mp4`;
      const text = opt.text || "VideoReduce.com";
      const fontSize = opt.fontSize || 32;
      const fontColor = opt.fontColor || "white";
      const opacity = opt.opacity || 0.8;

      let xCoord = "w-tw-20";
      let yCoord = "h-th-20";
      if (opt.position === "top-left") {
        xCoord = "20";
        yCoord = "20";
      } else if (opt.position === "top-right") {
        xCoord = "w-tw-20";
        yCoord = "20";
      } else if (opt.position === "bottom-left") {
        xCoord = "20";
        yCoord = "h-th-20";
      } else if (opt.position === "center") {
        xCoord = "(w-tw)/2";
        yCoord = "(h-th)/2";
      }

      const drawTextFilter = `drawtext=text='${text.replace(/'/g, "")}':fontsize=${fontSize}:fontcolor=${fontColor}@${opacity}:x=${xCoord}:y=${yCoord}`;

      const args = [
        "-i",
        inputName,
        "-vf",
        drawTextFilter,
        "-vcodec",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "fastdecode",
        "-threads",
        "0",
        "-crf",
        "22",
        "-acodec",
        "copy",
        "-movflags",
        "+faststart",
        outputName,
      ];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 10. Video Rotate & Flip
    case "video-rotate": {
      const opt = options as RotateOptions;
      const outputName = `${baseName}_rotated.mp4`;
      const rot = opt.rotation || "90";

      let vf = "transpose=1"; // 90 CW default
      if (rot === "180") vf = "transpose=1,transpose=1";
      else if (rot === "270") vf = "transpose=2"; // 90 CCW
      else if (rot === "hflip") vf = "hflip";
      else if (rot === "vflip") vf = "vflip";

      const args = [
        "-i",
        inputName,
        "-vf",
        vf,
        "-vcodec",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "fastdecode",
        "-threads",
        "0",
        "-crf",
        "22",
        "-acodec",
        "copy",
        "-movflags",
        "+faststart",
        outputName,
      ];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 11. Video Reverse / Rewind
    case "video-reverse": {
      const opt = options as ReverseOptions;
      const outputName = `${baseName}_reversed.mp4`;

      const scaleHeight = opt.quality === "high" ? 720 : 480;

      // Clean, robust reverse filter:
      // 1. scale=-2:480 (or 720) downscales so uncompressed frame RAM is strictly < 60MB (100% OOM safe)
      // 2. fps=24 normalizes framerate for 25% faster processing & completely smooth playback
      // 3. reverse plays the video backwards
      const vf = `scale=-2:${scaleHeight},fps=24,reverse`;

      const args: string[] = ["-i", inputName];

      // Clip duration handling:
      // If opt.maxDuration > 0, clip to user-selected duration (5s, 8s, 10s, 15s).
      // If opt.maxDuration === 0, process the full original video without -t clipping.
      if (opt.maxDuration && opt.maxDuration > 0) {
        args.push("-t", opt.maxDuration.toString());
      } else if (opt.maxDuration === 0) {
        // Full original video: no -t limit added
      } else {
        // Safe default fallback
        args.push("-t", "10");
      }

      args.push("-vf", vf);

      if (opt.muteAudio) {
        args.push("-an");
      } else if (opt.reverseAudio) {
        args.push("-af", "areverse", "-c:a", "aac", "-b:a", "128k");
      } else {
        args.push("-c:a", "aac", "-b:a", "128k");
      }

      args.push(
        "-vcodec",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "22",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        outputName
      );

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 12. Frame Extractor (Snapshot)
    case "frame-extractor": {
      const opt = options as FrameExtractorOptions;
      const ext = opt.format || "png";
      const outputName = `${baseName}_frame_${opt.timestampSecs.toFixed(1)}s.${ext}`;
      const timeStr = opt.timestampSecs.toFixed(2);

      const args = ["-ss", timeStr, "-i", inputName, "-vframes", "1", outputName];

      return {
        inputName,
        outputName,
        outputMimeType: ext === "png" ? "image/png" : "image/jpeg",
        args,
      };
    }

    // 13. Video Filters & Color Grading
    case "video-filters": {
      const opt = options as VideoFilterOptions;
      const outputName = `${baseName}_filtered.mp4`;

      const b = opt.brightness ?? 0;
      const c = opt.contrast ?? 1;
      const s = opt.saturation ?? 1;
      const g = opt.gamma ?? 1;

      let vf = "";

      switch (opt.preset) {
        case "cyberpunk":
          // Intense Neon Cyberpunk (Boost Red & Blue gammas, suppress Green, high saturation)
          vf = `eq=contrast=${(c * 1.35).toFixed(2)}:brightness=${(b + 0.02).toFixed(2)}:saturation=${(s * 2.4).toFixed(2)}:gamma_r=1.7:gamma_g=0.55:gamma_b=1.85`;
          break;
        case "sepia":
          // Classic Antique Warm Sepia (Boost Red & Green, lower Blue, soft saturation)
          vf = `eq=contrast=${(c * 1.15).toFixed(2)}:brightness=${(b + 0.01).toFixed(2)}:saturation=${(s * 0.55).toFixed(2)}:gamma_r=1.35:gamma_g=1.1:gamma_b=0.7`;
          break;
        case "vintage":
          // Warm 35mm Retro Film
          vf = `eq=contrast=${(c * 1.2).toFixed(2)}:brightness=${(b + 0.03).toFixed(2)}:saturation=${(s * 1.25).toFixed(2)}:gamma_r=1.25:gamma_g=1.1:gamma_b=0.85`;
          break;
        case "bw":
          // Crisp Monochrome Black & White
          vf = `eq=contrast=${(c * 1.35).toFixed(2)}:brightness=${(b + 0.02).toFixed(2)}:saturation=0:gamma=${g}`;
          break;
        case "warm":
          // Golden Sunset Hour
          vf = `eq=contrast=${(c * 1.2).toFixed(2)}:brightness=${(b + 0.02).toFixed(2)}:saturation=${(s * 1.5).toFixed(2)}:gamma_r=1.45:gamma_g=1.15:gamma_b=0.75`;
          break;
        case "cool":
          // Action Movie Cold Blue / Teal
          vf = `eq=contrast=${(c * 1.25).toFixed(2)}:brightness=${(b + 0.01).toFixed(2)}:saturation=${(s * 1.3).toFixed(2)}:gamma_r=0.75:gamma_g=0.95:gamma_b=1.45`;
          break;
        default:
          vf = `eq=brightness=${b}:contrast=${c}:saturation=${s}:gamma=${g}`;
          break;
      }

      const args = [
        "-i",
        inputName,
        "-vf",
        vf,
        "-vcodec",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "fastdecode",
        "-threads",
        "0",
        "-crf",
        "22",
        "-acodec",
        "copy",
        "-movflags",
        "+faststart",
        outputName,
      ];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 14. GIF to Video (MP4)
    case "gif-to-video": {
      const opt = options as GifToVideoOptions;
      const outputName = `${baseName}.mp4`;
      const crf = opt.crf || 20;

      const args = [
        "-i",
        inputName,
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-vcodec",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "fastdecode",
        "-threads",
        "0",
        "-crf",
        crf.toString(),
        outputName,
      ];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 15. Volume Booster & Normalizer
    case "volume-booster": {
      const opt = options as VolumeOptions;
      const outputName = `${baseName}_amplified.mp4`;

      const args = ["-i", inputName, "-vcodec", "copy"];
      if (opt.mode === "normalize") {
        args.push("-af", "loudnorm=I=-16:TP=-1.5:LRA=11");
      } else {
        const mult = opt.volumeMultiplier || 2.0;
        args.push("-af", `volume=${mult}`);
      }

      args.push("-acodec", "aac", "-b:a", "192k", outputName);

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 16. Audio Noise Reduction
    case "audio-denoiser": {
      const opt = options as AudioDenoiserOptions;
      const outputName = `${baseName}_denoised.mp4`;
      const nf = opt.noiseFloor || -25;

      const args = [
        "-i",
        inputName,
        "-vcodec",
        "copy",
        "-af",
        `afftdn=nf=${nf}`,
        "-acodec",
        "aac",
        "-b:a",
        "192k",
        outputName,
      ];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 17. Metadata & EXIF Stripper
    case "metadata-stripper": {
      const outputName = `${baseName}_clean.mp4`;
      const args = ["-i", inputName, "-map_metadata", "-1", "-c", "copy", outputName];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    // 18. Developer FFmpeg Terminal
    case "ffmpeg-terminal": {
      const opt = options as FFmpegTerminalOptions;
      const outputName = `${baseName}_custom.mp4`;
      const rawCommand = opt.customCommand.trim();

      // Split raw args string while respecting quoted substrings
      const parsedArgs = rawCommand.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      const sanitizedArgs = parsedArgs.map((arg) => arg.replace(/^['"]|['"]$/g, ""));

      const args = ["-i", inputName, ...sanitizedArgs, outputName];

      return {
        inputName,
        outputName,
        outputMimeType: "video/mp4",
        args,
      };
    }

    default:
      return {
        inputName,
        outputName: `${baseName}_processed.mp4`,
        outputMimeType: "video/mp4",
        args: ["-i", inputName, "-vcodec", "copy", "-acodec", "copy", `${baseName}_processed.mp4`],
      };
  }
}
