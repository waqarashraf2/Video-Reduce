/**
 * WebCodecs Feature Detection & Eligibility Utilities
 */

export function isWebCodecsSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "VideoEncoder" in window &&
    "VideoDecoder" in window &&
    "VideoFrame" in window &&
    "EncodedVideoChunk" in window
  );
}

/**
 * Checks if the current file can be processed via WebCodecs GPU Hardware Engine.
 * Supports MP4, MOV, M4V, MKV, 3GP, TS, and WebM container files.
 */
export function isWebCodecsEligible(toolId: string, file: File): boolean {
  if (!isWebCodecsSupported()) return false;
  if (toolId !== "video-compressor") return false;

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const isEligibleContainer =
    fileType.includes("mp4") ||
    fileType.includes("quicktime") ||
    fileType.includes("matroska") ||
    fileType.includes("webm") ||
    fileName.endsWith(".mp4") ||
    fileName.endsWith(".mov") ||
    fileName.endsWith(".m4v") ||
    fileName.endsWith(".mkv") ||
    fileName.endsWith(".webm") ||
    fileName.endsWith(".ts") ||
    fileName.endsWith(".avi") ||
    fileName.endsWith(".3gp");

  return isEligibleContainer;
}
