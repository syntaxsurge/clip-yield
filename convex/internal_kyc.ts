import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { resolveActivityChainId, upsertActivityEvent } from "./lib/activity";

export const getInquiryById = internalQuery({
  args: { inquiryId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kycInquiries")
      .withIndex("by_inquiryId", (q) => q.eq("inquiryId", args.inquiryId))
      .unique();
  },
});

export const setInquiryStatus = internalMutation({
  args: { inquiryId: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("kycInquiries")
      .withIndex("by_inquiryId", (q) => q.eq("inquiryId", args.inquiryId))
      .unique();

    if (!row) return null;

    await ctx.db.patch(row._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return row._id;
  },
});

export const setWalletVerified = internalMutation({
  args: {
    walletAddress: v.string(),
    verified: v.boolean(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("walletVerifications")
      .withIndex("by_walletAddress", (q) =>
        q.eq("walletAddress", args.walletAddress),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        verified: args.verified,
        txHash: args.txHash,
        updatedAt: Date.now(),
      });

      if (args.verified && args.txHash) {
        await upsertActivityEvent(ctx, {
          wallet: args.walletAddress,
          chainId: resolveActivityChainId(),
          txHash: args.txHash,
          kind: "kyc_onchain_update",
          status: "confirmed",
          title: "KYC verified on-chain",
          subtitle: "KYC registry updated",
          href: "/kyc/complete",
        });
      }

      return existing._id;
    }

    const id = await ctx.db.insert("walletVerifications", {
      walletAddress: args.walletAddress,
      verified: args.verified,
      txHash: args.txHash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (args.verified && args.txHash) {
      await upsertActivityEvent(ctx, {
        wallet: args.walletAddress,
        chainId: resolveActivityChainId(),
        txHash: args.txHash,
        kind: "kyc_onchain_update",
        status: "confirmed",
        title: "KYC verified on-chain",
        subtitle: "KYC registry updated",
        href: "/kyc/complete",
      });
    }

    return id;
  },
});

export const getWalletVerification = internalQuery({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("walletVerifications")
      .withIndex("by_walletAddress", (q) =>
        q.eq("walletAddress", args.walletAddress),
      )
      .unique();
  },
});
