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
};

export default nextConfig;
