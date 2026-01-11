import { mantle } from "@/lib/web3/mantleConstants";

const network = mantle.sepolia;
const explorerBase = network.explorerBaseUrl.replace(/\/$/, "");

export const mantleConfig = {
  chainId: network.chainId,
  rpcUrl: network.rpcUrl,
  explorerBase,
  faucetUrl: network.faucetUrl,
  bridgeUrl: network.bridgeUrl,
  wmntAddress: network.wmnt as `0x${string}`,
} as const;

export function explorerTxUrl(txHash: string) {
  return `${mantleConfig.explorerBase}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string) {
  return `${mantleConfig.explorerBase}/address/${address}`;
}

export function explorerTokenUrl(address: string, tokenId: string | number | bigint) {
  return `${mantleConfig.explorerBase}/token/${address}?a=${tokenId.toString()}`;
}
