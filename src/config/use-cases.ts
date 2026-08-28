export interface UseCaseData {
  slug: string;
  title: string;
  badge: string;
  h1: string;
  tagline: string;
  targetSizeText: string;
  recommendedPreset: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  whyItMatters: string;
  bestSettings: { label: string; value: string }[];
  steps: { step: number; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export const USE_CASES: UseCaseData[] = [
  {
    slug: "whatsapp-video",
    title: "Compress Video for WhatsApp",
    badge: "WhatsApp 16MB Fix",
    h1: "Free Video Compressor for WhatsApp (Under 16MB)",
    tagline: "Reduce large smartphone videos under WhatsApp's 16MB limit without blurry compression",
    targetSizeText: "Under 16 MB",
    recommendedPreset: "70% Smaller or Target Size: 15MB",
    seoTitle: "Compress Video for WhatsApp Online Free (Under 16MB Limit)",
    seoDescription: "Compress large MP4 and MOV videos under WhatsApp's 16MB file size limit directly in your browser. 100% private with no quality loss.",
    keywords: [
      "compress video for whatsapp",
      "reduce video size for whatsapp",
      "send large video on whatsapp",
      "whatsapp 16mb video limit bypass",
      "whatsapp video compressor online free",
    ],
    whyItMatters:
      "WhatsApp enforces a strict 16MB ceiling on direct video media. When you send an uncompressed 100MB file, WhatsApp aggressively compresses it on their servers, turning crisp footage into pixelated, blurry video. Pre-compressing with VideoReduce.com guarantees your file stays under 16MB while retaining sharp 720p clarity.",
    bestSettings: [
      { label: "Target File Size", value: "15 MB (Leaves 1MB buffer)" },
      { label: "Recommended Resolution", value: "720p HD (1280x720)" },
      { label: "Video Codec", value: "H.264 / AAC (100% WhatsApp Compatible)" },
    ],
    steps: [
      { step: 1, title: "Select Video", desc: "Upload your video from phone or PC." },
      { step: 2, title: "Pick 70% or 15MB Target", desc: "Select 70% Smaller or type 15 in target MB." },
      { step: 3, title: "Compress & Send", desc: "Download and send on WhatsApp with zero compression blur." },
    ],
    faqs: [
      {
        q: "Why does WhatsApp compress my videos so badly?",
        a: "WhatsApp applies high-speed server compression that slashes video bitrates to save bandwidth. Pre-compressing with VideoReduce.com keeps the file under 16MB while preserving visual sharpness.",
      },
    ],
  },
  {
    slug: "discord-video",
    title: "Compress Video for Discord",
    badge: "Discord 25MB Fix",
    h1: "Compress Video for Discord (Under 25MB & 8MB Limit)",
    tagline: "Reduce gaming clips and memes for Discord with instant web embed playback",
    targetSizeText: "Under 25 MB",
    recommendedPreset: "Custom Target: 24MB",
    seoTitle: "Compress Video for Discord Online Free (Under 25MB Max Size)",
    seoDescription: "Easily compress gaming clips and videos under Discord's 25MB file limit without server uploads. Instant web embed ready.",
    keywords: [
      "compress video for discord",
      "discord video compressor free",
      "bypass discord 25mb file limit",
      "reduce gaming clip size for discord",
      "compress mp4 for discord embed",
    ],
    whyItMatters:
      "Free Discord users are restricted to 25MB uploads (previously 8MB). VideoReduce.com allows gamers and creators to compress heavy 1080p clips down to exactly 24MB with faststart flags so clips play immediately in Discord chat channels.",
    bestSettings: [
      { label: "Target File Size", value: "24 MB" },
      { label: "Recommended Resolution", value: "1080p or 720p (60 FPS supported)" },
      { label: "Container", value: "MP4 with Faststart Web Streaming" },
    ],
    steps: [
      { step: 1, title: "Select Clip", desc: "Upload your high-bitrate gaming clip." },
      { step: 2, title: "Enter 24 MB", desc: "Type 24 in the Custom Target Size (MB) box." },
      { step: 3, title: "Post to Discord", desc: "Download and drop into your Discord channel." },
    ],
    faqs: [
      {
        q: "Will the video play directly inside Discord chat?",
        a: "Yes! All MP4s rendered on VideoReduce.com contain standard H.264 and +faststart web flags, ensuring instant in-line playback on Discord desktop and mobile.",
      },
    ],
  },
  {
    slug: "email-attachment",
    title: "Compress Video for Email",
    badge: "Gmail 25MB Cap",
    h1: "Compress Large Videos for Email Attachments (Gmail, Outlook, Yahoo)",
    tagline: "Shrink gigabyte videos down to email-friendly attachments in seconds",
    targetSizeText: "Under 20 MB",
    recommendedPreset: "70% Smaller or Target: 20MB",
    seoTitle: "Compress Video for Email Attachment Online (Gmail, Outlook, Yahoo)",
    seoDescription: "Compress large video files to send as email attachments in Gmail, Outlook, and Apple Mail. Zero server uploads, 100% private.",
    keywords: [
      "compress video for email",
      "reduce video size for gmail attachment",
      "how to email a large video file",
      "compress mp4 for outlook",
      "send video via email free",
    ],
    whyItMatters:
      "Gmail, Outlook, and Apple Mail reject file attachments larger than 20MB–25MB. VideoReduce.com shrinks corporate recordings, product demos, and family videos so they attach smoothly without forcing recipients to download from external cloud drive links.",
    bestSettings: [
      { label: "Target File Size", value: "20 MB (Safe for all email providers)" },
      { label: "Recommended Resolution", value: "720p HD" },
      { label: "Audio Bitrate", value: "96 kbps AAC" },
    ],
    steps: [
      { step: 1, title: "Upload Video", desc: "Select your large video file." },
      { step: 2, title: "Select 20MB Target", desc: "Set target to 20MB for guaranteed email delivery." },
      { step: 3, title: "Attach to Email", desc: "Attach the optimized video and hit Send." },
    ],
    faqs: [
      {
        q: "What is the maximum attachment limit for Gmail and Outlook?",
        a: "Gmail has a 25MB limit and Outlook has a 20MB limit. Setting your target size to 18MB–20MB ensures 100% successful delivery across all providers.",
      },
    ],
  },
  {
    slug: "4k-to-1080p",
    title: "4K to 1080p Downscaler",
    badge: "UHD Downscale",
    h1: "Downscale 4K UHD Video to 1080p Full HD Online",
    tagline: "Reduce massive 4K file sizes by up to 75% while keeping crystal-clear 1080p sharpness",
    targetSizeText: "75% Smaller",
    recommendedPreset: "1080p Resolution Scaling",
    seoTitle: "Convert 4K Video to 1080p Online Free - Reduce 4K File Size",
    seoDescription: "Downscale heavy 4K UHD smartphone and drone videos to 1080p Full HD in your browser. Fast, private, and 100% free.",
    keywords: [
      "convert 4k to 1080p online",
      "downscale 4k video free",
      "reduce 4k video size",
      "4k to 1080p converter no limit",
      "compress 4k drone footage",
    ],
    whyItMatters:
      "4K video files consume gigabytes of storage and struggle to stream smoothly on mobile networks. Downscaling to 1080p retains supreme visual fidelity while cutting file size by 4x, making footage instantly shareable.",
    bestSettings: [
      { label: "Target Resolution", value: "1920x1080 Full HD" },
      { label: "Scaling Filter", value: "Bicubic Lanczos Downscale" },
      { label: "CRF Quality", value: "CRF 22 (High Definition)" },
    ],
    steps: [
      { step: 1, title: "Upload 4K Video", desc: "Pick your 4K phone or drone footage." },
      { step: 2, title: "Select 1080p", desc: "Click 1080p in the resolution selector." },
      { step: 3, title: "Download 1080p", desc: "Save your lightweight Full HD video." },
    ],
    faqs: [
      {
        q: "Does 1080p look good on mobile screens?",
        a: "Yes! On smartphones and standard laptops, 1080p looks virtually indistinguishable from 4K while using only a fraction of the storage and bandwidth.",
      },
    ],
  },
];

export function getUseCaseBySlug(slug: string): UseCaseData | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
