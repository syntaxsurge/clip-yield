import { defineChain } from "viem";
import { mantleConfig } from "@/lib/web3/mantleConfig";

export const mantleSepolia = defineChain({
  id: mantleConfig.chainId,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: {
      http: [mantleConfig.rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle Explorer",
      url: mantleConfig.explorerBase,
    },
  },
  testnet: true,
});
