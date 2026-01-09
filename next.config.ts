import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const crossOriginIsolationHeaders = [
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
      {
        key: "Cross-Origin-Embedder-Policy",
        value: "credentialless",
      },
    ];

    return [
      {
        source: "/projects/:path*",
        headers: crossOriginIsolationHeaders,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@react-native-async-storage/async-storage": path.resolve(
        __dirname,
        "src/lib/shims/async-storage.ts",
      ),
      lit: path.resolve(__dirname, "node_modules/lit"),
      "lit-html": path.resolve(__dirname, "node_modules/lit-html"),
      "lit-element": path.resolve(__dirname, "node_modules/lit-element"),
      "@lit/reactive-element": path.resolve(
        __dirname,
        "node_modules/@lit/reactive-element",
      ),
    };
    return config;
  },
};

export default nextConfig;
