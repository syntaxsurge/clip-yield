"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const localBaseURL = "/ffmpeg";
const remoteBaseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
const loadTimeoutMs = 60000;
const classWorkerURL = "/ffmpeg/ffmpeg-worker.js";

export async function createLoadedFfmpeg(options?: {
  onLog?: (message: string) => void;
  onLoadProgress?: (event: {
    phase: "core" | "wasm";
    url: string;
    total: number;
    received: number;
    delta: number;
    done: boolean;
  }) => void;
}) {
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
      Boolean(options?.onLoadProgress),
      (event) =>
        options?.onLoadProgress?.({
          phase: "core",
          url: String(event.url),
          total: event.total,
          received: event.received,
          delta: event.delta,
          done: event.done,
        }),
    );
    const wasmURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm",
      Boolean(options?.onLoadProgress),
      (event) =>
        options?.onLoadProgress?.({
          phase: "wasm",
          url: String(event.url),
          total: event.total,
          received: event.received,
          delta: event.delta,
          done: event.done,
        }),
    );

    await ffmpeg.load({ classWorkerURL, coreURL, wasmURL }, { signal });
  };

  const loadWithTimeout = async (label: string, baseURL: string) => {
    const ffmpeg = createInstance();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, loadTimeoutMs);

    try {
      await loadFromBase(ffmpeg, baseURL, controller.signal);
      return ffmpeg;
    } catch (error) {
      try {
        ffmpeg.terminate();
      } catch {
        // Ignore termination failures.
      }

      const message =
        error instanceof Error ? error.message : "Unknown error.";
      throw new Error(`Failed to load FFmpeg from ${label}. ${message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    return await loadWithTimeout("the CDN", remoteBaseURL);
  } catch (error) {
    console.warn("FFmpeg CDN load failed, trying local assets.", error);
    return await loadWithTimeout("local assets", localBaseURL);
  }
}
