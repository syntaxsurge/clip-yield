"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { requirePublicEnv } from "@/lib/env/public";
import { mantleSepolia } from "@/lib/web3/mantle";

const config = getDefaultConfig({
  appName: "ClipYield",
  projectId: requirePublicEnv(
    process.env.NEXT_PUBLIC_WC_PROJECT_ID,
    "NEXT_PUBLIC_WC_PROJECT_ID",
  ),
  chains: [mantleSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
