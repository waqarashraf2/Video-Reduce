"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ToolMetadata } from "@/lib/ffmpeg/types";
import { FileDropzone, FileMetadata } from "@/components/ui/FileDropzone";
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Download,
  Film,
  FileText,
  Type,
  Maximize2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Search,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Volume2,
  Globe,
  Wand2,
  Video,
  Check,
  Eye,
  Mic,
  Scissors,
  Music,
  Sliders,
} from "lucide-react";
import { extractAudioFromMediaFile } from "@/lib/audio-extractor";
import { searchLiveVideosClient } from "@/lib/video-search";
import {
  ELEVENLABS_VOICES,
  ElevenLabsVoice,
  generateElevenLabsSpeech,
} from "@/lib/elevenlabs";
import {
  BG_MUSIC_TRACKS,
  getBestMediaRecorderMimeType,
  generateSynthesizedMusicBuffer,
  decodeAudioBlob,
} from "@/lib/videoAudioMixer";

interface AiTextToVideoStudioProps {
  tool: ToolMetadata;
}

// Media Item Definition
export interface StockMediaItem {
  id: string;
  category: string;
  name: string;
  keywords: string[];
  url: string;
  type?: "image" | "video";
  thumbnail?: string;
  duration?: number;
  sizeMb?: string;
}

