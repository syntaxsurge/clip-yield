"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const localBaseURL = "/ffmpeg";
const remoteBaseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
const loadTimeoutMs = 60000;

export async function createLoadedFfmpeg(options?: {
  onLog?: (message: string) => void;
}) {
  const ffmpeg = new FFmpeg();

  if (options?.onLog) {
    ffmpeg.on("log", ({ message }) => {
      options.onLog?.(message);
    });
  }

  const loadFromBase = async (baseURL: string) => {
    const coreURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.js`,
      "text/javascript",
    );
    const wasmURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm",
    );
    await ffmpeg.load({ coreURL, wasmURL });
  };

  const loadWithTimeout = async (label: string, loader: () => Promise<void>) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Timed out while loading FFmpeg from ${label}.`));
      }, loadTimeoutMs);
    });

    try {
      await Promise.race([loader(), timeout]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  try {
    await loadWithTimeout("CDN", () => loadFromBase(remoteBaseURL));
  } catch (error) {
    console.warn(
      "Failed to load FFmpeg core from CDN, falling back to local.",
      error,
    );
    await loadWithTimeout("local assets", () => loadFromBase(localBaseURL));
  }

  return ffmpeg;
}
