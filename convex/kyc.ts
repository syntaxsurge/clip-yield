import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAddress, isAddress } from "viem";
import { getEnv } from "./env";
import { anyApi } from "convex/server";

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

export const getInquiryById = query({
  args: { inquiryId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kycInquiries")
      .withIndex("by_inquiryId", (q) => q.eq("inquiryId", args.inquiryId))
      .unique();
  },
});

export const getWalletVerification = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    if (!isAddress(args.walletAddress)) {
      throw new Error("Invalid wallet address.");
    }

    const walletAddress = getAddress(args.walletAddress);

    return await ctx.db
      .query("walletVerifications")
      .withIndex("by_walletAddress", (q) =>
        q.eq("walletAddress", walletAddress),
      )
      .unique();
  },
});

export const getLatestInquiryByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    if (!isAddress(args.walletAddress)) {
      throw new Error("Invalid wallet address.");
    }

    const walletAddress = getAddress(args.walletAddress);

    return await ctx.db
      .query("kycInquiries")
      .withIndex("by_walletAddress_updatedAt", (q) =>
        q.eq("walletAddress", walletAddress),
      )
      .order("desc")
      .first();
  },
});

export const setWalletVerified = mutation({
  args: {
    walletAddress: v.string(),
    verified: v.boolean(),
    txHash: v.optional(v.string()),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expected = getEnv("KYC_SYNC_SECRET");
    if (expected && args.secret !== expected) {
      throw new Error("Invalid KYC sync secret.");
    }

    if (!isAddress(args.walletAddress)) {
      throw new Error("Invalid wallet address.");
    }

    const walletAddress = getAddress(args.walletAddress);

    return await ctx.runMutation(anyApi.internal_kyc.setWalletVerified, {
      walletAddress,
      verified: args.verified,
      txHash: args.txHash,
    });
  },
});
