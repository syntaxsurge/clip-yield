"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { requirePublicEnv } from "@/lib/env/public";
import { mantleSepolia } from "@/lib/web3/mantle";

type Web3Globals = typeof globalThis & {
  __clipYieldWagmiConfig?: ReturnType<typeof getDefaultConfig>;
  __clipYieldQueryClient?: QueryClient;
};

const getWeb3Config = () => {
  const globalForWeb3 = globalThis as Web3Globals;
  if (!globalForWeb3.__clipYieldWagmiConfig) {
    globalForWeb3.__clipYieldWagmiConfig = getDefaultConfig({
      appName: "ClipYield",
      projectId: requirePublicEnv(
        process.env.NEXT_PUBLIC_WC_PROJECT_ID,
        "NEXT_PUBLIC_WC_PROJECT_ID",
      ),
      chains: [mantleSepolia],
      ssr: false,
    });
  }
  return globalForWeb3.__clipYieldWagmiConfig;
};

const getQueryClient = () => {
  const globalForWeb3 = globalThis as Web3Globals;
  if (!globalForWeb3.__clipYieldQueryClient) {
    globalForWeb3.__clipYieldQueryClient = new QueryClient();
  }
  return globalForWeb3.__clipYieldQueryClient;
};

const config = getWeb3Config();
const queryClient = getQueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
