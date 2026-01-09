import { convexClient } from "@/lib/convex/client";
import { getCreatorVaultByWallet } from "@/lib/convex/functions";
import type { CreatorVaultRecord } from "@/app/types";

const useGetCreatorVaultByWallet = async (
  wallet: string,
): Promise<CreatorVaultRecord | null> => {
  if (!wallet) return null;

  const record = (await convexClient.query(getCreatorVaultByWallet, {
    wallet,
  })) as CreatorVaultRecord | null;

  if (!record) return null;

  return {
    wallet: record.wallet,
    vault: record.vault,
    txHash: record.txHash,
    createdAt: record.createdAt,
  };
};

export default useGetCreatorVaultByWallet;
