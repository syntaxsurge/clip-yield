import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveCoreDistDir() {
  const coreEntryPath = require.resolve("@ffmpeg/core");
  const coreDir = path.resolve(path.dirname(coreEntryPath), "..", "..");

  const distCandidates = [
    path.join(coreDir, "dist", "esm"),
    path.join(coreDir, "dist", "umd"),
  ];

  for (const distDir of distCandidates) {
    const coreJsPath = path.join(distDir, "ffmpeg-core.js");
    const coreWasmPath = path.join(distDir, "ffmpeg-core.wasm");
    if ((await pathExists(coreJsPath)) && (await pathExists(coreWasmPath))) {
      return distDir;
    }
  }

  throw new Error(
    [
      "FFmpeg core files not found.",
      `Checked: ${distCandidates.map((dir) => JSON.stringify(dir)).join(", ")}`,
      "Ensure @ffmpeg/core is installed and provides dist/esm or dist/umd.",
    ].join("\n"),
  );
}

async function main() {
  const distDir = await resolveCoreDistDir();
  const outDir = path.join(process.cwd(), "public", "ffmpeg");

  await fs.mkdir(outDir, { recursive: true });

  const requiredFiles = ["ffmpeg-core.js", "ffmpeg-core.wasm"];
  for (const filename of requiredFiles) {
    await fs.copyFile(path.join(distDir, filename), path.join(outDir, filename));
  }

  const optionalFiles = ["ffmpeg-core.worker.js"];
  for (const filename of optionalFiles) {
    const src = path.join(distDir, filename);
    if (await pathExists(src)) {
      await fs.copyFile(src, path.join(outDir, filename));
    }
  }

  console.log(`[ffmpeg] Copied core assets from ${distDir} → ${outDir}`);
}

main().catch((error) => {
  console.error("[ffmpeg] Failed to copy core assets.");
  console.error(error);
  process.exit(1);
});
