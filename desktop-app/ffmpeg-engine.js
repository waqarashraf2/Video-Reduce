const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// 1. Locate Native FFmpeg and FFprobe binaries
try {
  const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
  const ffprobeInstaller = require("@ffprobe-installer/ffprobe");

  let ffmpegPath = ffmpegInstaller.path;
  let ffprobePath = ffprobeInstaller.path;

  if (ffmpegPath.includes("app.asar")) {
    ffmpegPath = ffmpegPath.replace("app.asar", "app.asar.unpacked");
  }
  if (ffprobePath.includes("app.asar")) {
    ffprobePath = ffprobePath.replace("app.asar", "app.asar.unpacked");
  }

  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);
  console.log("✅ [Native FFmpeg Engine] Loaded FFmpeg from:", ffmpegPath);
} catch (err) {
  console.warn("⚠️ [Native FFmpeg Engine] Falling back to system FFmpeg:", err.message);
}

// Active jobs map for cancellation
const activeJobs = new Map();

/**
 * Extract comprehensive metadata directly from video file on disk
 */
function probeVideoFile(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find((s) => s.codec_type === "video");
      const audioStream = metadata.streams.find((s) => s.codec_type === "audio");
      const stats = fs.statSync(filePath);

      let calculatedFps = 30;
      if (videoStream && videoStream.r_frame_rate) {
        const parts = videoStream.r_frame_rate.split("/");
        if (parts.length === 2 && Number(parts[1]) > 0) {
          calculatedFps = Number(parts[0]) / Number(parts[1]);
        }
      }

      resolve({
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        duration: metadata.format.duration || 0,
        bitrate: metadata.format.bit_rate || 0,
        format: metadata.format.format_name,
        width: videoStream ? videoStream.width : 0,
        height: videoStream ? videoStream.height : 0,
        codec: videoStream ? videoStream.codec_name : "unknown",
        fps: Math.round(calculatedFps) || 30,
        hasAudio: !!audioStream,
      });
    });
  });
}

/**
 * Execute native FFmpeg operation based on selected Tool
 */
