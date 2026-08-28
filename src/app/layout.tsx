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
    "Compress, watermark, rotate, reverse, trim, convert, and edit videos 100% locally in your browser with WebAssembly. No server uploads, zero file size limits, totally free and private on VideoReduce.com.",
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
