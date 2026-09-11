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
    h1: "Free Video Compressor for WhatsApp (Under 16MB Limit)",
    tagline: "Reduce large smartphone videos under WhatsApp's 16MB limit without blurry compression",
    targetSizeText: "Under 16 MB",
    recommendedPreset: "Target Size: 15MB (720p HD)",
    seoTitle: "Compress Video for WhatsApp Free",
    seoDescription: "Compress large MP4 and MOV videos under WhatsApp's 16MB file size limit directly in your browser. 100% private with no quality loss.",
    keywords: [
      "compress video for whatsapp",
      "reduce video size for whatsapp",
      "send large video on whatsapp",
      "whatsapp 16mb limit bypass",
      "whatsapp video compressor free",
    ],
    whyItMatters:
      "WhatsApp enforces a strict 16MB ceiling on direct video media. When you send an uncompressed 100MB video, WhatsApp's aggressive server re-compression slashes bitrates, turning crisp footage into pixelated, blurry mud. Pre-compressing with VideoReduce in local browser memory guarantees your file remains under 16MB while retaining sharp 720p resolution and clear audio.",
    bestSettings: [
      { label: "Target File Size", value: "15 MB (1MB safety margin)" },
      { label: "Recommended Resolution", value: "720p HD (1280x720)" },
      { label: "Video Codec", value: "H.264 High Profile / AAC Audio" },
      { label: "Audio Bitrate", value: "128 kbps Stereo" },
    ],
    steps: [
      { step: 1, title: "Select Video", desc: "Select your high-resolution phone or PC recording." },
      { step: 2, title: "Set 15MB Target", desc: "Choose Target Size mode and enter 15 MB." },
      { step: 3, title: "Compress & Send", desc: "Download the file and send it directly on WhatsApp with zero blur." },
    ],
    faqs: [
      {
        q: "Why does WhatsApp ruin video quality when sending directly?",
        a: "WhatsApp compresses incoming media to preserve cloud server bandwidth. Pre-compressing with VideoReduce keeps your file under the 16MB threshold so WhatsApp transmits your optimized file without destroying clarity.",
      },
      {
        q: "Can I send videos as a 'Document' on WhatsApp instead?",
        a: "Sending as a document allows up to 2GB, but recipients cannot preview or play the video inline in chat feeds. Pre-compressing under 16MB allows native, instant in-chat video playback.",
      },
      {
        q: "What is the best resolution for WhatsApp video status and stories?",
        a: "For WhatsApp Status stories, 1080x1920 (9:16 vertical) or 720x1280 under 15MB delivers the highest visual fidelity.",
      },
      {
        q: "Are my personal family videos uploaded to a cloud server?",
        a: "Never. VideoReduce executes 100% in your browser memory via WebAssembly with zero server uploads.",
      },
    ],
  },
  {
    slug: "discord-video",
    title: "Compress Video for Discord",
    badge: "Discord 25MB Fix",
    h1: "Compress Video for Discord (Under 25MB & 8MB Limit)",
    tagline: "Reduce gaming clips and memes for Discord with instant inline web embed playback",
    targetSizeText: "Under 25 MB",
    recommendedPreset: "Custom Target: 24MB (FastStart)",
    seoTitle: "Compress Video for Discord Free",
    seoDescription: "Easily compress gaming clips and videos under Discord's 25MB file limit without server uploads. Instant web embed ready.",
    keywords: [
      "compress video for discord",
      "discord video compressor free",
      "bypass discord 25mb limit",
      "reduce gaming clip for discord",
      "compress mp4 for discord",
    ],
    whyItMatters:
      "Standard Discord accounts are capped at a 25MB upload limit per attachment (previously 8MB). VideoReduce enables gamers, streamers, and community members to shrink heavy 1080p 60fps clips down to exactly 24MB with FastStart moov metadata, ensuring clips embed and play instantly in Discord desktop, mobile, and web channels without buffering.",
    bestSettings: [
      { label: "Target File Size", value: "24 MB (Leaves 1MB headroom)" },
      { label: "Frame Rate", value: "Preserves 60 FPS Smooth Gaming" },
      { label: "Container", value: "MP4 with FastStart Streaming Flags" },
      { label: "Audio Track", value: "AAC 160 kbps Crisp Gaming Audio" },
    ],
    steps: [
      { step: 1, title: "Select Clip", desc: "Upload your high-bitrate OBS, Medal, or ShadowPlay clip." },
      { step: 2, title: "Enter 24 MB", desc: "Type 24 in the Custom Target Size box." },
      { step: 3, title: "Post to Discord", desc: "Drag and drop the lightweight MP4 into any Discord channel." },
    ],
    faqs: [
      {
        q: "Will the compressed video embed and play directly in Discord chat?",
        a: "Yes! All MP4s generated on VideoReduce include +faststart flags, allowing instant inline playback without downloading.",
      },
      {
        q: "Does this compressor support 60 FPS gaming clips?",
        a: "Yes. Our FFmpeg WebAssembly engine preserves 60 FPS and 120 FPS frame rates while optimizing video bitrate.",
      },
      {
        q: "Can I compress clips for the old 8MB Discord limit?",
        a: "Yes, you can simply type 7.5 MB into the target size box to ensure compatibility with legacy or server-specific restrictions.",
      },
      {
        q: "Is there any watermark placed on gaming highlights?",
        a: "Never. All videos exported on VideoReduce are 100% clean with zero watermarks or logos.",
      },
    ],
  },
  {
    slug: "email-attachment",
    title: "Compress Video for Email",
    badge: "Email 25MB Cap",
    h1: "Compress Large Videos for Email Attachments (Gmail & Outlook)",
    tagline: "Shrink gigabyte videos down to email-friendly attachments in seconds without third-party links",
    targetSizeText: "Under 20 MB",
    recommendedPreset: "Target Size: 19MB (720p)",
    seoTitle: "Compress Video for Email Free",
    seoDescription: "Compress large video files to send as email attachments in Gmail, Outlook, and Apple Mail. Zero server uploads, 100% private.",
    keywords: [
      "compress video for email",
      "reduce video size for gmail",
      "how to email large video",
      "compress mp4 for outlook",
      "email video compressor free",
    ],
    whyItMatters:
      "Gmail, Microsoft Outlook, Yahoo Mail, and Apple Mail bounce email attachments exceeding 20MB–25MB. Uploading to Google Drive or Dropbox creates sharing permission hurdles for clients. VideoReduce compresses corporate presentations, webinars, and camera clips down to under 20MB so you can attach them directly to any email message.",
    bestSettings: [
      { label: "Target File Size", value: "19 MB (Guaranteed delivery)" },
      { label: "Recommended Resolution", value: "720p HD or 480p" },
      { label: "Audio Bitrate", value: "96 kbps AAC Voice Optimized" },
      { label: "Compatibility", value: "Universal H.264 Baseline/Main" },
    ],
    steps: [
      { step: 1, title: "Select Video", desc: "Select your large business recording or phone video." },
      { step: 2, title: "Set 19MB Target", desc: "Select Target Size and enter 19MB for universal email deliverability." },
      { step: 3, title: "Attach & Send", desc: "Attach the optimized MP4 to your email draft and send." },
    ],
    faqs: [
      {
        q: "What is the attachment size limit for Gmail and Outlook?",
        a: "Gmail has a 25MB limit and Microsoft Outlook has a 20MB limit. Setting your target size to 18MB–19MB guarantees successful delivery across all email providers.",
      },
      {
        q: "Can clients on corporate networks view the attached video?",
        a: "Yes. MP4 with H.264 and AAC plays natively on all desktop and mobile mail clients without external software.",
      },
      {
        q: "Are my confidential company videos secure?",
        a: "100% secure. Media files are processed inside your browser memory with WebAssembly and are never transmitted across the internet.",
      },
      {
        q: "How much file size reduction can I expect?",
        a: "A 200MB 1080p smartphone video can typically be compressed down to 18MB with excellent visual clarity for speech and presentations.",
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
    recommendedPreset: "Resolution: 1080p (CRF 22)",
    seoTitle: "Convert 4K Video to 1080p Free",
    seoDescription: "Downscale heavy 4K UHD smartphone and drone videos to 1080p Full HD in your browser. Fast, private, and 100% free.",
    keywords: [
      "convert 4k to 1080p",
      "downscale 4k video free",
      "reduce 4k video size",
      "4k to 1080p converter no limit",
      "compress 4k drone video",
    ],
    whyItMatters:
      "4K UHD (3840x2160) smartphone and drone recordings consume over 300MB per minute of footage, causing mobile playback lag, high cloud storage costs, and upload failures. Downscaling 4K to 1080p (1920x1080) with bicubic Lanczos filtering slashes file sizes by up to 75% while maintaining visual sharpness virtually indistinguishable on standard screens.",
    bestSettings: [
      { label: "Target Resolution", value: "1920x1080 Full HD" },
      { label: "Resampling Filter", value: "Lanczos / Bicubic High-Fidelity Downscale" },
      { label: "CRF Rate Factor", value: "CRF 22 (Near-Lossless Quality)" },
      { label: "Color Matrix", value: "BT.709 Standard HD Gamut" },
    ],
    steps: [
      { step: 1, title: "Upload 4K Video", desc: "Select your 4K iPhone, GoPro, or drone recording." },
      { step: 2, title: "Select 1080p", desc: "Pick 1080p in the resolution dropdown." },
      { step: 3, title: "Download Full HD", desc: "Save your lightweight 1080p video ready for streaming or editing." },
    ],
    faqs: [
      {
        q: "Does 1080p look good on mobile and laptop screens?",
        a: "Yes! On smartphones, tablets, and 1080p monitors, properly downscaled 1080p footage looks exceptionally sharp because it benefits from super-sampled 4K source pixels.",
      },
      {
        q: "Can I downscale 4K 60fps drone footage?",
        a: "Yes. VideoReduce retains the original 60fps or 120fps motion fluidity during the 1080p downscale.",
      },
      {
        q: "Is there a maximum file size for 4K video inputs?",
        a: "No arbitrary cloud size limits exist because processing happens locally in your device's RAM using WebAssembly.",
      },
      {
        q: "How fast is 4K downscaling in the browser?",
        a: "With SIMD WebAssembly acceleration, modern CPUs downscale 4K clips at high rendering speeds.",
      },
    ],
  },
  {
    slug: "instagram-reels",
    title: "Compress Video for Instagram Reels",
    badge: "Instagram 2026 Ready",
    h1: "Compress Video for Instagram Reels (1080x1920 HD)",
    tagline: "Optimize vertical 9:16 videos for Instagram Reels and Stories to stop Instagram's blurry upload compression",
    targetSizeText: "Under 50 MB",
    recommendedPreset: "1080x1920 (9:16) • CRF 21",
    seoTitle: "Compress Video for Instagram Reels",
    seoDescription: "Optimize and compress 9:16 vertical videos for Instagram Reels and Stories. Maintain sharp 1080p quality with zero upload blur.",
    keywords: [
      "compress video for instagram reels",
      "instagram reels video compressor",
      "fix blurry instagram reels upload",
      "best settings for instagram reels",
      "reduce video size for instagram",
    ],
    whyItMatters:
      "Instagram's 2026 upload algorithm aggressively recompresses video files that exceed target bitrates or use non-standard frame sizes, resulting in blurry, pixelated Reels. By pre-encoding your vertical video to exactly 1080x1920 (9:16 aspect ratio) at 30/60 fps with H.264 High Profile and FastStart flags, Instagram processes your Reels without destructive downsampling.",
    bestSettings: [
      { label: "Optimal Resolution", value: "1080 x 1920 pixels (9:16 Aspect Ratio)" },
      { label: "Target Bitrate", value: "3.5 Mbps – 5.5 Mbps (VBR)" },
      { label: "Frame Rate", value: "30 fps or 60 fps Constant (CFR)" },
      { label: "Audio Spec", value: "Stereo AAC, 160 kbps, 48 kHz" },
      { label: "Maximum File Size", value: "Under 50 MB for Instant Upload" },
    ],
    steps: [
      { step: 1, title: "Select Vertical Clip", desc: "Select your 9:16 phone recording or exported edit." },
      { step: 2, title: "Choose Reels Preset", desc: "Select 1080p vertical resolution with CRF 21 encoding." },
      { step: 3, title: "Download & Post", desc: "Publish directly to Instagram Reels with crystal-clear sharpness." },
    ],
    faqs: [
      {
        q: "Why do my Instagram Reels look blurry after uploading?",
        a: "If your file is too large or has an excessive bitrate, Instagram's server compressor compresses it violently. Pre-compressing with optimal bitrates prevents Instagram from ruining quality.",
      },
      {
        q: "Should I enable 'Upload at highest quality' in Instagram settings?",
        a: "Yes! Go to Instagram Settings > Account > Data Usage > Turn on 'Upload at highest quality'. Combining this with VideoReduce optimization gives maximum clarity.",
      },
      {
        q: "What is the maximum duration for Instagram Reels?",
        a: "Instagram Reels support up to 90 seconds in duration. VideoReduce compresses any duration seamlessly in your browser.",
      },
      {
        q: "Can I convert horizontal 16:9 videos for Reels?",
        a: "You can use our Aspect Ratio Resizer tool to crop or pad 16:9 videos into 9:16 vertical frames before compression.",
      },
    ],
  },
  {
    slug: "tiktok-video",
    title: "Compress Video for TikTok",
    badge: "TikTok 2026 Specs",
    h1: "Compress Video for TikTok (Under 72MB Limit)",
    tagline: "Optimize vertical TikTok clips for maximum algorithm clarity and fast viral playback",
    targetSizeText: "Under 72 MB",
    recommendedPreset: "1080x1920 • 60 FPS • CRF 22",
    seoTitle: "Compress Video for TikTok Free",
    seoDescription: "Compress TikTok videos to stay under 72MB (Android) and 287MB (iOS) limits. Retain 1080p 60fps quality without lag or blur.",
    keywords: [
      "compress video for tiktok",
      "tiktok video compressor free",
      "reduce video size for tiktok",
      "tiktok upload limit bypass",
      "best video settings for tiktok",
    ],
    whyItMatters:
      "TikTok limits direct video uploads to 72MB on Android and 287MB on iOS, with a web studio cap of 1GB. Heavy 4K clips cause slow upload speeds and severe compression artifacting on the FYP (For You Page). Optimizing with VideoReduce ensures smooth 60fps motion, instant feed loading, and pristine 1080p vertical resolution.",
    bestSettings: [
      { label: "Optimal Dimensions", value: "1080 x 1920 (Vertical 9:16)" },
      { label: "Target Size", value: "Under 72 MB (Fastest FYP distribution)" },
      { label: "Target Video Codec", value: "H.264 (MPEG-4 AVC) + FastStart" },
      { label: "Audio Track", value: "AAC 48kHz Stereo, 192 kbps" },
    ],
    steps: [
      { step: 1, title: "Select TikTok Clip", desc: "Upload your vertical gameplay, dance, or tutorial clip." },
      { step: 2, title: "Optimize for TikTok", desc: "Select 1080p vertical scaling and CRF 22 profile." },
      { step: 3, title: "Upload to TikTok", desc: "Publish to TikTok with zero compression lag and high sharpness." },
    ],
    faqs: [
      {
        q: "What is TikTok's upload file size limit in 2026?",
        a: "TikTok enforces a 72MB ceiling for Android app uploads, 287MB for iOS, and 1GB for desktop web browser uploads.",
      },
      {
        q: "Does TikTok support 60 FPS video uploads?",
        a: "Yes! TikTok supports smooth 60 FPS playback. VideoReduce preserves your 60 FPS framerate while reducing data size.",
      },
      {
        q: "Will my sound remain synced on TikTok?",
        a: "Yes, VideoReduce enforces strict audio timestamp normalization to ensure your audio and lipsync remain 100% accurate.",
      },
      {
        q: "Is there any watermark on exported clips?",
        a: "Zero watermarks. Your content belongs entirely to you.",
      },
    ],
  },
  {
    slug: "youtube-shorts",
    title: "Compress Video for YouTube Shorts",
    badge: "Shorts 60s Max Bitrate",
    h1: "Compress Video for YouTube Shorts (1080p 60fps)",
    tagline: "Fine-tune vertical videos for YouTube Shorts with optimal bitrate and fast VP9/AV1 YouTube transcoding",
    targetSizeText: "Under 100 MB",
    recommendedPreset: "1080x1920 (9:16) • CRF 20",
    seoTitle: "Compress Video for YouTube Shorts",
    seoDescription: "Compress and optimize vertical videos for YouTube Shorts. Achieve crystal-clear 1080p 60fps uploads that YouTube's engine loves.",
    keywords: [
      "compress video for youtube shorts",
      "youtube shorts video compressor",
      "best settings for youtube shorts",
      "youtube shorts 60fps upload",
      "reduce video size for shorts",
    ],
    whyItMatters:
      "YouTube Shorts videos must be vertical (9:16 or square 1:1) and under 60 seconds (or up to 3 minutes for expanded shorts). When creators upload raw camera files, YouTube takes minutes processing the stream and can downscale quality to 720p. Pre-optimizing with VideoReduce guarantees high-priority 1080p 60fps encoding with minimal processing wait time.",
    bestSettings: [
      { label: "Optimal Resolution", value: "1080 x 1920 (9:16 Vertical)" },
      { label: "Target Bitrate", value: "8 Mbps to 12 Mbps (High Quality)" },
      { label: "Frame Rate", value: "60 FPS Constant Framerate" },
      { label: "Color Primaries", value: "BT.709 Color Profile" },
    ],
    steps: [
      { step: 1, title: "Select Shorts Clip", desc: "Select your vertical video under 60 seconds." },
      { step: 2, title: "Set Shorts Preset", desc: "Select 1080p resolution and high-clarity CRF 20 preset." },
      { step: 3, title: "Upload to YouTube", desc: "Post to YouTube Shorts with immediate 1080p HD availability." },
    ],
    faqs: [
      {
        q: "How do I ensure YouTube processes my Short in 1080p60?",
        a: "Export with standard 1080x1920 H.264 MP4 with AAC audio. VideoReduce embeds correct aspect ratios and stream tags that YouTube recognizes immediately.",
      },
      {
        q: "Why is YouTube taking so long to process my Short?",
        a: "Bloated 4K uploads force YouTube to re-encode heavy streams. Pre-compressing to 1080p makes YouTube processing finish in seconds.",
      },
      {
        q: "What is the maximum aspect ratio for YouTube Shorts?",
        a: "Vertical 9:16 (1080x1920) is recommended, but 1:1 square is also recognized as a Short if under 60 seconds.",
      },
      {
        q: "Can I compress multi-gigabyte video projects for Shorts?",
        a: "Yes! VideoReduce handles files of any size directly in your browser's local memory.",
      },
    ],
  },
  {
    slug: "slack-video",
    title: "Compress Video for Slack",
    badge: "Slack Workspace Fix",
    h1: "Compress Video for Slack (Inline Player Optimization)",
    tagline: "Shrink screen recordings and bug demos for Slack workspace channels with instant inline player playback",
    targetSizeText: "Under 30 MB",
    recommendedPreset: "720p/1080p • FastStart MP4",
    seoTitle: "Compress Video for Slack Free",
    seoDescription: "Compress screen recordings and videos for Slack workspaces. Enable instant inline video playback without forcing downloads.",
    keywords: [
      "compress video for slack",
      "slack video compressor free",
      "slack video upload limit",
      "make video play in slack",
      "reduce screen recording size for slack",
    ],
    whyItMatters:
      "While Slack allows large file attachments, videos that exceed optimal bitrate or lack FastStart metadata will fail to play in Slack's inline video player, forcing teammates to download the entire file. VideoReduce compresses bug captures, Loom recordings, and product walkthroughs into streamable MP4s that play instantly inside Slack channels.",
    bestSettings: [
      { label: "Target File Size", value: "Under 30 MB (Quick preview)" },
      { label: "Streaming Metadata", value: "Moov Atom at Front (+faststart)" },
      { label: "Resolution", value: "1080p for UI text clarity / 720p for general clips" },
      { label: "Audio Codec", value: "AAC Mono / Stereo" },
    ],
    steps: [
      { step: 1, title: "Select Screen Capture", desc: "Upload your bug demo or team walkthrough video." },
      { step: 2, title: "Optimize for Slack", desc: "Select MP4 format with FastStart streaming enabled." },
      { step: 3, title: "Drop into Slack", desc: "Paste directly into your Slack channel for immediate inline streaming." },
    ],
    faqs: [
      {
        q: "Why does Slack show a download button instead of a video player?",
        a: "Slack requires standard H.264 video with the metadata index (moov atom) placed at the beginning of the file. VideoReduce embeds this automatically.",
      },
      {
        q: "Will text and code in screen recordings stay sharp?",
        a: "Yes! Our high-fidelity compressor preserves UI sharp edges and code fonts without muddy compression artifacts.",
      },
      {
        q: "Is our internal company data safe?",
        a: "100% private. VideoReduce processes all media in your local browser memory via WebAssembly. Zero bytes are uploaded to external servers.",
      },
      {
        q: "Can I convert WebM screen recordings to Slack-ready MP4?",
        a: "Yes, you can drop WebM browser recordings into VideoReduce and convert them to Slack-compatible MP4s in seconds.",
      },
    ],
  },
  {
    slug: "twitter-x-video",
    title: "Compress Video for Twitter / X",
    badge: "X Feed Optimization",
    h1: "Compress Video for Twitter / X (Under 512MB & Instant Autoplay)",
    tagline: "Compress and format videos for Twitter / X feeds to maximize engagement with instant muted autoplay",
    targetSizeText: "Under 512 MB",
    recommendedPreset: "1080p • 30/60 FPS • CRF 22",
    seoTitle: "Compress Video for Twitter X Free",
    seoDescription: "Compress videos for Twitter / X feeds. Ensure instant autoplay, stay under the 512MB size limit, and maintain 1080p clarity.",
    keywords: [
      "compress video for twitter",
      "compress video for x",
      "twitter video compressor free",
      "twitter video upload limit",
      "x video format settings",
    ],
    whyItMatters:
      "Twitter / X allows video uploads up to 512MB (or larger for Premium subscribers), but the feed algorithm severely downgrades videos with irregular keyframe intervals or high bitrates. Pre-compressing with VideoReduce ensures your video starts playing instantly as users scroll past in their timeline, driving maximum impressions and click-through rates.",
    bestSettings: [
      { label: "Max File Size", value: "Under 512 MB (Under 100MB for fast mobile loading)" },
      { label: "Optimal Aspect Ratio", value: "16:9 Landscape or 1:1 Square" },
      { label: "Keyframe Interval", value: "GOP = 2 Seconds (Instant feed autoplay)" },
      { label: "Target Codec", value: "H.264 High Profile / AAC-LC" },
    ],
    steps: [
      { step: 1, title: "Select Video", desc: "Select your promo clip, news video, or meme." },
      { step: 2, title: "Set Twitter / X Preset", desc: "Choose 1080p or 720p with optimized FastStart flags." },
      { step: 3, title: "Post to X", desc: "Tweet your optimized video with flawless instant autoplay." },
    ],
    faqs: [
      {
        q: "What is Twitter / X's maximum video duration and size limit?",
        a: "Standard accounts can post up to 2 minutes and 20 seconds (140 seconds) under 512MB. Premium accounts have higher limits.",
      },
      {
        q: "How do I make my video autoplay smoothly on Twitter / X mobile apps?",
        a: "VideoReduce inserts +faststart header tags and regular 2-second keyframes (GOPs), allowing Twitter's player to start playback immediately.",
      },
      {
        q: "What aspect ratio works best on Twitter / X?",
        a: "1:1 square (1080x1080) and 16:9 landscape (1920x1080) occupy optimal screen space in mobile feeds.",
      },
      {
        q: "Can I compress 4K clips down for Twitter / X?",
        a: "Yes, our downscaling engine converts heavy 4K clips into crisp 1080p videos ready for Twitter / X in seconds.",
      },
    ],
  },
  {
    slug: "powerpoint-video",
    title: "Compress Video for PowerPoint",
    badge: "PPT Presentation Fix",
    h1: "Compress Video for PowerPoint (Prevent Crashes & Lag)",
    tagline: "Reduce video size inside Microsoft PowerPoint presentations to stop slide freezing and prevent file bloat",
    targetSizeText: "Under 50 MB",
    recommendedPreset: "720p/1080p Universal H.264",
    seoTitle: "Compress Video for PowerPoint Free",
    seoDescription: "Compress videos for PowerPoint (PPT/PPTX) presentations. Shrink slide deck file sizes and ensure smooth lag-free playback.",
    keywords: [
      "compress video for powerpoint",
      "reduce video size for ppt",
      "powerpoint video compressor free",
      "fix powerpoint video freezing",
      "embed video in powerpoint without lag",
    ],
    whyItMatters:
      "Embedding uncompressed 4K or heavy MOV videos into Microsoft PowerPoint inflates .pptx presentation decks to hundreds of megabytes. This causes email rejections, slow cloud syncing, and embarrassing slide transitions or video freezes during live presentations. VideoReduce compresses video assets into lightweight universal H.264 MP4s that embed smoothly without crashing PowerPoint.",
    bestSettings: [
      { label: "Target File Size", value: "10 MB – 30 MB per video clip" },
      { label: "Target Codec", value: "H.264 Baseline/Main (Universal Windows & Mac PPT)" },
      { label: "Audio Codec", value: "AAC Stereo 128 kbps" },
      { label: "Recommended Resolution", value: "1080p Full HD or 720p HD" },
    ],
    steps: [
      { step: 1, title: "Select Presentation Video", desc: "Select your product demo or corporate video clip." },
      { step: 2, title: "Optimize for PPT", desc: "Select 70% compression or 720p/1080p universal profile." },
      { step: 3, title: "Insert into Slide", desc: "Embed into PowerPoint (Insert > Video) for smooth, crash-proof playback." },
    ],
    faqs: [
      {
        q: "Why does PowerPoint freeze or lag when playing embedded videos?",
        a: "PowerPoint struggles with high-bitrate HEVC/ProRes files and multi-gigabyte video streams. Transcoding to lightweight H.264 MP4 completely eliminates playback stutter.",
      },
      {
        q: "Will the video play on both Windows PC and Mac PowerPoint versions?",
        a: "Yes! Universal H.264 MP4 with AAC audio is fully supported across PowerPoint for Windows, Mac, iPad, and Office 365 Online.",
      },
      {
        q: "How much will this reduce my .pptx presentation file size?",
        a: "Compressing video assets with VideoReduce typically shrinks the total PPTX presentation size by 70% to 85%.",
      },
      {
        q: "Is confidential company pitch deck footage kept private?",
        a: "Yes. Processing takes place 100% inside your browser's local memory via WebAssembly. Zero confidential data leaves your computer.",
      },
    ],
  },
  {
    slug: "zoom-recording",
    title: "Compress Zoom Recording",
    badge: "Meeting Archive",
    h1: "Compress Zoom Cloud & Local Meeting Recordings",
    tagline: "Shrink multi-hour Zoom, Teams, and Google Meet video recordings by up to 90% for easy sharing and archiving",
    targetSizeText: "Up to 90% Smaller",
    recommendedPreset: "Speech Optimized • 720p",
    seoTitle: "Compress Zoom Recording Online Free",
    seoDescription: "Compress Zoom and Microsoft Teams meeting recordings online for free. Speech-optimized compression cuts gigabyte recordings down to megabytes.",
    keywords: [
      "compress zoom recording",
      "reduce zoom video size",
      "zoom recording compressor free",
      "compress teams meeting recording",
      "how to share large zoom video",
    ],
    whyItMatters:
      "A 2-hour Zoom or Microsoft Teams meeting recording can easily exceed 2GB to 5GB in file size, rapidly consuming cloud storage quotas and making sharing via Slack or email impossible. Because meeting recordings consist primarily of static slides and speech, VideoReduce applies high-efficiency speech quantization and dynamic frame rate compression to reduce file sizes by up to 90% without compromising voice clarity.",
    bestSettings: [
      { label: "Target Reduction", value: "80% – 90% File Size Savings" },
      { label: "Optimal Resolution", value: "720p HD (Sharp slide text)" },
      { label: "Audio Optimization", value: "AAC Mono/Stereo Speech Normalization" },
      { label: "Encoding Preset", value: "CRF 28 High-Efficiency Transcode" },
    ],
    steps: [
      { step: 1, title: "Select Zoom Video", desc: "Select your local Zoom MP4 or downloaded cloud recording." },
      { step: 2, title: "Choose Speech Mode", desc: "Select 720p with balanced speech compression." },
      { step: 3, title: "Save & Share", desc: "Download the compact meeting archive and share effortlessly." },
    ],
    faqs: [
      {
        q: "Will shared slide deck text and spreadsheets remain legible?",
        a: "Yes! VideoReduce preserves high-frequency edge detail so presentation slides, spreadsheets, and whiteboard text stay perfectly readable.",
      },
      {
        q: "Can I compress 3-hour long webinar recordings?",
        a: "Yes. Because VideoReduce runs locally in your browser memory via WebAssembly, long recordings process without cloud upload timeouts.",
      },
      {
        q: "Does speech audio remain clear and intelligible?",
        a: "Our audio engine optimizes human voice frequencies between 300Hz and 3400Hz to preserve crystal-clear speech intelligibility.",
      },
      {
        q: "Are sensitive client meeting recordings protected?",
        a: "100% private. Files never leave your device, ensuring complete HIPAA, GDPR, and enterprise NDA compliance.",
      },
    ],
  },
  {
    slug: "compress-video-under-10mb",
    title: "Compress Video Under 10MB",
    badge: "10MB Strict Limit",
    h1: "Compress Video Under 10MB Online Free (Exact Size Target)",
    tagline: "Shrink any video down to exactly under 10MB for strict job portals, government forms, and email systems",
    targetSizeText: "Under 10 MB",
    recommendedPreset: "Custom Target: 9.5 MB",
    seoTitle: "Compress Video Under 10MB Free",
    seoDescription: "Compress any video under 10MB online without quality loss. Guaranteed under 10MB file size for job portals, LMS, and legacy uploaders.",
    keywords: [
      "compress video under 10mb",
      "reduce video size to 10mb",
      "10mb video compressor free",
      "compress mp4 under 10mb",
      "make video smaller than 10mb",
    ],
    whyItMatters:
      "Many government submission portals, job application forms, customer support ticket systems, and legacy email gateways enforce a strict, unyielding 10MB maximum file size limit. VideoReduce calculates the exact two-pass video and audio bitrate allocation required to guarantee your output file finishes at 9.5MB while maximizing visual sharpness.",
    bestSettings: [
      { label: "Target Size", value: "9.5 MB (Guaranteed under 10MB ceiling)" },
      { label: "Bitrate Calculation", value: "Dynamic Two-Pass Bitrate Budgeting" },
      { label: "Resolution Scaling", value: "Auto 720p / 480p depending on length" },
      { label: "Audio Allocation", value: "96 kbps AAC High Efficiency" },
    ],
    steps: [
      { step: 1, title: "Upload Video", desc: "Select your video file of any starting size." },
      { step: 2, title: "Set 9.5 MB Target", desc: "Choose Target Size mode and input 9.5 MB." },
      { step: 3, title: "Download", desc: "Save the guaranteed under-10MB video and submit with 100% confidence." },
    ],
    faqs: [
      {
        q: "How does VideoReduce guarantee the video will stay under 10MB?",
        a: "Our engine divides the 9.5MB budget across the exact duration of your clip to compute precise video and audio bitrates before encoding.",
      },
      {
        q: "What resolution should I use for a 5-minute video under 10MB?",
        a: "For clips over 3 minutes, selecting 480p or 720p ensures clean, artifact-free playback within the 10MB budget.",
      },
      {
        q: "Can I compress 1GB video files under 10MB?",
        a: "Yes! You can compress large gigabyte files directly in your browser without uploading to a cloud queue.",
      },
      {
        q: "Are there any watermarks added?",
        a: "No watermarks, no ads on your video, and no registration required.",
      },
    ],
  },
  {
    slug: "compress-video-under-25mb",
    title: "Compress Video Under 25MB",
    badge: "25MB Universal Cap",
    h1: "Compress Video Under 25MB Online (Discord & Gmail Limit)",
    tagline: "Reduce video files under 25MB for universal compatibility across Gmail, Discord, Outlook, and web forms",
    targetSizeText: "Under 25 MB",
    recommendedPreset: "Custom Target: 24 MB",
    seoTitle: "Compress Video Under 25MB Free",
    seoDescription: "Compress videos under 25MB online free. Exact 24MB target ensures 100% successful attachments for Discord, Gmail, and Outlook.",
    keywords: [
      "compress video under 25mb",
      "reduce video size to 25mb",
      "25mb video compressor free",
      "compress mp4 under 25mb",
      "video compressor for discord 25mb",
    ],
    whyItMatters:
      "25MB is the most critical file size threshold on the internet—it is the universal upload ceiling for free Discord users, Gmail attachments, Google Workspace, and Microsoft Outlook. VideoReduce optimizes video bitrate to target 24MB, leaving sufficient headroom for email MIME overhead and instant Discord chat embedding.",
    bestSettings: [
      { label: "Target Size", value: "24 MB (Universal safety margin)" },
      { label: "Optimal Resolution", value: "1080p Full HD or 720p HD" },
      { label: "Video Codec", value: "H.264 (AVC) + FastStart" },
      { label: "Audio Codec", value: "AAC 128 kbps Stereo" },
    ],
    steps: [
      { step: 1, title: "Select Video", desc: "Select your high-definition video." },
      { step: 2, title: "Enter 24 MB", desc: "Choose Target Size mode and enter 24 MB." },
      { step: 3, title: "Download", desc: "Send via Gmail, Outlook, or Discord without upload rejection errors." },
    ],
    faqs: [
      {
        q: "Why 24MB instead of exactly 25MB?",
        a: "Email servers encode binary attachments with Base64, which adds slight data overhead. Setting 24MB ensures the final email payload remains safely below 25MB.",
      },
      {
        q: "Can I preserve 1080p resolution under 25MB?",
        a: "For videos under 2 to 3 minutes, 1080p resolution easily fits inside 25MB with crisp visual fidelity.",
      },
      {
        q: "Will the video play on mobile phones?",
        a: "Yes. MP4 with H.264 is supported on 100% of modern iOS, Android, Mac, and Windows devices.",
      },
      {
        q: "Are my personal files kept private?",
        a: "Completely private. Processing is performed locally in your browser memory with zero cloud uploads.",
      },
    ],
  },
  {
    slug: "compress-video-under-50mb",
    title: "Compress Video Under 50MB",
    badge: "50MB Portal Standard",
    h1: "Compress Video Under 50MB Online Free",
    tagline: "Reduce large videos under 50MB for social media uploads, LMS submissions, and web portals",
    targetSizeText: "Under 50 MB",
    recommendedPreset: "Custom Target: 48 MB",
    seoTitle: "Compress Video Under 50MB Free",
    seoDescription: "Compress videos under 50MB online for free. Maintain high 1080p clarity for social uploads, LMS portals, and cloud backups.",
    keywords: [
      "compress video under 50mb",
      "reduce video size to 50mb",
      "50mb video compressor free",
      "compress mp4 under 50mb",
      "shrink video under 50mb",
    ],
    whyItMatters:
      "50MB is the standard maximum upload limit for Instagram Reels, Twitter/X mobile uploads, WordPress media libraries, and many corporate HR portals. VideoReduce shrinks raw camera files down to 48MB while preserving crisp 1080p resolution, high dynamic range, and rich stereo audio.",
    bestSettings: [
      { label: "Target Size", value: "48 MB" },
      { label: "Recommended Resolution", value: "1080p Full HD (1920x1080)" },
      { label: "Frame Rate", value: "30 / 60 FPS" },
      { label: "Quality Level", value: "High Definition (CRF 21 Equivalent)" },
    ],
    steps: [
      { step: 1, title: "Select Video", desc: "Select your 4K or 1080p video recording." },
      { step: 2, title: "Input 48 MB", desc: "Type 48 into the Target Size box." },
      { step: 3, title: "Download", desc: "Save your optimized video ready for immediate portal upload." },
    ],
    faqs: [
      {
        q: "How much quality will I lose compressing to 50MB?",
        a: "For videos under 5 minutes, visual quality loss is practically imperceptible to the human eye on modern screens.",
      },
      {
        q: "Can I upload the compressed file to WordPress media library?",
        a: "Yes! Default WordPress installations enforce a 50MB upload cap, making this target ideal for web developers.",
      },
      {
        q: "Does this tool work on Mac and Windows?",
        a: "Yes, VideoReduce works in all modern web browsers across macOS, Windows, Linux, iOS, and Android.",
      },
      {
        q: "How fast does 50MB compression complete?",
        a: "Thanks to WebAssembly SIMD hardware acceleration, compression finishes in just a few seconds.",
      },
    ],
  },
  {
    slug: "compress-video-under-100mb",
    title: "Compress Video Under 100MB",
    badge: "100MB LMS Standard",
    h1: "Compress Video Under 100MB Online (Canvas, Blackboard & LMS)",
    tagline: "Compress student video assignments, university presentations, and course modules under 100MB",
    targetSizeText: "Under 100 MB",
    recommendedPreset: "Custom Target: 95 MB",
    seoTitle: "Compress Video Under 100MB Free",
    seoDescription: "Compress videos under 100MB online for university submissions, Canvas, Blackboard, and Moodle. Retain full 1080p clarity.",
    keywords: [
      "compress video under 100mb",
      "reduce video size to 100mb",
      "100mb video compressor free",
      "compress video for canvas submission",
      "compress video for blackboard",
    ],
    whyItMatters:
      "Learning Management Systems (LMS) such as Canvas, Blackboard, Moodle, and Google Classroom enforce a strict 100MB file limit on student assignment submissions. Compressing multi-gigabyte project presentations, lab recordings, and speech videos down to 95MB guarantees successful submission without deadline panics or professor upload errors.",
    bestSettings: [
      { label: "Target Size", value: "95 MB (Safe for Canvas & Blackboard)" },
      { label: "Optimal Resolution", value: "1080p Full HD" },
      { label: "LMS Compatibility", value: "100% Universal HTML5 MP4" },
      { label: "Audio Quality", value: "192 kbps AAC High Definition" },
    ],
    steps: [
      { step: 1, title: "Select Assignment Video", desc: "Select your project or presentation recording." },
      { step: 2, title: "Enter 95 MB Target", desc: "Set target size to 95MB in the compressor settings." },
      { step: 3, title: "Submit to LMS", desc: "Download and submit to Canvas, Blackboard, or Moodle with zero errors." },
    ],
    faqs: [
      {
        q: "Can I compress long 30-minute student presentations under 100MB?",
        a: "Yes! A 30-minute 1080p presentation can comfortably compress down to 95MB with crisp slide text and clear voice audio.",
      },
      {
        q: "Will my professor be able to play the video directly inside Canvas?",
        a: "Yes. All exported MP4s include standard H.264/AAC encoding that plays natively inside Canvas and Blackboard grading portals.",
      },
      {
        q: "Are academic and research videos kept private?",
        a: "100% private. Files are processed locally inside your browser memory with zero server uploads.",
      },
      {
        q: "Can I compress iPhone 4K videos for university submission?",
        a: "Yes, you can drop heavy 4K iPhone recordings and downscale them into LMS-ready 1080p MP4s under 100MB.",
      },
    ],
  },
  {
    slug: "compress-iphone-video",
    title: "Compress iPhone Video",
    badge: "Apple 4K HDR Fix",
    h1: "Compress iPhone Videos Online (Shrink 4K HDR & MOV)",
    tagline: "Reduce heavy iPhone 4K ProRes and HEVC MOV video sizes by up to 85% for effortless sharing with Android and PC",
    targetSizeText: "Up to 85% Smaller",
    recommendedPreset: "Universal H.264 MP4 • 1080p",
    seoTitle: "Compress iPhone Video Online Free",
    seoDescription: "Compress large iPhone 4K HDR and QuickTime MOV videos to universal MP4 online. Reduce file size up to 85% with zero quality loss.",
    keywords: [
      "compress iphone video",
      "reduce iphone video size",
      "iphone video compressor free",
      "shrink 4k iphone video",
      "convert iphone mov to small mp4",
    ],
    whyItMatters:
      "Modern iPhones record video in heavy 4K 60fps Dolby Vision HDR using Apple ProRes or HEVC encoding. A 3-minute clip easily consumes over 1GB of iCloud storage and often fails to play on Windows PCs, Android phones, or smart TVs due to incompatible color profiles. VideoReduce tone-maps HDR colors to standard sRGB and compresses iPhone videos into lightweight universal MP4s.",
    bestSettings: [
      { label: "Target Format", value: "Universal H.264 MP4 (.mp4)" },
      { label: "Color Tone Mapping", value: "HDR Dolby Vision ➔ Rec.709 Standard SDR" },
      { label: "Resolution Options", value: "1080p Full HD or 720p HD" },
      { label: "Storage Savings", value: "70% to 85% File Reduction" },
    ],
    steps: [
      { step: 1, title: "Select iPhone Video", desc: "Select your iPhone MOV, 4K, or Cinematic Mode recording." },
      { step: 2, title: "Select Universal MP4", desc: "Choose 1080p or 50% reduction for instant sharing." },
      { step: 3, title: "Download & Share", desc: "Save your compact MP4 and send via AirDrop, WhatsApp, or email." },
    ],
    faqs: [
      {
        q: "Why do iPhone videos look washed out on Windows PCs?",
        a: "iPhones record in 10-bit Dolby Vision HDR. When opened on non-HDR Windows displays, colors appear faded. VideoReduce applies proper tone mapping to make colors pop on all screens.",
      },
      {
        q: "Can I compress iPhone Cinematic Mode clips?",
        a: "Yes! All Cinematic Mode and 4K 60fps iPhone recordings can be compressed into smooth, shareable MP4s.",
      },
      {
        q: "Does this save iPhone storage space?",
        a: "Yes. Compressing your large iPhone video archive reduces storage demands by up to 85%, freeing up precious local and iCloud storage.",
      },
      {
        q: "Are my personal photos and videos uploaded anywhere?",
        a: "Never. All compression runs strictly in your browser's local memory with WebAssembly. Zero bytes leave your device.",
      },
    ],
  },
];

export function getUseCaseBySlug(slug: string): UseCaseData | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
