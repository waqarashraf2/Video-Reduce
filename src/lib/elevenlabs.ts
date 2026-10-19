/**
 * ElevenLabs Client-Side Speech Synthesis Helper
 * Generates ultra-realistic human-like AI voiceovers directly in browser with CORS support.
 */

export interface ElevenLabsVoice {
  id: string;
  name: string;
  gender: "male" | "female";
  accent: string;
  category: string;
  description: string;
  badge?: string;
}

export const ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    gender: "male",
    accent: "American",
    category: "Viral Shorts Narrator",
    description: "Deep, cinematic, engaging narrator. The #1 viral voice for YouTube Shorts & Reels.",
    badge: "🔥 Most Popular",
  },
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    gender: "female",
    accent: "American",
    category: "Conversational & Warm",
    description: "Calm, articulate, natural female tone. Ideal for explainer videos and educational facts.",
    badge: "⭐ Studio Pick",
  },
  {
    id: "TxGEqnHWrfWFTfGW9XjX",
    name: "Josh",
    gender: "male",
    accent: "American",
    category: "High-Energy Hook",
    description: "Young, dynamic, fast-paced voice. Perfect for TikTok hooks, sports, and fast facts.",
    badge: "⚡ High Retention",
  },
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    gender: "male",
    accent: "American",
    category: "Storyteller & Docu",
    description: "Smooth, well-balanced male voice for mysteries, historical stories, and audiobooks.",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Bella",
    gender: "female",
    accent: "American",
    category: "Expressive & Soft",
    description: "Bright, empathetic, natural tone for motivation, quotes, and lifestyle content.",
  },
  {
    id: "VR6AewLTigWG4ivkRrG4",
    name: "Arnold",
    gender: "male",
    accent: "American",
    category: "Movie Trailer",
    description: "Crisp, assertive, authoritative voice for intense narratives and dramatic shorts.",
  },
  {
    id: "yoZ06aMxZJJ28mfd3POQ",
    name: "Sam",
    gender: "male",
    accent: "American",
    category: "Podcast Host",
    description: "Authentic, friendly conversational cadence, feels like a real human podcast host.",
  },
  {
    id: "nPczCjzI2devNBz1zQrb",
    name: "Brian",
    gender: "male",
    accent: "British",
    category: "Classic British Docu",
    description: "Deep, resonant, refined British accent for dark stories and prestigious narrations.",
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld",
    name: "Domi",
    gender: "female",
    accent: "American",
    category: "Strong & Assertive",
    description: "Energetic and confident voiceover for advertisements and product highlights.",
  },
];

export async function generateElevenLabsSpeech({
  text,
  voiceId,
  apiKey,
  modelId = "eleven_multilingual_v2",
  stability = 0.5,
  similarityBoost = 0.8,
}: {
  text: string;
  voiceId: string;
  apiKey: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}): Promise<Blob> {
  const cleanKey = (apiKey || "").trim();
  if (!cleanKey) {
    throw new Error("ElevenLabs API key is missing. Please provide your API key.");
  }

  const cleanText = (text || "").trim();
  if (!cleanText) {
    throw new Error("Script text is empty. Please enter text to generate speech.");
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": cleanKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style: 0.15,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    let errorMessage = "";
    try {
      const errJson = await response.json();
      errorMessage =
        errJson?.detail?.message ||
        errJson?.message ||
        (typeof errJson?.detail === "string" ? errJson.detail : JSON.stringify(errJson));
    } catch {
      errorMessage = `HTTP ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage || "ElevenLabs speech generation failed");
  }

  return await response.blob();
}
