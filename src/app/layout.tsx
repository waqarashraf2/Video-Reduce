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
    default: "Free Video Compressor Online — VideoReduce.com",
    template: "%s | VideoReduce.com",
  },
  description:
    "Reduce video file size online free without losing quality. Private in-browser video compressor & media suite. No uploads, no limits.",
  keywords: [
    "reduce video size",
    "video compressor",
    "compress video online free",
    "reduce video file size",
    "video to gif converter",
    "gif to mp4 converter",
    "online video compressor",
    "free video compressor",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "https://videoreduce.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://videoreduce.com",
    siteName: "VideoReduce.com",
    title: "VideoReduce.com — Free Private Video Compressor & Media Suite",
    description:
      "Compress and edit videos locally in your browser with WebAssembly. 18 free tools, zero server uploads, unlimited file sizes.",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "VideoReduce.com — Free Online Video Compressor Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoReduce.com — Free Online Video Compressor",
    description:
      "Reduce video size online for free without losing quality. 100% private WebAssembly media suite with 18 tools.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VideoReduce.com",
    url: "https://videoreduce.com",
    logo: "https://videoreduce.com/logo.png",
    description:
      "Free, private, browser-based video compressor and media editing suite powered by WebAssembly.",
    sameAs: [
      "https://github.com/waqarashraf2/Video-Reduce",
    ],
  };

  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="bg-[#080c14] font-sans antialiased text-slate-100 min-h-screen" suppressHydrationWarning>
        <FFmpegProvider>
          <AppShell>{children}</AppShell>
        </FFmpegProvider>
      </body>
    </html>
  );
}
