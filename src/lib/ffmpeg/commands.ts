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

export interface PreparedFFmpegJob {
  inputName: string;
  outputName: string;
  outputMimeType: string;
  args: string[];
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

      // 1. Calculate Target File Size
      let targetBytes: number;
      if (opt.compressionMode === "target-size" && opt.targetSizeMB && opt.targetSizeMB > 0) {
        targetBytes = Math.min(originalSize * 0.95, opt.targetSizeMB * 1024 * 1024);
      } else if (opt.compressionMode === "percentage") {
        const percent = Math.max(10, Math.min(90, opt.targetPercent || 50));
        targetBytes = originalSize * (1 - percent / 100);
      } else {
        targetBytes = originalSize * 0.7;
      }

      // 2. Compute Strict Bitrate Limits
      const targetTotalBitrateKbps = Math.max(80, Math.floor((targetBytes * 8) / (duration * 1000)));
      const audioBitrateKbps = opt.muteAudio
        ? 0
        : Math.min(96, Math.max(48, Math.floor(targetTotalBitrateKbps * 0.12)));
      const videoBitrateKbps = Math.max(64, targetTotalBitrateKbps - audioBitrateKbps);
      const maxRateKbps = Math.floor(videoBitrateKbps * 1.15);
      const bufSizeKbps = Math.floor(videoBitrateKbps * 2);

      // 3. Resolution scaling & framerate filters for optimal WebAssembly throughput
      const filters: string[] = [];
      if (opt.resolution === "1080p") {
        filters.push("scale='min(1920,iw)':-2");
      } else if (opt.resolution === "720p") {
        filters.push("scale='min(1280,iw)':-2");
      } else if (opt.resolution === "480p") {
        filters.push("scale='min(854,iw)':-2");
      } else if (opt.resolution === "360p") {
        filters.push("scale='min(640,iw)':-2");
      } else if (opt.resolution === "original") {
        // Auto-optimize 4K to 1080p for high-ratio compressions, or scale down on low bitrates
        if (videoBitrateKbps < 350) {
          filters.push("scale='min(854,iw)':-2");
        } else if (videoBitrateKbps < 650) {
          filters.push("scale='min(1280,iw)':-2");
        } else {
          // Cap 4K/UHD at 1080p in browser memory to prevent multi-gigabyte RAM lockups & slow frame times
          filters.push("scale='min(1920,iw)':-2");
        }
      }

      // Cap framerate to 30fps for 2x faster encoding while preserving fluid playback
      filters.push("fps=fps=min(30\\,fps)");

      if (filters.length > 0) {
        args.push("-vf", filters.join(","));
      }

      const crfValue = opt.crf || (opt.targetPercent >= 70 ? 30 : opt.targetPercent >= 50 ? 28 : 24);
      const chosenPreset = opt.preset || "ultrafast";

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
        crfValue.toString(),
        "-b:v",
        `${videoBitrateKbps}k`,
        "-maxrate",
        `${maxRateKbps}k`,
        "-bufsize",
        `${bufSizeKbps}k`
      );

      if (opt.muteAudio) {
        args.push("-an");
      } else {
        args.push("-c:a", "aac", "-b:a", `${audioBitrateKbps}k`, "-ac", "2");
      }

      args.push("-movflags", "+faststart", outputName);

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
      const fps = opt.fps || 15;
      const width = opt.width || 480;
      const loop = opt.loop ?? 0;

      const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`;
      const args = ["-i", inputName, "-vf", filter, "-loop", loop.toString(), outputName];

      return {
        inputName,
        outputName,
        outputMimeType: "image/gif",
        args,
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

      let mimeType = "video/mp4";
      const args = ["-i", inputName];

      if (targetFormat === "mp4") {
        mimeType = "video/mp4";
        args.push("-vcodec", "libx264", "-acodec", "aac", "-preset", "veryfast", "-crf", "22", "-movflags", "+faststart");
      } else if (targetFormat === "webm") {
        mimeType = "video/webm";
        args.push("-vcodec", "libvpx", "-acodec", "libvorbis", "-crf", "24", "-b:v", "1M");
      } else if (targetFormat === "mkv") {
        mimeType = "video/x-matroska";
        args.push("-vcodec", "libx264", "-acodec", "aac", "-preset", "veryfast", "-crf", "22");
      } else if (targetFormat === "mov") {
        mimeType = "video/quicktime";
        args.push("-vcodec", "libx264", "-acodec", "aac", "-preset", "veryfast", "-crf", "22");
      } else if (targetFormat === "avi") {
        mimeType = "video/x-msvideo";
        args.push("-vcodec", "libx264", "-acodec", "mp3", "-preset", "veryfast");
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

      const args = ["-i", inputName];
      if (opt.muteAudio) {
        args.push("-vf", "reverse", "-an");
      } else if (opt.reverseAudio) {
        args.push("-vf", "reverse", "-af", "areverse");
      } else {
        args.push("-vf", "reverse", "-acodec", "copy");
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
