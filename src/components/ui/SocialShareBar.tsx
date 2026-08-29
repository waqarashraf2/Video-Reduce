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
    <div className="my-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Share2 className="h-4 w-4 text-blue-400" />
          <span>Share this Free Tool:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* X / Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 font-medium text-slate-300 transition-colors hover:border-blue-400/40 hover:bg-slate-800 hover:text-white"
            aria-label="Share on X (Twitter)"
          >
            <span>𝕏 Post</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-950/40 px-3 py-1.5 font-medium text-emerald-300 transition-colors hover:bg-emerald-900/50 hover:text-emerald-200"
            aria-label="Share on WhatsApp"
          >
            <span>WhatsApp</span>
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-950/40 px-3 py-1.5 font-medium text-blue-300 transition-colors hover:bg-blue-900/50 hover:text-blue-200"
            aria-label="Share on LinkedIn"
          >
            <span>LinkedIn</span>
          </a>

          {/* Reddit */}
          <a
            href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-orange-500/20 bg-orange-950/40 px-3 py-1.5 font-medium text-orange-300 transition-colors hover:bg-orange-900/50 hover:text-orange-200"
            aria-label="Share on Reddit"
          >
            <span>Reddit</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
            aria-label="Copy tool URL"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
