import { requirePublicEnv } from "@/lib/env/public";
import { mantleConfig } from "@/lib/web3/mantleConfig";

export const mantleSepoliaContracts = {
  chainId: mantleConfig.chainId,
  wmnt: mantleConfig.wmntAddress,
  kycRegistry: requirePublicEnv(
    process.env.NEXT_PUBLIC_KYC_REGISTRY_ADDRESS,
    "NEXT_PUBLIC_KYC_REGISTRY_ADDRESS",
  ),
  clipYieldVault: requirePublicEnv(
    process.env.NEXT_PUBLIC_CLIPYIELD_VAULT_ADDRESS,
    "NEXT_PUBLIC_CLIPYIELD_VAULT_ADDRESS",
  ),
  boostFactory: requirePublicEnv(
    process.env.NEXT_PUBLIC_BOOST_FACTORY_ADDRESS,
    "NEXT_PUBLIC_BOOST_FACTORY_ADDRESS",
  ),
  sponsorHub: requirePublicEnv(
    process.env.NEXT_PUBLIC_SPONSOR_HUB_ADDRESS,
    "NEXT_PUBLIC_SPONSOR_HUB_ADDRESS",
  ),
  boostPass: requirePublicEnv(
    process.env.NEXT_PUBLIC_BOOST_PASS_ADDRESS,
    "NEXT_PUBLIC_BOOST_PASS_ADDRESS",
  ),
} as const;
