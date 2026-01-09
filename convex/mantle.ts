import { mantleSepoliaTestnet } from "@mantleio/viem/chains";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getEnv } from "./env";
import { mantle } from "../src/lib/web3/mantleConstants";

function requireMantleRpcUrl() {
  const rpcUrl =
    getEnv("MANTLE_SEPOLIA_RPC_URL") ??
    getEnv("NEXT_PUBLIC_MANTLE_RPC_URL") ??
    mantle.sepolia.rpcUrl;
  if (!rpcUrl) {
    throw new Error("Missing Mantle RPC URL.");
  }
  return rpcUrl;
}

export function createMantlePublicClient() {
  const rpcUrl = requireMantleRpcUrl();
  const chain = mantleSepoliaTestnet;
  const transport = http(rpcUrl);

  return { chain, publicClient: createPublicClient({ chain, transport }) };
}

export function createMantleClients(privateKey: string) {
  const rpcUrl = requireMantleRpcUrl();
  const chain = mantleSepoliaTestnet;

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const transport = http(rpcUrl);

  return {
    chain,
    publicClient: createPublicClient({ chain, transport }),
    walletClient: createWalletClient({ account, chain, transport }),
  };
}
