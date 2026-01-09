export const mantle = {
  mainnet: {
    chainId: 5000,
    rpcUrl: "https://rpc.mantle.xyz",
    explorerBaseUrl: "https://explorer.mantle.xyz",
    wmnt: "0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8",
  },
  sepolia: {
    chainId: 5003,
    rpcUrl: "https://rpc.sepolia.mantle.xyz",
    explorerBaseUrl: "https://explorer.testnet.mantle.xyz",
    faucetUrl: "https://faucet.testnet.mantle.xyz/",
    bridgeUrl: "https://bridge.testnet.mantle.xyz/",
    wmnt: "0x19f5557Eed0A61564eE400a6bf8fca289AA65F63",
  },
} as const;
