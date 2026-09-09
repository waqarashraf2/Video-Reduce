# 📖 VideoReduce.com — Master Project Architecture & Functional Specification

> **Notice for AI Assistants & Developers:**  
> This document is the single source of truth for the entire **VideoReduce (Video-Reduce)** codebase. It outlines the complete technical architecture, runtime mechanics, client-side WebAssembly media engine, tools catalog, routing, i18n system, backend API, CI/CD pipeline, and design constraints. Read this document thoroughly to understand every layer of the project before proposing or implementing changes.

---

## 📌 1. Project Overview & Philosophy

- **Application Name:** VideoReduce (`videoreduce.com`)
- **Repository:** `waqarashraf2/Video-Reduce`
- **Core Purpose:** A 100% private, free, browser-based multimedia suite for video compression, format conversion, audio extraction, video trimming, GIF generation, and creative video editing.
- **Key Differentiator & Value Proposition:**
  - **Zero Server Uploads (100% Privacy):** Unlike CloudConvert, Veed.io, or FreeConvert, user files **never leave the user's browser**. All transcoding and processing happen locally in device memory using WebAssembly (Wasm) compiled with SIMD multi-threading.
  - **No File Size Quotas:** Users can process multi-gigabyte 4K recordings directly on their machine without bandwidth bottlenecks or subscription paywalls.
  - **No Watermarks & Instant Processing:** Clean, high-fidelity outputs with psycho-visual CRF rate control and optimal bitrate calculations.
  - **Dual Architecture:**
    - **Frontend:** Static export (`output: "export"`) Next.js 14 application hosted on Hostinger (`domains/videoreduce.com/public_html/`).
    - **Backend API:** Lightweight Laravel 12 API hosted on Hostinger subdomain (`domains/api.videoreduce.com/public_html/`) handling contact form submissions, inquiries, database persistence, and email notifications.

---

## 🛠️ 2. Technology Stack & Key Dependencies

### Frontend (`/`)
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14.2.24** | App Router, static site generation (`output: "export"`), fully static HTML/JS/CSS assets. |
| **Runtime UI** | **React 18.3.1** | Client-side reactive state, component isolation, React hooks. |
| **Language** | **TypeScript 5.7.3** | Strict type safety for options, jobs, configs, and tool payloads. |
| **Styling** | **TailwindCSS 3.4.17** + PostCSS | Glassmorphic dark theme (`#080c14`, `#0d1424`, `#121a2d`), custom glowing gradients, animations. |
| **Media Engine** | **`@ffmpeg/ffmpeg` v0.12.10**<br>**`@ffmpeg/core` v0.12.6**<br>**`@ffmpeg/util` v0.12.1** | Client-side FFmpeg compiled to WebAssembly (Wasm) with multi-threaded SharedArrayBuffer support. |
| **Icons & UI** | **`lucide-react` v0.475.0** | Modern icon set for all tools, categories, and status indicators. |
| **Effects & Utility** | **`canvas-confetti`**, `clsx`, `tailwind-merge` | Celebration animations on export completion, robust class merging. |
| **Image Processing** | **`sharp` v0.35.4** | High-performance image optimization in build scripts. |

### Backend API (`/api`)
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Laravel 12** | PHP 8.2+ RESTful API. |
| **Database** | **MySQL** | Stores contact inquiries, user feedback, submission metadata. |
| **ORM & Mail** | **Eloquent ORM + Mailable** | Clean data modeling and SMTP email notifications to admin (`ADMIN_NOTIFICATION_EMAIL`). |
| **Rate Limiter** | **Laravel Throttle Middleware** | Restricts contact submissions to 10 requests per minute per IP. |

### Infrastructure & Hosting
| Service | Implementation |
| :--- | :--- |
| **Web Server** | Hostinger Apache Web Server with mod_rewrite & mod_headers. |
| **Wasm Security Headers** | COOP (`Cross-Origin-Opener-Policy: same-origin`) and COEP (`Cross-Origin-Embedder-Policy: require-corp`) configured via `.htaccess`. |
| **CI / CD Pipeline** | GitHub Actions (`.github/workflows/deploy.yml`) with automated SSH/Rsync deployment on push to `main`. |
| **Domain Topology** | Frontend: `https://videoreduce.com` \| Backend: `https://api.videoreduce.com` |

---

## 📂 3. Complete Codebase Directory Map

