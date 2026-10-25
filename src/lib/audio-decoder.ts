import { FFmpeg } from "@ffmpeg/ffmpeg";

/**
 * Robust audio decoder for Web Audio API.
 * First tries native AudioContext.decodeAudioData.
 * If native decode fails (e.g. video files like MP4/MKV/MOV/WebM or unsupported audio streams),
 * it seamlessly demuxes the audio into clean 16-bit 44.1kHz stereo PCM WAV using FFmpeg WebAssembly.
 */
export async function decodeAudioWithFallback(
  file: File,
  ctx: AudioContext,
  getFFmpeg: () => Promise<FFmpeg>,
  onStatus?: (status: string) => void
): Promise<AudioBuffer> {
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const arrayBuffer = await file.arrayBuffer();

  // 1. Fast Path: Native Web Audio decode (instant for standard audio files like WAV, MP3, OGG)
  try {
    return await ctx.decodeAudioData(arrayBuffer.slice(0));
  } catch (nativeErr) {
    console.warn(
      "[AudioDecoder] Native decodeAudioData failed, demuxing audio with WebAssembly FFmpeg:",
      nativeErr
    );
  }

  // 2. Fallback Path: Demux and extract clean PCM WAV using FFmpeg WebAssembly
  if (onStatus) {
    onStatus("Demuxing audio track with WebAssembly media engine...");
  }

  const ffmpeg = await getFFmpeg();
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const inName = `input_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const outName = `extracted_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.wav`;

  try {
    await ffmpeg.writeFile(inName, new Uint8Array(arrayBuffer));

    let exitCode = await ffmpeg.exec([
      "-i",
      inName,
      "-vn",
      "-c:a",
      "pcm_s16le",
      "-ar",
      "44100",
      "-ac",
      "2",
      outName,
    ]);

    if (exitCode !== 0) {
      exitCode = await ffmpeg.exec([
        "-i",
        inName,
        "-map",
        "0:a:0",
        "-vn",
        "-c:a",
        "pcm_s16le",
        "-ar",
        "44100",
        "-ac",
        "2",
        outName,
      ]);
    }

    if (exitCode !== 0) {
      throw new Error("Could not extract audio track. Video might not contain an audio stream.");
    }

    const wavData = await ffmpeg.readFile(outName);
    const wavBuffer = (wavData as Uint8Array).buffer.slice(
      (wavData as Uint8Array).byteOffset,
      (wavData as Uint8Array).byteOffset + (wavData as Uint8Array).byteLength
    ) as ArrayBuffer;

    return await ctx.decodeAudioData(wavBuffer);
  } finally {
    try {
      await ffmpeg.deleteFile(inName);
    } catch (_) {}
    try {
      await ffmpeg.deleteFile(outName);
    } catch (_) {}
  }
}
