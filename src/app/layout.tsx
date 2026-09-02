import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  verification: {
    google: "TCRQ56_gY9x_4Ll3Mt96Ztuw2wACORXDA3BuBIjGw4U",
  },
  alternates: {
    canonical: "https://videoreduce.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://videoreduce.com",
    siteName: "VideoReduce.com",
    title: "VideoReduce — High-Fidelity Video Compressor & Media Suite",
    description:
      "Reduce video file sizes up to 90% with zero quality loss. 100% private in-browser WebAssembly with 18 tools, 10MB to 10GB+ unlimited file sizes.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VideoReduce — High-Fidelity Video Compressor & Media Suite",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoReduce — High-Fidelity Video Compressor & Media Suite",
    description:
      "Reduce video file sizes up to 90% with zero quality loss. 100% private in-browser WebAssembly with 18 tools.",
    images: ["/og-image.jpg"],
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
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-53HYP7X4R4"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-53HYP7X4R4');
            `,
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="google-site-verification" content="TCRQ56_gY9x_4Ll3Mt96Ztuw2wACORXDA3BuBIjGw4U" />
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
