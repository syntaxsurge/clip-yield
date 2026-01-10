import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import * as dotenv from "dotenv";
import path from "node:path";
import type { HardhatUserConfig } from "hardhat/config";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const privateKey = process.env.PRIVATE_KEY;
const accounts = privateKey ? [privateKey] : [];
const mantlescanApiKey = process.env.API_KEY ?? "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  defaultNetwork: "mantleSepolia",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    mantle: {
      url: "https://rpc.mantle.xyz",
      chainId: 5000,
      accounts,
    },
    mantleSepolia: {
      url: "https://rpc.sepolia.mantle.xyz",
      chainId: 5003,
      accounts,
      gasPrice: 20_000_000,
    },
  },
  etherscan: {
    apiKey: {
      mantle: mantlescanApiKey,
      mantleSepolia: mantlescanApiKey,
    },
    customChains: [
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://api.mantlescan.xyz/api",
          browserURL: "https://mantlescan.xyz",
        },
      },
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: "https://api-sepolia.mantlescan.xyz/api",
          browserURL: "https://sepolia.mantlescan.xyz",
        },
      },
    ],
  },
};

export default config;
