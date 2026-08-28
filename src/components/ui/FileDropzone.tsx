"use client";

import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, FileVideo, Music, AlertCircle, File, X } from "lucide-react";
import { formatBytes, formatTime } from "@/lib/utils";

export interface FileMetadata {
  file: File;
  name: string;
  size: number;
  type: string;
  durationSecs?: number;
  width?: number;
  height?: number;
  previewUrl?: string;
}

interface FileDropzoneProps {
  acceptedTypes?: string[];
  acceptedExtensions?: string[];
  onFileSelected: (metadata: FileMetadata) => void;
  selectedFile: FileMetadata | null;
  onClear: () => void;
  title?: string;
  subtitle?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  acceptedTypes = ["video/*"],
  acceptedExtensions = [".mp4", ".mov", ".mkv", ".webm"],
  onFileSelected,
  selectedFile,
  onClear,
  title = "Drop your media file here",
  subtitle = "or browse from your device (100% private, runs in-browser)",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setErrorMsg(null);
      const url = URL.createObjectURL(file);

      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;

        video.onloadedmetadata = () => {
          onFileSelected({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            durationSecs: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            previewUrl: url,
          });
        };

        video.onerror = () => {
          // If video element fails to probe metadata (e.g. MKV/AVI in Safari), still allow processing
          onFileSelected({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: url,
          });
        };
      } else if (file.type.startsWith("audio/")) {
        const audio = document.createElement("audio");
        audio.preload = "metadata";
        audio.src = url;

        audio.onloadedmetadata = () => {
          onFileSelected({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            durationSecs: audio.duration,
            previewUrl: url,
          });
        };

        audio.onerror = () => {
          onFileSelected({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            previewUrl: url,
          });
        };
      } else {
        onFileSelected({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: url,
        });
      }
    },
    [onFileSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-[#0f172a]/90 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
              {selectedFile.type.startsWith("audio/") ? (
                <Music className="h-7 w-7" />
              ) : (
                <FileVideo className="h-7 w-7" />
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="text-base font-semibold text-white truncate">
                {selectedFile.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-300">
                  {formatBytes(selectedFile.size)}
                </span>
                {selectedFile.durationSecs !== undefined && (
                  <>
                    <span>•</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-blue-400 font-mono">
                      {formatTime(selectedFile.durationSecs)}
                    </span>
                  </>
                )}
                {selectedFile.width && selectedFile.height && (
                  <>
                    <span>•</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 font-mono">
                      {selectedFile.width}x{selectedFile.height}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 ring-1 ring-white/10 transition-colors"
            title="Remove and select different file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
        isDragging
          ? "border-blue-500 bg-blue-500/10 scale-[0.99] shadow-xl shadow-blue-500/20"
          : "border-white/15 bg-[#0f1624]/70 hover:border-blue-500/60 hover:bg-slate-900/80 hover:shadow-2xl"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedExtensions.join(",") + "," + acceptedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 transition-transform group-hover:scale-110">
        <UploadCloud className="h-8 w-8" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
        {title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-sm">
        {subtitle}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <span className="font-medium text-slate-300">Supported formats:</span>
        {acceptedExtensions.map((ext) => (
          <span
            key={ext}
            className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-slate-300 ring-1 ring-white/10"
          >
            {ext.toUpperCase().replace(".", "")}
          </span>
        ))}
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
