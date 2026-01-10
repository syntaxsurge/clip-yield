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

  if (record) {
    return {
      wallet: record.wallet,
      vault: record.vault,
      txHash: record.txHash,
      createdAt: record.createdAt,
    };
  }

  try {
    const res = await fetch("/api/creator-vault/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    });

    if (!res.ok) return null;

    const payload = (await res.json()) as {
      ok?: boolean;
      walletAddress?: string;
      vault?: string | null;
      txHash?: string | null;
    };

    if (!payload?.ok || !payload.vault || !payload.walletAddress) {
      return null;
    }

    return {
      wallet: payload.walletAddress,
      vault: payload.vault,
      txHash: payload.txHash ?? null,
      createdAt: Date.now(),
    };
  } catch {
    return null;
  }
};

export default useGetCreatorVaultByWallet;
