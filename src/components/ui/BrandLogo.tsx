import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const iconDimensions = {
    sm: { w: 32, h: 32, class: "h-8 w-8" },
    md: { w: 40, h: 40, class: "h-10 w-10" },
    lg: { w: 52, h: 52, class: "h-13 w-13" },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Image */}
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105 ${iconDimensions.class}`}>
        <Image
          src="/logo.png"
          alt="VideoReduce Logo"
          width={iconDimensions.w}
          height={iconDimensions.h}
          className="h-full w-full object-cover rounded-[10px]"
          priority
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-white sm:text-lg flex items-center leading-none">
            Video<span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent font-extrabold">Reduce</span>
            <span className="text-[10px] font-mono text-blue-400/80 ml-1 rounded bg-blue-500/10 px-1 py-0.2">.com</span>
          </span>
          <span className="text-[10px] font-medium tracking-wide text-slate-400 flex items-center gap-1 mt-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Private Wasm Suite
          </span>
        </div>
      )}
    </div>
  );
};
