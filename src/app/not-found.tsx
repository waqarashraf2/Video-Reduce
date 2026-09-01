import Link from "next/link";
import { ArrowLeft, Sparkles, Video } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="relative mx-auto max-w-lg text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
          <Video className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-sm text-slate-400">
            The page or media tool you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/tools/video-compressor"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>Video Compressor</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