```text
video converter/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD to Hostinger (SSH + Rsync)
├── api/                            # Laravel 12 Backend API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   └── ContactController.php   # Handles /api/contact and /api/health
│   │   ├── Mail/
│   │   │   └── ContactMessageReceived.php # Admin email notification template
│   │   └── Models/
│   │       └── Contact.php         # Contact message Eloquent model
│   ├── database/
│   │   └── migrations/             # Contacts table schema
│   ├── routes/
│   │   └── api.php                 # API endpoints definition
│   └── .env.example
├── public/                         # Static Assets & PWA
│   ├── .htaccess                   # Apache rules: COOP/COEP, trailing slashes, clean URLs
│   ├── icons/                      # PWA application icons (48x48 to 512x512)
│   ├── favicon.ico
│   ├── logo.png / og-image.jpg     # Branding and social preview assets
│   ├── manifest.json               # Progressive Web App manifest
│   ├── sw.js                       # Service Worker for offline asset caching
│   ├── robots.txt                  # Search crawler directives
│   ├── sitemap.xml                 # XML sitemap indexing all tools, hubs, and guides
│   └── llms.txt                    # LLM context summary for AI crawlers
├── scripts/
│   └── postbuild.js                # Post-export script: copies .htaccess & generates index.html files
├── src/                            # Next.js 14 Source Code
│   ├── app/                        # App Router Pages & Layouts
│   │   ├── [lang]/                 # Dynamic localized routes (es, fr, de, pt, it, hi)
│   │   │   ├── compress/[slug]/    # Localized use case hub pages
│   │   │   └── convert/[slug]/     # Localized format pair conversion pages
│   │   ├── about/                  # About page
│   │   ├── articles/               # Educational blog index and [slug] articles
│   │   ├── compress/[slug]/        # English use case hub pages (WhatsApp, Discord, etc.)
│   │   ├── contact/                # Contact form page (connected to Laravel API)
│   │   ├── convert/[slug]/         # English format conversion pages (MOV to MP4, etc.)
│   │   ├── faq/                    # Frequently asked questions
│   │   ├── privacy-policy/         # Privacy policy (details client-side zero-upload guarantee)
│   │   ├── terms/                  # Terms of service
│   │   ├── tools/[slug]/           # Dedicated standalone pages for all 18 tools
│   │   ├── globals.css             # Base styles, dark theme variables, custom scrollbars
│   │   ├── layout.tsx              # Root HTML, Inter font, Analytics, Global SEO JsonLd
│   │   ├── not-found.tsx           # Custom 404 page
│   │   └── page.tsx                # Homepage (Hero, Tool Grid, Trust Cards, SEO FAQs)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Application container
│   │   │   ├── Navbar.tsx          # Floating curved pill header (Bradley's Law style)
│   │   │   ├── Footer.tsx          # Comprehensive footer with quick tool & legal links
│   │   │   └── PwaInstallBanner.tsx# Native PWA install prompt banner
│   │   ├── tools/
│   │   │   ├── ToolRunner.tsx      # Master execution engine, state coordinator & Wasm runner
│   │   │   ├── ToolControls.tsx    # Dynamic controls per tool (sliders, dropdowns, presets)
│   │   │   └── ToolSeoContent.tsx  # Deep SEO articles, feature grids, step guides, FAQs
│   │   └── ui/
│   │       ├── BrandLogo.tsx       # SVG/Image brand mark
│   │       ├── CompetitorComparison.tsx # Comparison table vs CloudConvert/Veed/HandBrake
│   │       ├── DualRangeSlider.tsx # Interactive dual-handle range slider (for video trimming)
│   │       ├── FileDropzone.tsx    # Drag-and-drop file picker with validation & duration probe
│   │       ├── LanguageSwitcher.tsx# Multi-lingual dropdown switcher
│   │       ├── LiveScreenView.tsx  # Video preview canvas / HTML5 video player
│   │       ├── ProcessingProgress.tsx # Real-time progress bar, speed tracker, logs viewer
│   │       ├── ResultPreview.tsx   # Output download card, size savings calculation, confetti
│   │       ├── SocialShareBar.tsx  # One-click social sharing (Twitter, WhatsApp, LinkedIn, Reddit)
│   │       └── ToolIcon.tsx        # Dynamic Lucide icon resolver
│   ├── config/
│   │   ├── articles.ts             # 8 long-form SEO engineering articles & guides
│   │   ├── formats.ts              # Format conversion pairs specifications (MOV, MKV, WebM, AVI)
│   │   ├── tools.ts                # Master metadata catalog for all 18 tools
│   │   ├── use-cases.ts            # Targeted landing hubs (Discord, WhatsApp, Email, 4K)
│   │   └── i18n/                   # Multi-language dictionary and locales configuration
│   └── lib/
│       ├── ffmpeg/
│       │   ├── commands.ts         # Pure function FFmpeg CLI argument builder per tool
│       │   ├── ffmpeg-provider.tsx # React Context provider managing FFmpeg Wasm lifecycle
│       │   └── types.ts            # TypeScript interfaces for all tools, jobs, options, and results
│       ├── webcodecs/
│       │   ├── detector.ts         # Browser feature detection & file eligibility checker
│       │   ├── types.ts            # WebCodecs option, progress, and result interfaces
│       │   ├── useWebCodecsCompressor.ts # Custom React hook for GPU compression
│       │   └── webcodecs-compressor.ts # Hardware accelerated VideoDecoder/Encoder + mp4-muxer + MP4Box
│       ├── markdown.ts             # Lightweight Markdown parser for articles
│       └── utils.ts                # Helpers (formatBytes, formatTime, clamp, cn)
├── DEPLOYMENT.md                   # Step-by-step Hostinger & Laravel setup guide
├── next.config.mjs                 # Next.js static export config (`output: "export"`, unoptimized images)
├── package.json                    # Frontend dependencies and scripts
├── tailwind.config.ts              # Custom colors, glows, animations
└── tsconfig.json                   # TypeScript configuration with `@/*` aliases
```

---

## ⚡ 4. WebCodecs Hardware Acceleration Engine (GPU-Powered)

The application features a hybrid compression architecture. Video compression defaults to the browser's native **WebCodecs API** (`VideoDecoder` + `VideoEncoder`) paired with **`mp4box`** (stream demuxing) and **`mp4-muxer`** (in-memory container authoring), delivering a **10x to 50x speed increase**:

### A. Mechanics & Data Flow (`src/lib/webcodecs/`)
1. **Stream Reading:** Uses `file.stream().getReader()` to stream binary buffers chunk-by-chunk into `MP4Box.createFile()`, eliminating full-file RAM preloading.
2. **AVC Parameter Extraction:** Extracts SPS/PPS configuration from `moov.traks` (`avcC` box) via `DataStream` to configure the hardware decoder.
3. **GPU VideoDecoder:** Hardware-accelerated decoder (`prefer-hardware`) outputs decoded raw `VideoFrame` handles directly on the GPU.
4. **Target Bitrate & Resizing:**
   - Calculates target bitrate dynamically from the user's chosen compression mode (Percentage, Target MB, or CRF).
   - If downscaling is selected (e.g. 1080p / 720p), resizes via `OffscreenCanvas` maintaining even integer dimensions required by H.264.
5. **GPU VideoEncoder:** Level 5.2 profile (`avc1.640034`) encodes frames with keyframe intervals every 60 frames.
6. **Muxing:** `mp4-muxer` produces a web-optimized FastStart MP4 file in memory. Audio tracks are passed through with pristine AAC quality.
7. **Zero-Error Fallback Hierarchy:** If WebCodecs throws any codec exception or if the file is an unsupported format (e.g. MKV/AVI/FLV), the system transparently and silently routes the task to the universal **FFmpeg WebAssembly Engine**.

---

## 🧠 5. Universal Fallback: WebAssembly & FFmpeg Core Engine

The engine is encapsulated inside `src/lib/ffmpeg/`:

### A. Context & Lifecycle (`ffmpeg-provider.tsx`)
- **Singleton FFmpeg Instance:** Uses `@ffmpeg/ffmpeg` `FFmpeg` instance kept in a React Ref to avoid re-instantiation across page navigations.
- **Dual-CDN Fallback Strategy:**
  1. Primary: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js` & `.wasm`
  2. Fallback: `https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js` & `.wasm`
  - Utilizes `toBlobURL` to circumvent cross-origin script execution limitations.
- **Log Streaming & Progress Parsing:**
  - Subscribes to `ffmpeg.on("log")` to capture stdout/stderr in real-time (last 200 lines preserved).
  - Subscribes to `ffmpeg.on("progress")` to compute decimal ratio (0.0 to 1.0), percentage, elapsed seconds, and dynamic remaining time estimates (`estimatedRemainingSecs`).

### B. High-Performance In-Memory File System (MEMFS)
To prevent browser crashes and 2x RAM spikes when processing large videos (500MB - 1GB+):
1. Input buffer is written to MEMFS: `await ffmpeg.writeFile(inputName, buffer)`.
2. The JavaScript host buffer reference is immediately nulled: `(inputData as any).buffer = null` to prompt JS garbage collection.
3. Encoding runs: `await ffmpeg.exec(args)`.
4. **Immediate Cleanup Before Read:** `await ffmpeg.deleteFile(inputName)` deletes the input file from virtual RAM **before** reading output data into JS memory.
5. Output buffer read: `await ffmpeg.readFile(outputName)`.
6. Output virtual file deleted: `await ffmpeg.deleteFile(outputName)`.

### C. Browser Anti-Throttling & Reliability Suite (`ToolRunner.tsx`)
1. **Screen WakeLock API:** Automatically requests `navigator.wakeLock.request("screen")` when processing starts to prevent mobile screens and laptops from sleeping during encodes.
2. **Silent Web Audio Heartbeat:** Uses an inaudible `AudioContext` oscillator (40Hz, gain `0.00001`) playing during active renders. This tricks iOS Safari and Chromium background tab governors into prioritizing the thread rather than freezing it.
3. **`beforeunload` Guard:** Prevents accidental tab close or page reload during encoding with standard browser confirmation alerts.
4. **Dynamic Title Bar Progress:** Updates `document.title` with real-time percentage: e.g. `"(42%) Compressing... | VideoReduce"`.

---

## 🧰 5. Exhaustive Tool Catalog (All 18 Tools)

Every tool has an ID, dedicated route (`/tools/[slug]`), customizable control component, and custom command builder in `commands.ts`:

### 1. Smart Video Compressor (`video-compressor`)
- **Category:** Optimization
- **Accepted Inputs:** `.mp4`, `.mov`, `.mkv`, `.webm`, `.avi`, `.flv`
- **Output:** `.mp4` (H.264 / AAC)
- **Modes:**
  - `percentage`: 30%, 50%, 70%, 80% size reduction. Calculates exact target video bitrate:
    $$\text{Bitrate (kbps)} = \frac{\text{TargetBytes} \times 8}{\text{DurationSecs} \times 1000}$$
  - `target-size`: Direct user input in Megabytes (e.g. 15MB for WhatsApp, 24MB for Discord).
  - `manual-crf`: Direct CRF slider (18 to 35).
- **Features:** Preset resolutions (Original, 1080p, 720p, 480p, 360p), Audio Mute toggle, FastStart Moov atom (`-movflags +faststart`) for instant web streaming.

### 2. Video to GIF Converter (`video-to-gif`)
- **Category:** Conversion
- **Output:** `.gif`
- **Options:** Frame rate (10, 15, 24, 30 fps), Width (320px to 800px), Speed multiplier, Loop count.
- **Engine Logic:** Two-pass high quality palette generation using:
  `-vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3"`

### 3. Audio Extractor (`audio-extractor`)
- **Category:** Audio
- **Outputs:** MP3 (`libmp3lame`), AAC (`aac`), WAV (`pcm_s16le`)
- **Options:** Bitrate (128k, 192k, 256k, 320k), strip video track (`-vn`).

### 4. Video Trimmer (`video-trimmer`)
- **Category:** Video
- **Controls:** Dual-handle interactive scrubber slider (`DualRangeSlider.tsx`).
- **Options:** Start timestamp, End timestamp.
- **Modes:**
  - Fast Stream Copy (`-c copy -avoid_negative_ts make_zero`) for instant cutting without re-encoding.
  - Precise Frame-Accurate Mode (`-vcodec libx264 -crf 22`).

### 5. Speed Controller (`speed-controller`)
- **Category:** Video
- **Options:** Multipliers: 0.25x, 0.5x, 0.75x, 1.25x, 1.5x, 2x, 4x.
- **Engine Logic:** Synchronizes video `setpts` with audio `atempo` chains (handling multi-stage atempo for $>2.0$x or $<0.5$x speeds).

### 6. Video Mute (`video-mute`)
- **Category:** Audio / Video
- **Logic:** Instant stream copy with audio strip: `-i input -an -vcodec copy output.mp4`. Executes in under 1 second.

### 7. Format Converter (`format-converter`)
- **Category:** Conversion
- **Supported Conversions:** Transcodes between MP4, WebM (VP8/Vorbis), MKV (H.264/AAC), MOV (QuickTime H.264), and AVI.
- **Quality Presets:** High, Medium, Low.

### 8. Aspect Ratio Resizer (`aspect-ratio-resizer`)
- **Category:** Video
- **Presets:** `9:16` (TikTok/Reels/Shorts: 1080x1920), `1:1` (Square Instagram: 1080x1080), `16:9` (YouTube/Landscape: 1920x1080), `4:5` (Instagram Feed: 1080x1350).
- **Modes:**
  - `crop`: Center-cut scaling with zero letterboxing (`crop=ih*9/16:ih:(iw-ow)/2:0`).
  - `pad`: Pillarbox/Letterbox padding with customizable background color (`black`, `white`, etc.).

### 9. Video Watermark (`video-watermark`)
- **Category:** Video
- **Controls:** Text string, font size, font color, opacity (0.1 to 1.0), and 5 positions (Top-Left, Top-Right, Bottom-Left, Bottom-Right, Center).
- **Engine Logic:** Dynamically calculates coordinates using FFmpeg `drawtext`: e.g. `x=w-tw-20:y=h-th-20` for bottom-right placement.

### 10. Video Rotate & Flip (`video-rotate`)
- **Category:** Video
- **Options:** 90° Clockwise (`transpose=1`), 180° (`transpose=1,transpose=1`), 270° Counter-Clockwise (`transpose=2`), Horizontal Mirror (`hflip`), Vertical Flip (`vflip`).

### 11. Video Reverse / Rewind (`video-reverse`)
- **Category:** Video
- **Options:** Reverse video with reversed audio (`reverse` + `areverse`), or reverse video with audio muted.

### 12. Frame Extractor (`frame-extractor`)
- **Category:** Video
- **Options:** Exact second timestamp, Output format: `.png` (lossless) or `.jpg`.
- **Command:** `-ss <time> -i input -vframes 1 output.png`.

### 13. Video Filters & Color Grading (`video-filters`)
- **Category:** Video
- **Presets:**
  - `cyberpunk`: Boosted reds and blues, suppressed green, high saturation.
  - `sepia`: Warm vintage antique toning.
  - `vintage`: 35mm retro film warmth.
  - `bw`: Monochrome black and white.
  - `warm` / `cool`: Golden hour sunlight vs cold cinematic teal.
- **Sliders:** Brightness ($-0.5$ to $0.5$), Contrast ($0.5$ to $2.0$), Saturation ($0.0$ to $3.0$), Gamma ($0.5$ to $2.0$). Uses FFmpeg `eq` filter.

### 14. GIF to Video (`gif-to-video`)
- **Category:** Conversion
- **Logic:** Transcodes inefficient GIF animations to modern H.264 MP4 with even dimension padding (`scale=trunc(iw/2)*2:trunc(ih/2)*2`) reducing file sizes by up to 95%.

### 15. Volume Booster & Normalizer (`volume-booster`)
- **Category:** Audio
- **Modes:**
  - Multiplier: Boost quiet audio up to 300% (`volume=2.0`).
  - EBU R128 Broadcast Normalization (`loudnorm=I=-16:TP=-1.5:LRA=11`).

### 16. Audio Noise Reduction (`audio-denoiser`)
- **Category:** Audio
- **Controls:** FFT-based noise reduction filter (`afftdn`) with configurable noise floor ($-15\text{dB}$ to $-40\text{dB}$).

### 17. Metadata & EXIF Stripper (`metadata-stripper`)
- **Category:** Privacy & Pro
- **Logic:** Strips GPS locations, camera serials, device names, timestamps, and editing histories using `-map_metadata -1 -c copy`. Executes instantaneously without re-encoding.

### 18. Developer FFmpeg Web Terminal (`ffmpeg-terminal`)
- **Category:** Privacy & Pro
- **Description:** Interactive command terminal allowing advanced users to execute custom raw FFmpeg arguments (e.g. `-vf "hue=s=0" -c:a copy`) directly against their selected media.

---

## 🎯 6. Solution Hubs & Programmatic SEO Pages

To maximize organic search traffic, the project features targeted programmatic pages pre-configured for high-intent queries:

### A. Use Case Hubs (`src/config/use-cases.ts`)
Routed at `/compress/[slug]`:
1. `whatsapp-video`: Pre-configured for WhatsApp's 16MB file limit (15MB target).
2. `discord-video`: Pre-configured for Discord's 25MB attachment limit (24MB target with FastStart).
3. `email-attachment`: Shrinks videos under standard 20MB/25MB Gmail/Outlook attachment ceilings.
4. `4k-to-1080p`: Downscales heavy 4K UHD smartphone files to crisp 1080p Full HD.

### B. Format Pair Landing Pages (`src/config/formats.ts`)
Routed at `/convert/[slug]`:
1. `mov-to-mp4`: Solves Apple iPhone QuickTime playback incompatibility on Windows & Android.
2. `mkv-to-mp4`: Repackages OBS Studio and Matroska rips for browser, iOS, and Smart TV playback.
3. `webm-to-mp4`: Converts Google WebM clips into universal H.264 MP4.
4. `avi-to-mp4`: Transcodes legacy DivX/XviD AVI footage into modern web formats.

### C. Engineering & Educational Articles (`src/config/articles.ts`)
Routed at `/articles` and `/articles/[slug]`:
- 8 in-depth, long-form guides covering CRF rate control, online privacy dangers of cloud converters, WhatsApp video limits, iPhone format issues, watermarking, audio extraction, and GIF optimization.
- Each article includes full author metadata, reading time, table of contents, technical deep dives, and schema-structured FAQs.

---

## 🌐 7. Internationalization (i18n) Engine

- **Config Directory:** `src/config/i18n/`
- **Supported Locales:**
  - `en`: English (Default)
  - `es`: Español (Spanish)
  - `pt`: Português (Portuguese)
  - `fr`: Français (French)
  - `de`: Deutsch (German)
  - `it`: Italiano (Italian)
  - `hi`: हिन्दी (Hindi)
- **Static Export Generation:**  
  Multi-lingual pages are statically pre-rendered at build time via `generateStaticParams()`:
  - `/[lang]/compress/[slug]`
  - `/[lang]/convert/[slug]`
- **Components:**
  - `LanguageSwitcher.tsx`: Dropdown selector with native flags, locale codes, and automatic canonical link updates.
  - `src/config/i18n/translations.ts` & `index.ts`: Localized strings for navigation, tool labels, technical specs, badges, and FAQs.

---

## 🔌 8. Backend API (Laravel 12) Architecture

The backend API is located in the `/api` directory and operates independently on `api.videoreduce.com`:

### A. Endpoints (`api/routes/api.php`)
1. `GET /api/health`
   - Returns: `{"status": "ok", "timestamp": "...", "service": "VideoReduce API"}`
   - Used for uptime monitoring and verifying API health.
2. `POST /api/contact`
   - Rate Limited: `throttle:10,1` (maximum 10 requests per minute per IP address).
   - Validates:
     - `name`: string, min 2, max 255.
     - `email`: string, valid RFC/filter email, max 255.
     - `subject`: string, max 255 (defaults to "General Inquiry").
     - `message`: string, min 5, max 5000.

### B. Controller & Notification Pipeline (`ContactController.php`)
1. Sanitizes inputs (`strip_tags`, `trim`, `strtolower`).
2. Persists entry to `contacts` MySQL database table (stores `ip_address`, `user_agent`, `status`).
3. Dispatches `ContactMessageReceived` mailable to `ADMIN_NOTIFICATION_EMAIL` using configured SMTP credentials.
4. If SMTP dispatch fails (e.g. server temporary downtime), the error is caught, logged to `storage/logs/laravel.log`, and the customer's message remains safely stored in the database without throwing a 500 error to the user.

---

## 🚀 9. Hosting, Deployment & Apache Server Configuration

### A. Dual Hostinger Deployment Setup
- **Frontend Path:** `domains/videoreduce.com/public_html/`
- **Backend API Path:** `domains/api.videoreduce.com/public_html/`

### B. CI / CD Workflow (`.github/workflows/deploy.yml`)
On every push to `main`:
1. Sets up Node.js 20 on GitHub Runner.
2. Runs `npm run build` which invokes:
   `next build && node scripts/postbuild.js`
3. Rsyncs `out/` to Hostinger's `domains/videoreduce.com/public_html/` over SSH port 65002.
4. Enforces correct file permissions (`755` for directories, `644` for files).

### C. Build & Postbuild Processing (`scripts/postbuild.js`)
Because Next.js is configured with `output: "export"`, standard static hosting on Apache requires special handling:
1. Copies `public/.htaccess` into `out/.htaccess`.
2. Scans generated HTML files. If a route exists as `tools/video-compressor.html`, the script ensures `tools/video-compressor/index.html` also exists. This completely prevents Apache `403 Forbidden` or redirection issues when users visit either `/tool` or `/tool/`.

### D. Crucial `.htaccess` Directives (`public/.htaccess`)
```apache
# 1. Wasm Multi-Threading & SharedArrayBuffer Headers (CRITICAL)
<IfModule mod_headers.c>
    Header set Cross-Origin-Opener-Policy "same-origin"
    Header set Cross-Origin-Embedder-Policy "require-corp"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>

# 2. Canonical HTTPS & Non-WWW Redirection
RewriteCond %{HTTP_HOST} ^www\.videoreduce\.com [NC]
RewriteRule ^(.*)$ https://videoreduce.com/$1 [R=301,L]

# 3. Canonical Trailing Slash Removal
RewriteCond %{REQUEST_URI} ^(.+)/+$
RewriteRule ^ %1 [R=301,L,QSA]

# 4. Clean HTML Rewrite
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.*)$ $1.html [L]
```

> ⚠️ **CRITICAL WARNING:** Never remove the `Cross-Origin-Opener-Policy "same-origin"` or `Cross-Origin-Embedder-Policy "require-corp"` headers. Without them, web browsers immediately disable `SharedArrayBuffer`, causing FFmpeg WebAssembly multi-threading to fail with security exceptions.

---

## 🎨 10. Design System & UI Components

The application uses a high-end, dark-mode glassmorphic design system:
- **Background Palette:** `#080c14` (Deep Canvas), `#0d1424` (Card Background), `#121a2d` (Elevated Surfaces).
- **Accents:** Vibrant Indigo/Blue (`#3b82f6`, `#6366f1`), Emerald Green (`#10b981` for completed/safe badges), Amber/Purple for pro presets.
- **Header:** Floating curved glass pill (`Navbar.tsx`, Bradley's Law aesthetic) with dynamic mobile accordion and desktop dropdown showcasing all 18 tools with badges.
- **Result Preview Card (`ResultPreview.tsx`):**
  - Displays original size vs compressed size.
  - Percentage savings calculator with colorful badges.
  - Side-by-side comparison video player.
  - Confetti burst animation upon encoding completion.
  - One-click file download button.
- **PWA Ready (`PwaInstallBanner.tsx`):** Detects `beforeinstallprompt` event on supported devices and offers an install prompt to use VideoReduce as a native desktop or mobile app.

---

## 🔒 11. Security & SEO Specifications

- **Client-Side Privacy:** Zero video bytes leave the browser. Zero analytics on user video names or contents.
- **Structured Data (JSON-LD):**
  - `SoftwareApplication`: Declares price as $0, ratings (4.9/5 stars from 2,150+ reviews), operating systems supported.
  - `Organization`: Links logo, website, and GitHub repository.
  - `FAQPage`: Embedded schemas on Homepage, Tool pages, and Hub pages for Google rich snippets.
  - `BreadcrumbList`: Structured hierarchy on all routes.
- **Verification:** Google Search Console site verification tag configured in `layout.tsx`.

---

## 📋 12. Golden Rules for Future Development & AI Pair-Programmers

When working on this project in future chats, always adhere to these invariants:

1. **Do Not Break Static Export:** Next.js must remain purely exportable (`output: "export"`). Do not introduce server-side functions (`getServerSideProps`, Server Actions, or Next.js dynamic API routes in `/src/app/api/`) that break static export.
2. **Backend Code Stays in `/api`:** Any server-side logic (database, email, authentication) belongs in the Laravel application in `/api`.
3. **Preserve Memory Management:** When modifying `ToolRunner.tsx` or `commands.ts`, always ensure in-memory buffers are cleared and virtual files are deleted using `ffmpeg.deleteFile` to prevent browser tab crashes on low-RAM mobile devices.
4. **Maintain Trailing Slash & Clean URL Compatibility:** Keep `scripts/postbuild.js` updated if adding new root directories to ensure Apache handles URLs seamlessly.
5. **No Unauthorized Code Changes:** As requested by the user, do not alter working features, layout, or configs without explicit confirmation from the user.
