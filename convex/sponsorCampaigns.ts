import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    postId: v.id("posts"),
    clipHash: v.string(),
    creatorId: v.string(),
    vaultAddress: v.string(),
    sponsorAddress: v.string(),
    assets: v.string(),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sponsorCampaigns", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const byPostId = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    return await ctx.db
      .query("sponsorCampaigns")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .order("desc")
      .first();
  },
});
