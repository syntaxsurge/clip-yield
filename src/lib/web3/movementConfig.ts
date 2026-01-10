const DEFAULT_MOVEMENT_FULLNODE_URL = "https://full.testnet.movementinfra.xyz/v1";
const DEFAULT_MOVEMENT_EXPLORER_BASE =
  "https://explorer.testnet.imola.movementlabs.xyz";
const DEFAULT_MOVEMENT_COIN_TYPE = "0x1::aptos_coin::AptosCoin";

const explorerBase = (
  process.env.NEXT_PUBLIC_MOVEMENT_EXPLORER_BASE ??
  process.env.MOVEMENT_EXPLORER_BASE ??
  DEFAULT_MOVEMENT_EXPLORER_BASE
).replace(/\/$/, "");

export const movementConfig = {
  fullnodeUrl: process.env.MOVEMENT_FULLNODE_URL ?? DEFAULT_MOVEMENT_FULLNODE_URL,
  explorerBase,
  coinType: process.env.MOVEMENT_COIN_TYPE ?? DEFAULT_MOVEMENT_COIN_TYPE,
} as const;

export function movementTxUrl(txHash: string) {
  return `${movementConfig.explorerBase}/txn/${txHash}`;
}

export function movementAddressUrl(address: string) {
  return `${movementConfig.explorerBase}/account/${address}`;
}
