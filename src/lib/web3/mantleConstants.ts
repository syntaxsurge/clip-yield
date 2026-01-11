import { getAddress } from "viem";

export const mantle = {
  mainnet: {
    chainId: 5000,
    rpcUrl: "https://rpc.mantle.xyz",
    explorerBaseUrl: "https://mantlescan.xyz",
    wmnt: getAddress("0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8"),
  },
  sepolia: {
    chainId: 5003,
    rpcUrl: "https://rpc.sepolia.mantle.xyz",
    explorerBaseUrl: "https://sepolia.mantlescan.xyz",
    faucetUrl: "https://faucet.sepolia.mantle.xyz/",
    bridgeUrl: "https://app.mantle.xyz/bridge?network=sepolia",
    wmnt: getAddress("0x19f5557E23e9914A18239990f6C70D68FDF0deD5"),
  },
} as const;
