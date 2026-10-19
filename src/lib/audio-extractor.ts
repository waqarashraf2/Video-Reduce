/**
 * Utility to extract audio from video/audio files (MP4, WebM, MOV, MKV, MP3, WAV, etc.)
 * in client-side JavaScript using the native Web Audio API.
 */

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0, j = 0; i < left.length; i++, j += 2) {
      result[j] = left[i];
      result[j + 1] = right[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = result.length * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  /* fmt sub-chunk */
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  /* data sub-chunk */
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Write PCM 16-bit samples
  let offset = 44;
  for (let i = 0; i < result.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

export async function extractAudioFromMediaFile(
  file: File
): Promise<{ audioUrl: string; audioBlob: Blob; duration: number; isFromVideo: boolean }> {
  const isVideo =
    file.type.startsWith("video/") ||
    /\.(mp4|webm|mov|mkv|avi|m4v|flv)$/i.test(file.name);

  // If the file is already an audio file (e.g. mp3, wav, m4a, ogg):
  if (!isVideo && file.type.startsWith("audio/")) {
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    await new Promise((resolve) => {
      audio.onloadedmetadata = () => resolve(true);
      audio.onerror = () => resolve(true);
    });
    return {
      audioUrl,
      audioBlob: file,
      duration: isFinite(audio.duration) ? audio.duration : 0,
      isFromVideo: false,
    };
  }

  // If the file is a video (MP4, WebM, MOV, MKV, etc.), extract audio:
  try {
    const arrayBuffer = await file.arrayBuffer();
    const AudioCtxClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) throw new Error("AudioContext not supported");
    const audioCtx = new AudioCtxClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;
    const wavBlob = audioBufferToWav(audioBuffer);
    const audioUrl = URL.createObjectURL(wavBlob);
    try {
      audioCtx.close();
    } catch {}

    return {
      audioUrl,
      audioBlob: wavBlob,
      duration,
      isFromVideo: true,
    };
  } catch (err) {
    console.warn("Direct AudioContext decode failed, falling back to direct video audio playback:", err);
    const fallbackUrl = URL.createObjectURL(file);
    const audio = new Audio(fallbackUrl);
    await new Promise((resolve) => {
      audio.onloadedmetadata = () => resolve(true);
      audio.onerror = () => resolve(true);
    });
    return {
      audioUrl: fallbackUrl,
      audioBlob: file,
      duration: isFinite(audio.duration) ? audio.duration : 0,
      isFromVideo: true,
    };
  }
}
