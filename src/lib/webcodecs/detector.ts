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
 * Checks if the current file can be processed via WebCodecs + MP4Box.
 * Supports MP4, MOV, and M4V container files.
 */
export function isWebCodecsEligible(toolId: string, file: File): boolean {
  if (!isWebCodecsSupported()) return false;
  if (toolId !== "video-compressor") return false;

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const isMp4OrMov =
    fileType.includes("mp4") ||
    fileType.includes("quicktime") ||
    fileName.endsWith(".mp4") ||
    fileName.endsWith(".mov") ||
    fileName.endsWith(".m4v");

  return isMp4OrMov;
}
