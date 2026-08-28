import { VideoFormat } from "@/lib/ffmpeg/types";

export interface FormatPairData {
  slug: string;
  fromFormat: string;
  toFormat: string;
  targetFormatEnum: VideoFormat;
  title: string;
  badge: string;
  h1: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  whyConvert: string;
  technicalSpecs: { label: string; value: string }[];
  steps: { step: number; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export const FORMAT_PAIRS: FormatPairData[] = [
  {
    slug: "mov-to-mp4",
    fromFormat: "MOV",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    title: "MOV to MP4 Converter",
    badge: "iPhone & Apple Fix",
    h1: "Convert Apple MOV to Universal MP4 Online Free",
    tagline: "Transcode iPhone and QuickTime MOV videos to universal H.264 MP4 with 100% in-browser privacy",
    seoTitle: "Convert MOV to MP4 Online Free (No File Limit) | VideoReduce.com",
    seoDescription: "Convert Apple QuickTime MOV files to MP4 in your browser with WebAssembly. No upload limits, 100% private, instant web streaming ready.",
    keywords: [
      "convert mov to mp4 online",
      "iphone mov to mp4 converter free",
      "apple quicktime to mp4",
      "convert mov to mp4 no file limit",
      "play mov on windows pc",
    ],
    whyConvert:
      "Apple iPhones and iPads record videos in the QuickTime MOV format. While MOV works great within the Apple ecosystem, Windows PC players, Android phones, and non-Apple web browsers frequently fail to open MOV files. Converting to MP4 gives you 100% universal compatibility across every screen on earth.",
    technicalSpecs: [
      { label: "Input Container", value: "Apple QuickTime (.mov)" },
      { label: "Output Container", value: "MPEG-4 Part 14 (.mp4)" },
      { label: "Video Codec", value: "H.264 (AVC) with FastStart Web Flags" },
      { label: "Audio Codec", value: "AAC High Efficiency Stereo" },
    ],
    steps: [
      { step: 1, title: "Upload MOV File", desc: "Select your iPhone or Mac MOV recording." },
      { step: 2, title: "Select MP4 Target", desc: "MP4 format is automatically selected with high-quality CRF 22." },
      { step: 3, title: "Convert & Download", desc: "Download universal MP4 file instantly." },
    ],
    faqs: [
      {
        q: "Does converting MOV to MP4 reduce video quality?",
        a: "No. VideoReduce.com uses high-fidelity H.264 transcode with bicubic scaling, retaining crisp 1080p and 4K visual details.",
      },
    ],
  },
  {
    slug: "mkv-to-mp4",
    fromFormat: "MKV",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    title: "MKV to MP4 Converter",
    badge: "Matroska Repack",
    h1: "Convert MKV to MP4 Online Without Quality Loss",
    tagline: "Convert Matroska MKV videos into universal MP4 container for smart TVs, phones, and browsers",
    seoTitle: "Convert MKV to MP4 Online Free - Lossless & Private | VideoReduce.com",
    seoDescription: "Convert MKV to MP4 format online without quality loss. Runs locally in your browser with WebAssembly, 0 server uploads.",
    keywords: [
      "convert mkv to mp4 online free",
      "mkv to mp4 without losing quality",
      "fast mkv to mp4 converter no upload",
      "play mkv on iphone and smart tv",
    ],
    whyConvert:
      "MKV (Matroska) is a popular container for high-definition movies and screen captures (like OBS Studio). However, Apple devices, web browsers, and many smart TVs cannot play MKV files natively. Converting to standard MP4 solves playback issues everywhere.",
    technicalSpecs: [
      { label: "Input Container", value: "Matroska (.mkv)" },
      { label: "Output Container", value: "Universal MP4 (.mp4)" },
      { label: "Transcode Speed", value: "Fast (Wasm SIMD Engine)" },
    ],
    steps: [
      { step: 1, title: "Select MKV Video", desc: "Upload your MKV file." },
      { step: 2, title: "Configure Quality", desc: "Select MP4 with AAC audio track." },
      { step: 3, title: "Save MP4 Video", desc: "Download your newly formatted MP4." },
    ],
    faqs: [
      {
        q: "Can I convert large OBS MKV recordings?",
        a: "Yes! Because the conversion happens on your local device RAM, you can convert multi-gigabyte recordings without cloud upload limits.",
      },
    ],
  },
  {
    slug: "webm-to-mp4",
    fromFormat: "WebM",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    title: "WebM to MP4 Converter",
    badge: "Web Video Fix",
    h1: "Convert WebM to MP4 Online (Fast & Free)",
    tagline: "Convert Google WebM and VP8/VP9 videos into standard MP4 for editing and sharing",
    seoTitle: "Convert WebM to MP4 Online Free | VideoReduce.com",
    seoDescription: "Convert WebM videos to MP4 format with WebAssembly in your browser. 100% private, free, and compatible with iPhone and Premiere Pro.",
    keywords: [
      "convert webm to mp4",
      "webm to mp4 converter online free",
      "how to convert webm to mp4 on iphone",
      "open webm in premiere pro",
    ],
    whyConvert:
      "WebM is widely used for web streaming, but video editors (like Adobe Premiere Pro and DaVinci Resolve) and Apple iOS devices often refuse to import WebM files. Converting WebM to MP4 ensures smooth editing and sharing.",
    technicalSpecs: [
      { label: "Input Container", value: "WebM (VP8/VP9/Opus)" },
      { label: "Output Container", value: "MP4 (H.264/AAC)" },
      { label: "Hardware Support", value: "100% GPU Accelerated Playback" },
    ],
    steps: [
      { step: 1, title: "Upload WebM", desc: "Select your downloaded WebM file." },
      { step: 2, title: "Convert to MP4", desc: "Click convert to transcode into H.264 MP4." },
      { step: 3, title: "Download", desc: "Save and import into any editor." },
    ],
    faqs: [
      {
        q: "Can I convert Chrome screen recordings in WebM to MP4?",
        a: "Yes, Chrome browser recordings saved as WebM can be converted to MP4 in seconds.",
      },
    ],
  },
  {
    slug: "avi-to-mp4",
    fromFormat: "AVI",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    title: "AVI to MP4 Converter",
    badge: "Legacy Video Fix",
    h1: "Convert AVI to MP4 Online (Modern Web Standard)",
    tagline: "Convert old AVI videos into modern, lightweight MP4 videos with 90% size savings",
    seoTitle: "Convert AVI to MP4 Online Free | VideoReduce.com",
    seoDescription: "Convert legacy AVI video files to modern H.264 MP4 format online. Reduce file size and enable playback on modern phones.",
    keywords: [
      "convert avi to mp4 online free",
      "avi to mp4 converter no upload",
      "modernize old avi video",
      "play avi on iphone",
    ],
    whyConvert:
      "AVI is a 1990s legacy format that results in massive file sizes and lacks support on mobile phones. Converting AVI to MP4 shrinks file size dramatically while restoring full playback support.",
    technicalSpecs: [
      { label: "Input Container", value: "Audio Video Interleave (.avi)" },
      { label: "Output Container", value: "Modern MP4 (.mp4)" },
      { label: "File Size Reduction", value: "Up to 85% Smaller" },
    ],
    steps: [
      { step: 1, title: "Select AVI Video", desc: "Upload your legacy AVI file." },
      { step: 2, title: "Modernize to MP4", desc: "Transcode to H.264 MP4 standard." },
      { step: 3, title: "Download", desc: "Save lightweight MP4 file." },
    ],
    faqs: [
      {
        q: "Why are AVI files so big?",
        a: "AVI uses outdated compression. Converting to modern H.264 MP4 reduces file size by up to 85% with higher visual clarity.",
      },
    ],
  },
];

export function getFormatPairBySlug(slug: string): FormatPairData | undefined {
  return FORMAT_PAIRS.find((f) => f.slug === slug);
}