function processVideoTool(jobId, toolId, options, onProgress) {
  return new Promise(async (resolve, reject) => {
    const { inputPath, outputPath } = options;

    if (!fs.existsSync(inputPath)) {
      return reject(new Error(`Input file not found: ${inputPath}`));
    }

    let meta;
    try {
      meta = await probeVideoFile(inputPath);
    } catch (e) {
      meta = { duration: 1, size: 0, fps: 30 };
    }

    const duration = meta.duration || 1;
    const command = ffmpeg(inputPath);
    activeJobs.set(jobId, command);

    // Apply Tool Configurations
    if (toolId === "video-compressor") {
      const {
        compressionMode = "percentage",
        targetPercent = 50,
        targetSizeMB,
        crf = 26,
        preset = "veryfast",
        resolution = "original",
      } = options;

      const videoFilters = [];
      if (resolution === "1080p") videoFilters.push("scale=-2:'min(1080,ih)'");
      else if (resolution === "720p") videoFilters.push("scale=-2:'min(720,ih)'");
      else if (resolution === "480p") videoFilters.push("scale=-2:'min(480,ih)'");

      if (videoFilters.length > 0) command.videoFilters(videoFilters);

      let calculatedVideoBitrateKbps = null;
      if (compressionMode === "target-size" && targetSizeMB && targetSizeMB > 0) {
        const totalBits = targetSizeMB * 8 * 1024 * 1024;
        const totalBitrate = totalBits / duration;
        calculatedVideoBitrateKbps = Math.max(100, Math.floor((totalBitrate - 128 * 1024) / 1024));
      } else if (compressionMode === "percentage" && targetPercent) {
        const targetRatio = Math.max(0.1, Math.min(0.95, (100 - targetPercent) / 100));
        const calculatedTotal = (meta.size * 8 * targetRatio) / duration;
        calculatedVideoBitrateKbps = Math.max(150, Math.floor(calculatedTotal / 1024));
      }

      if (calculatedVideoBitrateKbps) {
        command.videoBitrate(`${calculatedVideoBitrateKbps}k`);
        command.outputOptions([
          "-c:v", "libx264",
          "-preset", preset || "ultrafast",
          "-threads", "0",
          "-tune", "fastdecode",
          "-pix_fmt", "yuv420p",
          "-movflags", "+faststart"
        ]);
      } else {
        command.outputOptions([
          "-c:v", "libx264",
          "-crf", String(crf),
          "-preset", preset || "ultrafast",
          "-threads", "0",
          "-tune", "fastdecode",
          "-pix_fmt", "yuv420p",
          "-movflags", "+faststart"
        ]);
      }
      if (meta.hasAudio) command.audioCodec("aac").audioBitrate("128k");
    } else if (toolId === "video-to-gif") {
      const fps = options.fps || 15;
      const width = options.width || 480;
      command.outputOptions([
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        "-loop", "0"
      ]);
    } else if (toolId === "video-trimmer") {
      if (options.startTime !== undefined) command.setStartTime(options.startTime);
      if (options.duration !== undefined) command.setDuration(options.duration);
      command.outputOptions(["-c", "copy"]);
    } else if (toolId === "audio-extractor") {
      command.noVideo();
      const format = options.format || "mp3";
      if (format === "mp3") command.audioCodec("libmp3lame").audioBitrate("192k");
      else if (format === "wav") command.audioCodec("pcm_s16le");
      else if (format === "aac") command.audioCodec("aac").audioBitrate("192k");
    } else if (toolId === "video-speed") {
      const speed = options.speed || 1.5;
      const pts = 1 / speed;
      command.outputOptions([
        "-filter_complex", `[0:v]setpts=${pts}*PTS[v];[0:a]atempo=${speed}[a]`,
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "veryfast"
      ]);
    } else if (toolId === "video-rotate") {
      const rotation = options.rotation || 90;
      let transpose = "1"; // 90 clockwise
      if (rotation === 180) transpose = "2,transpose=2";
      else if (rotation === 270) transpose = "2";
      command.outputOptions(["-vf", `transpose=${transpose}`, "-c:a", "copy"]);
    } else if (toolId === "video-mute") {
      command.noAudio().outputOptions(["-c:v", "copy"]);
    } else if (toolId === "video-reverse") {
      command.outputOptions(["-vf", "reverse", "-af", "areverse", "-c:v", "libx264", "-preset", "fast"]);
    } else {
      // Default Fast MP4 Remux / Transcode
      command.outputOptions(["-c:v", "libx264", "-preset", "veryfast", "-movflags", "+faststart"]);
      if (meta.hasAudio) command.audioCodec("aac").audioBitrate("128k");
    }

    // Attach Progress and Execution Handlers
    const startTime = Date.now();
    command
      .on("start", (cmd) => {
        console.log(`🎬 [FFmpeg Task ${jobId}] Command:`, cmd);
        if (onProgress) onProgress({ percent: 0, speed: "Starting..." });
      })
      .on("progress", (p) => {
        if (onProgress) {
          const pct = Math.min(100, Math.max(0, p.percent || (p.frames && meta.fps ? (p.frames / (duration * meta.fps)) * 100 : 0)));
          onProgress({
            percent: pct,
            fps: p.currentFps || 0,
            currentFps: p.currentFps || 0,
            timemark: p.timemark || "",
            currentKbps: p.currentKbps || 0,
          });
        }
      })
      .on("end", () => {
        activeJobs.delete(jobId);
        const outStats = fs.existsSync(outputPath) ? fs.statSync(outputPath) : { size: 0 };
        const processingTimeMs = Date.now() - startTime;
        const savedBytes = Math.max(0, meta.size - outStats.size);
        const reductionPct = meta.size ? Math.round((savedBytes / meta.size) * 100) : 0;

        resolve({
          outputPath,
          originalSize: meta.size,
          outputSize: outStats.size,
          savedBytes,
          reductionPercentage: reductionPct,
          processingTimeMs,
          durationSecs: duration,
        });
      })
      .on("error", (err) => {
        activeJobs.delete(jobId);
        reject(err);
      })
      .save(outputPath);
  });
}

function cancelJob(jobId) {
  const cmd = activeJobs.get(jobId);
  if (cmd) {
    try {
      cmd.kill("SIGKILL");
      activeJobs.delete(jobId);
      return true;
    } catch (_) {}
  }
  return false;
}

module.exports = {
  probeVideoFile,
  processVideoTool,
  cancelJob,
};
