import { requirePublicAddress } from "@/lib/env/public";
import { mantleConfig } from "@/lib/web3/mantleConfig";

export const mantleSepoliaContracts = {
  chainId: mantleConfig.chainId,
  wmnt: mantleConfig.wmntAddress,
  kycRegistry: requirePublicAddress(
    process.env.NEXT_PUBLIC_KYC_REGISTRY_ADDRESS,
    "NEXT_PUBLIC_KYC_REGISTRY_ADDRESS",
  ),
  clipYieldVault: requirePublicAddress(
    process.env.NEXT_PUBLIC_CLIPYIELD_VAULT_ADDRESS,
    "NEXT_PUBLIC_CLIPYIELD_VAULT_ADDRESS",
  ),
  boostFactory: requirePublicAddress(
    process.env.NEXT_PUBLIC_BOOST_FACTORY_ADDRESS,
    "NEXT_PUBLIC_BOOST_FACTORY_ADDRESS",
  ),
  sponsorHub: requirePublicAddress(
    process.env.NEXT_PUBLIC_SPONSOR_HUB_ADDRESS,
    "NEXT_PUBLIC_SPONSOR_HUB_ADDRESS",
  ),
  invoiceReceipts: requirePublicAddress(
    process.env.NEXT_PUBLIC_INVOICE_RECEIPTS_ADDRESS,
    "NEXT_PUBLIC_INVOICE_RECEIPTS_ADDRESS",
  ),
  boostPass: requirePublicAddress(
    process.env.NEXT_PUBLIC_BOOST_PASS_ADDRESS,
    "NEXT_PUBLIC_BOOST_PASS_ADDRESS",
  ),
  yieldStreamer: requirePublicAddress(
    process.env.NEXT_PUBLIC_YIELD_STREAMER_ADDRESS,
    "NEXT_PUBLIC_YIELD_STREAMER_ADDRESS",
  ),
} as const;

export const mantleSepoliaContractCatalog = [
  {
    id: "wmnt",
    name: "WMNT",
    address: mantleSepoliaContracts.wmnt,
    description:
      "Wrapped Mantle token used for boosts, sponsorships, and vault deposits.",
    tags: ["ERC-20", "Asset"],
    group: "assets",
  },
  {
    id: "kyc-registry",
    name: "KYC Registry",
    address: mantleSepoliaContracts.kycRegistry,
    description:
      "Access-control registry that stores on-chain verification status for protocol flows.",
    tags: ["Registry", "Access"],
    group: "core",
  },
  {
    id: "yield-vault",
    name: "ClipYield Vault",
    address: mantleSepoliaContracts.clipYieldVault,
    description:
      "ERC-4626 vault for WMNT deposits, redemptions, and protocol fee yield.",
    tags: ["ERC-4626", "Vault"],
    group: "core",
  },
  {
    id: "boost-factory",
    name: "Boost Vault Factory",
    address: mantleSepoliaContracts.boostFactory,
    description:
      "Deploys per-creator boost vaults and maps creator wallets to vault addresses.",
    tags: ["Factory", "Creator"],
    group: "core",
  },
  {
    id: "sponsor-hub",
    name: "Sponsor Hub",
    address: mantleSepoliaContracts.sponsorHub,
    description:
      "Routes sponsor payments, collects protocol fees, and funds creator boost vaults.",
    tags: ["Sponsorship", "Payments"],
    group: "sponsorship",
  },
  {
    id: "invoice-receipts",
    name: "Invoice Receipts",
    address: mantleSepoliaContracts.invoiceReceipts,
    description:
      "ERC-721 receipts that track sponsorship campaigns and invoice metadata.",
    tags: ["ERC-721", "Receipts"],
    group: "sponsorship",
  },
  {
    id: "boost-pass",
    name: "Boost Pass",
    address: mantleSepoliaContracts.boostPass,
    description:
      "ERC-1155 soulbound pass minted for leaderboard rewards and remix perks.",
    tags: ["ERC-1155", "Perks"],
    group: "perks",
  },
  {
    id: "yield-streamer",
    name: "Simulated Yield Streamer",
    address: mantleSepoliaContracts.yieldStreamer,
    description:
      "Testnet yield streamer that drips WMNT into the vault to simulate returns.",
    tags: ["Yield", "Streamer"],
    group: "perks",
  },
] as const;
