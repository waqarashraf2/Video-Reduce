import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Official Support & Feedback",
  description:
    "Get in touch with the VideoReduce team. Submit feedback, request features, report issues, or inquire about client-side WebAssembly video tools.",
  keywords: [
    "contact videoreduce",
    "videoreduce support",
    "video compressor feedback",
    "report video processing issue",
    "video converter help",
  ],
  alternates: {
    canonical: "https://videoreduce.com/contact",
  },
  openGraph: {
    title: "Contact Us — VideoReduce Official Support & Feedback",
    description:
      "Get in touch with the VideoReduce engineering team. Submit feedback, report issues, or inquire about WebAssembly video tools.",
    type: "website",
    siteName: "VideoReduce.com",
    url: "https://videoreduce.com/contact",
    images: [
      {
        url: "https://videoreduce.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact VideoReduce Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — VideoReduce Support & Feedback",
    description:
      "Get in touch with the VideoReduce engineering team for inquiries, feedback, and support.",
    images: ["https://videoreduce.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
