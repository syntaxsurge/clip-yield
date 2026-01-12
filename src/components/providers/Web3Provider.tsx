"use client";

import { useState } from "react";
import { PrivyProvider, type PrivyClientConfig } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mantleSepolia } from "@/lib/web3/mantle";
import { mantleConfig } from "@/lib/web3/mantleConfig";
import { requirePublicEnv } from "@/lib/env/public";

const supportedChains = [mantleSepolia] as const;

const wagmiConfig = createConfig({
  ssr: true,
  chains: supportedChains,
  transports: {
    [mantleSepolia.id]: http(mantleConfig.rpcUrl),
  },
  connectors: [injected({ shimDisconnect: true })],
  multiInjectedProviderDiscovery: false,
});

const privyConfig = {
  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
    },
  },
  loginMethods: ["email"],
  appearance: {
    loginGroupPriority: "web2-first",
  },
  defaultChain: mantleSepolia,
  supportedChains,
} satisfies PrivyClientConfig;

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const privyAppId = requirePublicEnv(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    "NEXT_PUBLIC_PRIVY_APP_ID",
  );

  return (
    <PrivyProvider
      appId={privyAppId}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
