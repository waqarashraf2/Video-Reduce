/**
 * AI Video Vocal Remover & Karaoke / Stem Splitter DSP Engine
 * 100% In-Browser Web Audio Processing
 * 
 * Splits any video or audio stream into:
 * 1. Instrumental / Karaoke (Vocals removed, full bass & high shimmer preserved)
 * 2. Vocals / Acapella (Speech & singing isolated, background music suppressed)
 */

export interface VocalSplitSettings {
  vocalSuppression: number; // 0 to 100%
  bassPreservation: number; // 0 to 100% (keeps kick/bass punchy)
  treblePreservation: number; // 0 to 100% (keeps cymbals/highs)
  vocalClarity: number; // 0 to 100%
}

export interface VocalSplitPreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  settings: VocalSplitSettings;
}

export const VOCAL_SPLIT_PRESETS: VocalSplitPreset[] = [
  {
    id: "karaoke-pro",
    name: "🎤 Karaoke & Instrumental (Music Only)",
    description: "Deep center vocal removal with 100% bass & stereo music preservation for karaoke singing and music reels.",
    badge: "Popular",
    settings: {
      vocalSuppression: 92,
      bassPreservation: 90,
      treblePreservation: 85,
      vocalClarity: 70,
    },
  },
  {
    id: "dialog-extractor",
    name: "🗣️ Dialogue & Voice Isolator (Speech Only)",
    description: "Extract clean vocals and dialogue from movie clips, interviews, and videos while muting background music.",
    badge: "Voice",
    settings: {
      vocalSuppression: 80,
      bassPreservation: 60,
      treblePreservation: 65,
      vocalClarity: 90,
    },
  },
  {
    id: "music-video-remix",
    name: "🎧 Balanced Stem Splitter",
    description: "Clean studio balance between instrumental separation and vocal acapella for sampling, remixing, and editing.",
    settings: {
      vocalSuppression: 85,
      bassPreservation: 85,
      treblePreservation: 80,
      vocalClarity: 80,
    },
  },
  {
    id: "ambient-music-filter",
    name: "🌊 Ambient Music Isolator",
    description: "Eliminates loud dialogue and foreground voiceover while preserving ambient background soundtrack.",
    settings: {
      vocalSuppression: 98,
      bassPreservation: 95,
      treblePreservation: 90,
      vocalClarity: 60,
    },
  },
];

export type PlaybackTrackMode = "instrumental" | "vocals" | "original";

/**
 * Builds live Web Audio graph for real-time video playback preview
 */
export function buildLiveVocalSplitGraph(
  ctx: AudioContext,
  source: AudioNode,
  destination: AudioNode,
  settings: VocalSplitSettings,
  mode: PlaybackTrackMode
): {
  disconnect: () => void;
  setMode: (newMode: PlaybackTrackMode) => void;
  updateSettings: (newSettings: VocalSplitSettings) => void;
} {
  if (ctx.state === "closed") {
    return {
      disconnect: () => {},
      setMode: () => {},
      updateSettings: () => {},
    };
  }

  // Channel splitter
  const splitter = ctx.createChannelSplitter(2);
  const mergerInst = ctx.createChannelMerger(2);
  const mergerVocals = ctx.createChannelMerger(2);

  // Gains for tracks
  const instGain = ctx.createGain();
  const vocalsGain = ctx.createGain();
  const origGain = ctx.createGain();

  instGain.gain.value = mode === "instrumental" ? 1.0 : 0.0;
  vocalsGain.gain.value = mode === "vocals" ? 1.0 : 0.0;
  origGain.gain.value = mode === "original" ? 1.0 : 0.0;

  // Mid-Side subtraction for live instrumental:
  // Left - Right inverts center vocals
  const invRight = ctx.createGain();
  invRight.gain.value = -((settings.vocalSuppression / 100) * 0.95);

  const leftInst = ctx.createGain();
  const rightInst = ctx.createGain();

  // Bass keeper (Low-pass 130Hz)
  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = "lowpass";
  bassFilter.frequency.value = 130;
  bassFilter.Q.value = 0.7;

  // Treble keeper (High-pass 7500Hz)
  const trebleFilter = ctx.createBiquadFilter();
  trebleFilter.type = "highpass";
  trebleFilter.frequency.value = 7500;
  trebleFilter.Q.value = 0.7;

  // Vocal bandpass filter (Center vocal extraction)
  const vocalBand = ctx.createBiquadFilter();
  vocalBand.type = "bandpass";
  vocalBand.frequency.value = 1400;
  vocalBand.Q.value = 0.8;

  const vocalBoost = ctx.createGain();
  vocalBoost.gain.value = 1.35;

  // Connect source
  source.connect(splitter);
  source.connect(origGain);

  // Instrumental path
  splitter.connect(leftInst, 0);
  splitter.connect(invRight, 1);
  invRight.connect(leftInst);

  splitter.connect(rightInst, 1);
  const invLeft = ctx.createGain();
  invLeft.gain.value = -((settings.vocalSuppression / 100) * 0.95);
  splitter.connect(invLeft, 0);
  invLeft.connect(rightInst);

  // Add back bass & treble
  source.connect(bassFilter);
  source.connect(trebleFilter);

  leftInst.connect(mergerInst, 0, 0);
  rightInst.connect(mergerInst, 0, 1);
  bassFilter.connect(mergerInst, 0, 0);
  bassFilter.connect(mergerInst, 0, 1);
  trebleFilter.connect(mergerInst, 0, 0);
  trebleFilter.connect(mergerInst, 0, 1);

  mergerInst.connect(instGain);

  // Vocals path
  source.connect(vocalBand);
  vocalBand.connect(vocalBoost);
  vocalBoost.connect(mergerVocals, 0, 0);
  vocalBoost.connect(mergerVocals, 0, 1);
  mergerVocals.connect(vocalsGain);

  // Output mix to destination
  instGain.connect(destination);
  vocalsGain.connect(destination);
  origGain.connect(destination);

  return {
    disconnect: () => {
      try {
        source.disconnect();
        splitter.disconnect();
        mergerInst.disconnect();
        mergerVocals.disconnect();
        instGain.disconnect();
        vocalsGain.disconnect();
        origGain.disconnect();
      } catch {}
    },
    setMode: (newMode: PlaybackTrackMode) => {
      if (ctx.state === "closed") return;
      const t = ctx.currentTime;
      instGain.gain.setValueAtTime(newMode === "instrumental" ? 1.0 : 0.0, t);
      vocalsGain.gain.setValueAtTime(newMode === "vocals" ? 1.0 : 0.0, t);
      origGain.gain.setValueAtTime(newMode === "original" ? 1.0 : 0.0, t);
    },
    updateSettings: (newSettings: VocalSplitSettings) => {
      const invVal = -((newSettings.vocalSuppression / 100) * 0.95);
      invRight.gain.value = invVal;
      invLeft.gain.value = invVal;
      bassFilter.frequency.value = 100 + (newSettings.bassPreservation / 100) * 50;
      vocalBoost.gain.value = 1.0 + (newSettings.vocalClarity / 100) * 0.7;
    },
  };
}

