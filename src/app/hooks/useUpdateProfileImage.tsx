import { convexClient } from "@/lib/convex/client";
import { updateProfile } from "@/lib/convex/functions";

const useUpdateProfileImage = async (userId: string, image: string) => {
  try {
    return await convexClient.mutation(updateProfile, {
      wallet: userId,
      image,
    });
  } catch (error) {
    throw error;
  }
};

export default useUpdateProfileImage;
