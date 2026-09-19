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
      {/* Brand Icon Image with Red Theme Border container */}
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-red-600 via-rose-500 to-red-600 p-[2px] shadow-md shadow-red-500/20 ring-1 ring-red-500/40 border border-red-500/30 transition-transform group-hover:scale-105 ${iconDimensions.class}`}>
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
          <span className="font-extrabold tracking-tight text-[#0B192C] sm:text-lg flex items-center leading-none">
            Video<span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent font-black">Reduce</span>
            <span className="text-[10px] font-mono text-[#0B192C] font-bold ml-1 rounded bg-blue-50/80 px-1.5 py-0.5 border border-blue-200/80">.com</span>
          </span>
          <span className="text-[10px] font-medium tracking-wide text-slate-500 flex items-center gap-1 mt-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% Private Wasm Suite
          </span>
        </div>
      )}
    </div>
  );
};
