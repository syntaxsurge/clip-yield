"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const localBaseURL = "/ffmpeg";
const remoteBaseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
const loadTimeoutMs = 60000;

function isCrossOriginIsolated() {
  if (typeof window === "undefined") return true;
  return Boolean(window.crossOriginIsolated);
}

export async function createLoadedFfmpeg(options?: {
  onLog?: (message: string) => void;
}) {
  if (!isCrossOriginIsolated()) {
    throw new Error(
      "FFmpeg requires cross-origin isolation. Reload this editor page so COOP/COEP headers apply.",
    );
  }

  const createInstance = () => {
    const ffmpeg = new FFmpeg();

    if (options?.onLog) {
      ffmpeg.on("log", ({ message }) => {
        options.onLog?.(message);
      });
    }

    return ffmpeg;
  };

  const loadFromBase = async (
    ffmpeg: FFmpeg,
    baseURL: string,
    signal: AbortSignal,
  ) => {
    const coreURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.js`,
      "text/javascript",
    );
    const wasmURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm",
    );

    await ffmpeg.load({ coreURL, wasmURL }, { signal });
  };

  const loadWithTimeout = async (label: string, baseURL: string) => {
    const ffmpeg = createInstance();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), loadTimeoutMs);

    try {
      await loadFromBase(ffmpeg, baseURL, controller.signal);
      return ffmpeg;
    } catch (error) {
      try {
        ffmpeg.terminate();
      } catch {
        // ignore
      }
      const message =
        error instanceof Error ? error.message : "Unknown error.";
      throw new Error(`Failed to load FFmpeg from ${label}. ${message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    return await loadWithTimeout("local assets", localBaseURL);
  } catch (error) {
    console.warn("FFmpeg local load failed, trying the CDN.", error);
    return await loadWithTimeout("the CDN", remoteBaseURL);
  }
}
