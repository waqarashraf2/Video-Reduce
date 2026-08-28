import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FFmpegProvider } from "@/lib/ffmpeg/ffmpeg-provider";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: "#080c14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://videoreduce.com"),
  title: {
    default: "VideoReduce.com | Free Private Video Compressor & Wasm Media Suite",
    template: "%s | VideoReduce.com",
  },
  description:
    "Reduce video file size online for free without losing quality. 100% private in-browser video compressor, MP4 converter, and media suite. Works on iPhone, Android, and PC with zero server uploads.",
  keywords: [
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
    "video to gif",
    "video to gif converter",
    "convert video to gif",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://videoreduce.com",
    siteName: "VideoReduce.com",
    title: "VideoReduce.com - 100% Client-Side Video Compressor & Media Suite",
    description: "Compress and edit videos locally in your browser with WebAssembly. 0 Server uploads.",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "VideoReduce.com Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoReduce.com",
    description: "100% Client-Side WebAssembly Media & Video Reduction Suite",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-[#080c14] font-sans antialiased text-slate-100 min-h-screen" suppressHydrationWarning>
        <FFmpegProvider>
          <AppShell>{children}</AppShell>
        </FFmpegProvider>
      </body>
    </html>
  );
}
