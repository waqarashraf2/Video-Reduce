"use client";

import React, { useState, useEffect } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface SocialShareBarProps {
  title?: string;
  url?: string;
  description?: string;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({
  title = "VideoReduce.com — Free Online Video Compressor",
  url,
  description = "Reduce video file size online for free without losing quality. 100% private in-browser WebAssembly compression.",
}) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>(url || "https://videoreduce.com");

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "https://videoreduce.com");
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="my-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Share2 className="h-4 w-4 text-red-600" />
          <span>Share this Free Tool:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* X / Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-red-600"
            aria-label="Share on X (Twitter)"
          >
            <span>𝕏 Post</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
            aria-label="Share on WhatsApp"
          >
            <span>WhatsApp</span>
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 font-semibold text-blue-800 transition-colors hover:bg-blue-100"
            aria-label="Share on LinkedIn"
          >
            <span>LinkedIn</span>
          </a>

          {/* Reddit */}
          <a
            href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 font-semibold text-orange-800 transition-colors hover:bg-orange-100"
            aria-label="Share on Reddit"
          >
            <span>Reddit</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            aria-label="Copy tool URL"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