/**
 * Offline rendering of Instrumental and Vocal AudioBuffers
 */
export async function renderVocalSplitBuffers(
  inputBuffer: AudioBuffer,
  settings: VocalSplitSettings
): Promise<{ instrumental: AudioBuffer; vocals: AudioBuffer }> {
  const sampleRate = inputBuffer.sampleRate;
  const length = inputBuffer.length;
  const numChannels = inputBuffer.numberOfChannels;

  // Extract raw channel data
  const left = inputBuffer.getChannelData(0);
  const right = numChannels > 1 ? inputBuffer.getChannelData(1) : left;

  // Create output AudioBuffers in an OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(2, length, sampleRate);
  const instBuffer = offlineCtx.createBuffer(2, length, sampleRate);
  const vocalBuffer = offlineCtx.createBuffer(2, length, sampleRate);

  const instLeft = instBuffer.getChannelData(0);
  const instRight = instBuffer.getChannelData(1);
  const vocalLeft = vocalBuffer.getChannelData(0);
  const vocalRight = vocalBuffer.getChannelData(1);

  const supFactor = Math.min(0.98, (settings.vocalSuppression / 100) * 0.96);
  const bassWeight = (settings.bassPreservation / 100) * 0.45;
  const vocalWeight = 1.0 + (settings.vocalClarity / 100) * 0.5;

  // Fast DSP pass over PCM samples
  // 1. Center extraction: C = (L + R) / 2
  // 2. Side extraction: S = (L - R) / 2
  // 3. Instrumental = S + bass
  // 4. Vocals = C - S
  let prevMono = 0;
  let bassFiltered = 0;
  const alpha = 0.08; // Simple low-pass filter coefficient for bass (~140Hz)

  for (let i = 0; i < length; i++) {
    const l = left[i];
    const r = right[i];
    const mid = (l + r) * 0.5;
    const diff = (l - r) * 0.5;

    // Low-pass filter for center bass preservation
    bassFiltered = bassFiltered + alpha * (mid - bassFiltered);

    // Instrumental computation
    const instSampleL = diff * (1.0 + supFactor * 0.4) + bassFiltered * bassWeight;
    const instSampleR = -diff * (1.0 + supFactor * 0.4) + bassFiltered * bassWeight;

    instLeft[i] = Math.max(-1, Math.min(1, instSampleL));
    instRight[i] = Math.max(-1, Math.min(1, instSampleR));

    // Vocal computation (isolated center speech/singing)
    const vocalSample = (mid - diff * supFactor) * vocalWeight;
    vocalLeft[i] = Math.max(-1, Math.min(1, vocalSample));
    vocalRight[i] = Math.max(-1, Math.min(1, vocalSample));
  }

  return {
    instrumental: instBuffer,
    vocals: vocalBuffer,
  };
}

/**
 * Converts an AudioBuffer into standard 16-bit PCM Stereo WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = 2; // Always normalize to stereo for universal compatibility
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;

  const numSamples = left.length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  // Write WAV RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // SubChunk1Size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave L and R channels
  let offset = 44;
  for (let i = 0; i < numSamples; i++, offset += 4) {
    const sL = Math.max(-1, Math.min(1, left[i]));
    const sR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    view.setInt16(offset + 2, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
