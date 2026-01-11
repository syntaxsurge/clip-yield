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
} as const;
