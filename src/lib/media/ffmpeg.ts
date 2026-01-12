"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const localBaseURL = "/ffmpeg";
const remoteBaseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

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

  try {
    await loadFromBase(localBaseURL);
  } catch (error) {
    console.warn("Failed to load local FFmpeg core, falling back to CDN.", error);
    await loadFromBase(remoteBaseURL);
  }

  return ffmpeg;
}
