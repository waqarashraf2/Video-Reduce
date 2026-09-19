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

        let handled = false;
        const triggerSelected = (dur?: number, w?: number, h?: number) => {
          if (handled) return;
          handled = true;
          onFileSelected({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            durationSecs: dur,
            width: w,
            height: h,
            previewUrl: url,
          });
        };

        video.onloadedmetadata = () => {
          let dur: number | undefined = video.duration;
          if (!isFinite(dur) || isNaN(dur) || dur <= 0) {
            dur = undefined;
          }
          triggerSelected(dur, video.videoWidth || undefined, video.videoHeight || undefined);
        };

        video.onerror = () => {
          triggerSelected();
        };

        try {
          video.load();
        } catch (_) {}

        // Fallback for mobile browsers that delay/skip metadata probe
        setTimeout(() => {
          triggerSelected();
        }, 1200);
      } else if (file.type.startsWith("audio/")) {
        const audio = document.createElement("audio");
        audio.preload = "metadata";
        audio.src = url;

        audio.onloadedmetadata = () => {
          let dur: number | undefined = audio.duration;
          if (!isFinite(dur) || isNaN(dur) || dur <= 0) {
            dur = undefined;
          }
          onFileSelected({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            durationSecs: dur,
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
      <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-white p-5 shadow-lg ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#060D17] via-[#0B192C] to-[#1e3a8a] text-white ring-1 ring-blue-500/25 shadow-md shadow-blue-950/20">
              {selectedFile.type.startsWith("audio/") ? (
                <Music className="h-7 w-7 text-white" />
              ) : (
                <FileVideo className="h-7 w-7 text-white" />
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {selectedFile.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">
                  {formatBytes(selectedFile.size)}
                </span>
                {selectedFile.durationSecs !== undefined && (
                  <>
                    <span>•</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-red-600 font-mono font-medium border border-slate-200/60">
                      {formatTime(selectedFile.durationSecs)}
                    </span>
                  </>
                )}
                {selectedFile.width && selectedFile.height && (
                  <>
                    <span>•</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 font-mono border border-slate-200/60">
                      {selectedFile.width}x{selectedFile.height}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 ring-1 ring-slate-200 transition-colors"
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
          ? "border-red-500 bg-red-50/40 scale-[0.99] shadow-lg shadow-red-500/15"
          : "border-slate-300 bg-white hover:border-red-500 hover:bg-red-50/20 hover:shadow-xl shadow-sm"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedExtensions.join(",") + "," + acceptedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#060D17] via-[#0B192C] to-[#1e3a8a] text-white shadow-xl shadow-blue-950/25 ring-1 ring-blue-500/25 transition-transform group-hover:scale-110">
        <UploadCloud className="h-8 w-8 text-white" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0B192C] transition-colors">
        {title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm">
        {subtitle}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">Supported formats:</span>
        {acceptedExtensions.map((ext) => (
          <span
            key={ext}
            className="rounded bg-blue-50/70 px-2 py-0.5 font-mono text-[#0B192C] ring-1 ring-blue-200/60 font-medium"
          >
            {ext.toUpperCase().replace(".", "")}
          </span>
        ))}
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
