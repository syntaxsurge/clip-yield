"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";

const loadTimeoutMs = 60000;

let hasWarnedAboutIsolation = false;

export async function createLoadedFfmpeg(options?: {
  onLog?: (message: string) => void;
}) {
  if (typeof window === "undefined") {
    throw new Error("FFmpeg can only be loaded in the browser.");
  }

  if (!window.crossOriginIsolated && !hasWarnedAboutIsolation) {
    hasWarnedAboutIsolation = true;
    console.warn(
      "FFmpeg: cross-origin isolation is not enabled. Continuing with single-thread FFmpeg; multi-threaded FFmpeg requires COOP/COEP headers in a compatible browser.",
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
    const isolationHint = window.crossOriginIsolated
      ? ""
      : " (Cross-origin isolation is disabled; if FFmpeg fails to load, use a COOP/COEP-enabled browser session.)";
    throw new Error(`Failed to load FFmpeg. ${message}${isolationHint}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
