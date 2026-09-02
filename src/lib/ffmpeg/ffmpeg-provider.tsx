"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { ProcessProgress } from "./types";

interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  isLoaded: boolean;
  isLoading: boolean;
  loadProgress: number;
  loadError: string | null;
  loadFFmpeg: () => Promise<boolean>;
  runFFmpeg: (
    inputData: { name: string; buffer: Uint8Array },
    outputName: string,
    args: string[],
    onProgress?: (progress: ProcessProgress) => void,
    totalDurationSecs?: number
  ) => Promise<{ outputData: Uint8Array; logOutput: string[] }>;
  logs: string[];
  clearLogs: () => void;
}

const FFmpegContext = createContext<FFmpegContextType>({
  ffmpeg: null,
  isLoaded: false,
  isLoading: false,
  loadProgress: 0,
  loadError: null,
  loadFFmpeg: async () => false,
  runFFmpeg: async () => ({ outputData: new Uint8Array(), logOutput: [] }),
  logs: [],
  clearLogs: () => {},
});

const FFMPEG_CORE_VERSION = "0.12.6";
const BASE_URL_UNPKG = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;
const BASE_URL_JSDELIVR = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

export const FFmpegProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const activeProgressCallback = useRef<((progress: ProcessProgress) => void) | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const loadFFmpeg = useCallback(async (): Promise<boolean> => {
    if (ffmpegRef.current && isLoaded) {
      return true;
    }
    if (isLoading) {
      return false;
    }

    setIsLoading(true);
    setLoadError(null);
    setLoadProgress(5);

    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("log", ({ message }) => {
        setLogs((prev) => {
          const next = [...prev, message];
          return next.length > 200 ? next.slice(-200) : next;
        });
      });

      ffmpeg.on("progress", ({ progress, time }) => {
        const ratio = Math.max(0, Math.min(1, progress));
        const percent = Math.round(ratio * 100);
        
        let estimatedRemainingSecs: number | undefined;
        if (startTimeRef.current && ratio > 0.05 && ratio < 0.99) {
          const elapsedSecs = (Date.now() - startTimeRef.current) / 1000;
          const totalEstimatedSecs = elapsedSecs / ratio;
          estimatedRemainingSecs = Math.max(1, Math.round(totalEstimatedSecs - elapsedSecs));
        }

        if (activeProgressCallback.current) {
          activeProgressCallback.current({
            ratio,
            percent,
            time: time / 1000000 || 0,
            estimatedRemainingSecs,
          });
        }
      });

      // Try loading from primary CDN (unpkg), fallback to jsdelivr
      let coreURL: string;
      let wasmURL: string;

      try {
        setLoadProgress(20);
        coreURL = await toBlobURL(`${BASE_URL_UNPKG}/ffmpeg-core.js`, "text/javascript");
        setLoadProgress(50);
        wasmURL = await toBlobURL(`${BASE_URL_UNPKG}/ffmpeg-core.wasm`, "application/wasm");
        setLoadProgress(80);
      } catch (err) {
        console.warn("Unpkg load failed, falling back to jsdelivr:", err);
        setLoadProgress(30);
        coreURL = await toBlobURL(`${BASE_URL_JSDELIVR}/ffmpeg-core.js`, "text/javascript");
        setLoadProgress(60);
        wasmURL = await toBlobURL(`${BASE_URL_JSDELIVR}/ffmpeg-core.wasm`, "application/wasm");
        setLoadProgress(85);
      }

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      setLoadProgress(100);
      setIsLoaded(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Failed to load FFmpeg WebAssembly core:", err);
      setLoadError(err?.message || "Failed to load WebAssembly media engine. Please check your network.");
      setIsLoading(false);
      setIsLoaded(false);
      return false;
    }
  }, [isLoaded, isLoading]);

  const runFFmpeg = useCallback(
    async (
      inputData: { name: string; buffer: Uint8Array },
      outputName: string,
      args: string[],
      onProgress?: (progress: ProcessProgress) => void,
      totalDurationSecs?: number
    ): Promise<{ outputData: Uint8Array; logOutput: string[] }> => {
      if (!ffmpegRef.current || !isLoaded) {
        const loaded = await loadFFmpeg();
        if (!loaded || !ffmpegRef.current) {
          throw new Error("WebAssembly engine could not be initialized.");
        }
      }

      const ffmpeg = ffmpegRef.current;
      activeProgressCallback.current = onProgress || null;
      startTimeRef.current = Date.now();
      durationRef.current = totalDurationSecs || 0;

      const currentLogs: string[] = [];
      const logCollector = ({ message }: { message: string }) => {
        currentLogs.push(message);
      };
      ffmpeg.on("log", logCollector);

      try {
        // 1. Write input file to in-memory virtual filesystem
        await ffmpeg.writeFile(inputData.name, inputData.buffer);

        // Immediately release JavaScript buffer reference to free host browser memory
        (inputData as any).buffer = null;

        // 2. Execute command
        const exitCode = await ffmpeg.exec(args);
        if (exitCode !== 0) {
          const lastLogs = currentLogs.slice(-8).join("\n");
          throw new Error(`FFmpeg error (code ${exitCode}): ${lastLogs || "Operation failed"}`);
        }

        // 3. Delete input file from MEMFS BEFORE reading output to prevent 2x RAM spike
        try {
          await ffmpeg.deleteFile(inputData.name);
        } catch (_) {}

        // 4. Read output file
        const data = await ffmpeg.readFile(outputName);
        const outputBuffer = typeof data === "string" ? new TextEncoder().encode(data) : (data as Uint8Array);

        if (!outputBuffer || outputBuffer.length === 0) {
          const lastLogs = currentLogs.slice(-8).join("\n");
          throw new Error(`FFmpeg rendered 0 bytes: ${lastLogs || "Encoding produced empty file"}`);
        }

        // 5. Delete output file from MEMFS
        try {
          await ffmpeg.deleteFile(outputName);
        } catch (cleanupErr) {
          console.warn("Cleanup warning:", cleanupErr);
        }

        return {
          outputData: outputBuffer,
          logOutput: currentLogs,
        };
      } catch (err: any) {
        // Attempt cleanup in case of crash/error
        try {
          await ffmpeg.deleteFile(inputData.name);
          await ffmpeg.deleteFile(outputName);
        } catch (_) {}
        throw err;
      } finally {
        activeProgressCallback.current = null;
      }
    },
    [isLoaded, loadFFmpeg]
  );

  return (
    <FFmpegContext.Provider
      value={{
        ffmpeg: ffmpegRef.current,
        isLoaded,
        isLoading,
        loadProgress,
        loadError,
        loadFFmpeg,
        runFFmpeg,
        logs,
        clearLogs,
      }}
    >
      {children}
    </FFmpegContext.Provider>
  );
};

export const useFFmpeg = () => useContext(FFmpegContext);
