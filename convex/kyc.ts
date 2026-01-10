import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAddress, isAddress } from "viem";

export const upsertInquiry = mutation({
  args: {
    inquiryId: v.string(),
    walletAddress: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isAddress(args.walletAddress)) {
      throw new Error("Invalid wallet address for KYC inquiry.");
    }

    const walletAddress = getAddress(args.walletAddress);

    const existing = await ctx.db
      .query("kycInquiries")
      .withIndex("by_inquiryId", (q) => q.eq("inquiryId", args.inquiryId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        walletAddress,
        status: args.status,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("kycInquiries", {
      inquiryId: args.inquiryId,
      walletAddress,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
