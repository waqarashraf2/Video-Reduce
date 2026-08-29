import { ToolMetadata, ToolId } from "@/lib/ffmpeg/types";

export const TOOLS: ToolMetadata[] = [
  // 1. Smart Video Compressor
  {
    id: "video-compressor",
    slug: "video-compressor",
    name: "Smart Video Compressor",
    shortName: "Compress Video",
    tagline: "Reduce video file size up to 90% without losing quality online for free",
    description:
      "Reduce video size and compress MP4, MOV, MKV, and WebM videos directly in your browser. Free video compressor for Discord (8MB & 10MB presets), iPhone, and PC with CRF bitrate ceilings and zero server uploads.",
    category: "Optimization",
    iconName: "Minimize2",
    badge: "Most Popular",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".avi", ".flv"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Ultra-Fast (Wasm SIMD)",
    seoTitle: "Free Video Compressor Online - Reduce Video Size Without Losing Quality",
    seoDescription:
      "Reduce video file size online for free with our powerful video compressor. Best free online video compressor for Discord (8MB/10MB), iPhone, Android, and PC. Fast, private WebAssembly MP4 compressor alternative to Handbrake and Veed.",
    seoKeywords: [
      "reduce video size",
      "reduce video file size",
      "how to reduce video file size",
      "reduce video size online free",
      "how to reduce video size",
      "reduce video size online",
      "reduce video quality",
      "does dropbox reduce video quality",
      "reduce video file size without losing quality",
      "how to reduce video size on iphone",
      "how to reduce video quality",
      "how to reduce video file size without losing quality",
      "how to reduce video size without losing quality",
      "how to reduce video resolution",
      "how to reduce video file size on iphone",
      "how to reduce video file size on my phone",
      "how do i reduce video file size",
      "reduce video size free",
      "reduce video size iphone",
      "how to reduce video storage size",
      "video compressor",
      "video compressor for discord",
      "discord video compressor",
      "video compressor free",
      "free video compressor",
      "online video compressor",
      "video compressor online",
      "8mb video compressor",
      "handbrake video compressor",
      "freeconvert video compressor",
      "10mb video compressor",
      "video compressor online free",
      "free online video compressor",
      "video compressor app",
      "mp4 video compressor",
      "free video compressor online",
      "online video compressor free",
      "veed video compressor",
      "best video compressor",
      "video compressor discord",
    ],
    features: [
      {
        title: "Reduce Video File Size Without Quality Loss",
        description: "Psycho-visual CRF rate control preserves human-visible sharpness while reducing file size up to 90%.",
        icon: "Sliders",
      },
      {
        title: "Discord 8MB & 10MB Compression Presets",
        description: "One-click compression under Discord 8MB, 10MB, and 25MB limits with faststart web streaming playback.",
        icon: "Maximize",
      },
      {
        title: "Zero Server Uploads (100% Private)",
        description: "Your recordings never leave your device. All transcoding happens in local RAM via WebAssembly.",
        icon: "ShieldCheck",
      },
      {
        title: "Works on iPhone, Android & PC",
        description: "Reduce video storage size on iPhone camera roll or desktop browser without downloading third-party software.",
        icon: "Smartphone",
      },
    ],
    steps: [
      { step: 1, title: "Select Video File", description: "Pick any MP4, MOV, or WebM video from your phone or PC." },
      { step: 2, title: "Choose Target Reduction", description: "Select 50% Smaller, 70% Smaller, 8MB Discord preset, or set custom target MB." },
      { step: 3, title: "Compress & Download", description: "Click 'Start Compress' and download your optimized lightweight video." },
    ],
    faqs: [
      {
        question: "How to reduce video file size without losing quality?",
        answer:
          "To reduce video file size without losing quality, VideoReduce.com uses Constant Rate Factor (CRF 23-28) encoding and dynamic bitrate calculation. This compresses redundant background pixels while preserving crisp sharpness on focal points like faces and text.",
      },
      {
        question: "How to reduce video size on iPhone or Android phone?",
        answer:
          "Open Safari or Chrome on your iPhone or Android phone, navigate to VideoReduce.com, and select your video from your gallery. Choose a target compression preset (such as 70% reduction or 1080p downscaling) and hit compress. It processes right in your mobile browser without installing any app.",
      },
      {
        question: "How do I compress a video for Discord (8MB & 25MB)?",
        answer:
          "Select the Discord preset or set the Custom Target Size to 8MB (or 24MB for nitro/standard limits). The video compressor enforces an exact bitrate ceiling so the output file attaches smoothly in Discord chat.",
      },
      {
        question: "Does Dropbox or cloud storage reduce video quality?",
        answer:
          "Dropbox does not alter your original downloaded file, but its web video player streams a heavily compressed, low-quality preview. To share videos directly without losing quality or buffering, pre-compress them with VideoReduce.com before sending.",
      },
      {
        question: "How does VideoReduce compare to HandBrake, Veed, or FreeConvert?",
        answer:
          "Unlike HandBrake, VideoReduce requires zero software installation and runs directly in your browser. Unlike Veed or FreeConvert, VideoReduce is 100% free, imposes no file size limits, adds no watermarks, and never uploads your private videos to cloud servers.",
      },
      {
        question: "How to reduce video resolution or storage size?",
        answer:
          "In the compressor settings, select a lower resolution preset like 1080p, 720p, or 480p. Downscaling from 4K to 1080p immediately cuts raw video data by 75% while maintaining exceptional clarity on phone and computer screens.",
      },
    ],
  },

  // 2. Video to GIF Converter
  {
    id: "video-to-gif",
    slug: "video-to-gif",
    name: "Video to GIF Converter",
    shortName: "Make GIF",
    tagline: "Turn video clips into ultra-smooth, high-definition animated GIFs online for free",
    description:
      "Convert MP4, MOV, or WebM video clips into high quality animated GIFs using advanced two-pass palette generation. Free video to gif converter for iPhone, PC, YouTube & Twitter clips with no watermarks or server uploads.",
    category: "Conversion",
    iconName: "Film",
    badge: "High Quality",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".webm", ".mkv", ".avi"],
    outputExtension: "gif",
    outputMimeType: "image/gif",
    estimatedSpeed: "Fast (Two-Pass Palette)",
    seoTitle: "Free Video to GIF Converter Online - High Quality HD GIF Maker",
    seoDescription:
      "Convert video to GIF online free in high quality. Fast video to GIF maker for iPhone, PC, YouTube and Twitter clips with custom FPS and two-pass color palette. Best free alternative to Ezgif & Adobe Express.",
    seoKeywords: [
      "video to gif",
      "video to gif converter",
      "convert video to gif",
      "youtube video to gif",
      "ezgif video to gif",
      "twitter video to gif",
      "video to gif maker",
      "turn video to gif",
      "how to convert video to gif",
      "adobe express video to gif",
      "adobe video to gif",
      "video to gif high quality",
      "video to gif converter free",
      "video to gif iphone",
      "video to gif online",
      "iphone video to gif",
      "free video to gif converter",
      "video to gif free",
      "change video to gif",
      "video to gif adobe",
    ],
    features: [
      {
        title: "Two-Pass Color Palette",
        description: "Generates a custom 256-color palette to eliminate color banding for crystal clear, high quality GIFs.",
        icon: "Palette",
      },
      {
        title: "Custom Frame Rate & Dimensions",
        description: "Choose 10, 15, 24, or 30 FPS and custom width for ultra-smooth motion or lightweight files.",
        icon: "Gauge",
      },
      {
        title: "100% Free & Private (No Uploads)",
        description: "Turn video to GIF directly on your device with WebAssembly. No file size limits or cloud privacy risks.",
        icon: "ShieldCheck",
      },
      {
        title: "Works on iPhone, Android & PC",
        description: "Easily convert iPhone MOV clips or recorded video into animated GIFs in any modern mobile or desktop browser.",
        icon: "Smartphone",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload Video Clip",
        description: "Select your MP4, MOV, or WebM video file (from your iPhone, Android, or PC).",
      },
      {
        step: 2,
        title: "Set Frame Rate & Dimensions",
        description: "Customize FPS (10-30 FPS) and width for the ideal balance of smoothness and file size.",
      },
      {
        step: 3,
        title: "Generate & Download GIF",
        description: "Click 'Start Converting' and instantly download your high quality animated GIF.",
      },
    ],
    faqs: [
      {
        question: "How to convert video to GIF in high quality?",
        answer:
          "To get a high quality GIF without grainy artifacts, VideoReduce.com utilizes an automated two-pass color palette generation algorithm (palettegen and paletteuse with Lanczos scaling) to capture all 256 optimal colors for your specific video footage.",
      },
      {
        question: "How do I turn an iPhone video into a GIF?",
        answer:
          "Simply upload your iPhone QuickTime MOV or MP4 video to VideoReduce.com's Video to GIF converter. It processes locally on your iOS browser (Safari/Chrome) without uploading to any server, outputting an animated GIF ready to share via iMessage, WhatsApp, or Twitter.",
      },
      {
        question: "How does this compare to Ezgif, Adobe Express, or other online GIF makers?",
        answer:
          "Unlike cloud converters like Ezgif or Adobe Express that require uploading private videos to remote servers with strict file caps, VideoReduce.com runs 100% client-side via WebAssembly. It is completely free, instant, requires no registration, and has zero server upload queues.",
      },
      {
        question: "Can I convert YouTube and Twitter video clips into GIFs?",
        answer:
          "Yes! Download or record your favorite YouTube or Twitter video clip and drop the MP4 or WebM file into our Video to GIF maker to turn it into an animated GIF in seconds.",
      },
      {
        question: "Is this video to GIF converter completely free?",
        answer:
          "Yes, 100% free with no watermarks, no sign-ups, and unlimited conversions.",
      },
    ],
  },

  // 3. Audio Extractor
  {
    id: "audio-extractor",
    slug: "audio-extractor",
    name: "Audio Extractor & Converter",
    shortName: "Extract Audio",
    tagline: "Extract audio from video online free — convert MP4 to MP3, WAV, or AAC instantly",
    description:
      "Free online audio extractor to rip audio from video files. Convert MP4 to MP3, extract soundtrack from MOV, MKV, or WebM videos into high-quality 320kbps MP3, lossless 16-bit WAV, or AAC audio. Works on iPhone, Android, and PC — 100% private in your browser.",
    category: "Audio",
    iconName: "Music",
    badge: "Studio Audio",
    acceptedTypes: ["video/*", "audio/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".avi", ".flv", ".mp3", ".wav", ".aac"],
    outputExtension: "mp3",
    outputMimeType: "audio/mpeg",
    estimatedSpeed: "Instant",
    seoTitle: "Extract Audio from Video Online Free — MP4 to MP3",
    seoDescription:
      "Extract audio from video online free. Convert MP4 to MP3, WAV, or AAC. Rip soundtrack from any video in seconds — no app install, 100% private.",
    seoKeywords: [
      "extract audio from video",
      "extract audio from video online",
      "extract audio from video free",
      "how to extract audio from video",
      "mp4 to mp3 converter",
      "mp4 to mp3 converter online",
      "convert mp4 to mp3",
      "convert video to mp3",
      "video to mp3 converter",
      "video to mp3",
      "rip audio from video",
      "extract sound from video",
      "mp4 to mp3 free",
      "video to audio converter",
      "extract music from video",
      "pull audio from video",
      "get audio from video",
      "mp4 to wav converter",
      "video to wav",
      "extract audio from mp4",
    ],
    features: [
      {
        title: "Extract Audio from Any Video Format",
        description: "Rip audio from MP4, MOV, MKV, WebM, AVI, and FLV video files instantly in your browser.",
        icon: "FileAudio",
      },
      {
        title: "Multiple Output Formats (MP3, WAV, AAC)",
        description: "Export as universal 320kbps MP3, lossless 16-bit WAV for studio work, or compact AAC for Apple devices.",
        icon: "Radio",
      },
      {
        title: "Lightning Fast Extraction",
        description: "Audio demuxing completes in seconds — no re-encoding required for stream-copy extraction.",
        icon: "Zap",
      },
      {
        title: "100% Private — No Server Upload",
        description: "Your video files stay on your device. Extract audio entirely in browser memory via WebAssembly.",
        icon: "ShieldCheck",
      },
    ],
    steps: [
      { step: 1, title: "Upload Any Video", description: "Select any MP4, MOV, MKV, or WebM video file from your device." },
      { step: 2, title: "Choose Audio Format", description: "Pick MP3 (universal), WAV (lossless studio), or AAC (Apple) and select bitrate quality." },
      { step: 3, title: "Extract & Download", description: "Click Extract and download your clean audio file in seconds." },
    ],
    faqs: [
      {
        question: "How to extract audio from video online for free?",
        answer:
          "Upload your video to VideoReduce.com's Audio Extractor, choose your desired format (MP3, WAV, or AAC), and click Extract. The WebAssembly engine demuxes the audio track directly in your browser — no server upload, no software install, completely free.",
      },
      {
        question: "How to convert MP4 to MP3 without losing quality?",
        answer:
          "Select 320kbps MP3 output quality in the Audio Extractor. This is the highest bitrate for MP3 encoding and preserves virtually all audible detail from the original video soundtrack.",
      },
      {
        question: "Can I extract audio from iPhone MOV videos?",
        answer:
          "Yes! Upload your iPhone QuickTime .MOV recording and extract the audio as MP3, WAV, or AAC. Works directly in Safari and Chrome on iOS without any app installation.",
      },
      {
        question: "What is the difference between MP3, WAV, and AAC?",
        answer:
          "MP3 is the universal compressed format (small files, works everywhere). WAV is lossless uncompressed 16-bit PCM (studio quality, large files). AAC is Apple's efficient compressed format (better quality than MP3 at same bitrate).",
      },
      {
        question: "Can I rip music or soundtrack from YouTube videos?",
        answer:
          "If you have a downloaded MP4 or WebM file from YouTube, you can extract the audio track as MP3 or WAV using our tool. We do not download from YouTube directly — you must provide the video file.",
      },
    ],
  },

  // 4. Video Trimmer & Splitter
  {
    id: "video-trimmer",
    slug: "video-trimmer",
    name: "Video Trimmer & Splitter",
    shortName: "Trim Video",
    tagline: "Cut and trim video online free — split clips with millisecond precision",
    description:
      "Free online video trimmer to cut, trim, and split video clips. Remove unwanted sections from MP4, MOV, MKV, or WebM videos with dual-handle timeline slider and ultra-fast lossless stream-copy. Works on iPhone, Android, and desktop browsers.",
    category: "Video",
    iconName: "Scissors",
    badge: "Dual Timeline",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Instant (Lossless Copy)",
    seoTitle: "Free Video Trimmer Online — Cut & Split Video Clips",
    seoDescription:
      "Trim and cut video clips online free. Split MP4, MOV, MKV videos with dual-handle timeline and lossless stream-copy — no quality loss, no upload.",
    seoKeywords: [
      "video trimmer",
      "video trimmer online",
      "trim video online",
      "cut video online",
      "cut video online free",
      "video cutter",
      "video cutter online",
      "trim video",
      "how to trim a video",
      "split video online",
      "video splitter",
      "trim mp4 online",
      "cut mp4 video",
      "video clip cutter",
      "trim video free",
      "online video trimmer free",
      "video trimmer app",
      "how to cut a video",
      "crop video length",
      "shorten video online",
    ],
    features: [
      {
        title: "Dual Timeline Handle Trimmer",
        description: "Interactive start and end handles with frame-accurate seeking for exact video cuts.",
        icon: "SlidersHorizontal",
      },
      {
        title: "Live Video Scrub Preview",
        description: "Video player follows handle movement frame by frame so you see exactly what you're cutting.",
        icon: "Eye",
      },
      {
        title: "Lossless Stream-Copy (Instant)",
        description: "Exports trimmed video without re-encoding — completes in under a second with zero quality loss.",
        icon: "Cpu",
      },
      {
        title: "100% Private & Free",
        description: "Cut and trim videos directly in your browser memory. No file upload to any server.",
        icon: "ShieldCheck",
      },
    ],
    steps: [
      { step: 1, title: "Upload Video", description: "Select any MP4, MOV, MKV, or WebM video from your phone or computer." },
      { step: 2, title: "Set Start & End Points", description: "Drag the dual timeline handles to mark the segment you want to keep." },
      { step: 3, title: "Trim & Download", description: "Click Trim and download your perfectly cut video clip instantly." },
    ],
    faqs: [
      {
        question: "How to trim a video online for free?",
        answer:
          "Upload your video to VideoReduce.com's Video Trimmer, drag the start and end handles on the timeline to select the part you want, and click Trim. The lossless stream-copy engine exports your cut in under a second with zero quality loss.",
      },
      {
        question: "How fast is lossless stream-copy trimming?",
        answer:
          "Stream-copy trimming completes in under a second — even for large 1GB+ files — because it copies raw video packets without re-encoding any frames. Your video quality remains 100% identical to the original.",
      },
      {
        question: "Can I trim videos on iPhone or Android?",
        answer:
          "Yes! Open VideoReduce.com in Safari (iPhone) or Chrome (Android), upload your video from Photos/Gallery, and trim it directly in your mobile browser without installing any app.",
      },
      {
        question: "Can I split a video into multiple clips?",
        answer:
          "You can trim one segment at a time. To create multiple clips, simply repeat the process with different start and end points for each segment you need.",
      },
      {
        question: "Does trimming reduce video quality?",
        answer:
          "No! Our lossless stream-copy mode copies the video and audio streams bit-for-bit without any re-encoding, so there is absolutely zero quality degradation.",
      },
    ],
  },

  // 5. Video Speed Controller
  {
    id: "speed-controller",
    slug: "speed-controller",
    name: "Video Speed Controller",
    shortName: "Change Speed",
    tagline: "Speed up or slow down video online free — 0.25x slow motion to 4x fast forward",
    description:
      "Free online video speed changer. Speed up video for time-lapse effects or create cinematic slow-motion from 0.25x to 4x with automated audio pitch preservation. Works on any device.",
    category: "Video",
    iconName: "FastForward",
    badge: "0.25x - 4x",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast",
    seoTitle: "Speed Up Video Online Free — Slow Motion & Fast Forward",
    seoDescription:
      "Speed up or slow down video online free. Change video speed from 0.25x slow motion to 4x fast forward with pitch correction — no app needed.",
    seoKeywords: [
      "speed up video",
      "speed up video online",
      "speed up video online free",
      "how to speed up a video",
      "slow motion video",
      "slow motion video maker",
      "slow down video",
      "video speed changer",
      "video speed controller",
      "change video speed",
      "change video speed online",
      "fast forward video",
      "make video faster",
      "make video slower",
      "2x speed video",
      "video speed editor",
      "time lapse video maker",
      "slow mo video",
      "speed up mp4 video",
      "video playback speed changer",
    ],
    features: [
      {
        title: "0.25x to 4x Speed Multipliers",
        description: "One-click preset speed buttons for slow motion (0.25x, 0.5x) and fast forward (1.5x, 2x, 3x, 4x).",
        icon: "Zap",
      },
      {
        title: "Audio Pitch Correction",
        description: "Maintains natural vocal pitch using FFmpeg atempo filter — no chipmunk or deep voice distortion.",
        icon: "Volume2",
      },
      {
        title: "Smooth PTS Timestamp Recalculation",
        description: "Recalculates video presentation timestamps for stutter-free, buttery smooth playback at any speed.",
        icon: "Activity",
      },
      {
        title: "100% Private & Free",
        description: "Change video speed entirely in your browser via WebAssembly. No upload, no watermarks.",
        icon: "ShieldCheck",
      },
    ],
    steps: [
      { step: 1, title: "Upload Video", description: "Select any MP4, MOV, MKV, or WebM video clip." },
      { step: 2, title: "Select Speed Multiplier", description: "Choose 0.25x (slow motion), 0.5x, 1.5x, 2x, 3x, or 4x (fast forward)." },
      { step: 3, title: "Render & Download", description: "Click Apply and download your speed-adjusted video." },
    ],
    faqs: [
      {
        question: "How to speed up a video online for free?",
        answer:
          "Upload your video to VideoReduce.com's Speed Controller, select your desired speed (2x, 3x, 4x), and click Apply. The engine recalculates all timestamps and preserves audio pitch for a natural-sounding fast-forward.",
      },
      {
        question: "How to make a slow motion video?",
        answer:
          "Select 0.25x or 0.5x speed in the Speed Controller to create cinematic slow motion effects. The tool smoothly extends each frame's duration while maintaining proper audio synchronization.",
      },
      {
        question: "Does the audio sound normal after speeding up?",
        answer:
          "Yes! The audio pitch correction (atempo filter) prevents the chipmunk effect. Voices and music sound natural at any speed between 0.5x and 2x. For extreme speeds, audio may be automatically muted.",
      },
      {
        question: "Can I create a time-lapse from a long video?",
        answer:
          "Yes! Use 4x speed to condense a long video into a fast time-lapse. A 4-minute video becomes a 1-minute clip while preserving smooth visual motion.",
      },
      {
        question: "Does this work on mobile phones?",
        answer:
          "Yes, VideoReduce.com works in all modern mobile browsers (Safari, Chrome, Edge) on iPhone, iPad, and Android devices without any app installation.",
      },
    ],
  },

  // 6. Video Mute
  {
    id: "video-mute",
    slug: "video-mute",
    name: "Video Mute & Audio Stripper",
    shortName: "Mute Video",
    tagline: "Remove audio from video online free — mute video in one click",
    description:
      "Free online tool to remove audio from video. Mute any MP4, MOV, MKV, or WebM video instantly in one click. Strip background noise, confidential speech, or unwanted audio with zero video quality loss using lossless stream-copy.",
    category: "Audio",
    iconName: "VolumeX",
    badge: "1-Click",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".avi", ".flv"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Instant (100ms)",
    seoTitle: "Remove Audio from Video Online Free — Mute Video",
    seoDescription:
      "Remove audio from video online free. Mute and strip audio from MP4, MOV, WebM videos instantly with zero quality loss — no software needed.",
    seoKeywords: [
      "remove audio from video",
      "remove audio from video online",
      "remove audio from video free",
      "how to remove audio from video",
      "mute video",
      "mute video online",
      "mute video online free",
      "strip audio from video",
      "remove sound from video",
      "how to mute a video",
      "video audio remover",
      "delete audio from video",
      "remove voice from video",
      "silent video maker",
      "remove background noise from video",
      "video muter online",
      "remove music from video",
      "take audio off video",
      "mute mp4 video",
      "remove audio track from video",
    ],
    features: [
      {
        title: "1-Click Audio Removal",
        description: "Instantly mute any video with a single click — removes the entire audio track in milliseconds.",
        icon: "Shield",
      },
      {
        title: "Zero Re-encoding (Lossless)",
        description: "Copies video stream bit-for-bit without touching a single pixel. Your video quality stays 100% identical.",
        icon: "Clock",
      },
      {
        title: "Sub-Second Processing",
        description: "Mutes even 1GB+ files in under 100 milliseconds using instant stream-copy demuxing.",
        icon: "Zap",
      },
      {
        title: "Smaller File Size Output",
        description: "Removing the audio track reduces total file size, saving storage space on your device.",
        icon: "ArrowDownCircle",
      },
    ],
    steps: [
      { step: 1, title: "Upload Video", description: "Select any video file containing audio you want to remove." },
      { step: 2, title: "Click Mute", description: "Click the 1-Click Mute button to strip all audio tracks instantly." },
      { step: 3, title: "Download Silent Video", description: "Save your clean, silent video file immediately." },
    ],
    faqs: [
      {
        question: "How to remove audio from a video online?",
        answer:
          "Upload your video to VideoReduce.com's Video Muter, click the 1-Click Mute button, and download your silent video. The tool strips the audio stream in milliseconds using lossless stream-copy — no re-encoding, no quality loss.",
      },
      {
        question: "Does muting a video affect video quality?",
        answer:
          "Not at all. The video stream is copied bit-for-bit without any re-encoding. Not a single pixel changes — only the audio track is removed from the container.",
      },
      {
        question: "Can I remove background noise instead of muting completely?",
        answer:
          "For selective noise removal while keeping speech, use our Audio De-Noiser tool instead. The Video Muter removes all audio entirely for completely silent output.",
      },
      {
        question: "Why would I want to remove audio from a video?",
        answer:
          "Common use cases include: removing confidential conversation before sharing, eliminating wind/background noise, removing copyrighted music, or preparing silent clips for social media with added music overlay.",
      },
      {
        question: "Does removing audio make the file smaller?",
        answer:
          "Yes! Audio tracks can account for 5-15% of total file size. Removing them creates a smaller, leaner video file.",
      },
    ],
  },

  // 7. Universal Format Converter
  {
    id: "format-converter",
    slug: "format-converter",
    name: "Universal Video Format Converter",
    shortName: "Convert Format",
    tagline: "Convert video format online free — MP4, WebM, MKV, MOV, AVI, FLV transcoder",
    description:
      "Free online video converter to change video format. Convert MOV to MP4, MKV to MP4, WebM to MP4, AVI to MP4, and more. Transcode seamlessly between all major formats for maximum device compatibility and web streaming — 100% private in your browser.",
    category: "Conversion",
    iconName: "RefreshCw",
    badge: "All Formats",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".avi", ".flv", ".wmv", ".m4v"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast",
    seoTitle: "Free Video Converter Online — Convert MP4, MOV, MKV, WebM",
    seoDescription:
      "Convert video format online free. Convert MOV to MP4, MKV to MP4, WebM to MP4, AVI to MP4 and more in your browser — no software install needed.",
    seoKeywords: [
      "video converter",
      "video converter online",
      "video converter online free",
      "free video converter",
      "convert video online",
      "convert video format",
      "video format converter",
      "convert mov to mp4",
      "convert mkv to mp4",
      "webm to mp4 converter",
      "avi to mp4 converter",
      "mov to mp4 online",
      "mkv to mp4 online",
      "change video format",
      "video file converter",
      "mp4 converter",
      "video transcoder online",
      "convert video to mp4",
      "best free video converter",
      "online video converter free",
    ],
    features: [
      { title: "6+ Major Video Formats", description: "Full support for MP4, WebM, MKV, MOV, AVI, FLV, WMV, and M4V container formats.", icon: "FileCode" },
      { title: "Web Streaming Optimized", description: "Applies faststart/moov atom flags for progressive web playback without full download.", icon: "Globe" },
      { title: "High Fidelity H.264 Transcode", description: "Crisp H.264 or VP8 video encoding with customizable quality presets.", icon: "Sparkles" },
      { title: "100% Private & Free", description: "Convert video formats entirely in your browser. No file upload, no registration.", icon: "ShieldCheck" },
    ],
    steps: [
      { step: 1, title: "Upload Any Video", description: "Select any MP4, MOV, MKV, WebM, AVI, or FLV video file." },
      { step: 2, title: "Select Target Format", description: "Choose your desired output format: MP4 (universal), WebM, MKV, or MOV." },
      { step: 3, title: "Convert & Download", description: "Click Convert and download your newly formatted video file." },
    ],
    faqs: [
      { question: "How to convert MOV to MP4 online free?", answer: "Upload your Apple QuickTime .MOV file to VideoReduce.com's Format Converter, select MP4 as the output format, and click Convert. The WebAssembly engine transcodes your video into universal H.264 MP4 directly in your browser." },
      { question: "Which video format is best for social media?", answer: "MP4 with H.264 video codec and AAC audio is the universal standard supported by YouTube, Instagram, TikTok, Twitter, Facebook, WhatsApp, and Discord. Always convert to MP4 for maximum compatibility." },
      { question: "How to convert MKV to MP4 without quality loss?", answer: "If your MKV file already contains H.264 video, our converter can stream-copy the video track (zero quality loss) and just re-wrap it into an MP4 container. This takes only seconds." },
      { question: "Can I convert WebM files to MP4?", answer: "Yes! WebM (Google's VP8/VP9 format) can be converted to standard H.264 MP4 for compatibility with iPhones, Windows, and all social media platforms." },
      { question: "Is this better than installing HandBrake or VLC?", answer: "VideoReduce.com works instantly in your browser without downloading or installing any software. Unlike HandBrake or VLC, there's no learning curve — just upload, select format, and convert." },
    ],
  },

  // 8. Social Aspect Ratio Resizer
  {
    id: "aspect-ratio-resizer",
    slug: "aspect-ratio-resizer",
    name: "Social Aspect Ratio Resizer",
    shortName: "Resize for Social",
    tagline: "Resize video for TikTok, Reels, Shorts (9:16), Instagram (1:1), YouTube (16:9) free",
    description:
      "Free online video resizer for social media. Convert landscape video to vertical 9:16 for TikTok and Instagram Reels, square 1:1 for Instagram posts, or widescreen 16:9 for YouTube. Smart center crop or letterbox padding with 1080p HD output.",
    category: "Optimization",
    iconName: "Smartphone",
    badge: "TikTok & Reels",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast",
    seoTitle: "Resize Video for TikTok & Reels Free — Aspect Ratio",
    seoDescription:
      "Resize video for TikTok, Instagram Reels (9:16), YouTube (16:9) free online. Convert landscape to vertical with crop or letterbox padding.",
    seoKeywords: [
      "resize video for tiktok",
      "resize video",
      "resize video online",
      "resize video online free",
      "video resizer",
      "video resizer online",
      "change video aspect ratio",
      "video aspect ratio changer",
      "convert horizontal to vertical video",
      "landscape to portrait video",
      "resize video for instagram",
      "resize video for youtube",
      "resize video for reels",
      "9:16 video maker",
      "1:1 video maker",
      "square video maker",
      "vertical video converter",
      "video ratio changer",
      "fit video for social media",
      "crop video for tiktok",
    ],
    features: [
      { title: "Social Media Presets", description: "One-click presets for 9:16 (TikTok/Reels/Shorts), 1:1 (Instagram), and 16:9 (YouTube/Widescreen).", icon: "LayoutGrid" },
      { title: "Crop vs Letterbox Padding", description: "Choose full-screen center-crop or elegant black letterbox padding to keep your entire video in frame.", icon: "Maximize2" },
      { title: "Crisp 1080p HD Output", description: "All resized videos are exported at standard 1080p high-definition resolution.", icon: "CheckCircle" },
      { title: "100% Private & Free", description: "Resize videos entirely in your browser. No upload, no watermarks, no file size limits.", icon: "ShieldCheck" },
    ],
    steps: [
      { step: 1, title: "Upload Video", description: "Select your landscape, portrait, or square video from your device." },
      { step: 2, title: "Pick Aspect Ratio", description: "Choose 9:16 (TikTok/Reels), 1:1 (Instagram), or 16:9 (YouTube) and select Crop or Pad mode." },
      { step: 3, title: "Export & Post", description: "Download your perfectly resized video ready to upload to social media." },
    ],
    faqs: [
      { question: "How to resize a video for TikTok or Instagram Reels?", answer: "Upload your landscape video, select the 9:16 aspect ratio preset, choose Center Crop or Letterbox Pad mode, and click Export. You'll get a vertical video perfectly sized for TikTok, Instagram Reels, and YouTube Shorts." },
      { question: "What is the difference between crop and letterbox?", answer: "Crop fills the entire frame by cutting the sides of your video (full-screen, but loses some edges). Letterbox adds black bars to fit the entire video within the new aspect ratio (keeps everything, but has borders)." },
      { question: "Can I convert a YouTube video to vertical for TikTok?", answer: "Yes! Upload your 16:9 YouTube-format video, select 9:16, and the tool will center-crop or pad it for perfect TikTok/Reels vertical format." },
      { question: "What resolution are the output videos?", answer: "All videos are exported at standard 1080p HD (1920x1080 for 16:9, 1080x1920 for 9:16, 1080x1080 for 1:1) for crisp social media quality." },
      { question: "Does this work with iPhone MOV files?", answer: "Yes! Upload iPhone QuickTime .MOV recordings and resize them to any aspect ratio. Works directly in Safari and Chrome on iOS." },
    ],
  },

  // 9. Video Watermark & Logo Adder
  {
    id: "video-watermark",
    slug: "video-watermark",
    name: "Video Watermark & Logo Adder",
    shortName: "Add Watermark",
    tagline: "Add watermark to video online free — text or logo branding overlay",
    description:
      "Free online tool to add watermark to video. Add custom text watermarks or transparent PNG logo branding to your videos with 5 position presets, opacity control, and custom sizing — 100% private in your browser.",
    category: "Video",
    iconName: "Image",
    badge: "Branding",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast",
    seoTitle: "Add Watermark to Video Online Free — Logo & Text",
    seoDescription:
      "Add watermark to video online free. Overlay text or PNG logo on MP4, MOV, WebM videos with custom opacity and position — no software needed.",
    seoKeywords: [
      "add watermark to video",
      "add watermark to video online",
      "add watermark to video free",
      "watermark video online",
      "video watermark maker",
      "add logo to video",
      "add logo to video online",
      "video logo overlay",
      "text watermark on video",
      "watermark video free",
      "brand video with logo",
      "video watermark app",
      "how to add watermark to video",
      "put logo on video",
      "video branding tool",
      "watermark maker online",
      "add text to video",
      "video overlay tool",
      "transparent logo on video",
      "protect video with watermark",
    ],
    features: [
      { title: "Text & Image Watermarks", description: "Type custom text or upload a transparent PNG logo for professional video branding.", icon: "Image" },
      { title: "5 Position Presets", description: "Place your watermark in Top-Left, Top-Right, Bottom-Left, Bottom-Right, or Center of the video.", icon: "LayoutGrid" },
      { title: "Opacity & Size Control", description: "Adjust transparency from subtle to bold and scale the watermark size to fit your video.", icon: "Sliders" },
      { title: "100% Private & Free", description: "Add watermarks without uploading your video to any server. All processing happens locally.", icon: "ShieldCheck" },
    ],
    steps: [
      { step: 1, title: "Upload Video", description: "Select the video you want to brand with a watermark or logo." },
      { step: 2, title: "Configure Watermark", description: "Type text or upload PNG logo, choose position, and adjust opacity and size." },
      { step: 3, title: "Apply & Download", description: "Click Apply and download your branded video with the watermark embedded." },
    ],
    faqs: [
      { question: "How to add a watermark to a video online?", answer: "Upload your video to VideoReduce.com's Watermark tool, type your desired text or upload a PNG logo, choose the corner position and opacity level, and click Apply. Your branded video is ready to download." },
      { question: "Can I use transparent PNG logos?", answer: "Yes! Alpha transparency in PNG images is fully preserved. Your logo will overlay cleanly on the video without any white background box." },
      { question: "Will the watermark appear on every frame?", answer: "Yes, the watermark is burned into every frame of the video for consistent branding throughout the entire clip." },
      { question: "Can I protect my videos from being stolen?", answer: "Adding a visible watermark with your name, brand, or URL helps deter unauthorized use and proves ownership if your content is shared without permission." },
      { question: "Does adding a watermark reduce video quality?", answer: "The video is re-encoded with high-quality H.264 settings to ensure minimal quality difference. The watermark is composited at the pixel level for crisp, clean results." },
    ],
  },

  // 10. Video Rotate & Flip
  {
    id: "video-rotate",
    slug: "video-rotate",
    name: "Video Rotate & Flip",
    shortName: "Rotate Video",
    tagline: "Rotate video online free — fix sideways videos 90°, 180°, 270° or flip mirror",
    description:
      "Free online video rotator to fix sideways smartphone recordings. Rotate videos 90°, 180°, or 270° clockwise, or flip horizontally/vertically for mirror effects. Works with MP4, MOV, MKV, WebM files on any device.",
    category: "Video",
    iconName: "RotateCw",
    badge: "Orientation",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast",
    seoTitle: "Rotate Video Online Free — 90° 180° 270° & Flip",
    seoDescription:
      "Rotate video online free. Fix sideways videos 90°, 180°, 270° clockwise or flip horizontal/vertical mirror — no software needed.",
    seoKeywords: [
      "rotate video",
      "rotate video online",
      "rotate video online free",
      "how to rotate a video",
      "rotate video 90 degrees",
      "flip video",
      "flip video online",
      "flip video horizontally",
      "mirror video",
      "mirror video online",
      "fix sideways video",
      "video rotator",
      "rotate mp4 video",
      "rotate mov video",
      "turn video sideways",
      "rotate video on iphone",
      "rotate video windows",
      "how to flip a video",
      "video flipper online",
      "rotate landscape to portrait",
    ],
    features: [
      { title: "90°, 180°, 270° Rotation", description: "Fix any sideways or upside-down phone recording with precise clockwise rotation angles.", icon: "RotateCw" },
      { title: "Horizontal & Vertical Flip", description: "Mirror video selfie recordings horizontally or create upside-down flip effects vertically.", icon: "RefreshCw" },
      { title: "Maintains Full Video Quality", description: "Clean re-encode with proper metadata orientation tags for universal playback compatibility.", icon: "CheckCircle" },
      { title: "100% Private & Free", description: "Rotate and flip videos entirely in your browser. No upload, no watermarks.", icon: "ShieldCheck" },
    ],
    steps: [
      { step: 1, title: "Upload Video", description: "Select your sideways, upside-down, or mirrored video file." },
      { step: 2, title: "Choose Rotation Angle", description: "Click 90° Clockwise, 180° (upside-down), 270° Counter-Clockwise, or Flip Horizontal/Vertical." },
      { step: 3, title: "Save Rotated Video", description: "Download your properly oriented video file." },
    ],
    faqs: [
      { question: "How to rotate a sideways video online?", answer: "Upload your sideways video to VideoReduce.com's Rotate tool, click the 90° Clockwise button (or 270° for counter-clockwise), and download your properly oriented video. The rotation is hardcoded into the video frames for universal playback." },
      { question: "Why do iPhone and Android videos sometimes appear sideways?", answer: "Smartphones record video in the sensor's native orientation and rely on metadata rotation tags. Some players ignore these tags, causing the video to appear sideways. Our tool re-encodes with the correct physical orientation." },
      { question: "How to flip a video horizontally for mirror effect?", answer: "Upload your video and click the Flip Horizontal button. This creates a mirror image effect — useful for correcting selfie camera recordings that appear reversed." },
      { question: "Does rotating reduce video quality?", answer: "The video is re-encoded with high-quality H.264 settings. While there is a minimal generation loss from re-encoding, it is virtually imperceptible to the human eye." },
      { question: "Can I rotate iPhone MOV videos to landscape?", answer: "Yes! Upload your vertically-shot iPhone .MOV recording and rotate it 90° to create a landscape-oriented video for YouTube or desktop viewing." },
    ],
  },

  // 11. Video Reverse / Rewind Maker
  {
    id: "video-reverse",
    slug: "video-reverse",
    name: "Video Reverse & Rewind Maker",
    shortName: "Reverse Video",
    tagline: "Reverse any video online free — play video backwards with audio for rewind effects",
    description:
      "Free online video reverse tool to play any video backwards. Create viral rewind effects for TikTok, YouTube Shorts, and Instagram Reels. Works with any size video — no file limits, 100% private in your browser.",
    category: "Video",
    iconName: "Rewind",
    badge: "Rewind FX",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast (Wasm)",
    seoTitle: "Free Video Reverse Online — Play Video Backwards & Rewind Maker",
    seoDescription:
      "Reverse video online for free. Play any video backwards with reversed or muted audio. Create viral rewind effects, loop videos in reverse, and edit reversed clips — no app install needed.",
    seoKeywords: [
      "video reverse",
      "video reverse online",
      "video reverse search",
      "video reverse search engine",
      "how to make a video reverse",
      "video reverse app",
      "video reverse image search",
      "google video reverse search",
      "how to make video reverse",
      "search by video reverse",
      "video reverse lookup",
      "search video reverse",
      "loop video reverse",
      "video reverse tool",
      "edit video reverse",
      "video reverse editor",
      "video reverse prompt generator",
      "how to play video reverse",
    ],
    features: [
      {
        title: "Reverse Any Size Video",
        description: "Unlike other tools limited to 8MB or 10MB, VideoReduce reverses videos of any file size — 100MB, 1GB, or even 4K footage — directly in your browser.",
        icon: "Rewind",
      },
      {
        title: "Reverse Audio or Mute",
        description: "Choose to reverse the audio soundtrack for a true rewind effect, or mute audio entirely for clean silent reverse clips.",
        icon: "Volume2",
      },
      {
        title: "Loop Video in Reverse",
        description: "Create seamless forward-then-reverse loop effects for mesmerizing boomerang-style social media content.",
        icon: "RefreshCw",
      },
      {
        title: "100% Free & Private",
        description: "No app install, no file upload to servers. Edit and reverse videos entirely inside your browser RAM via WebAssembly.",
        icon: "ShieldCheck",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload Any Video",
        description: "Select any MP4, MOV, MKV, or WebM video file of any size from your device.",
      },
      {
        step: 2,
        title: "Choose Reverse Options",
        description: "Select reverse audio, mute audio, or loop video reverse playback mode.",
      },
      {
        step: 3,
        title: "Download Reversed Video",
        description: "Click Reverse and download your backwards-playing video in seconds.",
      },
    ],
    faqs: [
      {
        question: "How to make a video reverse online for free?",
        answer:
          "Upload your video to VideoReduce.com's Video Reverse tool, select whether to reverse audio or mute it, and click Reverse. The WebAssembly engine processes the video entirely in your browser — no server upload, no file size limits, completely free.",
      },
      {
        question: "Can I reverse any size video, not just 8MB or 10MB?",
        answer:
          "Yes! Unlike Discord compressors or other tools that cap files at 8MB or 10MB, VideoReduce.com processes videos of any size — even 1GB+ 4K footage — directly in your browser's memory with zero file restrictions.",
      },
      {
        question: "How to play a video in reverse with audio?",
        answer:
          "Select 'Reverse Audio' mode in VideoReduce's reverse tool. The engine will reverse both the video frames and the audio track, creating a genuine rewind effect where speech and music play backwards.",
      },
      {
        question: "Can I loop a video in reverse (boomerang effect)?",
        answer:
          "Yes! Use the loop reverse option to create a forward-then-backward seamless loop. This is perfect for boomerang-style effects on Instagram, TikTok, and YouTube Shorts.",
      },
      {
        question: "Is this video reverse tool better than a phone app?",
        answer:
          "VideoReduce.com works instantly in any browser (Safari, Chrome, Edge) without installing apps, creating accounts, or dealing with ads and watermarks. It also handles much larger files than most mobile reverse video apps.",
      },
    ],
  },

  // 12. Video Frame Extractor
  {
    id: "frame-extractor",
    slug: "frame-extractor",
    name: "Video Frame Extractor & Screenshot Grabber",
    shortName: "Grab Frame",
    tagline: "Capture HD video frames and screenshots online free — save full resolution PNG/JPG",
    description:
      "Free online video frame extractor and screenshot grabber. Capture pristine, uncompressed full-resolution still photo frames and thumbnail images from any MP4, MOV, MKV, or WebM video at exact millisecond marks with zero quality loss.",
    category: "Conversion",
    iconName: "Eye",
    badge: "HD Snapshot",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".avi"],
    outputExtension: "png",
    outputMimeType: "image/png",
    estimatedSpeed: "Instant",
    seoTitle: "Extract Frame from Video Online Free — Snapshot Grabber",
    seoDescription:
      "Extract HD and 4K frames from video online free. Capture video screenshots as lossless PNG or JPG with exact timeline scrubber — 100% private.",
    seoKeywords: [
      "extract frame from video",
      "extract frame from video online",
      "video screenshot grabber",
      "video to photo converter",
      "capture frame from mp4",
      "take screenshot from video",
      "video frame grabber",
      "save frame from video",
      "video to image converter",
      "extract image from video",
      "high quality video screenshot",
      "video snapshot online",
      "grab thumbnail from video",
      "convert video to photos",
      "extract still image from video",
      "frame by frame video snapshot",
      "4k video frame extractor",
      "video frame capture tool",
      "extract photo from mp4",
      "best video screenshot tool",
    ],
    features: [
      {
        title: "Millisecond Timeline Precision",
        description: "Scrub smoothly through your video to pinpoint and extract the exact frame you want with millisecond accuracy.",
        icon: "SlidersHorizontal",
      },
      {
        title: "Lossless Native Resolution Export",
        description: "Exports images in full native resolution (1080p, 4K, 8K) as uncompressed PNG or lightweight JPG.",
        icon: "Image",
      },
      {
        title: "Instant Sub-Second Snapshot",
        description: "Demuxes and grabs video frames in under 200ms using local browser WebAssembly processing.",
        icon: "Zap",
      },
      {
        title: "100% Private — No Uploads",
        description: "Capture sensitive moments, family clips, or security footage privately on your device without cloud upload.",
        icon: "ShieldCheck",
      },
    ],
    steps: [
      { step: 1, title: "Upload Video File", description: "Select any MP4, MOV, MKV, or WebM video from your device." },
      { step: 2, title: "Scrub to Exact Frame", description: "Use the live interactive timeline slider to navigate to the exact frame." },
      { step: 3, title: "Save High-Res Photo", description: "Click Capture Frame and download your crystal-clear PNG or JPG image." },
    ],
    faqs: [
      {
        question: "How to extract a high-quality frame from a video online?",
        answer:
          "Upload your video to VideoReduce.com's Frame Extractor, drag the timeline slider to your desired moment, and click Capture Frame. The tool exports a lossless, native-resolution image directly from the video stream without browser compression.",
      },
      {
        question: "Is the extracted photo full resolution (1080p or 4K)?",
        answer:
          "Yes! If your source video is 1080p, 4K, or 8K, the image is saved at the exact native pixel dimensions (e.g. 3840x2160 for 4K) without downscaling.",
      },
      {
        question: "How do I take a screenshot from an iPhone video?",
        answer:
          "Upload your iPhone QuickTime .MOV recording into VideoReduce.com in Safari or Chrome, scrub to the frame you want, and save it as a high-res PNG directly to your Photos library.",
      },
      {
        question: "Why is an extracted frame better than a standard screenshot?",
        answer:
          "A regular screen grab is limited by your screen display resolution and UI overlays. VideoReduce extracts the pure raw frame directly from the decoded video stream for maximum visual fidelity.",
      },
      {
        question: "Can I extract multiple thumbnails for YouTube?",
        answer:
          "Yes! Simply scrub to different scenes in your video and click capture on each one to generate multiple HD candidate thumbnail images in seconds.",
      },
    ],
  },

  // 13. Video Filters & Color Grading
  {
    id: "video-filters",
    slug: "video-filters",
    name: "Video Filters & Color Grading",
    shortName: "Color Filters",
    tagline: "Apply video filters and cinematic color grading online free — brightness & contrast",
    description:
      "Free online video filter and color grading tool. Enhance your footage with aesthetic presets (Cyberpunk, Vintage Sepia, Black & White, Warm Sunset) or fine-tune brightness, contrast, saturation, and gamma directly in your browser.",
    category: "Video",
    iconName: "Sun",
    badge: "Cinematic",
    acceptedTypes: ["video/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast",
    seoTitle: "Free Video Color Filters & Grading Online — Effects",
    seoDescription:
      "Apply cinematic video filters, vintage effects, and color grading online free. Adjust brightness, contrast, and saturation in browser with zero upload.",
    seoKeywords: [
      "video color grading online",
      "video filters free",
      "video color filter",
      "adjust video brightness",
      "black and white video filter",
      "vintage video filter",
      "video contrast adjuster",
      "color correction video online",
      "brighten dark video online",
      "video saturation tool",
      "cinematic video filters",
      "sepia video filter",
      "video color editor",
      "enhance video colors",
      "free video effects online",
      "video filter maker",
      "make video black and white",
      "fix dark video online",
      "warm video filter",
      "video visual effects online",
    ],
    features: [
      {
        title: "Cinematic Color Presets",
        description: "One-click aesthetic styles: Cyberpunk Neon, Vintage Film, Sepia Classic, B&W High Contrast, and Warm Sunset.",
        icon: "Palette",
      },
      {
        title: "Fine Slider Tuning",
        description: "Complete control over Brightness, Contrast, Color Saturation, and Gamma curve values.",
        icon: "Sliders",
      },
      {
        title: "Brighten Underexposed Videos",
        description: "Instantly fix dark smartphone and evening footage by boosting exposure and shadow gamma levels.",
        icon: "Sun",
      },
      {
        title: "100% Private & Free",
        description: "Apply filters and color grade videos locally in browser RAM without cloud storage uploads.",
        icon: "ShieldCheck",
      },
    ],
    steps: [
      { step: 1, title: "Upload Video", description: "Select the video clip you want to enhance or filter." },
      { step: 2, title: "Choose Preset or Sliders", description: "Select a cinematic preset or manually adjust brightness, contrast, and saturation." },
      { step: 3, title: "Render & Download", description: "Click Apply Filters and download your beautifully color-graded video." },
    ],
    faqs: [
      {
        question: "How to brighten a dark video online for free?",
        answer:
          "Upload your dark video to VideoReduce.com's Color Filters tool, increase the Brightness and Gamma sliders until shadow details appear clear, and click Apply. The WebAssembly engine renders the brightened clip locally.",
      },
      {
        question: "How to convert a video to Black and White?",
        answer:
          "Select the 'Black & White' preset or drag the Saturation slider to 0. This strips all color channels to create a classic monochrome film aesthetic.",
      },
      {
        question: "Can I add cinematic filters for TikTok or Reels?",
        answer:
          "Yes! Our Cyberpunk and Warm Sunset presets give your clips a vibrant, cinematic look that stands out on TikTok, Instagram Reels, and YouTube Shorts.",
      },
      {
        question: "Does color grading reduce video quality?",
        answer:
          "VideoReduce re-encodes your filtered footage using high-bitrate H.264 profiles with balanced CRF settings to ensure smooth gradients without color banding.",
      },
      {
        question: "What is Gamma adjustment?",
        answer:
          "Gamma adjusts mid-tone luminance without blowing out bright highlights or washing out pure blacks. It's the most natural way to fix underexposed videos.",
      },
    ],
  },

  // 14. GIF to MP4 Video Converter
  {
    id: "gif-to-video",
    slug: "gif-to-video",
    name: "GIF to MP4 Video Converter",
    shortName: "GIF to MP4",
    tagline: "Convert heavy animated GIFs into 95% smaller looping MP4 videos online free",
    description:
      "Convert animated GIF to MP4 video online for free. Transform heavy .gif files from Twitter, Photoshop, Mac, or PC into ultra-lightweight, looping H.264 MP4 videos directly in your browser with zero server uploads.",
    category: "Conversion",
    iconName: "Film",
    badge: "95% Smaller",
    acceptedTypes: ["image/gif"],
    acceptedExtensions: [".gif"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast (Wasm SIMD)",
    seoTitle: "Free GIF to MP4 Converter Online — Convert GIF to Video",
    seoDescription:
      "Convert GIF to MP4 online free with looping and 95% size reduction. Best tool for Twitter, Photoshop, Mac, and PC GIFs with zero uploads.",
    seoKeywords: [
      "gif to mp4",
      "convert gif to mp4",
      "gif to mp4 converter",
      "ezgif gif to mp4",
      "how to convert gif to mp4",
      "twitter gif to mp4",
      "gif to mp4 converter free",
      "convert gif to mp4 free",
      ".gif to mp4",
      "convert gif to mp4 photoshop",
      "how to convert a gif to mp4",
      "convert animated gif to mp4",
      "gif to mp4 loop",
      "change gif to mp4",
      "converting gif to mp4",
      "convert gif to mp4 online free",
      "turn gif to mp4",
      "gif to mp4 online",
      "convert gif to mp4 mac",
      "animated gif to mp4",
    ],
    features: [
      {
        title: "95% File Size Reduction",
        description: "Shrink a bulky 30MB animated GIF into an ultra-lightweight 1.5MB MP4 video with identical visual smoothness.",
        icon: "Minimize2",
      },
      {
        title: "Seamless Looping MP4 Playback",
        description: "Encodes with standard YUV420p and HTML5 video looping flags for instant, stutter-free autoplay.",
        icon: "RefreshCw",
      },
      {
        title: "100% Free & Private (No Uploads)",
        description: "Convert .gif to MP4 directly inside your browser memory via WebAssembly without cloud queues or privacy risks.",
        icon: "ShieldCheck",
      },
      {
        title: "Universal Mac, PC & Mobile Support",
        description: "Easily turn Photoshop, Twitter, or Discord GIFs into universally compatible MP4 videos on Mac, Windows, iOS, and Android.",
        icon: "CheckCircle",
      },
    ],
    steps: [
      {
        step: 1,
        title: "Upload Animated GIF",
        description: "Select any .gif file from your computer, Mac, or phone.",
      },
      {
        step: 2,
        title: "Choose Compression Preset",
        description: "Pick High Quality (CRF 20) or Maximum Compression (CRF 26) with standard H.264 encoding.",
      },
      {
        step: 3,
        title: "Convert to MP4 & Download",
        description: "Click 'Convert to MP4' and download your ultra-lean looping video in seconds.",
      },
    ],
    faqs: [
      {
        question: "How to convert animated GIF to MP4 online for free?",
        answer:
          "Simply drag and drop your .gif file into VideoReduce.com's GIF to MP4 converter and click Convert. The WebAssembly engine decodes each GIF frame and encodes it into standard H.264 MP4 right in your browser.",
      },
      {
        question: "Why is MP4 so much smaller than animated GIF?",
        answer:
          "GIF is an outdated 1987 format that stores every frame as a full uncompressed image. MP4 uses advanced inter-frame video compression (H.264), storing only the differences between frames. This results in up to 95% smaller file sizes with better frame rates.",
      },
      {
        question: "How do I convert Twitter GIFs to MP4?",
        answer:
          "Twitter actually serves its GIFs as video streams. If you have saved a Twitter .gif file, drop it into VideoReduce.com to convert and clean it into a standalone MP4 video that can be shared or embedded anywhere.",
      },
      {
        question: "Can I convert GIF to MP4 on Mac without Photoshop?",
        answer:
          "Yes! Instead of using heavy desktop software like Adobe Photoshop, VideoReduce.com runs entirely in your Mac browser (Safari, Chrome, Firefox) without needing any software installations or subscriptions.",
      },
      {
        question: "How does VideoReduce compare to Ezgif GIF to MP4?",
        answer:
          "Ezgif uploads your file to their remote web server with upload queues and file size restrictions. VideoReduce processes your GIF locally in your browser memory via WebAssembly — offering faster processing, zero file caps, and complete data privacy.",
      },
    ],
  },

  // 15. Volume Booster & Normalizer
  {
    id: "volume-booster",
    slug: "volume-booster",
    name: "Volume Booster & Audio Normalizer",
    shortName: "Boost Volume",
    tagline: "Boost video volume up to 300% or normalize uneven audio online free",
    description:
      "Free online video volume booster and audio normalizer. Amplify quiet voices, low microphone audio, and quiet video clips up to 3x, or apply broadcast-standard EBU R128 loudnorm leveling with lossless video stream-copy.",
    category: "Audio",
    iconName: "Volume2",
    badge: "Up to 300%",
    acceptedTypes: ["video/*", "audio/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".mp3", ".wav"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Instant",
    seoTitle: "Free Video Volume Booster Online — Amplify Audio 300%",
    seoDescription:
      "Boost video volume up to 300% online free. Amplify quiet video audio and normalize sound levels with zero quality loss — no app needed.",
    seoKeywords: [
      "video volume booster",
      "boost video volume",
      "increase video volume",
      "increase volume of video online",
      "video sound booster",
      "audio normalizer online",
      "boost mp4 volume",
      "make video louder online",
      "amplify video audio",
      "fix quiet video audio",
      "loudness normalizer",
      "ebu r128 audio normalizer",
      "video volume amplifier",
      "boost audio in video free",
      "turn up video volume",
      "sound booster for video",
      "make quiet video louder",
      "increase mov volume",
      "audio gain booster online",
      "normalize video volume",
    ],
    features: [
      {
        title: "Up to 300% Clean Audio Gain",
        description: "Amplify quiet microphone recordings and phone videos with clear, artifact-free volume boost presets (150%, 200%, 300%).",
        icon: "Volume2",
      },
      {
        title: "EBU R128 Audio Normalization",
        description: "Broadcast-standard loudness normalization prevents sudden deafening spikes while boosting whisper-quiet dialog.",
        icon: "Radio",
      },
      {
        title: "Zero Video Re-encoding (Instant)",
        description: "Only transcodes the audio track while copying the video stream 1:1, making processing lightning fast with zero video degradation.",
        icon: "Zap",
      },
      {
        title: "100% Private & Free",
        description: "Boost audio levels entirely inside your browser via WebAssembly without uploading files to remote servers.",
        icon: "ShieldCheck",
      },
    ],
    steps: [
      { step: 1, title: "Upload Video or Audio", description: "Select the media file with quiet, muffled, or uneven sound levels." },
      { step: 2, title: "Choose Boost Level", description: "Pick 150%, 200%, 300% amplification or select Automatic EBU Normalization." },
      { step: 3, title: "Download Amplified Video", description: "Save your crystal-clear, loud video immediately." },
    ],
    faqs: [
      {
        question: "How to increase the volume of a video online for free?",
        answer:
          "Upload your video to VideoReduce.com's Volume Booster, select your desired boost multiplier (150%, 200%, or 300%), and click Boost. The tool amplifies the audio track in seconds while keeping the video stream completely untouched.",
      },
      {
        question: "What is EBU R128 Audio Normalization?",
        answer:
          "EBU R128 is an international broadcast standard that balances audio loudness. It automatically boosts quiet whispering and caps loud explosions so your viewers don't need to constantly adjust their volume.",
      },
      {
        question: "Does boosting audio distort the sound?",
        answer:
          "Our booster uses built-in limiter algorithms to prevent digital clipping distortion at 150% and 200% levels. For extreme audio variance, the EBU Normalization preset produces the cleanest result.",
      },
      {
        question: "Does this affect the video quality?",
        answer:
          "Zero impact on video quality. The video stream is stream-copied bit-for-bit, so not a single video pixel is re-compressed.",
      },
      {
        question: "Can I boost volume on iPhone recordings?",
        answer:
          "Yes! Upload quiet iPhone .MOV or .MP4 video recordings directly in Safari or Chrome to boost sound levels without needing any external apps.",
      },
    ],
  },

  // 16. Audio Noise Reduction / De-Noiser
  {
    id: "audio-denoiser",
    slug: "audio-denoiser",
    name: "Audio Noise Reduction & De-Noiser",
    shortName: "De-Noise Audio",
    tagline: "Remove microphone hiss, fan background noise, and AC hum online free",
    description:
      "Free online audio noise reducer for video and audio. Remove background noise, computer fan hiss, room hum, and microphone static using advanced FFT spectral suppression directly in your browser without cloud uploads.",
    category: "Audio",
    iconName: "Mic",
    badge: "Clean Audio",
    acceptedTypes: ["video/*", "audio/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".mp3", ".wav"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Fast",
    seoTitle: "Remove Background Noise from Video Online Free — De-Noiser",
    seoDescription:
      "Remove background noise, fan hiss, and mic hum from video online free. Clean voice audio with WebAssembly spectral noise reduction — 100% private.",
    seoKeywords: [
      "remove background noise from video",
      "remove background noise from video online",
      "audio denoiser online",
      "clean mic hiss",
      "noise reduction video",
      "remove fan noise from video",
      "audio noise removal free",
      "remove static from audio",
      "clean up audio online",
      "background noise remover video",
      "reduce background noise in video",
      "audio cleaner online free",
      "voice clarity enhancer",
      "remove hum from audio",
      "podcast audio denoiser",
      "clean microphone noise",
      "video audio noise filter",
      "remove wind noise from video",
      "audio denoise tool online",
      "best free video noise remover",
    ],
    features: [
      {
        title: "FFT Spectral Noise Suppression",
        description: "Intelligently identifies and removes continuous static, fan noise, electrical hum, and microphone hiss.",
        icon: "Mic",
      },
      {
        title: "Sensitivity Level Adjustments",
        description: "Choose between Light, Balanced, and Aggressive noise suppression to match your recording conditions.",
        icon: "Sliders",
      },
      {
        title: "Enhanced Vocal Clarity",
        description: "Isolates spoken voice frequencies to ensure dialog remains crisp and natural for podcasts, courses, and webinars.",
        icon: "CheckCircle",
      },
      {
        title: "100% Private Processing",
        description: "Clean sensitive audio recordings entirely in your browser RAM without sending audio data to third-party servers.",
        icon: "ShieldCheck",
      },
    ],
    steps: [
      { step: 1, title: "Upload Recording", description: "Select the video or audio file containing unwanted background noise or hiss." },
      { step: 2, title: "Set Noise Threshold", description: "Select Light (subtle), Balanced (recommended), or Deep noise suppression." },
      { step: 3, title: "Download Clean Media", description: "Save your crystal-clear, noise-free video or audio file." },
    ],
    faqs: [
      {
        question: "How to remove background noise from a video online for free?",
        answer:
          "Upload your video to VideoReduce.com's Audio De-Noiser, choose your desired suppression strength (Balanced is recommended), and click Clean Audio. The spectral filter removes background hums and hisses in seconds.",
      },
      {
        question: "What types of noise can this tool remove?",
        answer:
          "It excels at eliminating steady-state continuous sounds such as computer fans, air conditioners, electrical grounding hums, mic preamp hiss, and wind rumble.",
      },
      {
        question: "Will noise removal make voices sound robotic?",
        answer:
          "Our filter uses targeted spectral subtraction calibrated for human vocal formants, ensuring dialog remains warm and natural without the hollow, robotic artifacts common in cheap filters.",
      },
      {
        question: "Can I clean audio on audio-only files like MP3 or WAV?",
        answer:
          "Yes! The tool accepts both video files (MP4, MOV, MKV) and standalone audio files (MP3, WAV, AAC).",
      },
      {
        question: "Is there a file size limit for noise reduction?",
        answer:
          "Because processing happens entirely in your local browser memory, VideoReduce imposes no strict file size limits — even long podcast recordings can be cleaned.",
      },
    ],
  },

  // 17. Metadata & EXIF Stripper
  {
    id: "metadata-stripper",
    slug: "metadata-stripper",
    name: "Metadata & EXIF Privacy Shield",
    shortName: "Strip Metadata",
    tagline: "Remove video metadata, EXIF, GPS location, and device tags online free",
    description:
      "Free online video metadata and EXIF scrubber. Wipe GPS location coordinates, camera serial numbers, author tags, creation timestamps, and device identifiers from MP4, MOV, and MKV files in 1-click before sharing online.",
    category: "Privacy & Pro",
    iconName: "Lock",
    badge: "Privacy Shield",
    acceptedTypes: ["video/*", "audio/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".avi"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Instant (50ms)",
    seoTitle: "Remove Video Metadata & EXIF Online Free — Privacy Shield",
    seoDescription:
      "Remove EXIF metadata, GPS location, and camera tags from video online free in 1-click. Protect privacy before sharing — zero quality loss.",
    seoKeywords: [
      "remove video metadata",
      "strip exif from video",
      "remove gps from mp4",
      "clean video metadata",
      "remove metadata from video online",
      "video exif remover",
      "delete metadata from video",
      "remove location from video",
      "video privacy scrubber",
      "remove device info from video",
      "clear mp4 metadata",
      "remove author tags video",
      "anonymize video file",
      "strip video creation date",
      "exif cleaner for video",
      "remove camera serial from mp4",
      "video privacy cleaner",
      "scrub metadata online free",
      "remove metadata iphone video",
      "best video metadata remover",
    ],
    features: [
      {
        title: "Scrub GPS & Device Identifiers",
        description: "Completely wipes embedded geolocation coordinates, camera model serials, and device hardware signatures.",
        icon: "Lock",
      },
      {
        title: "Sub-Second Stream-Copy Clean",
        description: "Removes header tags in milliseconds without re-encoding media — zero loss in video or audio fidelity.",
        icon: "Zap",
      },
      {
        title: "100% Anonymous Sharing",
        description: "Safely publish footage on YouTube, Reddit, Discord, or Twitter without leaking private location data.",
        icon: "ShieldCheck",
      },
      {
        title: "Multi-Format Support",
        description: "Cleans metadata from MP4, MOV, MKV, WebM, and AVI container formats in one universal tool.",
        icon: "CheckCircle",
      },
    ],
    steps: [
      { step: 1, title: "Upload Video File", description: "Select the video you intend to publish or share online." },
      { step: 2, title: "Click 1-Click Scrub", description: "Click Clean Metadata to instantly strip all EXIF, GPS, and hardware tags." },
      { step: 3, title: "Download Anonymous Video", description: "Save your privacy-protected media file ready for safe sharing." },
    ],
    faqs: [
      {
        question: "What metadata is hidden inside my video files?",
        answer:
          "Modern smartphones and cameras embed detailed metadata including exact GPS latitude/longitude, creation date/time, camera serial number, lens details, and editing software history.",
      },
      {
        question: "How to remove GPS location and metadata from a video?",
        answer:
          "Upload your video to VideoReduce.com's Metadata Privacy Shield and click Clean Metadata. The tool strips all container metadata headers in under 50ms using lossless stream-copy.",
      },
      {
        question: "Does stripping metadata reduce video quality?",
        answer:
          "Not at all. The video and audio streams are copied 1:1 at the binary level. Only the text metadata blocks inside the file header are removed.",
      },
      {
        question: "Why should I clean metadata before posting online?",
        answer:
          "Scrubbing metadata prevents stalkers, advertisers, and bad actors from discovering your home address, daily routine, or personal device serial numbers from shared video files.",
      },
      {
        question: "Can I remove metadata from iPhone QuickTime MOV videos?",
        answer:
          "Yes! iPhone .MOV recordings contain extensive location and sensor metadata. Our tool strips all Apple QuickTime user data tags instantly.",
      },
    ],
  },

  // 18. FFmpeg Developer Terminal
  {
    id: "ffmpeg-terminal",
    slug: "ffmpeg-terminal",
    name: "FFmpeg Developer Terminal",
    shortName: "Wasm Terminal",
    tagline: "Run custom FFmpeg commands in browser with WebAssembly — live terminal logs",
    description:
      "Free browser-based FFmpeg command runner. Execute raw FFmpeg CLI flags, complex filtergraphs (-vf, -af, -filter_complex), custom CRF presets, and video codec pipelines directly in your browser with real-time stderr logs.",
    category: "Privacy & Pro",
    iconName: "Terminal",
    badge: "Dev Mode",
    acceptedTypes: ["video/*", "audio/*", "image/*"],
    acceptedExtensions: [".mp4", ".mov", ".mkv", ".webm", ".avi", ".gif", ".mp3", ".wav"],
    outputExtension: "mp4",
    outputMimeType: "video/mp4",
    estimatedSpeed: "Variable",
    seoTitle: "Online FFmpeg Command Runner — WebAssembly Terminal",
    seoDescription:
      "Run FFmpeg CLI commands online in browser via WebAssembly. Sandbox with recipes, custom filters, and live real-time execution logs.",
    seoKeywords: [
      "ffmpeg online",
      "run ffmpeg in browser",
      "ffmpeg wasm terminal",
      "ffmpeg command runner",
      "online ffmpeg converter",
      "ffmpeg web sandbox",
      "browser ffmpeg terminal",
      "test ffmpeg command online",
      "ffmpeg cli online",
      "ffmpeg webassembly",
      "ffmpeg filter complex online",
      "ffmpeg transcode in browser",
      "online video encoding terminal",
      "ffmpeg script runner",
      "web ffmpeg executor",
      "ffmpeg command builder online",
      "client side ffmpeg",
      "ffmpeg simulator online",
      "run ffmpeg without installing",
      "best online ffmpeg tool",
    ],
    features: [
      {
        title: "Raw FFmpeg CLI Flags",
        description: "Type any valid FFmpeg command arguments: -c:v, -c:a, -crf, -b:v, -vf, -af, -filter_complex, -ss, -t, and more.",
        icon: "Terminal",
      },
      {
        title: "Pre-Built Recipe Templates",
        description: "One-click load templates for 60fps interpolation, black & white desaturation, two-pass encoding, and high-bitrate masters.",
        icon: "FileCode",
      },
      {
        title: "Live Real-Time Stderr Logs",
        description: "View full standard error output stream from the underlying FFmpeg core engine with bitrate and frame metrics.",
        icon: "Activity",
      },
      {
        title: "Zero Installation Needed",
        description: "Test and develop FFmpeg command pipelines right in your browser without setting up local PATH binaries.",
        icon: "Globe",
      },
    ],
    steps: [
      { step: 1, title: "Upload Input Media", description: "Select any video, audio, or image file as your input source." },
      { step: 2, title: "Enter FFmpeg Arguments", description: "Type custom flags or click a pre-built recipe from the menu." },
      { step: 3, title: "Execute & Inspect Logs", description: "Run the WebAssembly engine, observe live logs, and download the output." },
    ],
    faqs: [
      {
        question: "How does the online FFmpeg terminal work?",
        answer:
          "VideoReduce.com compiles the official FFmpeg C codebase into WebAssembly (Wasm) with SIMD multi-threading. It executes your commands directly in your browser's virtual filesystem (MEMFS) without sending data to any server.",
      },
      {
        question: "Can I use complex video filtergraphs (-filter_complex)?",
        answer:
          "Yes! Complex filterchains like scale, overlay, drawtext, fps, hflip, and eq are fully compiled into our Wasm binary.",
      },
      {
        question: "Do I need to install FFmpeg on my computer?",
        answer:
          "No software or binary installation is needed. You can test and run FFmpeg commands on Chromebooks, Macs, Windows PCs, and even mobile browsers.",
      },
      {
        question: "What output formats are supported?",
        answer:
          "You can generate MP4 (H.264/AAC), WebM (VP8/Vorbis), GIF, MP3, WAV, PNG, and JPG outputs.",
      },
      {
        question: "Is there a command execution timeout?",
        answer:
          "Browser tabs maintain memory ceilings, so for best performance we recommend testing clips under 5 minutes or smaller files for rapid iterative prototyping.",
      },
    ],
  },
];

export function getToolBySlug(slug: string): ToolMetadata | undefined {
  return TOOLS.find((tool) => tool.slug === slug || tool.id === slug);
}
