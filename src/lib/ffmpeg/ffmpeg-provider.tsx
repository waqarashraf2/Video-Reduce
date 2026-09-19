"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { ProcessProgress } from "./types";
import { FFmpegCommandStep } from "./commands";

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
    args: string[] | FFmpegCommandStep[],
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

const MT_URL_UNPKG = `https://unpkg.com/@ffmpeg/core-mt@${FFMPEG_CORE_VERSION}/dist/umd`;
const MT_URL_JSDELIVR = `https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@${FFMPEG_CORE_VERSION}/dist/umd`;

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
  const phaseBaseProgressRef = useRef<number>(0);
  const phaseWeightRef = useRef<number>(1.0);
  const phaseDescRef = useRef<string>("");

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
        let stepRatio = progress;
        // Accurate ratio calculation if progress is 0 or uninformative
        if ((!stepRatio || stepRatio <= 0) && time > 0 && durationRef.current > 0) {
          stepRatio = Math.min(0.99, (time / 1000000) / durationRef.current);
        }
        stepRatio = Math.max(0, Math.min(1, stepRatio || 0));

        const overallRatio = Math.max(
          0,
          Math.min(0.99, phaseBaseProgressRef.current + stepRatio * phaseWeightRef.current)
        );
        const percent = Math.round(overallRatio * 100);

        let estimatedRemainingSecs: number | undefined;
        if (startTimeRef.current && overallRatio > 0.05 && overallRatio < 0.99) {
          const elapsedSecs = (Date.now() - startTimeRef.current) / 1000;
          const totalEstimatedSecs = elapsedSecs / overallRatio;
          estimatedRemainingSecs = Math.max(1, Math.round(totalEstimatedSecs - elapsedSecs));
        }

        if (activeProgressCallback.current) {
          activeProgressCallback.current({
            ratio: overallRatio,
            percent,
            time: time / 1000000 || 0,
            estimatedRemainingSecs,
            speed: phaseDescRef.current || undefined,
          });
        }
      });

      const isMultiThreadSupported =
        typeof window !== "undefined" &&
        Boolean(window.crossOriginIsolated) &&
        typeof window.SharedArrayBuffer !== "undefined";

      let coreURL: string;
      let wasmURL: string;

      // Load Official Rock-Solid FFmpeg Core (100% stable, zero indirect call signature mismatch)
      console.log("🚀 [FFmpeg] Loading stable WebAssembly media engine...");
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
      console.log("✅ [FFmpeg] Stable WebAssembly core loaded successfully!");
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
      args: string[] | FFmpegCommandStep[],
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
      let hasRealProgress = false;
      let heartbeatRatio = 0;

      const logCollector = ({ message }: { message: string }) => {
        currentLogs.push(message);

        // Real-time fallback progress parsing from ffmpeg stderr output
        const timeMatch = message.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d+)/);
        if (timeMatch && durationRef.current > 0) {
          hasRealProgress = true;
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const seconds = parseFloat(timeMatch[3]);
          const currentSecs = hours * 3600 + minutes * 60 + seconds;

          const stepRatio = Math.min(0.99, Math.max(0, currentSecs / durationRef.current));
          const overallRatio = Math.max(
            heartbeatRatio,
            Math.min(0.99, phaseBaseProgressRef.current + stepRatio * phaseWeightRef.current)
          );
          const percent = Math.round(overallRatio * 100);

          let estimatedRemainingSecs: number | undefined;
          if (startTimeRef.current && overallRatio > 0.05 && overallRatio < 0.99) {
            const elapsedSecs = (Date.now() - startTimeRef.current) / 1000;
            const totalEstimatedSecs = elapsedSecs / overallRatio;
            estimatedRemainingSecs = Math.max(1, Math.round(totalEstimatedSecs - elapsedSecs));
          }

          if (activeProgressCallback.current) {
            activeProgressCallback.current({
              ratio: overallRatio,
              percent,
              time: currentSecs,
              estimatedRemainingSecs,
              speed: phaseDescRef.current || undefined,
            });
          }
        }
      };
      ffmpeg.on("log", logCollector);

      const isMulti =
        Array.isArray(args) &&
        args.length > 0 &&
        typeof args[0] === "object" &&
        "args" in (args[0] as any);

      const steps: FFmpegCommandStep[] = isMulti
        ? (args as FFmpegCommandStep[])
        : [{ args: args as string[], progressWeight: 1.0 }];

      phaseBaseProgressRef.current = 0;
      let heartbeatTimer: any = null;

      try {
        // Heartbeat progress for filters like reverse/rewind that buffer in RAM before first frame
        heartbeatTimer = setInterval(() => {
          if (!hasRealProgress && activeProgressCallback.current && heartbeatRatio < 0.35) {
            heartbeatRatio = Math.min(0.35, heartbeatRatio + 0.05);
            activeProgressCallback.current({
              ratio: heartbeatRatio,
              percent: Math.round(heartbeatRatio * 100),
              time: 0,
              speed: "Decoding & buffering video frames...",
            });
          }
        }, 600);

        // 1. Write input file to in-memory virtual filesystem
        await ffmpeg.writeFile(inputData.name, inputData.buffer);

        // Immediately release JavaScript buffer reference to free host browser memory
        (inputData as any).buffer = null;

        // 2. Execute command step(s)
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          phaseWeightRef.current = step.progressWeight ?? 1.0 / steps.length;
          phaseDescRef.current = step.phaseDescription || "";

          // Initial phase notification
          if (activeProgressCallback.current) {
            activeProgressCallback.current({
              ratio: phaseBaseProgressRef.current,
              percent: Math.round(phaseBaseProgressRef.current * 100),
              time: 0,
              speed: step.phaseDescription,
            });
          }

          let exitCode: number;
          try {
            exitCode = await ffmpeg.exec(step.args);
          } catch (execErr: any) {
            const errStr = String(execErr?.message || execErr);
            if (
              errStr.includes("Aborted(OOM)") ||
              errStr.includes("Cannot enlarge memory") ||
              errStr.includes("out of memory")
            ) {
              throw new Error(
                "Memory limit reached (OOM). To reverse this video safely in browser memory, please select a shorter clip (5s or 8s) or choose Turbo Fast mode."
              );
            }
            throw execErr;
          }

          if (exitCode !== 0) {
            const lastLogs = currentLogs.slice(-12).join("\n");

            // Auto-recovery: If audio filter failed because input file has no audio stream,
            // retry with -an (no audio) seamlessly so processing never fails!
            if (
              lastLogs.includes("unlabeled input pad 0 on filter areverse") ||
              lastLogs.includes("Cannot find a matching stream for unlabeled input pad") ||
              lastLogs.includes("does not contain any audio stream") ||
              lastLogs.includes("matches no streams") ||
              lastLogs.includes("filter atrim") ||
              lastLogs.includes("filter areverse")
            ) {
              console.warn("⚠️ [FFmpeg] Input video has no audio stream, retrying with -an...");
              const sanitizedArgs: string[] = [];
              const originalArgs = step.args;
              for (let a = 0; a < originalArgs.length; a++) {
                const cur = originalArgs[a];
                const prev = a > 0 ? originalArgs[a - 1] : "";
                if (
                  cur === "-af" || prev === "-af" ||
                  cur === "-c:a" || prev === "-c:a" ||
                  cur === "-b:a" || prev === "-b:a" ||
                  cur === "-acodec" || prev === "-acodec"
                ) {
                  continue;
                }
                sanitizedArgs.push(cur);
              }
              // Insert -an before output filename (last arg)
              const outputPos = sanitizedArgs.length - 1;
              sanitizedArgs.splice(outputPos, 0, "-an");

              exitCode = await ffmpeg.exec(sanitizedArgs);
            }

            if (exitCode !== 0) {
              const finalLogs = currentLogs.slice(-8).join("\n");
              if (
                finalLogs.includes("Aborted(OOM)") ||
                finalLogs.includes("Cannot enlarge memory") ||
                finalLogs.includes("out of memory")
              ) {
                throw new Error(
                  "Memory limit reached (OOM). To reverse this video safely in browser memory, please select a shorter clip (5s or 8s) or choose Turbo Fast mode."
                );
              }
              throw new Error(`FFmpeg error (code ${exitCode}): ${finalLogs || "Operation failed"}`);
            }
          }

          // Cleanup intermediate step artifacts (e.g. temporary palette.png)
          if (step.cleanupFiles && step.cleanupFiles.length > 0) {
            for (const f of step.cleanupFiles) {
              try {
                await ffmpeg.deleteFile(f);
              } catch (_) {}
            }
          }

          phaseBaseProgressRef.current = Math.min(
            0.99,
            phaseBaseProgressRef.current + phaseWeightRef.current
          );
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
          for (const step of steps) {
            if (step.cleanupFiles) {
              for (const f of step.cleanupFiles) {
                try {
                  await ffmpeg.deleteFile(f);
                } catch (_) {}
              }
            }
          }
        } catch (_) {}

        const errMsg = String(err?.message || err);
        if (
          errMsg.includes("Aborted(OOM)") ||
          errMsg.includes("Cannot enlarge memory") ||
          errMsg.includes("out of memory")
        ) {
          throw new Error(
            "Memory limit reached (OOM). To reverse this video safely in browser memory, please select a shorter clip (5s or 8s) or choose Turbo Fast mode."
          );
        }
        throw err;
      } finally {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        ffmpeg.off("log", logCollector);
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
