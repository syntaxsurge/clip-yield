import { convexClient } from "@/lib/convex/client";
import { ensureProfile } from "@/lib/convex/functions";

const useCreateProfile = async (userId: string, name?: string) => {
  try {
    return await convexClient.mutation(ensureProfile, {
      wallet: userId,
      name,
    });
  } catch (error) {
    throw error;
  }
};

export default useCreateProfile;
