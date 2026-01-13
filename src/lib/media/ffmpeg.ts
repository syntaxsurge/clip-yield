"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";

const loadTimeoutMs = 60000;

function isCrossOriginIsolated() {
  if (typeof window === "undefined") return true;
  return Boolean(window.crossOriginIsolated);
}

export async function createLoadedFfmpeg(options?: {
  onLog?: (message: string) => void;
}) {
  if (typeof window === "undefined") {
    throw new Error("FFmpeg can only be loaded in the browser.");
  }

  if (!isCrossOriginIsolated()) {
    throw new Error(
      "FFmpeg requires cross-origin isolation. Reload this editor page so COOP/COEP headers apply.",
    );
  }

  const ffmpeg = new FFmpeg();

  if (options?.onLog) {
    ffmpeg.on("log", ({ message }) => {
      options.onLog?.(message);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), loadTimeoutMs);

  try {
    const coreURL = new URL("/ffmpeg/ffmpeg-core.js", window.location.origin);
    const wasmURL = new URL("/ffmpeg/ffmpeg-core.wasm", window.location.origin);

    await ffmpeg.load(
      {
        coreURL: coreURL.toString(),
        wasmURL: wasmURL.toString(),
      },
      { signal: controller.signal },
    );

    return ffmpeg;
  } catch (error) {
    try {
      ffmpeg.terminate();
    } catch {
      // ignore
    }

    const message = error instanceof Error ? error.message : "Unknown error.";
    throw new Error(`Failed to load FFmpeg. ${message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
