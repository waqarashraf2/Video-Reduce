/**
 * Fast client-side Matroska (.mkv) and WebM (.webm) header duration probe
 * Parses EBML Info element to extract duration in milliseconds instantly without full decoding.
 */
export async function probeMkvDuration(file: File): Promise<number | undefined> {
  try {
    const parseChunk = async (blob: Blob): Promise<number | undefined> => {
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const view = new DataView(buffer);

      let timecodeScale = 1000000; // default 1ms

      // Find TimecodeScale [0x2A, 0xD7, 0xB1]
      for (let i = 0; i < bytes.length - 6; i++) {
        if (bytes[i] === 0x2a && bytes[i + 1] === 0xd7 && bytes[i + 2] === 0xb1) {
          const len = bytes[i + 3];
          if (len === 1 && i + 4 < bytes.length) timecodeScale = bytes[i + 4];
          else if (len === 2 && i + 5 < bytes.length) timecodeScale = view.getUint16(i + 4);
          else if (len === 3 && i + 6 < bytes.length) timecodeScale = (bytes[i + 4] << 16) | (bytes[i + 5] << 8) | bytes[i + 6];
          else if (len === 4 && i + 7 < bytes.length) timecodeScale = view.getUint32(i + 4);
          break;
        }
      }

      // Find Duration [0x44, 0x89]
      for (let i = 0; i < bytes.length - 10; i++) {
        if (bytes[i] === 0x44 && bytes[i + 1] === 0x89) {
          const len = bytes[i + 2];
          if (len === 4 && i + 6 < bytes.length) {
            const val = view.getFloat32(i + 3);
            if (val > 0 && isFinite(val) && val < 86400000) {
              return (val * timecodeScale) / 1000000000;
            }
          } else if (len === 8 && i + 10 < bytes.length) {
            const val = view.getFloat64(i + 3);
            if (val > 0 && isFinite(val) && val < 86400000) {
              return (val * timecodeScale) / 1000000000;
            }
          }
        }
      }
      return undefined;
    };

    // 1. Probe first 256KB
    const headChunk = file.slice(0, Math.min(file.size, 262144));
    const durHead = await parseChunk(headChunk);
    if (durHead && durHead > 0) return durHead;

    // 2. Probe last 256KB (some OBS recordings write Segment Info at end)
    if (file.size > 262144) {
      const tailChunk = file.slice(file.size - 262144);
      const durTail = await parseChunk(tailChunk);
      if (durTail && durTail > 0) return durTail;
    }
  } catch (_) {}
  return undefined;
}
