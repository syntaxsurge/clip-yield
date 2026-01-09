import { convexClient } from "@/lib/convex/client";
import { getCampaignReceipt } from "@/lib/convex/functions";
import type { CampaignReceipt } from "@/app/types";

const useGetCampaignReceiptById = async (
  campaignId: string,
): Promise<CampaignReceipt | null> => {
  if (!campaignId) return null;
  return (await convexClient.query(getCampaignReceipt, {
    campaignId,
  })) as CampaignReceipt | null;
};

export default useGetCampaignReceiptById;