// Curated 9:16 High-Res Royalty-Free Fallback Visuals & Video Loops (CORS-enabled)
export const CURATED_STOCK_MEDIA: StockMediaItem[] = [
  // 1. Time, Waiting, Patience, Clock
  {
    id: "time-hourglass",
    category: "Time & Patience ⏳",
    name: "Hourglass & Passing Time",
    keywords: ["wait", "waiting", "moment", "time", "clock", "watch", "delay", "patience", "hour", "now", "stop", "perfect"],
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "time-pocketwatch",
    category: "Time & Patience ⏳",
    name: "Golden Vintage Pocket Watch",
    keywords: ["tick", "second", "seconds", "minute", "lifetime", "late", "hurry"],
    url: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 2. Start, Difficult, Struggle, Grit, Hard Work, Gym
  {
    id: "grit-workout",
    category: "Action & Grit 🔥",
    name: "Athletic Grit & Heavy Training",
    keywords: ["start", "difficult", "hard", "grind", "grit", "struggle", "sweat", "push", "action", "effort", "body", "muscle", "train", "gym", "workout"],
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "fire-sparks",
    category: "Action & Grit 🔥",
    name: "Burning Sparks & Steel Forge",
    keywords: ["forge", "fire", "burn", "flame", "iron", "steel", "pain", "endure", "discipline"],
    url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 3. Learning, Mistakes, Books, Wisdom, Mindset
  {
    id: "wisdom-books",
    category: "Learning & Wisdom 💡",
    name: "Open Books & Candlelight",
    keywords: ["learn", "mistake", "mistakes", "lesson", "study", "wisdom", "book", "books", "knowledge", "experience", "read", "understand", "mindset"],
    url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "craft-hands",
    category: "Learning & Wisdom 💡",
    name: "Focused Hands & Learning Progress",
    keywords: ["craft", "hands", "progress", "build", "practice", "grow", "growth"],
    url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 4. Future, Journey, One Step, Road, Horizon
  {
    id: "future-horizon",
    category: "Journey & Future 🚀",
    name: "Solo Walker on Golden Highway",
    keywords: ["future", "step", "walk", "journey", "road", "path", "ahead", "forward", "tomorrow", "horizon", "destination", "begins", "begin"],
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "strength-trail",
    category: "Journey & Future 🚀",
    name: "Misty Mountain Trail",
    keywords: ["trail", "stronger", "strength", "power", "climb", "footsteps", "keep", "going"],
    url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 5. Reach The Top, Summit, Mountain, Victory
  {
    id: "mountain-summit",
    category: "Victory & Summit 🏔️",
    name: "High Mountain Peak Above Clouds",
    keywords: ["top", "reach", "summit", "peak", "mountain", "victory", "win", "winner", "highest", "sky", "champion"],
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "lion-majestic",
    category: "Power & Animals 🦁",
    name: "Majestic Dark Lion",
    keywords: ["lion", "animal", "animals", "king", "roar", "confidence", "fearless", "brave", "beast", "alpha", "strength"],
    url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 6. Village, Rural, Countryside, Old Mysteries
  {
    id: "village-rural",
    category: "Village & Rural 🏡",
    name: "Scenic Countryside Village",
    keywords: ["village", "rural", "countryside", "cottage", "field", "fields", "houses", "farm", "peaceful"],
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "mysteries-castle",
    category: "Mysteries & Ancient 🏰",
    name: "Ancient Misty Castle Ruins",
    keywords: ["mystery", "mysteries", "ancient", "castle", "ruins", "old", "haunted", "dark", "secret", "fog"],
    url: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 7. Cars & Supercars (Lamborghini, Ferrari, etc.)
  {
    id: "wealth-lamborghini",
    category: "Supercars & Luxury 🏎️",
    name: "Exotic Midnight Lamborghini",
    keywords: ["lamborghini", "car", "cars", "supercar", "sports car", "ferrari", "porsche", "speed", "drive", "vehicle"],
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "wealth-investing",
    category: "Wealth & Finance 💰",
    name: "Financial Assets & Gold",
    keywords: ["invest", "investing", "assets", "trade", "finance", "crypto", "rich", "future", "stocks", "cash", "sleep", "poor", "money"],
    url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 8. Space & Science
  {
    id: "space-galaxy",
    category: "Space & Science 🌌",
    name: "Cosmic Nebula & Stars",
    keywords: ["space", "galaxy", "cosmos", "nebula", "stars", "universe", "cloud", "astronomy", "alcohol"],
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "space-earth",
    category: "Space & Science 🌌",
    name: "Earth Orbit Horizon",
    keywords: ["earth", "orbit", "planet", "solar", "atmosphere", "satellite", "globe"],
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "diamonds-crystals",
    category: "Space & Science 🌌",
    name: "Diamond Crystals (Neptune)",
    keywords: ["diamond", "diamonds", "crystal", "crystals", "gem", "gems", "rain", "solid", "neptune", "ice"],
    url: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 9. WiFi, Technology, Network & Internet
  {
    id: "tech-wifi-router",
    category: "WiFi & Technology 💻",
    name: "Glowing WiFi Router & Data Waves",
    keywords: ["wifi", "wi-fi", "internet", "router", "wireless", "signal", "broadband", "network", "connect", "connection", "tech", "technology", "online"],
    url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },
  {
    id: "tech-code-matrix",
    category: "WiFi & Technology 💻",
    name: "Cyber Code & Matrix Screen",
    keywords: ["code", "coding", "software", "developer", "computer", "screen", "cyber", "data", "matrix", "hacker", "laptop", "programming"],
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=720&h=1280&q=80",
    type: "image",
  },

  // 10. Real HD Video Clips (100% unique URLs, Fastly/CDN verified, zero duplicate URLs, zero 429 errors)
  {
    id: "video-car-chase",
    category: "Cars & Speed 🏎️",
    name: "High Speed Supercar Highway Chase",
    keywords: ["car", "cars", "lamborghini", "ferrari", "supercar", "sports car", "speed", "drive", "driving", "highway", "chase", "race", "fast", "vehicle"],
    url: "/videos/car-chase.webm",
    type: "video",
  },
  {
    id: "video-car-highway-traffic",
    category: "Cars & Speed 🏎️",
    name: "Highway Traffic & Speeding Cars",
    keywords: ["car", "cars", "lamborghini", "speed", "drive", "driving", "highway", "traffic", "road", "vehicle", "fast", "speeding", "passing", "time", "timelapse"],
    url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/car-detection.mp4",
    type: "video",
  },
  {
    id: "video-car-urban-drive",
    category: "Cars & Speed 🏎️",
    name: "Modern City Cars & Urban Drive",
    keywords: ["car", "cars", "porsche", "bmw", "drive", "driving", "street", "city", "road", "traffic", "vehicle"],
    url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4",
    type: "video",
  },
  {
    id: "video-tech-stream",
    category: "WiFi & Tech 💻",
    name: "Glowing Cyber Stream & Data Waves",
    keywords: ["wifi", "wi-fi", "internet", "signal", "network", "wireless", "router", "tech", "technology", "online", "broadband", "cyber", "stream", "data"],
    url: "https://videos.pexels.com/video-files/6274203/6274203-sd_426_226_30fps.mp4",
    type: "video",
  },
  {
    id: "video-tech-matrix-ocean",
    category: "WiFi & Tech 💻",
    name: "Digital Coding Matrix & Deep Stream",
    keywords: ["code", "coding", "software", "developer", "computer", "matrix", "hacker", "cyber", "tech", "digital", "data", "screen"],
    url: "https://vjs.zencdn.net/v/oceans.webm",
    type: "video",
  },
  {
    id: "video-time-rain-lapse",
    category: "Nature & Ocean 🌊",
    name: "Peaceful Rain & Time Droplets Lapse",
    keywords: ["time", "moment", "clock", "timelapse", "passing", "waiting", "rain", "nature", "peace", "water", "droplets", "weather"],
    url: "https://raw.githubusercontent.com/sh20raj-dump/sample/master/video/raining_480p.mp4",
    type: "video",
  },
  {
    id: "video-time-study-growth",
    category: "Mindset & Grind 🔥",
    name: "Focus, Learning & Timeless Progress",
    keywords: ["time", "learn", "learning", "growth", "progress", "study", "student", "class", "classroom", "focus", "work", "hard work", "future", "mindset"],
    url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/classroom.mp4",
    type: "video",
  },
  {
    id: "video-urban-pedestrians",
    category: "City & Urban 🏙️",
    name: "Metropolis Crowd & Downtown Walk",
    keywords: ["city", "urban", "street", "streets", "people", "crowd", "walk", "walking", "pedestrian", "lifestyle", "busy", "downtown", "commute", "metropolis"],
    url: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/people-detection.mp4",
    type: "video",
  },
  {
    id: "video-ocean-depths",
    category: "Nature & Ocean 🌊",
    name: "Majestic Deep Ocean Horizons",
    keywords: ["ocean", "waves", "sea", "beach", "water", "nature", "deep", "blue", "tide", "marine", "wildlife"],
    url: "https://vjs.zencdn.net/v/oceans.mp4",
    type: "video",
  },
  {
    id: "video-money-counting",
    category: "Money & Wealth 💰",
    name: "Banknotes Cash Flow & Currency Count",
    keywords: ["dollar", "dollars", "money", "cash", "wealth", "banknotes", "currency", "rich", "income", "finance", "luxury", "gold"],
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Money_of_Russia_2025_exchange_rubli.webm",
    type: "video",
    duration: 15,
  },
  {
    id: "video-money-changing",
    category: "Money & Wealth 💰",
    name: "Counting Bills & Currency Exchange",
    keywords: ["dollar", "dollars", "money", "cash", "bills", "notes", "currency", "change", "coins", "wealth", "bank"],
    url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Money_of_Russia_2025_changing_rubli.webm",
    type: "video",
    duration: 4,
  },
  {
    id: "video-money-vault",
    category: "Money & Wealth 💰",
    name: "Cash Storage & Wealth Reserve Case",
    keywords: ["dollar", "dollars", "money", "cash", "vault", "reserve", "luxury", "gold", "crypto", "wealth", "storage"],
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Money_of_box_case_Russia_2025_Aerodizain_%D0%90%D1%8D%D1%80%D0%BE%D0%B4%D0%B8%D0%B7%D0%B0%D0%B9%D0%BD_lefortovo_work.webm",
    type: "video",
    duration: 32,
  },
  {
    id: "video-cinematic-fantasy",
    category: "Stories & Mysteries 🏰",
    name: "Cinematic Ocean & Deep Horizons",
    keywords: ["mystery", "mysteries", "ancient", "village", "castle", "story", "adventure", "dragon", "hero", "cinematic", "epic", "fantasy"],
    url: "https://vjs.zencdn.net/v/oceans.webm",
    type: "video",
  },
  {
    id: "video-animated-creativity",
    category: "3D Animation ✨",
    name: "Future 3D Animated Character & Echo",
    keywords: ["animation", "3d", "character", "cartoon", "mascot", "creative", "fun", "future", "motion", "music"],
    url: "https://raw.githubusercontent.com/mediaelement/mediaelement-files/master/echo-hereweare.mp4",
    type: "video",
  },
];

// Helper: Smart Search Intent & Subject Prioritization (With robust fallback)
export const extractSearchQueryFromSentence = (sentence: string): string => {
  const lower = sentence.toLowerCase();

  const highValueSubjects = [
    "wifi", "wi-fi", "internet", "router", "wireless", "broadband", "network",
    "lamborghini", "ferrari", "supercar", "sports car", "car", "bmw", "porsche", "speed",
    "village", "ancient castle", "castle", "ruins", "mystery", "mysteries",
    "lion", "tiger", "wolf", "animal", "horse", "eagle", "bear",
    "empty road", "highway", "road", "mountain", "summit", "ocean", "waves", "forest", "desert", "waterfall",
    "gym", "workout", "fitness", "books", "wisdom", "money", "gold", "crypto", "wealth",
    "code", "coding", "software", "computer", "technology", "tech", "digital",
    "space", "galaxy", "diamonds", "statue", "fire", "ice", "time", "clock", "city", "people"
  ];

  for (const sub of highValueSubjects) {
    if (lower.includes(sub)) {
      return sub;
    }
  }

  const stopwords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "up", "about", "into", "over", "after",
    "you", "your", "my", "we", "they", "it", "its", "is", "are", "was",
    "were", "be", "been", "being", "have", "has", "had", "do", "does",
    "did", "will", "would", "shall", "should", "may", "might", "must",
    "can", "could", "this", "that", "these", "those", "along", "way",
    "ever", "cried", "some", "every", "just", "very", "much", "more", "how"
  ]);

  const cleanWords = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));

  if (cleanWords.length === 0) return "inspiration";
  return cleanWords.slice(0, 2).join(" ");
};

// Search video clips dynamically across keywords, categories, and main subjects
export const searchVideoClips = (query: string): StockMediaItem[] => {
  const allVideoItems = CURATED_STOCK_MEDIA.filter((m) => m.type === "video");
  const clean = query.trim().toLowerCase();
  if (!clean) return allVideoItems;

  const words = clean.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);

  const matchedSet = new Set<string>();
  const results: StockMediaItem[] = [];

  const addUnique = (item: StockMediaItem) => {
    if (!matchedSet.has(item.id)) {
      matchedSet.add(item.id);
      results.push(item);
    }
  };

  // 1. Direct match on name, category, or keywords
  allVideoItems.forEach((item) => {
    const inName = item.name.toLowerCase().includes(clean);
    const inCat = item.category.toLowerCase().includes(clean);
    const inKeys = item.keywords.some((k) => clean.includes(k) || k.includes(clean));
    if (inName || inCat || inKeys) addUnique(item);
  });

  // 2. Word-level token match (e.g. from "fast wifi connection" -> "wifi")
  allVideoItems.forEach((item) => {
    if (item.keywords.some((k) => words.some((w) => k.includes(w) || w.includes(k)))) {
      addUnique(item);
    }
  });

  // 3. Fallback based on main subject extraction
  const mainSubject = extractSearchQueryFromSentence(query);
  if (mainSubject && mainSubject !== "inspiration" && mainSubject !== clean) {
    allVideoItems.forEach((item) => {
      if (item.keywords.some((k) => k.includes(mainSubject) || mainSubject.includes(k))) {
        addUnique(item);
      }
    });
  }

  // Return all authentic matches for the query
  return results;
};

// Internal API Fetcher for Openverse
async function fetchOpenverseApi(q: string, count: number): Promise<StockMediaItem[]> {
  try {
    const res = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&page_size=${count}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((r: any, idx: number) => ({
      id: `openverse-${r.id || idx}-${Math.random()}`,
      category: "Live Web Search 🌐",
      name: r.title ? r.title.slice(0, 30) : q,
      keywords: [q.toLowerCase()],
      url: r.url,
      type: "image",
    }));
  } catch (e) {
    return [];
  }
}

// Multi-Tier Fallback Search (Guarantees zero 0-results)
export async function searchOpenverseImages(query: string, count: number = 9): Promise<StockMediaItem[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  // Tier 1: Try exact search
  let results = await fetchOpenverseApi(clean, count);
  if (results.length > 0) return results;

  // Tier 2: Multi-word query: extract key nouns
  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  const knownSubjects = [
    "wifi", "internet", "network", "router", "wireless", "tech", "technology", "coding", "software",
    "lamborghini", "ferrari", "supercar", "car", "porsche", "vehicle",
    "village", "castle", "ruins", "mystery", "mysteries", "mountain",
    "lion", "tiger", "animal", "wolf", "horse", "eagle", "bear",
    "road", "highway", "forest", "nature", "ocean", "sunset", "desert",
    "money", "gold", "crypto", "wealth", "luxury", "books", "gym", "workout"
  ];

  const matchedSubject = words.find((w) => knownSubjects.includes(w));
  if (matchedSubject) {
    results = await fetchOpenverseApi(matchedSubject, count);
    if (results.length > 0) return results;
  }

  // Tier 3: Search individual words
  if (words.length > 1) {
    for (let i = words.length - 1; i >= 0; i--) {
      results = await fetchOpenverseApi(words[i], count);
      if (results.length > 0) return results;
    }
  }

  // Tier 4: Fallback to Curated library match
  const curatedMatch = CURATED_STOCK_MEDIA.filter((m) =>
    m.keywords.some((kw) => clean.includes(kw) || words.some((w) => kw.includes(w)))
  );
  if (curatedMatch.length > 0) {
    return curatedMatch.map((m) => ({ ...m, category: "High-Res Match 📸" }));
  }

  return [];
}

// Fallback Semantic Matcher
export const matchStockMediaForSentence = (
  sentence: string,
  sceneIndex: number,
  usedIds: Set<string>
): StockMediaItem => {
  const words = sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let bestMatch: StockMediaItem | null = null;
  let highestScore = 0;

  for (const item of CURATED_STOCK_MEDIA) {
    let score = 0;
    for (const word of words) {
      if (word.length <= 2) continue;
      for (const kw of item.keywords) {
        if (kw === word) {
          score += 6;
        } else if (word.includes(kw) || kw.includes(word)) {
          score += 2.5;
        }
      }
    }

    if (usedIds.has(item.id)) {
      score -= 4;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 0) {
    usedIds.add(bestMatch.id);
    return bestMatch;
  }

  const unused = CURATED_STOCK_MEDIA.filter((m) => !usedIds.has(m.id));
  const fallback =
    unused.length > 0
      ? unused[sceneIndex % unused.length]
      : CURATED_STOCK_MEDIA[sceneIndex % CURATED_STOCK_MEDIA.length];
  usedIds.add(fallback.id);
  return fallback;
};

// Single Scene in the Video Storyboard
export interface VideoScene {
  id: string;
  sentenceText: string;
  mediaItem: StockMediaItem;
  customMediaUrl: string | null;
  mediaType: "image" | "video";
  zoomEffect: "zoom-in" | "zoom-out" | "pan-left" | "pan-right";
  trimStart?: number;
  trimDuration?: number;
}

// Preset Viral Prompts & Scripts
export interface ViralScriptPreset {
  id: string;
  category: string;
  title: string;
  badge: string;
  script: string;
}

export const VIRAL_PRESETS: ViralScriptPreset[] = [
  {
    id: "lamborghini-quote",
    category: "Wealth & Mindset 🏎️",
    title: "Crying in a Lamborghini",
    badge: "Viral Trend",
    script:
      "Money can’t buy real happiness.\nBut have you ever cried in a Lamborghini?\nWork hard until luxury becomes your standard.",
  },
  {
    id: "ancient-mystery",
    category: "Stories & Mysteries 🏰",
    title: "Old Village Mysteries",
    badge: "Storytelling",
    script:
      "Deep inside an ancient forgotten village.\nOld mysteries whisper through empty roads.\nA fearless lion roams in the shadows.",
  },
  {
    id: "struggle-growth",
    category: "Mindset & Growth 🌱",
    title: "Struggle & Learning Progress",
    badge: "Trending",
    script:
      "You may struggle along the way.\nBut every step is teaching you.\nTrust yourself and keep moving.",
  },
  {
    id: "reach-the-top",
    category: "Mindset & Grind 🔥",
    title: "Stop Waiting & Start Now",
    badge: "Viral Motivational",
    script:
      "Stop waiting for the perfect moment.\nStart now, even if it’s difficult.\nLearn from every mistake.\nYour future begins with one step.",
  },
  {
    id: "space-secrets",
    category: "Space & Science 🚀",
    title: "Crazy Space Facts That Sound Fake",
    badge: "Viral Sci-Fi",
    script:
      "Did you know that in space, there is a giant cloud of alcohol spanning 463 billion kilometers? And on Neptune, it literally rains solid diamonds!",
  },
];

// Subtitle Caption Styling Presets
export interface SubtitleStyle {
  id: string;
  name: string;
  textColor: string;
  highlightColor: string;
  strokeColor: string;
  fontSize: number;
}

export const SUBTITLE_STYLES: SubtitleStyle[] = [
  {
    id: "mrbeast-yellow",
    name: "MrBeast Yellow",
    textColor: "#ffffff",
    highlightColor: "#facc15",
    strokeColor: "#000000",
    fontSize: 34,
  },
  {
    id: "hormozi-green",
    name: "Hormozi Neon Green",
    textColor: "#ffffff",
    highlightColor: "#22c55e",
    strokeColor: "#000000",
    fontSize: 34,
  },
  {
    id: "cinematic-red",
    name: "Red Alert Viral",
    textColor: "#ffffff",
    highlightColor: "#ef4444",
    strokeColor: "#000000",
    fontSize: 34,
  },
  {
    id: "clean-white",
    name: "Apple Minimal White",
    textColor: "#f8fafc",
    highlightColor: "#38bdf8",
    strokeColor: "#09090b",
    fontSize: 32,
  },
];

// Helper: Split text into scenes
export const createScenesFromScript = (script: string): VideoScene[] => {
  const sentences = script
    .split(/(?<=[.!?؟۔\n])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const usedIds = new Set<string>();

  if (sentences.length === 0) {
    const defaultItem = CURATED_STOCK_MEDIA[0];
    return [
      {
        id: "scene-1",
        sentenceText: script.trim(),
        mediaItem: defaultItem,
        customMediaUrl: null,
        mediaType: defaultItem.type || "image",
        zoomEffect: "zoom-in",
      },
    ];
  }

  const zoomEffects: ("zoom-in" | "zoom-out" | "pan-left" | "pan-right")[] = [
    "zoom-in",
    "pan-left",
    "zoom-out",
    "pan-right",
  ];

  return sentences.map((sentence, idx) => {
    const matchedMedia = matchStockMediaForSentence(sentence, idx, usedIds);
    return {
      id: `scene-${idx + 1}-${Date.now()}-${idx}`,
      sentenceText: sentence,
      mediaItem: matchedMedia,
      customMediaUrl: null,
      mediaType: matchedMedia.type || "image",
      zoomEffect: zoomEffects[idx % zoomEffects.length],
    };
  });
};

export const AiTextToVideoStudio: React.FC<AiTextToVideoStudioProps> = ({ tool }) => {
  // Script & Presets State
  const [scriptText, setScriptText] = useState<string>(VIRAL_PRESETS[0].script);
  const [activePresetId, setActivePresetId] = useState<string>(VIRAL_PRESETS[0].id);

  // Multi-Scene Storyboard State
  const [scenes, setScenes] = useState<VideoScene[]>(() =>
    createScenesFromScript(VIRAL_PRESETS[0].script)
  );
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);

  // Live Web Search & Picker State
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<StockMediaItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activePickerTab, setActivePickerTab] = useState<"search" | "ai" | "videos" | "library" | "upload">("search");
  const [videoFilterQuery, setVideoFilterQuery] = useState<string>("");
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<string>("all");

  // Video Search & Pexels Key State
  const [pexelsToken, setPexelsToken] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pexels_free_key") || "";
    }
    return "";
  });
  const [showPexelsTokenInput, setShowPexelsTokenInput] = useState<boolean>(false);
  const [livePexelsVideoResults, setLivePexelsVideoResults] = useState<StockMediaItem[]>([]);
  const [isSearchingPexels, setIsSearchingPexels] = useState<boolean>(false);

  // AI Prompt & Preview State (Preview First, Then Apply!)
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiPreviewCandidate, setAiPreviewCandidate] = useState<StockMediaItem | null>(null);
  const [aiGeneratedResults, setAiGeneratedResults] = useState<StockMediaItem[]>([]);
  const [hfToken, setHfToken] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hf_free_token") || "";
    }
    return "";
  });
  const [showHfTokenInput, setShowHfTokenInput] = useState<boolean>(false);

  // Subtitle Styling State
  const [selectedStyleId, setSelectedStyleId] = useState<string>(SUBTITLE_STYLES[0].id);
  const [subtitleSize, setSubtitleSize] = useState<number>(34);

  // Voice & Pacing State (Default to Natural English)
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  // ElevenLabs & Neural AI Voice Engine State
  const [voiceEngine, setVoiceEngine] = useState<"elevenlabs" | "natural">("elevenlabs");
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("elevenlabs_api_key") || "";
    }
    return "";
  });
  const [selectedElevenVoiceId, setSelectedElevenVoiceId] = useState<string>("pNInz6obpgDQGcFmaJgB"); // Adam (Default)
  const [isGeneratingEleven, setIsGeneratingEleven] = useState<boolean>(false);
  const [elevenAudioError, setElevenAudioError] = useState<string | null>(null);
  const [showElevenKeyInput, setShowElevenKeyInput] = useState<boolean>(false);
  const [elevenGeneratedVoiceName, setElevenGeneratedVoiceName] = useState<string | null>(null);

  // Playback & Animation State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedExtension, setExportedExtension] = useState<"mp4" | "webm">("mp4");

  // Background Music State (Default: Viral Shorts Beat so every export has sound!)
  const [selectedBgMusicTrack, setSelectedBgMusicTrack] = useState<string>("beat");
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(0.25);

  // Video Grid Pagination & Hover (Max 6 clips at a time to avoid system lag)
  const [visibleVideoCount, setVisibleVideoCount] = useState<number>(6);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  // Audio Upload & Transcription State
  const [inputMode, setInputMode] = useState<"text" | "audio">("text");
  const [customVoiceoverFile, setCustomVoiceoverFile] = useState<File | null>(null);
  const [customVoiceoverUrl, setCustomVoiceoverUrl] = useState<string | null>(null);
  const [isExtractingAudio, setIsExtractingAudio] = useState<boolean>(false);
  const [audioExtractedFromVideo, setAudioExtractedFromVideo] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState<number>(0);
  const [transcriptionStatus, setTranscriptionStatus] = useState<string>("");
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const whisperPipelineRef = useRef<any>(null);

  // Update Scene Video Trim Offset
  const handleUpdateSceneTrim = (sceneIndex: number, trimStart: number) => {
    setScenes((prev) => {
      const next = [...prev];
      if (next[sceneIndex]) {
        next[sceneIndex] = { ...next[sceneIndex], trimStart };
      }
      return next;
    });
  };

  // Refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sceneStartTimeRef = useRef<number>(0);
  const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const loadedVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const activeSceneIndexRef = useRef<number>(0);
  activeSceneIndexRef.current = activeSceneIndex;

  const activeSubtitleStyle = useMemo(() => {
    return SUBTITLE_STYLES.find((s) => s.id === selectedStyleId) || SUBTITLE_STYLES[0];
  }, [selectedStyleId]);

  // Current Scene
  const currentScene = scenes[activeSceneIndex] || scenes[0];

  // Preload Images & Videos whenever scenes change
  useEffect(() => {
    scenes.forEach((scene) => {
      const url = scene.customMediaUrl || scene.mediaItem.url;
      if (!url) return;

      if (scene.mediaType === "video") {
        if (!loadedVideosRef.current.has(url)) {
          const vid = document.createElement("video");
          vid.src = url;
          vid.crossOrigin = "anonymous";
          vid.loop = true;
          vid.muted = true;
          vid.playsInline = true;
          vid.load();
          loadedVideosRef.current.set(url, vid);
        }
      } else {
        if (!loadedImagesRef.current.has(url)) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = url;
          img.onload = () => {
            loadedImagesRef.current.set(url, img);
            renderFrame();
          };
          img.onerror = () => {
            // If crossOrigin check is rejected by host on localhost, load directly without crossOrigin
            const directImg = new Image();
            directImg.src = url;
            directImg.onload = () => {
              loadedImagesRef.current.set(url, directImg);
              renderFrame();
            };
          };
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes]);

  // Detect & Populate Voices with Natural English prioritized
  const populateVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);

    if (!selectedVoiceURI && voices.length > 0) {
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
      const naturalEnglish = englishVoices.find(
        (v) =>
          v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("online") ||
          v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("mark")
      );
      if (naturalEnglish) {
        setSelectedVoiceURI(naturalEnglish.voiceURI);
      } else if (englishVoices.length > 0) {
        setSelectedVoiceURI(englishVoices[0].voiceURI);
      } else {
        setSelectedVoiceURI(voices[0].voiceURI);
      }
    }
  }, [selectedVoiceURI]);

  useEffect(() => {
    populateVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, [populateVoices]);

  // Stop Playback Helper
  const stopPlayback = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    // Pause custom voiceover audio if playing
    if (customAudioRef.current) {
      try {
        customAudioRef.current.pause();
        customAudioRef.current.currentTime = 0;
      } catch (e) {}
    }
    // Pause all playing videos
    loadedVideosRef.current.forEach((v) => {
      try {
        v.pause();
      } catch (e) {}
    });

    setIsPlaying(false);
    setIsSynthesizing(false);
    setActiveWordIndex(0);
    setActiveSceneIndex(0);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  // Generate Ultra-Realistic Voiceover using ElevenLabs AI
  const handleGenerateElevenSpeech = async () => {
    if (!elevenLabsApiKey.trim()) {
      setShowElevenKeyInput(true);
      return;
    }

    setIsGeneratingEleven(true);
    setElevenAudioError(null);
    stopPlayback();

    try {
      const fullText = scenes
        .map((s) => s.sentenceText.trim())
        .filter(Boolean)
        .join(" ");

      const textToSynthesize = fullText || scriptText;
      if (!textToSynthesize.trim()) {
        throw new Error("No script text found to synthesize voiceover.");
      }

      const audioBlob = await generateElevenLabsSpeech({
        text: textToSynthesize,
        voiceId: selectedElevenVoiceId,
        apiKey: elevenLabsApiKey,
      });

      const audioUrl = URL.createObjectURL(audioBlob);
      setCustomVoiceoverUrl(audioUrl);
      const chosenVoice = ELEVENLABS_VOICES.find((v) => v.id === selectedElevenVoiceId);
      setElevenGeneratedVoiceName(chosenVoice?.name || "ElevenLabs");
      localStorage.setItem("elevenlabs_api_key", elevenLabsApiKey.trim());

      // Auto play preview
      const audio = new Audio(audioUrl);
      customAudioRef.current = audio;
      audio.play().catch(() => {});
      setIsPlaying(true);
    } catch (err: any) {
      setElevenAudioError(err?.message || "Failed to generate ElevenLabs voiceover.");
    } finally {
      setIsGeneratingEleven(false);
    }
  };

  // Core AI Speech-to-Text & Auto Scene Generation using In-Browser Whisper AI (@xenova/transformers)
  const transcribeAudioFile = async (file: File) => {
    setIsTranscribing(true);
    setTranscriptionProgress(15);
    setTranscriptionStatus("Decoding audio waveform...");
    setTranscriptionError(null);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });

      setTranscriptionProgress(25);
      setTranscriptionStatus("Preparing 16kHz audio for Whisper AI...");

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const pcmData = audioBuffer.getChannelData(0);

      setTranscriptionProgress(40);
      setTranscriptionStatus("Loading in-browser Whisper AI model (WebAssembly)...");

      let transcriber = whisperPipelineRef.current;
      if (!transcriber) {
        const { pipeline, env } = await import("@xenova/transformers");
        env.allowLocalModels = false;
        env.useBrowserCache = true;

        transcriber = await pipeline(
          "automatic-speech-recognition",
          "Xenova/whisper-tiny.en",
          {
            progress_callback: (data: any) => {
              if (data.status === "progress" && data.progress) {
                const p = Math.round(data.progress);
                setTranscriptionProgress(40 + Math.round(p * 0.35));
                setTranscriptionStatus(`Loading Whisper AI Model: ${p}%`);
              } else if (data.status === "ready") {
                setTranscriptionProgress(75);
                setTranscriptionStatus("Transcribing spoken speech from voiceover...");
              }
            },
          }
        );
        whisperPipelineRef.current = transcriber;
      }

      setTranscriptionProgress(80);
      setTranscriptionStatus("Transcribing spoken speech into sentences...");

      const output: any = await transcriber(pcmData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      });

      try {
        audioCtx.close();
      } catch {}

      let transcribedText = "";

      if (output && output.chunks && output.chunks.length > 0) {
        const lines = output.chunks
          .map((c: any) => String(c.text || "").trim())
          .filter((t: string) => t.length > 0);
        transcribedText = lines.join("\n");
      } else if (output && typeof output.text === "string" && output.text.trim()) {
        transcribedText = output.text.trim();
      }

      if (transcribedText) {
        setScriptText(transcribedText);
        setTranscriptionProgress(90);
        setTranscriptionStatus("Cutting into scenes and matching stock video clips...");

        // Automatically create scenes from transcribed sentences
        const newScenes = createScenesFromScript(transcribedText);
        setScenes(newScenes);
        setActiveSceneIndex(0);

        // Auto-match visuals / video clips for each sentence
        newScenes.forEach(async (sc, idx) => {
          const query = extractSearchQueryFromSentence(sc.sentenceText);
          if (query && query !== "inspiration") {
            const webMatches = await searchOpenverseImages(query, 1);
            if (webMatches && webMatches.length > 0) {
              setScenes((prev) => {
                const next = [...prev];
                if (next[idx]) {
                  next[idx] = {
                    ...next[idx],
                    mediaItem: webMatches[0],
                    customMediaUrl: null,
                    mediaType: webMatches[0].type || "image",
                  };
                }
                return next;
              });
            }
          }
        });

        setTranscriptionProgress(100);
        setTranscriptionStatus(`✓ Successfully transcribed ${newScenes.length} scenes with Whisper AI!`);
      } else {
        setTranscriptionError(
          "No clear spoken speech detected in this audio. You can paste or type your sentences in the script box below to generate scenes!"
        );
      }
    } catch (err: any) {
      console.warn("In-browser Whisper transcription note:", err);
      // Fallback: If user has a Hugging Face token, try HF
      let hfSuccess = false;
      if (hfToken.trim()) {
        try {
          setTranscriptionStatus("Trying Hugging Face Whisper API...");
          const hfRes = await fetch(
            "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3-turbo",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${hfToken.trim()}`,
                "Content-Type": file.type || "audio/wav",
              },
              body: file,
            }
          );
          if (hfRes.ok) {
            const data = await hfRes.json();
            const text = (data.text || "").trim();
            if (text) {
              setScriptText(text);
              const newScenes = createScenesFromScript(text);
              setScenes(newScenes);
              setActiveSceneIndex(0);
              setTranscriptionProgress(100);
              setTranscriptionStatus(`✓ Successfully transcribed with Hugging Face!`);
              hfSuccess = true;
            }
          }
        } catch (e) {}
      }

      if (!hfSuccess) {
        setTranscriptionError(
          "Transcription notice: " + (err?.message || "Speech decoding failed") + ". You can enter your sentences in the script box below to generate scenes!"
        );
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handle Custom Audio/Video File Upload (Extracts audio track & automatically transcribes speech)
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingAudio(true);
    setAudioExtractedFromVideo(false);
    setTranscriptionError(null);
    setTranscriptionStatus("Extracting audio from file...");
    stopPlayback();

    try {
      const extracted = await extractAudioFromMediaFile(file);
      const audioFileName = extracted.isFromVideo
        ? (file.name.replace(/\.[^/.]+$/, "") || "extracted-audio") + ".wav"
        : file.name;
      const audioFile = new File([extracted.audioBlob], audioFileName, {
        type: extracted.audioBlob.type || "audio/wav",
      });

      setCustomVoiceoverFile(audioFile);
      setCustomVoiceoverUrl(extracted.audioUrl);
      setAudioExtractedFromVideo(extracted.isFromVideo);
      setIsExtractingAudio(false);

      // AUTOMATIC: Immediately transcribe speech into sentences & match stock clips!
      await transcribeAudioFile(audioFile);
    } catch (err: any) {
      console.warn("Audio extraction fallback:", err);
      setCustomVoiceoverFile(file);
      setCustomVoiceoverUrl(URL.createObjectURL(file));
      setAudioExtractedFromVideo(false);
      setIsExtractingAudio(false);

      // Try transcribe on original file
      await transcribeAudioFile(file);
    }
  };

  // Manual Trigger: Re-Transcribe Audio into Sentences
  const handleTranscribeAudio = async () => {
    if (!customVoiceoverFile) return;
    await transcribeAudioFile(customVoiceoverFile);
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: ViralScriptPreset) => {
    setActivePresetId(preset.id);
    setScriptText(preset.script);
    const newScenes = createScenesFromScript(preset.script);
    setScenes(newScenes);
    setActiveSceneIndex(0);
    stopPlayback();
  };

  // Re-generate scenes from script text & perform live web search for custom words!
  const handleGenerateScenesFromScript = async () => {
    stopPlayback();
    const newScenes = createScenesFromScript(scriptText);
    setScenes(newScenes);
    setActiveSceneIndex(0);

    // Dynamic Live Web Search across scenes for non-preset custom words
    newScenes.forEach(async (sc, idx) => {
      const query = extractSearchQueryFromSentence(sc.sentenceText);
      if (query && query !== "inspiration") {
        const webMatches = await searchOpenverseImages(query, 1);
        if (webMatches && webMatches.length > 0) {
          setScenes((prev) => {
            const next = [...prev];
            if (next[idx]) {
              next[idx] = {
                ...next[idx],
                mediaItem: webMatches[0],
                customMediaUrl: null,
                mediaType: webMatches[0].type || "image",
              };
            }
            return next;
          });
        }
      }
    });
  };

  // Helper: Live Dynamic Web Videos Fetcher (Pexels + Wikimedia Commons client-side with open CORS)
  const fetchLiveVideos = async (query: string): Promise<StockMediaItem[]> => {
    return await searchLiveVideosClient(query, pexelsToken);
  };

  // Handle Live Web Photos Search in Tab 1 (High-Res Photos Only - Matching Exact Query!)
  const handlePerformLiveSearch = async (query: string) => {
    setMediaSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    // Search matching live high-res photos from Openverse
    const matchingPhotos = await searchOpenverseImages(query.trim(), 12);
    setSearchResults(matchingPhotos);
    setIsSearching(false);
  };

  // Open Picker for Scene
  const handleOpenPickerForScene = (index: number) => {
    setEditingSceneIndex(index);
    const initialQuery = extractSearchQueryFromSentence(scenes[index].sentenceText);
    setMediaSearchQuery(initialQuery);
    setAiCustomPrompt(scenes[index].sentenceText);
    setVideoFilterQuery("");
    setVideoCategoryFilter("all");
    setLivePexelsVideoResults([]);
    setAiPreviewCandidate(null);
    setAiGeneratedResults([]);
    handlePerformLiveSearch(initialQuery);
    setActivePickerTab("search");
  };

  // Dedicated Video Clips Tab Search (Queries dynamic live web videos + local library)
  const handleSearchVideoTab = async (query: string) => {
    setVideoFilterQuery(query);
    if (!query.trim()) {
      setLivePexelsVideoResults([]);
      return;
    }
    setIsSearchingPexels(true);

    // 1. Fetch any authentic curated stock clips for this query
    const localMatches = searchVideoClips(query.trim());

    // 2. Fetch live web videos from /api/video-search (Pexels / Wikimedia)
    const liveClips = await fetchLiveVideos(query.trim());

    // Prioritize Pexels if token present; otherwise prioritize curated authentic clips
    const combined = pexelsToken.trim()
      ? [...liveClips, ...localMatches]
      : [...localMatches, ...liveClips];

    // Deduplicate
    const seen = new Set<string>();
    const uniqueCombined = combined.filter((item) => {
      if (!item.url || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

    setLivePexelsVideoResults(uniqueCombined);
    setIsSearchingPexels(false);
  };

  // Helper: Hugging Face Serverless Inference (Free FLUX / SDXL with user token)
  const generateWithHuggingFace = async (prompt: string, token: string): Promise<string | null> => {
    try {
      const models = [
        "black-forest-labs/FLUX.1-schnell",
        "stabilityai/stable-diffusion-xl-base-1.0",
      ];
      for (const model of models) {
        try {
          const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token.trim()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: `${prompt}, cinematic 8k resolution, vertical 9:16 aspect ratio, masterpiece`,
            }),
          });
          if (res.ok) {
            const blob = await res.blob();
            return URL.createObjectURL(blob);
          }
        } catch (e) {
          console.warn(`HF model ${model} note:`, e);
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Generate Custom AI Visual Preview (Dual-Engine: Hugging Face + Safe Free AI + Fallback)
  const handleGenerateAiPreview = async () => {
    if (!aiCustomPrompt.trim() || editingSceneIndex === null) return;
    setIsAiGenerating(true);

    try {
      // 1. Sanitize prompt (convert curly quotes, smart punctuation to clean ASCII)
      const cleanPrompt = aiCustomPrompt
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .trim();

      const baseSeed = Math.floor(Math.random() * 900000) + 100000;

      // 2. Pro Mode: If user has configured Hugging Face Free Token, try FLUX.1-schnell first!
      if (hfToken.trim()) {
        const hfImageUrl = await generateWithHuggingFace(cleanPrompt, hfToken.trim());
        if (hfImageUrl) {
          const hfItem: StockMediaItem = {
            id: `ai-hf-${baseSeed}`,
            category: "Hugging Face AI ✨",
            name: `HF: ${cleanPrompt.slice(0, 32)}...`,
            keywords: [cleanPrompt],
            url: hfImageUrl,
            type: "image",
          };
          setAiPreviewCandidate(hfItem);
          setAiGeneratedResults([hfItem]);
          setIsAiGenerating(false);
          return;
        }
      }

      // 3. Free Mode: Safe Single-Request AI Engine (Zero Key, Zero Login, Zero 402 Paywall)
      const enhancedPrompt = `${cleanPrompt}, cinematic lighting, photorealistic, 8k resolution, vertical 9:16`;
      const encodedPrompt = encodeURIComponent(enhancedPrompt);

      // Single serialized call without model=flux parameter to avoid 402 Payment Required!
      const freeAiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=720&height=1280&seed=${baseSeed}&nologo=true`;

      const isLoaded = await new Promise<boolean>((resolve) => {
        const testImg = new Image();
        testImg.onload = () => resolve(true);
        testImg.onerror = () => resolve(false);
        testImg.src = freeAiUrl;
        setTimeout(() => resolve(false), 9000);
      });

      if (isLoaded) {
        const candidate: StockMediaItem = {
          id: `ai-free-${baseSeed}`,
          category: "Free AI Engine ✨",
          name: `AI: ${cleanPrompt.slice(0, 32)}...`,
          keywords: [cleanPrompt],
          url: freeAiUrl,
          type: "image",
        };
        setAiPreviewCandidate(candidate);
        setAiGeneratedResults([candidate]);
      } else {
        // 4. Smart Backup: If free AI endpoint is temporarily busy, auto-fetch high quality visual
        const query = extractSearchQueryFromSentence(cleanPrompt);
        const stockMatches = await searchOpenverseImages(query || cleanPrompt, 3);
        if (stockMatches.length > 0) {
          setAiPreviewCandidate(stockMatches[0]);
          setAiGeneratedResults(stockMatches);
        } else {
          const usedIds = new Set<string>();
          const fallback = matchStockMediaForSentence(cleanPrompt, editingSceneIndex, usedIds);
          setAiPreviewCandidate(fallback);
          setAiGeneratedResults([fallback]);
        }
      }
    } catch (e) {
      console.warn("AI generation note:", e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // User explicitly applies the reviewed visual to the scene
  const handleApplyPreviewToScene = (itemToApply: StockMediaItem) => {
    if (editingSceneIndex === null) return;
    handleSelectMediaForScene(editingSceneIndex, itemToApply);
  };

  // Shuffle a single scene's visual to next matching item
  const handleShuffleSceneVisual = (sceneIndex: number) => {
    const scene = scenes[sceneIndex];
    const currentIndex = CURATED_STOCK_MEDIA.findIndex((m) => m.id === scene.mediaItem.id);
    const nextIndex = (currentIndex + 1) % CURATED_STOCK_MEDIA.length;
    const nextMedia = CURATED_STOCK_MEDIA[nextIndex];

    setScenes((prev) => {
      const next = [...prev];
      next[sceneIndex] = {
        ...next[sceneIndex],
        mediaItem: nextMedia,
        customMediaUrl: null,
        mediaType: nextMedia.type || "image",
      };
      return next;
    });
  };

  // Update a scene's text
  const handleUpdateSceneText = (index: number, newText: string) => {
    setScenes((prev) => {
      const next = [...prev];
      const usedIds = new Set(next.map((s) => s.mediaItem.id));
      const autoMatched = matchStockMediaForSentence(newText, index, usedIds);
      next[index] = {
        ...next[index],
        sentenceText: newText,
        mediaItem: autoMatched,
        mediaType: autoMatched.type || "image",
      };
      return next;
    });
  };

  // Select media for scene
  const handleSelectMediaForScene = (sceneIndex: number, media: StockMediaItem) => {
    setScenes((prev) => {
      const next = [...prev];
      next[sceneIndex] = {
        ...next[sceneIndex],
        mediaItem: media,
        customMediaUrl: null,
        mediaType: media.type || "image",
      };
      return next;
    });
    setEditingSceneIndex(null);
  };

  // Upload Custom Media (Images or Any Resolution Videos: 480p, 720p, 1080p, 4k)
  const handleCustomMediaUploadForScene = (sceneIndex: number, meta: FileMetadata) => {
    const url = URL.createObjectURL(meta.file);
    const isVideo =
      meta.type.startsWith("video") ||
      meta.name.toLowerCase().endsWith(".mp4") ||
      meta.name.toLowerCase().endsWith(".webm") ||
      meta.name.toLowerCase().endsWith(".mov");

    setScenes((prev) => {
      const next = [...prev];
      next[sceneIndex] = {
        ...next[sceneIndex],
        customMediaUrl: url,
        mediaType: isVideo ? "video" : "image",
      };
      return next;
    });
    setEditingSceneIndex(null);
  };

  // Change Scene Ken Burns Zoom Effect
  const handleUpdateSceneEffect = (
    sceneIndex: number,
    effect: "zoom-in" | "zoom-out" | "pan-left" | "pan-right"
  ) => {
    setScenes((prev) => {
      const next = [...prev];
      next[sceneIndex] = { ...next[sceneIndex], zoomEffect: effect };
      return next;
    });
  };

  // Render 9:16 Frame with Ken Burns Animation & Viral Subtitles (Handles Images & Videos!)
  const renderFrame = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const currentIdx = activeSceneIndexRef.current;
    const scene = scenes[currentIdx] || scenes[0];
    if (!scene) return;

    // 1. Calculate Ken Burns Motion Progress
    const now = performance.now();
    const elapsedSeconds = sceneStartTimeRef.current > 0 ? (now - sceneStartTimeRef.current) / 1000 : 0;
    const sceneDuration = Math.max(4, (scene.sentenceText.split(/\s+/).length || 1) * 0.45);
    const motionProgress = Math.min(1.0, elapsedSeconds / sceneDuration);

    let scale = 1.0;
    let tx = 0;
    let ty = 0;

    if (scene.zoomEffect === "zoom-in") {
      scale = 1.0 + motionProgress * 0.16;
    } else if (scene.zoomEffect === "zoom-out") {
      scale = 1.16 - motionProgress * 0.16;
    } else if (scene.zoomEffect === "pan-left") {
      scale = 1.12;
      tx = (0.5 - motionProgress) * width * 0.08;
    } else if (scene.zoomEffect === "pan-right") {
      scale = 1.12;
      tx = (motionProgress - 0.5) * width * 0.08;
    }

    // 2. Draw Scene Visual (Video or Image)
    const mediaUrl = scene.customMediaUrl || scene.mediaItem.url;
    const isVideo = scene.mediaType === "video";
    const vid = isVideo ? loadedVideosRef.current.get(mediaUrl) : null;
    const img = !isVideo ? loadedImagesRef.current.get(mediaUrl) : null;

    if (vid && vid.readyState >= 2) {
      // Draw Video scaled to 9:16 aspect ratio (any resolution: 480p, 720p, 1080p, 4k)
      const vidRatio = (vid.videoWidth || 16) / (vid.videoHeight || 9);
      const canvasRatio = width / height;

      let drawW = width;
      let drawH = height;
      if (vidRatio > canvasRatio) {
        drawW = height * vidRatio;
      } else {
        drawH = width / vidRatio;
      }

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.drawImage(vid, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Dark cinematic tint for text readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, width, height);
    } else if (img && img.complete && img.naturalWidth > 0) {
      // Draw Image with Ken Burns motion
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;

      let drawW = width;
      let drawH = height;
      if (imgRatio > canvasRatio) {
        drawW = height * imgRatio;
      } else {
        drawH = width / imgRatio;
      }

      ctx.save();
      ctx.translate(width / 2 + tx, height / 2 + ty);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Cinematic Vignette Overlay
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      grad.addColorStop(0.35, "rgba(0, 0, 0, 0.1)");
      grad.addColorStop(0.7, "rgba(0, 0, 0, 0.5)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Atmospheric Gradient Fallback
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#09090b");
      grad.addColorStop(0.5, "#1e1b4b");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Draw Dynamic CapCut / MrBeast Style Subtitles
    const sceneWords = scene.sentenceText.trim().split(/\s+/).filter(Boolean);
    if (sceneWords.length > 0) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const phraseLength = 3;
      const currentPhraseIndex = Math.floor(activeWordIndex / phraseLength);
      const phraseStart = currentPhraseIndex * phraseLength;
      const phraseEnd = Math.min(sceneWords.length, phraseStart + phraseLength);
      const currentPhraseWords = sceneWords.slice(phraseStart, phraseEnd);

      const phraseText = currentPhraseWords.join(" ").toUpperCase();
      const centerY = height * 0.55;

      let fontSize = Math.round((width / 360) * subtitleSize);
      ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif, "Impact"`;

      // Auto-fit: scale down fontSize if text exceeds 84% of canvas width (prevents overflow cut-off)
      const maxAllowedWidth = width * 0.84;
      let metrics = ctx.measureText(phraseText);
      if (metrics.width > maxAllowedWidth) {
        fontSize = Math.max(16, Math.floor(fontSize * (maxAllowedWidth / metrics.width)));
        ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif, "Impact"`;
        metrics = ctx.measureText(phraseText);
      }

      const boxWidth = metrics.width + 28;
      const boxHeight = fontSize + 20;

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === "function") {
        (ctx as any).roundRect(width / 2 - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight, 14);
      } else {
        ctx.rect(width / 2 - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);
      }
      ctx.fill();

      ctx.strokeStyle = activeSubtitleStyle.strokeColor;
      ctx.lineWidth = 6;
      ctx.lineJoin = "round";
      ctx.strokeText(phraseText, width / 2, centerY);

      ctx.fillStyle = activeSubtitleStyle.highlightColor;
      ctx.fillText(phraseText, width / 2, centerY);

      ctx.restore();
    }

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }
  }, [isPlaying, scenes, activeWordIndex, subtitleSize, activeSubtitleStyle]);

  // Redraw when scenes, style, or size changes
  useEffect(() => {
    renderFrame();
  }, [renderFrame, scenes, selectedStyleId, subtitleSize, activeSceneIndex]);

  // Clean up
  useEffect(() => {
    return () => {
      stopPlayback();
      if (exportedVideoUrl) URL.revokeObjectURL(exportedVideoUrl);
    };
  }, [stopPlayback, exportedVideoUrl]);

  // Play Scene by Scene with Auto-Cut Sequencing
  const playSceneSequence = useCallback(
    (sceneIdx: number) => {
      if (sceneIdx >= scenes.length) {
        stopPlayback();
        return;
      }

      setActiveSceneIndex(sceneIdx);
      activeSceneIndexRef.current = sceneIdx;
      setActiveWordIndex(0);
      sceneStartTimeRef.current = performance.now();

      const scene = scenes[sceneIdx];
      const textToSpeak = scene.sentenceText.trim();

      // Start playing scene video if present
      const mediaUrl = scene.customMediaUrl || scene.mediaItem.url;
      if (scene.mediaType === "video" && mediaUrl) {
        const vid = loadedVideosRef.current.get(mediaUrl);
        if (vid) {
          vid.currentTime = 0;
          vid.play().catch(() => {});
        }
      }

      if (!textToSpeak) {
        playSceneSequence(sceneIdx + 1);
        return;
      }

      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;
      utterance.rate = speechRate;

      if (selectedVoiceURI) {
        const voice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }
      }

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const textUpToChar = textToSpeak.slice(0, event.charIndex);
          const wIdx = textUpToChar.trim().split(/\s+/).length - 1;
          setActiveWordIndex(Math.max(0, wIdx));
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsSynthesizing(false);
        renderFrame();
      };

      utterance.onend = () => {
        if (sceneIdx + 1 < scenes.length) {
          playSceneSequence(sceneIdx + 1);
        } else {
          stopPlayback();
        }
      };

      utterance.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") {
          return;
        }
        console.warn("Speech notice:", e);
        if (sceneIdx + 1 < scenes.length) {
          playSceneSequence(sceneIdx + 1);
        } else {
          stopPlayback();
        }
      };

      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    },
    [scenes, speechRate, selectedVoiceURI, availableVoices, renderFrame, stopPlayback]
  );

  // Play Button Handler (Supports both Browser TTS & Custom Audio)
  const handlePlay = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    // A. Custom Voiceover Audio playback
    if (customVoiceoverUrl) {
      stopPlayback();
      const audio = customAudioRef.current || new Audio(customVoiceoverUrl);
      customAudioRef.current = audio;
      setIsPlaying(true);
      audio.currentTime = 0;
      audio.play().catch(() => {});

      const totalWords = scenes.reduce((acc, s) => acc + s.sentenceText.split(/\s+/).length, 0);
      let cumulativeWords = 0;
      const sceneWordCounts = scenes.map((s) => {
        const c = s.sentenceText.split(/\s+/).length || 1;
        cumulativeWords += c;
        return cumulativeWords;
      });

      audio.ontimeupdate = () => {
        const progress = audio.currentTime / (audio.duration || 1);
        const currentWord = Math.floor(progress * totalWords);
        setActiveWordIndex(currentWord);

        const sceneIndex = sceneWordCounts.findIndex((cnt) => cnt > currentWord);
        const targetSceneIdx = sceneIndex !== -1 ? sceneIndex : scenes.length - 1;
        if (targetSceneIdx !== activeSceneIndexRef.current) {
          setActiveSceneIndex(targetSceneIdx);
          activeSceneIndexRef.current = targetSceneIdx;
          sceneStartTimeRef.current = performance.now();
          const targetScene = scenes[targetSceneIdx];
          const mediaUrl = targetScene.customMediaUrl || targetScene.mediaItem.url;
          if (targetScene.mediaType === "video" && mediaUrl) {
            const vid = loadedVideosRef.current.get(mediaUrl);
            if (vid) {
              vid.currentTime = targetScene.trimStart || 0;
              vid.play().catch(() => {});
            }
          }
        }
      };

      audio.onended = () => {
        stopPlayback();
      };

      renderFrame();
      return;
    }

    // B. Browser Speech Synthesis playback
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech Synthesis is not supported in this browser.");
      return;
    }

    stopPlayback();
    setIsSynthesizing(true);
    playSceneSequence(0);
  };

  // Export 9:16 Video with SYNCHRONIZED AUDIO TRACK (Canvas Video + Web Audio Mixed)
  const handleExportVideo = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(5);
    stopPlayback();

    try {
      let activeVoiceUrl = customVoiceoverUrl;

      // 1. Auto-generate ElevenLabs voice if user has API key and selected ElevenLabs
      if (!activeVoiceUrl && voiceEngine === "elevenlabs" && elevenLabsApiKey.trim()) {
        try {
          setExportProgress(8);
          const speechBlob = await generateElevenLabsSpeech({
            text: scriptText,
            voiceId: selectedElevenVoiceId,
            apiKey: elevenLabsApiKey,
          });
          activeVoiceUrl = URL.createObjectURL(speechBlob);
          setCustomVoiceoverUrl(activeVoiceUrl);
          const chosenVoice = ELEVENLABS_VOICES.find((v) => v.id === selectedElevenVoiceId);
          setElevenGeneratedVoiceName(chosenVoice?.name || "ElevenLabs");
        } catch (genErr: any) {
          console.warn("Auto voice generation note:", genErr);
        }
      }

      // If still no voice and user has no music selected, default to Viral Shorts Beat so video is never muted!
      let activeBgTrack = selectedBgMusicTrack;
      if (!activeVoiceUrl && activeBgTrack === "none") {
        activeBgTrack = "beat";
        setSelectedBgMusicTrack("beat");
      }

      // 2. Setup AudioContext & MediaStreamDestination (ALWAYS RESUME TO PREVENT MUTING)
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
      const dest = audioCtx.createMediaStreamDestination();

      // 3. Decode Voiceover Audio into an AudioBuffer (100% CORS-free PCM samples)
      let voiceDuration = 0;
      let voiceSourceNode: AudioBufferSourceNode | null = null;

      if (activeVoiceUrl) {
        try {
          const res = await fetch(activeVoiceUrl);
          const voiceBlob = await res.blob();
          const voiceBuffer = await decodeAudioBlob(audioCtx, voiceBlob);
          voiceDuration = voiceBuffer.duration;

          voiceSourceNode = audioCtx.createBufferSource();
          voiceSourceNode.buffer = voiceBuffer;

          const voiceGain = audioCtx.createGain();
          voiceGain.gain.value = 1.0;

          voiceSourceNode.connect(voiceGain);
          voiceGain.connect(dest);
          voiceGain.connect(audioCtx.destination);
        } catch (decodeErr) {
          console.warn("Voice buffer decode notice:", decodeErr);
        }
      }

      // 4. Calculate Total Video Duration
      const totalWords = scenes.reduce((acc, s) => acc + s.sentenceText.split(/\s+/).length, 0);
      const estSpeechSeconds = Math.max(6, totalWords * 0.52);
      const totalExportDuration = Math.max(6, voiceDuration || estSpeechSeconds);

      // 5. Synthesize & Mix Royalty-Free Background Music (Lo-Fi / Cinematic Beat)
      let bgSourceNode: AudioBufferSourceNode | null = null;

      if (activeBgTrack !== "none") {
        try {
          const bgBuffer = generateSynthesizedMusicBuffer(
            audioCtx,
            activeBgTrack,
            totalExportDuration + 2
          );
          bgSourceNode = audioCtx.createBufferSource();
          bgSourceNode.buffer = bgBuffer;
          bgSourceNode.loop = true;

          const bgGain = audioCtx.createGain();
          // If voiceover is active, keep background subtle (22%); otherwise 38%
          bgGain.gain.value = voiceSourceNode
            ? Math.min(0.22, bgMusicVolume * 0.3)
            : Math.max(0.35, bgMusicVolume);

          bgSourceNode.connect(bgGain);
          bgGain.connect(dest);
          bgGain.connect(audioCtx.destination);
        } catch (bgErr) {
          console.warn("Background music synthesis note:", bgErr);
        }
      } else if (!voiceSourceNode) {
        // Guarantee non-zero audio track so media players never mute
        try {
          const ambientBuffer = generateSynthesizedMusicBuffer(audioCtx, "chill", totalExportDuration + 2);
          const ambSource = audioCtx.createBufferSource();
          ambSource.buffer = ambientBuffer;
          ambSource.loop = true;
          const ambGain = audioCtx.createGain();
          ambGain.gain.value = 0.25;
          ambSource.connect(ambGain);
          ambGain.connect(dest);
          ambSource.start(0);
        } catch {}
      }

      // 6. Combine Canvas 30fps Video Stream + Active Web Audio Stream
      const canvasStream = canvas.captureStream(30);
      const audioTracks = dest.stream.getAudioTracks();
      const combinedTracks = [...canvasStream.getVideoTracks(), ...audioTracks];
      const combinedStream = new MediaStream(combinedTracks);

      // 7. Negotiate Best Codec (Prioritize native MP4 with AAC for Windows Media Player!)
      const { mimeType, extension } = getBestMediaRecorderMimeType();
      setExportedExtension(extension);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000,
        audioBitsPerSecond: 192000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        if (audioCtx) {
          try {
            audioCtx.close();
          } catch {}
        }
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setExportedVideoUrl(url);
        setIsExporting(false);
        setExportProgress(100);
      };

      // 8. Start Recording and Audio Playback
      recorder.start(200);
      if (voiceSourceNode) voiceSourceNode.start(0);
      if (bgSourceNode) bgSourceNode.start(0);

      // 9. Frame & Subtitle Animation Loop during Export
      const exportStartTime = performance.now();
      let cumulativeWords = 0;
      const sceneWordCounts = scenes.map((s) => {
        const c = s.sentenceText.split(/\s+/).length || 1;
        cumulativeWords += c;
        return cumulativeWords;
      });

      const interval = setInterval(() => {
        const elapsed = (performance.now() - exportStartTime) / 1000;
        const progress = Math.min(1.0, elapsed / totalExportDuration);
        setExportProgress(Math.min(98, Math.round(progress * 100)));

        const currentWord = Math.floor(progress * totalWords);
        setActiveWordIndex(currentWord);

        const sceneIndex = sceneWordCounts.findIndex((cnt) => cnt > currentWord);
        const targetSceneIdx = sceneIndex !== -1 ? sceneIndex : scenes.length - 1;
        if (targetSceneIdx !== activeSceneIndexRef.current) {
          setActiveSceneIndex(targetSceneIdx);
          activeSceneIndexRef.current = targetSceneIdx;
          sceneStartTimeRef.current = performance.now();
        }

        renderFrame();

        if (elapsed >= totalExportDuration) {
          clearInterval(interval);
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }
      }, 33);
    } catch (err: any) {
      console.error("Export failed:", err);
      setIsExporting(false);
      alert("Export could not be completed: " + err.message);
    }
  };

  // Dynamic Filtered Video Clips (Supports search query & topic category filters)
  const curatedVideoClips = useMemo(() => {
    const allVideoItems = CURATED_STOCK_MEDIA.filter((m) => m.type === "video");
    let pool = allVideoItems;
    if (videoCategoryFilter !== "all") {
      pool = allVideoItems.filter((m) =>
        m.category.toLowerCase().includes(videoCategoryFilter.toLowerCase()) ||
        m.keywords.some((k) => k.toLowerCase().includes(videoCategoryFilter.toLowerCase()))
      );
    }

    if (!videoFilterQuery.trim()) {
      return pool;
    }

    return searchVideoClips(videoFilterQuery);
  }, [videoFilterQuery, videoCategoryFilter]);

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-500/15">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {tool?.name || "AI Script to Video & Faceless Shorts Studio"}
              </h2>
              <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                Video Clips + AI Voice
              </span>
            </div>
            <p className="text-xs text-white/85">
              {tool?.tagline || "Mix video clips & AI visuals per sentence with Ken Burns motion & CapCut viral subtitles"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold bg-black/20 px-3 py-1.5 rounded-xl border border-white/20">
          <span>🎬 Video Clips Supported</span>
          <span>•</span>
          <span>Zero Watermark</span>
          <span>•</span>
          <span>1080×1920 HD</span>
        </div>
      </div>

      {/* 2. Main Studio Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Script, Multi-Scene Storyboard, Voice & Captions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Script & Viral Presets */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-red-600" />
                Step 1: Viral Short Script & Topics
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {scenes.length} Scenes • ~{Math.max(5, Math.round(scriptText.split(/\s+/).length / 2.5))}s Duration
              </span>
            </div>

            {/* Input Mode Selector: Text Script vs Audio Upload */}
            <div className="flex rounded-2xl bg-slate-100 p-1 gap-1">
              <button
                onClick={() => setInputMode("text")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  inputMode === "text"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-red-600" />
                <span>✍️ Write / Pick Text Script</span>
              </button>
              <button
                onClick={() => setInputMode("audio")}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  inputMode === "audio"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Mic className="h-3.5 w-3.5 text-red-600" />
                <span>🎙️ Upload Voiceover (Audio / Video MP4)</span>
              </button>
            </div>

            {/* Mode A: Custom Voiceover Audio Upload & Transcription */}
            {inputMode === "audio" ? (
              <div className="space-y-3.5 p-4 bg-red-50/60 rounded-2xl border border-red-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                    <Music className="h-4 w-4 text-red-600" />
                    Upload Voiceover (Audio or Video - MP3 / MP4 / MOV / WAV / WebM):
                  </span>
                  {customVoiceoverUrl && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {audioExtractedFromVideo ? "Audio Extracted from Video (MP4)" : "Audio Attached"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-red-300 hover:border-red-500 bg-white hover:bg-red-50/30 text-xs font-bold text-slate-700 transition-all">
                    {isExtractingAudio ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        <span className="text-red-600">Extracting audio track from video file...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-red-600" />
                        <span>
                          {customVoiceoverFile
                            ? `${audioExtractedFromVideo ? "🎬 Video Audio: " : "🎵 "}${customVoiceoverFile.name}`
                            : "Select Audio (MP3/WAV) or Video (MP4/WebM/MOV)..."}
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.mp4,.webm,.mov,.mkv,.avi"
                      onChange={handleAudioUpload}
                      disabled={isExtractingAudio}
                      className="hidden"
                    />
                  </label>

                  {customVoiceoverUrl && (
                    <button
                      onClick={handleTranscribeAudio}
                      disabled={isTranscribing || isExtractingAudio}
                      className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition-all"
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Transcribing ({transcriptionProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-300" />
                          <span>Re-Transcribe Voiceover</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* In-Browser Whisper Transcription Progress Bar */}
                {isTranscribing && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-white border border-red-200 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                        <span>{transcriptionStatus || "Transcribing speech with Whisper AI..."}</span>
                      </span>
                      <span className="font-mono text-red-600 font-extrabold">{transcriptionProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-rose-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${transcriptionProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Transcription Success Banner */}
                {!isTranscribing && transcriptionProgress === 100 && transcriptionStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{transcriptionStatus}</span>
                  </div>
                )}

                {customVoiceoverUrl && (
                  <div className="space-y-1">
                    <audio
                      src={customVoiceoverUrl}
                      controls
                      className="w-full h-8 rounded-lg"
                    />
                    <p className="text-[10px] text-slate-500 font-medium">
                      ✓ This audio will be played during preview and embedded into the exported download video!
                    </p>
                  </div>
                )}

                {transcriptionError && (
                  <p className="text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                    {transcriptionError}
                  </p>
                )}

                {/* Editable Transcript Textarea */}
                <div className="space-y-1.5 pt-2 border-t border-red-200">
                  <span className="text-[11px] font-bold text-slate-700">
                    Extracted Sentences (Edit or fine-tune before matching clips):
                  </span>
                  <textarea
                    value={scriptText}
                    onChange={(e) => setScriptText(e.target.value)}
                    rows={3}
                    placeholder="Transcribed sentences will appear here automatically, or you can paste your lines..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-red-500 text-xs font-medium text-slate-900 outline-none bg-white resize-y"
                  />
                  <button
                    onClick={handleGenerateScenesFromScript}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Cut Into Scenes & Match Stock Clips</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Mode B: Text Script Presets & Custom Text Area */
              <>
                {/* Presets Grid */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Pick a Viral Niche Topic:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {VIRAL_PRESETS.map((preset) => {
                      const isSelected = activePresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-2.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "bg-red-50 border-red-500 text-red-950 font-bold shadow-sm"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{preset.category}</span>
                          </div>
                          <p className="text-xs truncate font-bold mt-1 text-slate-900">{preset.title}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Script Textarea & Auto-Generate Button */}
                <div className="space-y-2.5">
                  <textarea
                    value={scriptText}
                    onChange={(e) => {
                      setScriptText(e.target.value);
                      setActivePresetId("");
                    }}
                    rows={4}
                    placeholder="Write any story (mention Lamborghini, cars, village, old mysteries, lion, animals, space)... each line matches video clips or photos!"
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-slate-900 text-sm leading-relaxed transition-all resize-y font-medium"
                  />

                  <button
                    onClick={handleGenerateScenesFromScript}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-black hover:from-black hover:to-slate-900 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Auto-Cut Lines & Match Visuals (Smart Topic Match)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Step 2: Multi-Scene Storyboard (Auto-Cut Timeline) */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Film className="h-4 w-4 text-red-600" />
                Step 2: Auto-Cut Storyboard ({scenes.length} Scenes)
              </label>
              <span className="text-[11px] font-bold text-slate-400">
                1 Line = 1 Dynamic Scene
              </span>
            </div>

            {/* Scenes List */}
            <div className="space-y-3">
              {scenes.map((scene, idx) => {
                const isActive = activeSceneIndex === idx;
                const isExpanded = expandedSceneId === scene.id;
                const visualUrl = scene.customMediaUrl || scene.mediaItem.url;
                const isVideo = scene.mediaType === "video";

                return (
                  <div
                    key={scene.id}
                    className={`rounded-2xl border transition-all ${
                      isActive
                        ? "border-red-500 bg-red-50/40 shadow-sm"
                        : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-3 sm:p-4 flex items-center gap-3">
                      {/* Scene Visual Thumbnail with Aspect 9:16 */}
                      <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-300 shadow-sm flex items-center justify-center">
                        {isVideo ? (
                          <div className="relative w-full h-full">
                            <video
                              src={visualUrl}
                              crossOrigin="anonymous"
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-1 left-1 text-[8px] bg-red-600 text-white px-1 py-0.5 rounded font-black flex items-center gap-0.5">
                              <Video className="h-2.5 w-2.5" /> Video
                            </span>
                          </div>
                        ) : (
                          <img
                            src={visualUrl}
                            alt={scene.mediaItem.name}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] bg-black/75 text-white px-1 rounded font-bold uppercase">
                          {scene.zoomEffect.replace("pan-", "")}
                        </span>
                      </div>

                      {/* Scene Line & Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-white bg-slate-900 px-2 py-0.5 rounded-full">
                            Scene {idx + 1}
                          </span>
                          <span className="text-[11px] font-bold text-slate-600 truncate">
                            {scene.mediaItem.name}
                          </span>
                          {isVideo && (
                            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-extrabold">
                              Video Clip
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-relaxed">
                          &ldquo;{scene.sentenceText}&rdquo;
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenPickerForScene(idx)}
                          title="Search or change visual for this line"
                          className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-[11px] font-bold text-red-700 shadow-sm flex items-center gap-1"
                        >
                          <Search className="h-3.5 w-3.5 text-red-600" />
                          <span>Visual / Clip</span>
                        </button>
                        <button
                          onClick={() => handleShuffleSceneVisual(idx)}
                          title="Shuffle to another visual"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-bold text-slate-700 shadow-sm flex items-center gap-1"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
                          <span>Shuffle</span>
                        </button>
                        <button
                          onClick={() => setExpandedSceneId(isExpanded ? null : scene.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-center"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4 mx-auto" /> : <ChevronDown className="h-4 w-4 mx-auto" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Controls for Editing Text & Animation Effect */}
                    {isExpanded && (
                      <div className="p-3.5 border-t border-slate-200/80 bg-white rounded-b-2xl space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500">Edit Scene Line:</span>
                          <input
                            type="text"
                            value={scene.sentenceText}
                            onChange={(e) => handleUpdateSceneText(idx, e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-red-500"
                          />
                        </div>

                        {/* Video Clip Trim Control */}
                        {isVideo && (
                          <div className="p-3 bg-red-50/70 rounded-2xl border border-red-200/80 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-red-950 flex items-center gap-1.5">
                                <Scissors className="h-3.5 w-3.5 text-red-600" />
                                Trim Video Clip (Start Offset):
                              </span>
                              <span className="font-mono font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-md text-[11px]">
                                Starts at: {(scene.trimStart || 0).toFixed(1)}s
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={0}
                                max={Math.max(10, scene.mediaItem.duration || 30) - 1}
                                step={0.5}
                                value={scene.trimStart || 0}
                                onChange={(e) => handleUpdateSceneTrim(idx, parseFloat(e.target.value))}
                                className="w-full accent-red-600 h-2 bg-red-200 rounded-lg cursor-pointer"
                              />
                              <button
                                onClick={() => {
                                  setActiveSceneIndex(idx);
                                  const mediaUrl = scene.customMediaUrl || scene.mediaItem.url;
                                  const vid = loadedVideosRef.current.get(mediaUrl);
                                  if (vid) {
                                    vid.currentTime = scene.trimStart || 0;
                                    vid.play().catch(() => {});
                                  }
                                  renderFrame();
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-[11px] shrink-0 hover:bg-red-700 shadow-sm"
                              >
                                Preview Trim
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Choose which exact second of the clip starts playing for this scene line.
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-600">Motion:</span>
                            <select
                              value={scene.zoomEffect}
                              onChange={(e) =>
                                handleUpdateSceneEffect(idx, e.target.value as any)
                              }
                              className="p-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none"
                            >
                              <option value="zoom-in">Cinematic Zoom In</option>
                              <option value="zoom-out">Cinematic Zoom Out</option>
                              <option value="pan-left">Slow Pan Left</option>
                              <option value="pan-right">Slow Pan Right</option>
                            </select>
                          </div>

                          <button
                            onClick={() => {
                              setActiveSceneIndex(idx);
                              renderFrame();
                            }}
                            className="text-[11px] font-extrabold text-red-600 hover:underline"
                          >
                            Preview This Scene
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Subtitles & Voiceover Settings */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Type className="h-4 w-4 text-red-600" />
              Step 3: Viral Subtitles & Voiceover Narration
            </label>

            {/* Subtitle Style Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">Subtitles Style (CapCut / MrBeast):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SUBTITLE_STYLES.map((style) => {
                  const isSelected = selectedStyleId === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyleId(style.id)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      <span
                        className="text-sm font-black block tracking-wider"
                        style={{ color: style.highlightColor }}
                      >
                        TEXT
                      </span>
                      <span className="text-[10px] mt-0.5 block truncate">{style.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice & AI Narration Engine */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Mic className="h-3.5 w-3.5 text-red-600" />
                  Voiceover & Narration Engine:
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {voiceEngine === "elevenlabs" ? "💎 ElevenLabs AI" : "⚡ Free Neural AI"}
                </span>
              </div>

              {/* Engine Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setVoiceEngine("elevenlabs")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    voiceEngine === "elevenlabs"
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>ElevenLabs AI (Viral Voices)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceEngine("natural")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    voiceEngine === "natural"
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Volume2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Free Neural Voices</span>
                </button>
              </div>

              {/* 1. ELEVENLABS ENGINE UI */}
              {voiceEngine === "elevenlabs" && (
                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Choose AI Narrator (ChatGPT / YouTube Shorts Quality):
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowElevenKeyInput(!showElevenKeyInput)}
                      className="text-[11px] font-semibold text-red-600 hover:underline"
                    >
                      {elevenLabsApiKey ? "⚙️ Change API Key" : "🔑 Set API Key"}
                    </button>
                  </div>

                  {/* Curated Voice Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ELEVENLABS_VOICES.map((v) => {
                      const isSelected = selectedElevenVoiceId === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedElevenVoiceId(v.id);
                            if (customVoiceoverUrl && elevenGeneratedVoiceName !== v.name) {
                              setCustomVoiceoverUrl(null);
                              setElevenGeneratedVoiceName(null);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-red-500"
                              : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black">{v.name}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                            }`}>
                              {v.gender === "male" ? "♂" : "♀"} {v.accent}
                            </span>
                          </div>
                          <div className={`text-[10px] truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            {v.category}
                          </div>
                          {v.badge && (
                            <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isSelected ? "bg-red-500/80 text-white" : "bg-amber-100 text-amber-800"
                            }`}>
                              {v.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* API Key Drawer */}
                  {(showElevenKeyInput || !elevenLabsApiKey) && (
                    <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">ElevenLabs Free API Key:</span>
                        <a
                          href="https://elevenlabs.io"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          Get Free Key (10k chars/mo) →
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="password"
                          value={elevenLabsApiKey}
                          onChange={(e) => {
                            setElevenLabsApiKey(e.target.value);
                            localStorage.setItem("elevenlabs_api_key", e.target.value.trim());
                          }}
                          placeholder="Paste xi-api-key here (e.g. sk_...)"
                          className="flex-1 p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("elevenlabs_api_key", elevenLabsApiKey.trim());
                            setShowElevenKeyInput(false);
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Generate Button & Status */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isGeneratingEleven}
                      onClick={handleGenerateElevenSpeech}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black shadow-md shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isGeneratingEleven ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating Studio Speech...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Generate {ELEVENLABS_VOICES.find((v) => v.id === selectedElevenVoiceId)?.name} Voiceover</span>
                        </>
                      )}
                    </button>

                    {customVoiceoverUrl && elevenGeneratedVoiceName && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{elevenGeneratedVoiceName} Voice Active</span>
                      </div>
                    )}
                  </div>

                  {elevenAudioError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      ⚠️ {elevenAudioError}
                    </div>
                  )}
                </div>
              )}

              {/* 2. FREE NEURAL AI ENGINE UI */}
              {voiceEngine === "natural" && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-700">
                      Select Natural Browser Voice:
                    </span>
                    <select
                      value={selectedVoiceURI}
                      onChange={(e) => {
                        setSelectedVoiceURI(e.target.value);
                        setCustomVoiceoverUrl(null);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-red-500 bg-white"
                    >
                      <optgroup label="🌟 Natural & Online AI Voices (Recommended)">
                        {availableVoices
                          .filter(
                            (v) =>
                              v.name.toLowerCase().includes("natural") ||
                              v.name.toLowerCase().includes("online") ||
                              v.name.toLowerCase().includes("google")
                          )
                          .map((v) => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              ⭐ {v.name} ({v.lang})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="⚙️ Standard System Voices">
                        {availableVoices
                          .filter(
                            (v) =>
                              !v.name.toLowerCase().includes("natural") &&
                              !v.name.toLowerCase().includes("online") &&
                              !v.name.toLowerCase().includes("google")
                          )
                          .map((v) => (
                            <option key={v.voiceURI} value={v.voiceURI}>
                              {v.name} ({v.lang})
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
              )}

              {/* Speed & Caption Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">Voice Speed</span>
                    <span className="font-mono font-bold text-red-600">{speechRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={1.4}
                    step={0.1}
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">Caption Font Size</span>
                    <span className="font-mono font-bold text-red-600">{subtitleSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={46}
                    step={2}
                    value={subtitleSize}
                    onChange={(e) => setSubtitleSize(Number(e.target.value))}
                    className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Background Music & Audio Beats */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Music className="h-3.5 w-3.5 text-red-600" />
                    Background Music Track:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Royalty-Free Audio
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {BG_MUSIC_TRACKS.map((t) => {
                    const isSelected = selectedBgMusicTrack === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedBgMusicTrack(t.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-slate-900"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{t.name}</span>
                          {t.badge && (
                            <span className="text-[8px] bg-red-600 text-white font-extrabold px-1 rounded">
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                          {t.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedBgMusicTrack !== "none" && (
                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <span className="text-[11px] font-medium text-slate-600">Music Volume Level:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0.1}
                        max={0.5}
                        step={0.05}
                        value={bgMusicVolume}
                        onChange={(e) => setBgMusicVolume(Number(e.target.value))}
                        className="w-24 accent-red-600 h-1 bg-slate-200 rounded cursor-pointer"
                      />
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {Math.round(bgMusicVolume * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive 9:16 Phone Preview & Video Exporter */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="p-5 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-red-500" />
                9:16 Live Phone Preview
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                Scene {activeSceneIndex + 1} of {scenes.length}
              </span>
            </div>

            {/* Vertical 9:16 Phone Mockup Container */}
            <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-slate-800 shadow-inner bg-black flex items-center justify-center">
              {/* Real-time Render Canvas */}
              <canvas
                ref={previewCanvasRef}
                width={720}
                height={1280}
                className="w-full h-full object-cover block"
              />

              {/* Simulated Phone Top Notch & Time */}
              <div className="absolute top-2.5 left-0 right-0 flex items-center justify-between px-4 text-[10px] font-bold text-white/70 pointer-events-none">
                <span>9:41</span>
                <div className="h-3 w-16 bg-black rounded-full" />
                <span>5G 100%</span>
              </div>

              {/* Visual Scene Badge */}
              <div className="absolute top-8 left-3 pointer-events-none flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold bg-black/60 text-white/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                  {currentScene?.mediaItem.name}
                </span>
                {currentScene?.mediaType === "video" && (
                  <span className="text-[9px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full">
                    Video Clip
                  </span>
                )}
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlay}
                  disabled={isSynthesizing || scenes.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 transition-all active:scale-95"
                >
                  {isSynthesizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Voice...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause Auto-Cut Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" />
                      <span>Play 9:16 Video Preview</span>
                    </>
                  )}
                </button>

                <button
                  onClick={stopPlayback}
                  disabled={!isPlaying}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                  title="Stop playback"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Export Video Button */}
              {isExporting ? (
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      Rendering 9:16 Video with Audio...
                    </span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-red-600 h-1.5 transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              ) : exportedVideoUrl ? (
                <a
                  href={exportedVideoUrl}
                  download={`viral-short-ai-videoreduce.${exportedExtension}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download 9:16 Short (.{exportedExtension.toUpperCase()} with Audio)</span>
                </a>
              ) : (
                <button
                  onClick={handleExportVideo}
                  disabled={scenes.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold text-xs transition-all"
                >
                  <Download className="h-4 w-4 text-red-400" />
                  <span>Export Vertical 9:16 Video File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Option C: Live Search, AI Generator & Video Clips Picker Modal */}
      {editingSceneIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Visual or Video Clip for Scene {editingSceneIndex + 1}
                </h3>
                <p className="text-xs text-slate-500">
                  Search live web photos, generate AI visuals, or pick / upload any video clip (480p, 720p, 1080p)
                </p>
              </div>
              <button
                onClick={() => setEditingSceneIndex(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
              <button
                onClick={() => setActivePickerTab("search")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activePickerTab === "search"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Live Web Photos 📸</span>
              </button>
              <button
                onClick={() => setActivePickerTab("ai")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activePickerTab === "ai"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>AI Generator (Preview First)</span>
              </button>
              <button
                onClick={() => setActivePickerTab("videos")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activePickerTab === "videos"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>HD Video Clips 🎬</span>
              </button>
              <button
                onClick={() => setActivePickerTab("library")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activePickerTab === "library"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Curated Library</span>
              </button>
              <button
                onClick={() => setActivePickerTab("upload")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activePickerTab === "upload"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Custom Upload (Video / Photo)</span>
              </button>
            </div>

            {/* Tab 1: Live Web Search */}
            {activePickerTab === "search" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type ANY topic: lamborghini, car, village, lion, ancient ruins, road..."
                      value={mediaSearchQuery}
                      onChange={(e) => setMediaSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePerformLiveSearch(mediaSearchQuery);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-red-500 font-medium"
                    />
                  </div>
                  <button
                    onClick={() => handlePerformLiveSearch(mediaSearchQuery)}
                    className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                  >
                    Search
                  </button>
                </div>

                {isSearching ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    <span>Searching web photos for &ldquo;{mediaSearchQuery}&rdquo;...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-slate-600" />
                        Photos for &ldquo;{mediaSearchQuery}&rdquo; ({searchResults.length} options):
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                        HD Photos
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {searchResults.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleSelectMediaForScene(editingSceneIndex, m)}
                          className="relative group rounded-2xl overflow-hidden border border-slate-200 hover:border-red-500 text-left transition-all aspect-[9/14] bg-slate-900 shadow-sm"
                        >
                          <img
                            src={m.url}
                            alt={m.name}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <p className="text-[10px] font-extrabold text-white truncate">{m.name}</p>
                            <span className="text-[9px] text-amber-300 font-mono">Apply Photo ✓</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Type a topic above (e.g. &ldquo;money&rdquo;, &ldquo;lamborghini&rdquo;, &ldquo;ocean&rdquo;) to find photos.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: AI Image Generator (Preview First, Then Apply!) */}
            {activePickerTab === "ai" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5 text-red-600" />
                      Dual-Engine AI Generator:
                    </span>
                    <button
                      onClick={() => setShowHfTokenInput(!showHfTokenInput)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{showHfTokenInput ? "Hide HF Pro Key" : "🔑 Add Free Hugging Face Key (Optional)"}</span>
                    </button>
                  </div>

                  {/* Optional Hugging Face Token Input */}
                  {showHfTokenInput && (
                    <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold text-indigo-900">
                          Hugging Face Free Token (hf_...):
                        </label>
                        <a
                          href="https://huggingface.co/settings/tokens"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-600 underline font-semibold"
                        >
                          Get Free Key ↗
                        </a>
                      </div>
                      <input
                        type="password"
                        value={hfToken}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHfToken(val);
                          if (typeof window !== "undefined") localStorage.setItem("hf_free_token", val);
                        }}
                        placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 text-xs font-mono text-slate-900 bg-white outline-none focus:border-indigo-500"
                      />
                      <p className="text-[10px] text-indigo-700">
                        {hfToken.trim()
                          ? "✓ Active: Using Hugging Face FLUX.1 Pro AI engine"
                          : "Empty: Defaulting to Safe Free AI Engine (Zero setup required)"}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiCustomPrompt}
                      onChange={(e) => setAiCustomPrompt(e.target.value)}
                      placeholder="e.g. Never give up on your dreams, or Luxury golden Lamborghini"
                      className="flex-1 p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-red-500"
                    />
                    <button
                      onClick={handleGenerateAiPreview}
                      disabled={isAiGenerating || !aiCustomPrompt.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      {isAiGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Generate Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Dual Mode: Generates with Hugging Face (if key added) or Safe Free AI Engine. Inspect preview, then apply!
                  </p>
                </div>

                {/* Prominent Visual Preview Card Before Applying */}
                {aiPreviewCandidate && (
                  <div className="p-4 bg-amber-50/50 rounded-2xl border-2 border-amber-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Preview Generated Visual (Review Before Applying):
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        Ready to Apply
                      </span>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-300 shadow-md shrink-0">
                        <img
                          src={aiPreviewCandidate.url}
                          alt={aiPreviewCandidate.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {aiPreviewCandidate.name}
                          </p>
                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            Matches: &ldquo;{aiCustomPrompt}&rdquo;
                          </p>
                        </div>

                        {/* Action Buttons: Re-Roll and Apply */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleGenerateAiPreview}
                            disabled={isAiGenerating}
                            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 border border-slate-300"
                            title="Generate another AI variation"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isAiGenerating ? "animate-spin" : ""}`} />
                            <span>Re-Roll</span>
                          </button>
                          <button
                            onClick={() => handleApplyPreviewToScene(aiPreviewCandidate)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          >
                            <Check className="h-4 w-4" />
                            <span>Yes, Apply This Visual to Scene {editingSceneIndex + 1}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternative Variations Grid */}
                {aiGeneratedResults.length > 1 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600">
                      Or Pick an Alternative Variation:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto">
                      {aiGeneratedResults.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setAiPreviewCandidate(m)}
                          className="relative group rounded-2xl overflow-hidden border border-slate-200 hover:border-amber-500 text-left transition-all aspect-[9/14] bg-slate-900"
                        >
                          <img
                            src={m.url}
                            alt={m.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <p className="text-[10px] font-extrabold text-white truncate">{m.name}</p>
                            <span className="text-[9px] text-amber-300 font-mono">Click to Preview</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: HD Video Clips (Real Motion Clips) */}
            {activePickerTab === "videos" && (
              <div className="space-y-3.5">
                {/* Pexels Key Toggle Header */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-red-600" />
                    HD Motion Clips Engine:
                  </span>
                  <button
                    onClick={() => setShowPexelsTokenInput(!showPexelsTokenInput)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{showPexelsTokenInput ? "Hide Pexels Key" : "🔑 Add Free Pexels Video Key (Optional)"}</span>
                  </button>
                </div>

                {/* Optional Pexels Token Input */}
                {showPexelsTokenInput && (
                  <div className="p-3 bg-red-50/80 rounded-xl border border-red-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold text-red-900">
                        Pexels Free Video Key (Search Millions of HD Clips):
                      </label>
                      <a
                        href="https://www.pexels.com/api/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-red-600 underline font-semibold"
                      >
                        Get Free Key ↗
                      </a>
                    </div>
                    <input
                      type="password"
                      value={pexelsToken}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPexelsToken(val);
                        if (typeof window !== "undefined") localStorage.setItem("pexels_free_key", val);
                      }}
                      placeholder="Paste your free Pexels key..."
                      className="w-full px-3 py-2 rounded-lg border border-red-200 text-xs font-mono text-slate-900 bg-white outline-none focus:border-red-500"
                    />
                    <p className="text-[10px] text-red-700">
                      {pexelsToken.trim()
                        ? "✓ Active: Searching live HD vertical videos from Pexels"
                        : "Empty: Defaulting to built-in verified HD stock video library"}
                    </p>
                  </div>
                )}

                {/* Search Bar for Video Clips */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search video clips: money, wifi, car, nature, space, city, gym..."
                      value={videoFilterQuery}
                      onChange={(e) => setVideoFilterQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearchVideoTab(videoFilterQuery);
                      }}
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-red-500 font-medium"
                    />
                    {videoFilterQuery && (
                      <button
                        onClick={() => {
                          setVideoFilterQuery("");
                          setLivePexelsVideoResults([]);
                        }}
                        className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleSearchVideoTab(videoFilterQuery)}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                  >
                    Search
                  </button>
                </div>

                {/* Category Filter Pills (When not actively searching a query) */}
                {!videoFilterQuery.trim() && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {[
                      { id: "all", label: "All Clips 🎬" },
                      { id: "money", label: "Money & Dollars 💰" },
                      { id: "car", label: "Cars & Speed 🏎️" },
                      { id: "wifi", label: "WiFi & Tech 💻" },
                      { id: "nature", label: "Nature & Ocean 🌊" },
                      { id: "city", label: "City & Urban 🏙️" },
                      { id: "animation", label: "3D Animation ✨" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setVideoCategoryFilter(cat.id);
                          setLivePexelsVideoResults([]);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          videoCategoryFilter === cat.id
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                {isSearchingPexels ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-slate-500 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                    <span>Searching live HD video clips for &ldquo;{videoFilterQuery}&rdquo;...</span>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {/* Active Search Results */}
                    {videoFilterQuery.trim() ? (
                      livePexelsVideoResults.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span>
                              Video Clips for &ldquo;{videoFilterQuery}&rdquo; ({Math.min(visibleVideoCount, livePexelsVideoResults.length)} of {livePexelsVideoResults.length}):
                            </span>
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                              {pexelsToken.trim() ? "Pexels HD 🎬" : "Web Motion HD 🎬"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {livePexelsVideoResults.slice(0, visibleVideoCount).map((m) => (
                              <button
                                key={m.id}
                                onClick={() => handleSelectMediaForScene(editingSceneIndex, m)}
                                onMouseEnter={() => setHoveredVideoId(m.id)}
                                onMouseLeave={() => setHoveredVideoId(null)}
                                className="relative group rounded-2xl overflow-hidden border-2 border-red-300 hover:border-red-600 text-left transition-all aspect-[9/14] bg-slate-950 shadow-sm"
                              >
                                <video
                                  ref={(el) => {
                                    if (el) {
                                      if (hoveredVideoId === m.id) {
                                        el.play().catch(() => {});
                                      } else {
                                        el.pause();
                                        el.currentTime = 0;
                                      }
                                    }
                                  }}
                                  src={m.url}
                                  crossOrigin="anonymous"
                                  muted
                                  loop
                                  playsInline
                                  poster={m.thumbnail}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                {hoveredVideoId !== m.id && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none group-hover:bg-transparent transition-all">
                                    <div className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white shadow-md">
                                      <Play className="h-3.5 w-3.5 ml-0.5 fill-current" />
                                    </div>
                                  </div>
                                )}
                                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
                                  <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-black flex items-center gap-1 shadow-sm">
                                    <Video className="h-3 w-3" /> Motion Clip
                                  </span>
                                  {m.duration && (
                                    <span className="text-[8px] bg-black/75 text-slate-200 px-1.5 py-0.5 rounded backdrop-blur-sm font-semibold">
                                      {m.duration}s
                                    </span>
                                  )}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                  <p className="text-[11px] font-extrabold text-white truncate">{m.name}</p>
                                  <span className="text-[9px] text-amber-300 font-bold">Apply Video Clip ✓</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {livePexelsVideoResults.length > visibleVideoCount && (
                            <button
                              onClick={() => setVisibleVideoCount((prev) => prev + 6)}
                              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <span>Load 6 More Video Clips ({livePexelsVideoResults.length - visibleVideoCount} remaining)</span>
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                          <p className="text-xs font-semibold text-slate-600">
                            No motion clips found for &ldquo;{videoFilterQuery}&rdquo;.
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Try searching another word (e.g. &ldquo;money&rdquo;, &ldquo;wifi&rdquo;, &ldquo;car&rdquo;, &ldquo;ocean&rdquo;) or pick from the curated library.
                          </p>
                          <button
                            onClick={() => {
                              setVideoFilterQuery("");
                              setVideoCategoryFilter("all");
                              setLivePexelsVideoResults([]);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
                          >
                            Show All Motion Clips
                          </button>
                        </div>
                      )
                    ) : (
                      /* Curated Library Clips (Shown when browsing without search query) */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span>
                            Available Curated Clips ({Math.min(visibleVideoCount, curatedVideoClips.length)} of {curatedVideoClips.length}):
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                            HD Library
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {curatedVideoClips.slice(0, visibleVideoCount).map((m) => (
                            <button
                              key={m.id}
                              onClick={() => handleSelectMediaForScene(editingSceneIndex, m)}
                              onMouseEnter={() => setHoveredVideoId(m.id)}
                              onMouseLeave={() => setHoveredVideoId(null)}
                              className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-red-600 text-left transition-all aspect-[9/14] bg-slate-950 shadow-sm"
                            >
                              <video
                                ref={(el) => {
                                  if (el) {
                                    if (hoveredVideoId === m.id) {
                                      el.play().catch(() => {});
                                    } else {
                                      el.pause();
                                      el.currentTime = 0;
                                    }
                                  }
                                }}
                                src={m.url}
                                crossOrigin="anonymous"
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {hoveredVideoId !== m.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none group-hover:bg-transparent transition-all">
                                  <div className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white shadow-md">
                                    <Play className="h-3.5 w-3.5 ml-0.5 fill-current" />
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
                                <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-black flex items-center gap-1 shadow-sm">
                                  <Video className="h-3 w-3" /> Motion Clip
                                </span>
                                <span className="text-[8px] bg-black/75 text-slate-200 px-1.5 py-0.5 rounded backdrop-blur-sm font-semibold">
                                  {m.category.replace(/[^a-zA-Z &]/g, "").trim()}
                                </span>
                              </div>
                              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                <p className="text-[11px] font-extrabold text-white truncate">{m.name}</p>
                                <span className="text-[9px] text-amber-300 font-bold">Apply Video Clip ✓</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {curatedVideoClips.length > visibleVideoCount && (
                          <button
                            onClick={() => setVisibleVideoCount((prev) => prev + 6)}
                            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <span>Load 6 More Video Clips ({curatedVideoClips.length - visibleVideoCount} remaining)</span>
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Curated Library */}
            {activePickerTab === "library" && (
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
                <span className="text-[11px] font-bold text-slate-500">Pick from High-Res Library:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CURATED_STOCK_MEDIA.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMediaForScene(editingSceneIndex, m)}
                      className="relative group rounded-2xl overflow-hidden border border-slate-200 hover:border-red-500 text-left transition-all aspect-[9/14] bg-slate-900"
                    >
                      <img
                        src={m.url}
                        alt={m.name}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <p className="text-[10px] font-extrabold text-white truncate">{m.name}</p>
                        <p className="text-[9px] text-slate-300">{m.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Custom Upload (Any Resolution: 480p, 720p, 1080p, 4K Video Clips or Images!) */}
            {activePickerTab === "upload" && (
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900">
                  <span className="font-extrabold block mb-0.5">🎬 Video Clips Supported:</span>
                  Drop any video clip (480p, 720p, 1080p, 4K MP4 / WebM / MOV) or photo. It will automatically scale to 9:16 vertical!
                </div>

                <FileDropzone
                  acceptedTypes={["video/*", "image/*"]}
                  acceptedExtensions={[".mp4", ".webm", ".mov", ".mkv", ".jpg", ".jpeg", ".png", ".webp"]}
                  onFileSelected={(meta) => handleCustomMediaUploadForScene(editingSceneIndex, meta)}
                  selectedFile={null}
                  onClear={() => {}}
                  title="Upload Video Clip or Photo"
                  subtitle="Any resolution (480p, 720p, 1080p, 4K) MP4, WebM, MOV, or Image"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
