"use client";

import { useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { createLoadedFfmpeg } from "@/lib/media/ffmpeg";
import FfmpegRender from "./FfmpegRender";
import RenderOptions from "./RenderOptions";
export default function Ffmpeg() {
  const [loadFfmpeg, setLoadedFfmpeg] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<{
    phase: "core" | "wasm";
    received: number;
    total: number;
  } | null>(null);
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
  const [logMessages, setLogMessages] = useState<string>("");

  const loadFFmpegFunction = async () => {
    setLoadedFfmpeg(false);
    setLoadError(null);
    try {
      setLogMessages("");
      const ffmpeg = await createLoadedFfmpeg({
        onLog: (message) => setLogMessages(message),
        onLoadProgress: (event) => {
          setLoadProgress({
            phase: event.phase,
            received: event.received,
            total: event.total,
          });
        },
      });
      ffmpegRef.current = ffmpeg;
      setLoadedFfmpeg(true);
      setLoadProgress(null);
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      setLoadError(
        error instanceof Error ? error.message : "Failed to load FFmpeg.",
      );
      setLoadProgress(null);
    }
  };

  useEffect(() => {
    loadFFmpegFunction();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center py-2">
      <RenderOptions />
      {!loadFfmpeg && !loadError ? (
        <p className="mt-2 text-xs text-white/60">
          {loadProgress
            ? `Loading FFmpeg ${loadProgress.phase === "core" ? "core" : "wasm"}${
                loadProgress.total > 0
                  ? ` (${Math.round((loadProgress.received / loadProgress.total) * 100)}%)`
                  : ""
              }…`
            : "Loading FFmpeg…"}
        </p>
      ) : null}
      <FfmpegRender
        loadFunction={loadFFmpegFunction}
        loadFfmpeg={loadFfmpeg}
        loadError={loadError}
        logMessages={logMessages}
        ffmpeg={ffmpegRef.current}
      />
    </div>
  );
}
