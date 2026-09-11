import { VideoFormat, ToolId } from "@/lib/ffmpeg/types";

export interface FormatPairData {
  slug: string;
  fromFormat: string;
  toFormat: string;
  targetFormatEnum?: string;
  toolSlug: ToolId;
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
    toolSlug: "format-converter",
    title: "MOV to MP4 Converter",
    badge: "iPhone & Apple Fix",
    h1: "Convert Apple MOV to Universal MP4 Online Free",
    tagline: "Transcode iPhone and QuickTime MOV videos to universal H.264 MP4 with 100% in-browser privacy",
    seoTitle: "Convert MOV to MP4 Online Free",
    seoDescription: "Convert Apple QuickTime MOV files to MP4 in your browser with WebAssembly. No upload limits, 100% private, instant web streaming ready.",
    keywords: [
      "convert mov to mp4",
      "iphone mov to mp4 free",
      "apple quicktime to mp4",
      "convert mov to mp4 no limit",
      "play mov on windows",
    ],
    whyConvert:
      "Apple iPhones and iPads record videos in the QuickTime MOV format using ProRes or HEVC encoding. While MOV works seamlessly within macOS and iOS, Windows PC media players, Android phones, smart TVs, and web browsers frequently fail to open MOV files. Transcoding to H.264 MP4 with AAC stereo audio delivers 100% universal hardware playback compatibility across every screen.",
    technicalSpecs: [
      { label: "Input Container", value: "Apple QuickTime (.mov)" },
      { label: "Output Container", value: "MPEG-4 Part 14 (.mp4)" },
      { label: "Video Codec", value: "H.264 (AVC) + FastStart Moov Atom" },
      { label: "Audio Codec", value: "AAC High Efficiency Stereo (192 kbps)" },
      { label: "Execution Engine", value: "Client-Side FFmpeg WebAssembly (Wasm)" },
    ],
    steps: [
      { step: 1, title: "Select MOV Video", desc: "Choose your iPhone or QuickTime MOV recording from your local device." },
      { step: 2, title: "Choose MP4 Profile", desc: "Select high-quality CRF 22 or balanced compression profile." },
      { step: 3, title: "Convert & Download", desc: "Transcode instantly in local RAM and download your universal MP4." },
    ],
    faqs: [
      {
        q: "Does converting MOV to MP4 reduce video quality?",
        a: "No. VideoReduce uses high-fidelity H.264 transcoding with bicubic lanczos scaling, retaining crisp 1080p and 4K visual details without artificial compression artifacts.",
      },
      {
        q: "Why won't my iPhone MOV video play on Windows Media Player?",
        a: "Windows lacks native support for proprietary Apple ProRes and certain HEVC MOV container flags. Transcoding to H.264 MP4 solves playback errors instantly.",
      },
      {
        q: "Is there any file size limit for MOV conversions?",
        a: "Unlike cloud converters that cap uploads at 100MB or 1GB, VideoReduce operates in your browser memory via WebAssembly, allowing multi-gigabyte files to process without cloud quotas.",
      },
      {
        q: "Are my personal videos uploaded to external servers?",
        a: "Zero bytes leave your computer. All video frames are transcoded locally in browser memory, ensuring complete privacy for medical, legal, and personal footage.",
      },
    ],
  },
  {
    slug: "mkv-to-mp4",
    fromFormat: "MKV",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "MKV to MP4 Converter",
    badge: "Matroska Repack",
    h1: "Convert MKV to MP4 Online Without Quality Loss",
    tagline: "Convert Matroska MKV videos into universal MP4 container for smart TVs, phones, and browsers",
    seoTitle: "Convert MKV to MP4 Online Free",
    seoDescription: "Convert MKV to MP4 format online without quality loss. Runs locally in your browser with WebAssembly, 0 server uploads.",
    keywords: [
      "convert mkv to mp4",
      "mkv to mp4 without quality loss",
      "fast mkv to mp4 converter",
      "play mkv on iphone smart tv",
      "obs mkv to mp4 online",
    ],
    whyConvert:
      "MKV (Matroska) is a flexible open container frequently used by OBS Studio, gaming recorders, and high-definition video rips. However, Apple iOS, QuickTime, Safari, Premiere Pro, and many smart TVs do not support MKV playback or import. Converting to MP4 repackages or re-encodes the stream for flawless playback across all players.",
    technicalSpecs: [
      { label: "Input Container", value: "Matroska (.mkv)" },
      { label: "Output Container", value: "Universal MP4 (.mp4)" },
      { label: "Transcode Speed", value: "Ultra-Fast (Wasm SIMD Multi-Threading)" },
      { label: "Subtitle Support", value: "Burn-in or Stream Passthrough" },
      { label: "Audio Output", value: "AAC 2.0 Stereo / 5.1 Surround" },
    ],
    steps: [
      { step: 1, title: "Select MKV File", desc: "Upload your OBS recording or Matroska movie file." },
      { step: 2, title: "Select MP4 Target", desc: "Choose optimal H.264 transcode settings." },
      { step: 3, title: "Save MP4 Video", desc: "Download your newly formatted MP4 ready for editing or streaming." },
    ],
    faqs: [
      {
        q: "Can I convert large OBS Studio MKV recordings?",
        a: "Yes! Because the conversion executes directly on your local device RAM, you can transcode multi-gigabyte OBS gaming sessions without cloud upload throttling.",
      },
      {
        q: "How do I import MKV into Adobe Premiere Pro or DaVinci Resolve?",
        a: "Premiere Pro and DaVinci Resolve do not natively read MKV containers. Converting them to H.264 MP4 makes them immediately importable into your editing timeline.",
      },
      {
        q: "Does MKV to MP4 conversion preserve 60 FPS video?",
        a: "Yes, our FFmpeg WebAssembly engine preserves the original source frame rate (including 60fps and 120fps) and audio sync.",
      },
      {
        q: "Will audio remain in sync after conversion?",
        a: "VideoReduce applies strict presentation timestamp (PTS) rectification to ensure zero audio drift across long video recordings.",
      },
    ],
  },
  {
    slug: "webm-to-mp4",
    fromFormat: "WebM",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "WebM to MP4 Converter",
    badge: "Web Video Fix",
    h1: "Convert WebM to MP4 Online (Fast & Free)",
    tagline: "Convert Google WebM and VP8/VP9 videos into standard MP4 for editing and sharing",
    seoTitle: "Convert WebM to MP4 Online Free",
    seoDescription: "Convert WebM videos to MP4 format with WebAssembly in your browser. 100% private, free, and compatible with iPhone and Premiere Pro.",
    keywords: [
      "convert webm to mp4",
      "webm to mp4 converter free",
      "convert webm to mp4 iphone",
      "open webm in premiere pro",
      "chrome screen recording to mp4",
    ],
    whyConvert:
      "WebM is an open web media container using VP8, VP9, or AV1 video codecs and Opus audio, standard for HTML5 browser playback and Chrome screen recordings. However, non-Chromium apps, Apple QuickTime, Final Cut Pro, and older mobile platforms cannot open WebM files. Converting WebM to H.264 MP4 unlocks complete editing and sharing flexibility.",
    technicalSpecs: [
      { label: "Input Codec", value: "VP8 / VP9 / AV1 + Opus Audio" },
      { label: "Output Codec", value: "H.264 (AVC) + AAC Audio" },
      { label: "Hardware Support", value: "100% GPU Accelerated Playback" },
      { label: "Metadata", value: "FastStart Atom for Instant Web Streaming" },
    ],
    steps: [
      { step: 1, title: "Select WebM File", desc: "Upload your browser screen recording or downloaded WebM clip." },
      { step: 2, title: "Configure Quality", desc: "Select MP4 output with default crisp CRF 23 encoding." },
      { step: 3, title: "Download MP4", desc: "Save your universal MP4 video to disk." },
    ],
    faqs: [
      {
        q: "Can I convert Chrome and Loom WebM screen captures to MP4?",
        a: "Yes. Browser screen recordings saved as .webm can be converted to MP4 in seconds with perfect video-audio synchronization.",
      },
      {
        q: "Why does my iPhone refuse to open WebM files?",
        a: "iOS Safari and Photos apps have restricted support for WebM containers and Opus audio. Converting to MP4 allows seamless playback in the Apple Photos app.",
      },
      {
        q: "Is the audio converted from Opus to AAC?",
        a: "Yes, the audio stream is transcoded into high-bitrate AAC stereo, ensuring compatibility with all media players and social apps.",
      },
      {
        q: "Can I upload converted MP4s directly to Instagram or TikTok?",
        a: "Yes. The generated MP4 files strictly comply with Instagram, TikTok, and YouTube upload standards.",
      },
    ],
  },
  {
    slug: "avi-to-mp4",
    fromFormat: "AVI",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "AVI to MP4 Converter",
    badge: "Legacy Video Fix",
    h1: "Convert AVI to MP4 Online (Modern Web Standard)",
    tagline: "Convert old AVI videos into modern, lightweight MP4 videos with up to 85% size savings",
    seoTitle: "Convert AVI to MP4 Online Free",
    seoDescription: "Convert legacy AVI video files to modern H.264 MP4 format online. Reduce file size and enable playback on modern phones.",
    keywords: [
      "convert avi to mp4",
      "avi to mp4 converter free",
      "modernize old avi video",
      "play avi on iphone",
      "compress large avi file",
    ],
    whyConvert:
      "Audio Video Interleave (AVI) is a legacy container introduced by Microsoft in 1992. AVI files lack modern compression efficiency, creating bloated multi-gigabyte files that fail to play on iPhones, iPads, modern smart TVs, and web browsers. Converting AVI to H.264 MP4 modernizes your archive and cuts file sizes by up to 85% while boosting visual fidelity.",
    technicalSpecs: [
      { label: "Input Container", value: "Audio Video Interleave (.avi)" },
      { label: "Output Container", value: "Modern MP4 (.mp4)" },
      { label: "File Size Reduction", value: "Up to 85% Smaller Footprint" },
      { label: "Audio Transcode", value: "PCM / MP3 to High-Efficiency AAC" },
    ],
    steps: [
      { step: 1, title: "Select AVI Video", desc: "Choose your legacy camcorder or archive AVI video." },
      { step: 2, title: "Modernize to MP4", desc: "Select H.264 standard profile for maximum compatibility." },
      { step: 3, title: "Download", desc: "Save the streamlined, lightweight MP4 file." },
    ],
    faqs: [
      {
        q: "Why are AVI files so excessively large?",
        a: "AVI uses outdated codecs (like DivX, Xvid, or uncompressed PCM) that lack modern inter-frame compression algorithms. H.264 MP4 provides 5x to 10x better data compression.",
      },
      {
        q: "Can I play the converted video on iPhone and Mac?",
        a: "Yes. MP4 files encoded with H.264 and AAC play natively on iOS, macOS, QuickTime, and Apple TV without third-party codec packs.",
      },
      {
        q: "Does converting AVI improve video quality?",
        a: "While conversion cannot recreate missing camera detail, modern bicubic de-interlacing and color space normalization make vintage AVI clips look significantly cleaner.",
      },
      {
        q: "Can I convert home camcorder DV-AVI files?",
        a: "Yes, VideoReduce supports DV-AVI, DivX, Xvid, and MJPEG AVI formats directly in browser memory.",
      },
    ],
  },
  {
    slug: "flv-to-mp4",
    fromFormat: "FLV",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "FLV to MP4 Converter",
    badge: "Flash Video Recovery",
    h1: "Convert FLV Flash Video to MP4 Online Free",
    tagline: "Recover legacy Adobe Flash FLV videos and transcode Sorenson/VP6 streams into modern universal MP4",
    seoTitle: "Convert FLV to MP4 Online Free",
    seoDescription: "Convert Flash FLV videos to MP4 format online for free. In-browser WebAssembly conversion restores unplayable vintage FLV clips.",
    keywords: [
      "convert flv to mp4",
      "flv to mp4 converter free",
      "play flv on iphone mac",
      "flash video to mp4 online",
      "recover old flv files",
    ],
    whyConvert:
      "Adobe Flash Video (FLV) was once the dominant video standard for YouTube and web animations in the 2000s. Since Adobe officially discontinued Flash Player, FLV files cannot be played on modern operating systems, smartphones, or web browsers. Converting FLV to H.264 MP4 resurrects historic web archives, retro tutorials, and downloaded videos for modern viewing.",
    technicalSpecs: [
      { label: "Input Container", value: "Flash Video (.flv)" },
      { label: "Legacy Codecs", value: "Sorenson Spark (FLV1) / VP6 / Screen Video" },
      { label: "Output Format", value: "MPEG-4 Part 14 (.mp4)" },
      { label: "Target Codec", value: "H.264 / AAC 48kHz Stereo" },
    ],
    steps: [
      { step: 1, title: "Select FLV Video", desc: "Select your legacy .flv file from disk." },
      { step: 2, title: "Choose Transcode Preset", desc: "Select MP4 with high compatibility flags." },
      { step: 3, title: "Download Modern MP4", desc: "Save and watch on any modern phone, tablet, or PC." },
    ],
    faqs: [
      {
        q: "Why can't modern browsers play FLV videos anymore?",
        a: "All major web browsers completely removed Flash runtime support due to security vulnerabilities. Converting FLV to H.264 MP4 restores full HTML5 playback.",
      },
      {
        q: "Does this tool support Sorenson Spark and On2 VP6 codecs?",
        a: "Yes. Our WebAssembly FFmpeg build includes full decoder support for legacy Sorenson Spark, VP6A, VP6F, and Nellymoser audio.",
      },
      {
        q: "Is it possible to convert multi-gigabyte FLV collections?",
        a: "Yes, you can convert FLV files one by one with no cloud upload queues or daily bandwidth caps.",
      },
      {
        q: "Will the audio and video remain synchronized?",
        a: "Legacy FLV files often have variable frame rates (VFR). VideoReduce automatically normalizes timestamps to constant frame rate (CFR) to prevent audio desync.",
      },
    ],
  },
  {
    slug: "wmv-to-mp4",
    fromFormat: "WMV",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "WMV to MP4 Converter",
    badge: "Windows Media Fix",
    h1: "Convert Windows Media WMV to Universal MP4 Online",
    tagline: "Transcode Windows Media VC-1 and WMV9 videos into universal MP4 for iPhone, Mac, and Android",
    seoTitle: "Convert WMV to MP4 Online Free",
    seoDescription: "Convert Windows Media WMV videos to MP4 format online. 100% private in-browser transcode, play Windows videos on Mac and iPhone.",
    keywords: [
      "convert wmv to mp4",
      "wmv to mp4 online free",
      "play wmv on mac iphone",
      "windows media video to mp4",
      "wmv converter no limit",
    ],
    whyConvert:
      "Windows Media Video (WMV) was engineered specifically for Microsoft Windows and Windows Media Player. Apple devices (iPhone, iPad, Mac QuickTime), Linux systems, and modern smart TVs lack built-in decoders for proprietary WMV7, WMV8, and VC-1 streams. Converting WMV to MP4 enables seamless cross-platform playback without installing third-party plugins.",
    technicalSpecs: [
      { label: "Input Container", value: "Advanced Systems Format (.wmv / .asf)" },
      { label: "Input Video Codec", value: "WMV1 / WMV2 / WMV3 / VC-1" },
      { label: "Output Codec", value: "H.264 (AVC) Baseline/High Profile" },
      { label: "Audio Conversion", value: "WMA (Windows Media Audio) ➔ AAC" },
    ],
    steps: [
      { step: 1, title: "Upload WMV File", desc: "Select your Windows Media recording." },
      { step: 2, title: "Convert to MP4", desc: "Transcode VC-1 and WMA tracks into universal H.264/AAC." },
      { step: 3, title: "Save Video", desc: "Download and play on Apple, Android, or web platforms." },
    ],
    faqs: [
      {
        q: "Can I play converted WMV files on Mac QuickTime?",
        a: "Yes! Converting WMV to H.264 MP4 makes the video immediately playable in macOS QuickTime and editable in Final Cut Pro and iMovie.",
      },
      {
        q: "What happens to the WMA audio track?",
        a: "The proprietary Windows Media Audio (WMA) stream is transcoded into high-quality AAC stereo, universally supported across all devices.",
      },
      {
        q: "Does WMV to MP4 conversion reduce file size?",
        a: "In most cases yes. H.264 encoding achieves superior compression efficiency compared to older WMV7/WMV8 codecs.",
      },
      {
        q: "Is my Windows corporate video kept confidential?",
        a: "Yes. Processing occurs 100% locally in your browser memory via WebAssembly with zero network uploads, guaranteeing enterprise confidentiality.",
      },
    ],
  },
  {
    slug: "3gp-to-mp4",
    fromFormat: "3GP",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "3GP to MP4 Converter",
    badge: "Vintage Mobile Fix",
    h1: "Convert Old 3GP Mobile Videos to MP4 Online",
    tagline: "Restore legacy 3GPP feature phone recordings and modernize AMR audio into crystal-clear MP4",
    seoTitle: "Convert 3GP to MP4 Online Free",
    seoDescription: "Convert old 3GP and 3G2 mobile phone videos to MP4 format online. In-browser tool restores vintage mobile memories with modern audio.",
    keywords: [
      "convert 3gp to mp4",
      "3gp to mp4 converter free",
      "play 3gp video on pc",
      "old mobile phone video to mp4",
      "convert 3gpp to mp4 online",
    ],
    whyConvert:
      "3GP (3GPP) was designed for early 2G and 3G cellular phones to save mobile bandwidth and storage. 3GP files use low-bitrate H.263 video and AMR-NB voice codecs that modern video editing software and streaming platforms reject. Converting 3GP to modern MP4 standardizes the frame rate, updates audio to AAC, and ensures your vintage family memories remain viewable forever.",
    technicalSpecs: [
      { label: "Input Container", value: "3GPP / 3GPP2 (.3gp / .3g2)" },
      { label: "Legacy Codecs", value: "H.263 / MPEG-4 Part 2 + AMR-NB Audio" },
      { label: "Output Container", value: "MPEG-4 Part 14 (.mp4)" },
      { label: "Audio Upgrade", value: "AMR-NB ➔ High-Quality AAC Stereo" },
    ],
    steps: [
      { step: 1, title: "Select 3GP Video", desc: "Select your vintage mobile phone clip." },
      { step: 2, title: "Modernize Settings", desc: "Choose MP4 format to re-encode video and AMR audio." },
      { step: 3, title: "Download", desc: "Save and share your restored video on modern social apps." },
    ],
    faqs: [
      {
        q: "Why do modern video editors fail to import 3GP clips?",
        a: "Modern NLEs like Premiere Pro and DaVinci Resolve have deprecated legacy H.263 and AMR-NB audio decoders. Converting to MP4 solves import errors.",
      },
      {
        q: "Can I upscale low-resolution 3GP videos?",
        a: "VideoReduce scales 3GP videos with high-quality bicubic interpolation so they display cleanly on modern high-resolution displays.",
      },
      {
        q: "Will the AMR voice audio be clear?",
        a: "Yes, our audio engine resamples 8kHz AMR speech into 48kHz AAC stereo with volume normalization.",
      },
      {
        q: "Can I convert .3g2 files from CDMA phones?",
        a: "Yes, both 3GP (GSM) and 3G2 (CDMA) containers are fully supported.",
      },
    ],
  },
  {
    slug: "vob-to-mp4",
    fromFormat: "VOB",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "VOB to MP4 Converter",
    badge: "DVD Rip & Digitize",
    h1: "Convert DVD VOB Files to MP4 Online Free",
    tagline: "Digitize DVD Video Object (VOB) MPEG-2 streams into lightweight, universal H.264 MP4 videos",
    seoTitle: "Convert VOB to MP4 Online Free",
    seoDescription: "Convert DVD VOB video files to MP4 format online without quality loss. In-browser WebAssembly digitizes home DVD movies privately.",
    keywords: [
      "convert vob to mp4",
      "vob to mp4 converter free",
      "digitize dvd vob files",
      "play vob file on iphone pc",
      "convert dvd video object to mp4",
    ],
    whyConvert:
      "VOB (Video Object) is the core container format found inside DVD-Video VIDEO_TS folders. VOB files contain interlaced MPEG-2 video, AC-3 multi-channel audio, and DVD menu structures. Since modern laptops lack optical drives and mobile phones cannot open VOB streams, converting VOB to MP4 deinterlaces the video and creates a single portable digital file.",
    technicalSpecs: [
      { label: "Input Format", value: "DVD Video Object (.vob)" },
      { label: "Input Video Stream", value: "MPEG-2 Video (Interlaced 480i/576i)" },
      { label: "Deinterlacing", value: "Yadif Deinterlacer Enabled" },
      { label: "Output Format", value: "Progressive H.264 MP4 (.mp4)" },
    ],
    steps: [
      { step: 1, title: "Select VOB File", desc: "Select the VOB file from your DVD VIDEO_TS folder." },
      { step: 2, title: "Auto-Deinterlace to MP4", desc: "Transcode MPEG-2 stream into progressive H.264." },
      { step: 3, title: "Save Digital MP4", desc: "Download and watch your home DVD movie anywhere." },
    ],
    faqs: [
      {
        q: "Does conversion remove jagged interlacing lines from DVD videos?",
        a: "Yes! VideoReduce automatically applies hardware-level deinterlacing to eliminate comb-like horizontal scan lines from old DVD recordings.",
      },
      {
        q: "How much smaller will the converted MP4 file be?",
        a: "A 1GB VOB MPEG-2 file typically compresses down to 250MB–350MB in H.264 MP4 with equal or improved visual clarity.",
      },
      {
        q: "What happens to the AC-3 5.1 Dolby Digital audio?",
        a: "Our audio processor transcodes AC-3 audio into crisp AAC stereo or surround stream, fully compatible with mobile speakers.",
      },
      {
        q: "Can I convert multi-gigabyte VOB files?",
        a: "Yes. With local browser memory processing, you can convert full-length DVD VOB files with zero cloud upload waiting.",
      },
    ],
  },
  {
    slug: "m4v-to-mp4",
    fromFormat: "M4V",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "M4V to MP4 Converter",
    badge: "Apple Container Fix",
    h1: "Convert Apple M4V to Universal MP4 Online",
    tagline: "Convert iTunes and Apple M4V video containers to standard MP4 for Android and Windows devices",
    seoTitle: "Convert M4V to MP4 Online Free",
    seoDescription: "Convert Apple M4V video files to MP4 format online for free. Fast, lossless in-browser conversion for Android, Windows, and TV playback.",
    keywords: [
      "convert m4v to mp4",
      "m4v to mp4 converter free",
      "play m4v on android windows",
      "itunes m4v to mp4 online",
      "m4v to mp4 lossless",
    ],
    whyConvert:
      "M4V is a video container format developed by Apple, very similar to MP4 but specifically tailored for Apple devices, iTunes, and QuickTime. Many non-Apple applications, Android media players, and smart televisions fail to recognize the .m4v file extension. Converting M4V to standard MP4 unlocks universal playback on all non-Apple hardware.",
    technicalSpecs: [
      { label: "Input Container", value: "Apple M4V (.m4v)" },
      { label: "Output Container", value: "MPEG-4 Part 14 (.mp4)" },
      { label: "Conversion Mode", value: "Lossless Stream Repackage / Fast Transcode" },
      { label: "Audio Channels", value: "Stereo 2.0 / Surround 5.1" },
    ],
    steps: [
      { step: 1, title: "Select M4V Video", desc: "Select your Apple or iTunes export file." },
      { step: 2, title: "Select MP4 Target", desc: "Choose MP4 container formatting." },
      { step: 3, title: "Download", desc: "Save and play on Windows, Android, Linux, or smart TVs." },
    ],
    faqs: [
      {
        q: "What is the difference between M4V and MP4?",
        a: "M4V is Apple's variation of MP4 with optional Apple chapter markers and AC3 audio handling. Standard MP4 is universally recognized across all non-Apple devices.",
      },
      {
        q: "Can I convert DRM-free personal M4V videos?",
        a: "Yes. Any unencrypted personal, podcast, or screen recording M4V file can be converted instantly.",
      },
      {
        q: "Is there any quality loss during M4V to MP4 conversion?",
        a: "No quality loss occurs when remuxing compatible H.264 streams into the MP4 container.",
      },
      {
        q: "Will subtitles and audio tracks be preserved?",
        a: "Yes, primary audio channels and video tracks are seamlessly preserved in the output MP4.",
      },
    ],
  },
  {
    slug: "ts-to-mp4",
    fromFormat: "TS",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "TS to MP4 Converter",
    badge: "Broadcast Stream Fix",
    h1: "Convert MPEG Transport Stream (TS) to MP4 Online",
    tagline: "Convert IPTV, DVB broadcast, and digital TV Transport Stream recordings into shareable MP4",
    seoTitle: "Convert TS to MP4 Online Free",
    seoDescription: "Convert MPEG-2/H.264 TS (Transport Stream) video files to MP4 format online. Private in-browser tool optimizes broadcast recordings.",
    keywords: [
      "convert ts to mp4",
      "ts to mp4 converter free",
      "play ts video on iphone mac",
      "iptv transport stream to mp4",
      "mpeg transport stream converter",
    ],
    whyConvert:
      "MPEG Transport Stream (TS / M2TS) is the global standard for digital TV broadcasts (DVB, ATSC), satellite TV, and IPTV streams. TS containers are designed for noisy broadcast environments and contain error correction packets that make files excessively large and unplayable on mobile phones and web browsers. Converting TS to MP4 eliminates broadcast overhead and delivers smooth web playback.",
    technicalSpecs: [
      { label: "Input Container", value: "MPEG Transport Stream (.ts / .m2ts / .mts)" },
      { label: "Output Container", value: "Universal MP4 (.mp4)" },
      { label: "Payload Codec", value: "MPEG-2 / H.264 / H.265 Transcode" },
      { label: "Optimization", value: "Stream Header De-jittering & PTS Sync" },
    ],
    steps: [
      { step: 1, title: "Select TS Video", desc: "Select your digital TV or IPTV TS recording." },
      { step: 2, title: "Transcode to MP4", desc: "Select high-efficiency H.264 MP4 output." },
      { step: 3, title: "Save MP4 File", desc: "Download and stream smoothly on phone or PC." },
    ],
    faqs: [
      {
        q: "Why do IPTV TS recordings stutter on regular media players?",
        a: "TS broadcast files often have timestamp discontinuities and missing sync frames. VideoReduce rebuilds the presentation timestamps during conversion to ensure smooth playback.",
      },
      {
        q: "Can I convert camcorder .M2TS and .MTS files?",
        a: "Yes, AVCHD camcorder files (.m2ts and .mts) from Sony, Panasonic, and Canon are fully supported.",
      },
      {
        q: "Does converting TS to MP4 shrink file size?",
        a: "Yes, stripping transport packet headers and re-encoding with modern H.264 cuts file sizes by up to 60%.",
      },
      {
        q: "Can I convert multi-hour sports broadcasts?",
        a: "Yes. Processing occurs inside your local browser memory with WebAssembly, allowing large files to convert without cloud restrictions.",
      },
    ],
  },
  {
    slug: "ogv-to-mp4",
    fromFormat: "OGV",
    toFormat: "MP4",
    targetFormatEnum: "mp4",
    toolSlug: "format-converter",
    title: "OGV to MP4 Converter",
    badge: "Ogg Theora Modernizer",
    h1: "Convert Ogg OGV Video to MP4 Online Free",
    tagline: "Convert open-source Ogg Theora OGV videos into modern H.264 MP4 for mobile and social media",
    seoTitle: "Convert OGV to MP4 Online Free",
    seoDescription: "Convert Ogg OGV and Theora video files to MP4 format online for free. WebAssembly-powered converter brings open-source video to all devices.",
    keywords: [
      "convert ogv to mp4",
      "ogv to mp4 converter free",
      "ogg theora to mp4 online",
      "play ogv on iphone windows",
      "convert ogg video to mp4",
    ],
    whyConvert:
      "OGV (Ogg Video) is a free, open container format utilizing the Theora video codec and Vorbis audio. While celebrated in the open-source Linux community and Wikipedia, OGV has virtually zero native hardware support on iOS, macOS QuickTime, Windows Media Player, and social media platforms. Converting OGV to MP4 provides universal playback across every operating system.",
    technicalSpecs: [
      { label: "Input Container", value: "Ogg Media (.ogv / .ogg)" },
      { label: "Input Codec", value: "Theora Video + Vorbis Audio" },
      { label: "Output Format", value: "H.264 / AAC MP4 (.mp4)" },
      { label: "Color Space", value: "YUV420p Standard Gamut" },
    ],
    steps: [
      { step: 1, title: "Select OGV File", desc: "Select your Ogg Theora video." },
      { step: 2, title: "Select MP4 Preset", desc: "Choose standard H.264 profile." },
      { step: 3, title: "Download", desc: "Save and share on WhatsApp, Instagram, or YouTube." },
    ],
    faqs: [
      {
        q: "Why won't Safari and QuickTime play OGV files?",
        a: "Apple has never included native support for Ogg Theora or Vorbis codecs. Converting to standard MP4 solves compatibility on all Apple devices.",
      },
      {
        q: "Will the Vorbis audio track be converted?",
        a: "Yes, Vorbis audio is transcoded to high-fidelity 192kbps AAC stereo.",
      },
      {
        q: "Can I convert Wikipedia video downloads in OGV format?",
        a: "Yes. Many Wikimedia Commons videos are archived in OGV; converting them to MP4 allows you to use them in standard video editors.",
      },
      {
        q: "Is there any software installation required?",
        a: "None. VideoReduce executes entirely in your web browser via WebAssembly with zero plugin requirements.",
      },
    ],
  },
  {
    slug: "mp4-to-webm",
    fromFormat: "MP4",
    toFormat: "WebM",
    targetFormatEnum: "webm",
    toolSlug: "format-converter",
    title: "MP4 to WebM Converter",
    badge: "HTML5 Web Ready",
    h1: "Convert MP4 to WebM Online Free (HTML5 Video)",
    tagline: "Compress and encode MP4 videos into lightweight VP9/VP8 WebM for ultra-fast website background video loading",
    seoTitle: "Convert MP4 to WebM Online Free",
    seoDescription: "Convert MP4 videos to WebM format online with WebAssembly. Create lightweight, royalty-free HTML5 video embeds with zero quality loss.",
    keywords: [
      "convert mp4 to webm",
      "mp4 to webm converter free",
      "html5 webm video converter",
      "compress mp4 for website background",
      "vp9 webm online converter",
    ],
    whyConvert:
      "WebM is an open-source, royalty-free media container developed by Google, tailored specifically for HTML5 web streaming. Converting MP4 to WebM (VP9/Opus) reduces video file sizes by an extra 25% to 40% compared to standard H.264, speeding up website page loads and cutting cloud CDN bandwidth bills.",
    technicalSpecs: [
      { label: "Input Container", value: "MPEG-4 Part 14 (.mp4)" },
      { label: "Output Container", value: "Google WebM (.webm)" },
      { label: "Video Codec", value: "VP8 / VP9 Web Stream" },
      { label: "Audio Codec", value: "Opus High-Fidelity Audio" },
      { label: "Use Case", value: "Website Heroes, Background Loops, Web Apps" },
    ],
    steps: [
      { step: 1, title: "Select MP4 Video", desc: "Choose your high-definition MP4 video." },
      { step: 2, title: "Select WebM Output", desc: "Configure WebM compression settings for web delivery." },
      { step: 3, title: "Download WebM", desc: "Embed into your HTML5 `<video>` tag with instant loading." },
    ],
    faqs: [
      {
        q: "Why should I use WebM instead of MP4 for my website?",
        a: "WebM files with VP9 encoding are up to 35% smaller than H.264 MP4s at equivalent visual quality, improving your Google Core Web Vitals and page speed score.",
      },
      {
        q: "Do all modern web browsers support WebM playback?",
        a: "Yes! Google Chrome, Mozilla Firefox, Microsoft Edge, and modern Apple Safari (iOS 15+ / macOS Big Sur+) all natively play WebM video.",
      },
      {
        q: "Can I create looping background hero videos without audio?",
        a: "Yes. You can pair WebM conversion with audio muting to produce ultra-compact background loops for modern landing pages.",
      },
      {
        q: "Are files uploaded to an external server during conversion?",
        a: "No. Conversion runs locally in your browser memory via WebAssembly, guaranteeing zero upload bandwidth consumption.",
      },
    ],
  },
  {
    slug: "mp4-to-gif",
    fromFormat: "MP4",
    toFormat: "GIF",
    targetFormatEnum: "gif",
    toolSlug: "video-to-gif",
    title: "MP4 to GIF Converter",
    badge: "High-FPS Animation",
    h1: "Convert MP4 Video to Animated GIF Online Free",
    tagline: "Turn video clips into silky-smooth, high-quality animated GIFs with custom FPS, resolution, and palette optimization",
    seoTitle: "Convert MP4 to GIF Online Free",
    seoDescription: "Convert MP4 videos to high-quality animated GIFs in your browser. Custom frame rates, 256-color palette optimization, and zero upload limits.",
    keywords: [
      "convert mp4 to gif",
      "mp4 to gif converter free",
      "high quality video to gif",
      "make animated gif from mp4",
      "video to gif no watermark",
    ],
    whyConvert:
      "Animated GIFs are universally supported across Discord, Slack, GitHub READMEs, email newsletters, and Twitter/X feeds where embedded video players may be restricted. Converting an MP4 clip to an optimized GIF with two-pass color quantization produces crisp, high-framerate animations without pixelated dithering artifacts.",
    technicalSpecs: [
      { label: "Input Format", value: "MPEG-4 Part 14 (.mp4)" },
      { label: "Output Format", value: "CompuServe GIF89a (.gif)" },
      { label: "Palette Engine", value: "Two-Pass PaletteGen & PaletteUse" },
      { label: "Configurable FPS", value: "10 fps to 30 fps" },
      { label: "Loop Control", value: "Infinite Loop / Custom Iterations" },
    ],
    steps: [
      { step: 1, title: "Upload MP4 Clip", desc: "Choose your video snippet." },
      { step: 2, title: "Tune GIF Settings", desc: "Adjust frame rate (FPS), width, and playback speed." },
      { step: 3, title: "Generate & Download", desc: "Download your crisp animated GIF with zero watermarks." },
    ],
    faqs: [
      {
        q: "How does VideoReduce prevent ugly grain and dithering in GIFs?",
        a: "We generate a custom 256-color palette tailored specifically to your clip's color histogram using FFmpeg's two-pass palettegen filter.",
      },
      {
        q: "Can I make GIFs for Discord and Slack emojis?",
        a: "Yes! Set the width to 128px or 256px to create perfectly sized custom animated emojis for Slack and Discord.",
      },
      {
        q: "Is there any watermark on the exported GIF?",
        a: "Never. All exports are 100% clean and free of watermarks or branding.",
      },
      {
        q: "What is the recommended duration for a video GIF?",
        a: "For optimal GIF file size and fast loading, we recommend converting clips between 2 to 10 seconds in length.",
      },
    ],
  },
  {
    slug: "mov-to-gif",
    fromFormat: "MOV",
    toFormat: "GIF",
    targetFormatEnum: "gif",
    toolSlug: "video-to-gif",
    title: "MOV to GIF Converter",
    badge: "Apple & Live Photo GIF",
    h1: "Convert Apple MOV to Animated GIF Online Free",
    tagline: "Transform iPhone QuickTime videos and Live Photos into crisp, lightweight animated GIFs for chat and social media",
    seoTitle: "Convert MOV to GIF Online Free",
    seoDescription: "Convert Apple MOV files and iPhone videos to animated GIFs online. 100% private in-browser tool with color palette optimization and no watermarks.",
    keywords: [
      "convert mov to gif",
      "mov to gif converter free",
      "iphone video to gif online",
      "apple quicktime to animated gif",
      "convert live photo mov to gif",
    ],
    whyConvert:
      "iPhones capture beautiful high-definition QuickTime MOV clips and Live Photos that look stunning in Apple Photos. However, sending MOV clips over Discord, Slack, or Reddit often requires external video players. Converting MOV to animated GIF makes your Apple footage immediately previewable in inline chat feeds and forum posts.",
    technicalSpecs: [
      { label: "Input Format", value: "Apple QuickTime (.mov)" },
      { label: "Output Format", value: "Animated GIF (.gif)" },
      { label: "Dithering Algorithm", value: "Bayer / Floyd-Steinberg Dynamic Dither" },
      { label: "Max Resolution", value: "Up to 1080p Animated Output" },
    ],
    steps: [
      { step: 1, title: "Select MOV Video", desc: "Select your iPhone or Mac QuickTime video." },
      { step: 2, title: "Configure GIF", desc: "Set target width (320px to 720px) and frame rate." },
      { step: 3, title: "Download Animated GIF", desc: "Save and share across any chat app or website." },
    ],
    faqs: [
      {
        q: "Can I convert iPhone Live Photos saved as MOV to GIF?",
        a: "Yes! Simply select the MOV file exported from your iPhone Live Photo, and VideoReduce will generate a looping animation in seconds.",
      },
      {
        q: "Does this work on high-framerate 60fps iPhone footage?",
        a: "Yes, you can adjust the export FPS to maintain ultra-smooth motion while keeping file size compact.",
      },
      {
        q: "Are my personal iPhone clips safe?",
        a: "100% safe. Processing takes place strictly in your browser's local memory via WebAssembly with zero cloud data transmission.",
      },
      {
        q: "How do I keep the GIF file size under 10MB?",
        a: "Reduce the export width to 480px and set the frame rate to 15 FPS for the optimal balance of smoothness and small file size.",
      },
    ],
  },
  {
    slug: "mp4-to-mp3",
    fromFormat: "MP4",
    toFormat: "MP3",
    targetFormatEnum: "mp3",
    toolSlug: "audio-extractor",
    title: "MP4 to MP3 Converter",
    badge: "Audio Extractor Pro",
    h1: "Extract High-Quality MP3 Audio from MP4 Video",
    tagline: "Strip video streams and extract studio-grade 320kbps MP3 audio tracks in seconds with zero quality loss",
    seoTitle: "Convert MP4 to MP3 Online Free",
    seoDescription: "Extract MP3 audio from MP4 video online free. High-quality 320kbps audio extractor powered by WebAssembly. No file size limits.",
    keywords: [
      "convert mp4 to mp3",
      "mp4 to mp3 converter free",
      "extract audio from mp4",
      "320kbps mp4 to mp3 online",
      "save sound from mp4 video",
    ],
    whyConvert:
      "Extracting audio from MP4 video allows you to listen to video podcasts, music concerts, lectures, webinars, and voice memos on any MP3 player, smart watch, or car stereo without consuming screen battery or gigabytes of video storage. VideoReduce extracts pristine audio tracks encoded up to 320 kbps in local browser memory.",
    technicalSpecs: [
      { label: "Input Container", value: "MPEG-4 Part 14 (.mp4)" },
      { label: "Output Audio", value: "MPEG Audio Layer III (.mp3)" },
      { label: "Bitrate Options", value: "128k, 192k, 256k, 320k (Studio CBR)" },
      { label: "Sample Rate", value: "44.1 kHz / 48 kHz High Definition" },
    ],
    steps: [
      { step: 1, title: "Select MP4 Video", desc: "Select your lecture, podcast, or music video." },
      { step: 2, title: "Choose MP3 Bitrate", desc: "Select 320 kbps for audiophile clarity or 192 kbps for compact size." },
      { step: 3, title: "Download MP3", desc: "Save your standalone MP3 audio track instantly." },
    ],
    faqs: [
      {
        q: "What bitrate should I choose for the extracted MP3?",
        a: "We recommend 320 kbps for high-fidelity music tracks and concerts, and 128–192 kbps for voice recordings, podcasts, and audiobooks.",
      },
      {
        q: "Can I extract audio from a long 2-hour video?",
        a: "Yes! Because the engine runs locally inside your browser, multi-hour video files process in seconds without cloud upload waiting.",
      },
      {
        q: "Does extracting audio reduce original sound quality?",
        a: "No. VideoReduce decodes the source audio stream and re-encodes it using LAME MP3 codec with high perceptual bit allocation.",
      },
      {
        q: "Can I play the MP3 on an iPod or car dashboard?",
        a: "Yes. The generated MP3 files strictly follow the universal MPEG-1 Audio Layer III standard, playable on every audio device.",
      },
    ],
  },
  {
    slug: "mov-to-mp3",
    fromFormat: "MOV",
    toFormat: "MP3",
    targetFormatEnum: "mp3",
    toolSlug: "audio-extractor",
    title: "MOV to MP3 Converter",
    badge: "iPhone Audio Rip",
    h1: "Convert Apple MOV to MP3 Audio Online Free",
    tagline: "Extract crisp voice memos, interview audio, and soundtrack stems from iPhone QuickTime MOV videos",
    seoTitle: "Convert MOV to MP3 Online Free",
    seoDescription: "Extract MP3 audio from Apple MOV and QuickTime videos online. 100% private in-browser tool with 320kbps audio quality and no file size limits.",
    keywords: [
      "convert mov to mp3",
      "mov to mp3 converter free",
      "extract audio from iphone video",
      "quicktime mov to mp3 online",
      "rip voice from mov file",
    ],
    whyConvert:
      "When recording interviews, voice memos, jam sessions, or dictation on an iPhone or Mac, QuickTime saves the file as a bulky MOV video. Extracting the audio stream to a lightweight MP3 file cuts the storage footprint by over 95% while making the recording easy to transcribe, edit in Audacity, or share via email.",
    technicalSpecs: [
      { label: "Input Container", value: "Apple QuickTime (.mov)" },
      { label: "Output Format", value: "Standard MP3 Audio (.mp3)" },
      { label: "LAME Encoder", value: "High-Quality Multi-Pass CBR/VBR" },
      { label: "Storage Reduction", value: "Up to 96% Smaller than MOV" },
    ],
    steps: [
      { step: 1, title: "Select MOV File", desc: "Select your iPhone interview or QuickTime recording." },
      { step: 2, title: "Select MP3 Audio", desc: "Pick your preferred audio bitrate (up to 320 kbps)." },
      { step: 3, title: "Download Audio Track", desc: "Save and listen on any audio player." },
    ],
    faqs: [
      {
        q: "Can I convert voice interviews recorded on iPhone to MP3?",
        a: "Yes. VideoReduce strips the video track and produces a clean, high-clarity MP3 file ideal for podcasts, transcription, and sharing.",
      },
      {
        q: "Does this support high-resolution 48kHz audio from Apple cameras?",
        a: "Yes. Our audio pipeline preserves the full 48 kHz dynamic frequency range during the MP3 transcode.",
      },
      {
        q: "Are my confidential interviews uploaded to the cloud?",
        a: "Never. All processing happens 100% locally in your browser memory, ensuring complete privacy for sensitive journalistic or legal interviews.",
      },
      {
        q: "How fast is MOV to MP3 extraction?",
        a: "Because video rendering is bypassed, audio extraction typically completes in just 1 to 3 seconds.",
      },
    ],
  },
];

export function getFormatPairBySlug(slug: string): FormatPairData | undefined {
  return FORMAT_PAIRS.find((f) => f.slug === slug);
}
