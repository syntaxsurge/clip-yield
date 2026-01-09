import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { anyApi } from "convex/server";
import { getAddress, isAddress } from "viem";
import { getEnv, requireEnv } from "./env";
import { createMantleClients } from "./mantle";

const kycRegistryAbi = [
  {
    type: "function",
    name: "setVerified",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "verified", type: "bool" },
    ],
    outputs: [],
  },
] as const;

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

export const ingestWebhookEvent = mutation({
  args: {
    eventId: v.string(),
    eventName: v.string(),
    inquiryId: v.string(),
    createdAtIso: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("kycWebhookEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .unique();

    if (existing) return { ok: true, deduped: true };

    await ctx.db.insert("kycWebhookEvents", {
      eventId: args.eventId,
      eventName: args.eventName,
      inquiryId: args.inquiryId,
      createdAtIso: args.createdAtIso,
      receivedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, anyApi.kyc.processKycEvent, {
      inquiryId: args.inquiryId,
      eventName: args.eventName,
    });

    return { ok: true, deduped: false };
  },
});

export const processKycEvent = action({
  args: {
    inquiryId: v.string(),
    eventName: v.string(),
  },
  handler: async (ctx, args) => {
    const positiveEvents = new Set(["inquiry.completed", "inquiry.approved"]);

    const inquiry = await ctx.runQuery(
      anyApi.internal_kyc.getInquiryById,
      {
        inquiryId: args.inquiryId,
      },
    );

    if (!inquiry) {
      throw new Error(`KYC inquiry not found: ${args.inquiryId}`);
    }

    await ctx.runMutation(anyApi.internal_kyc.setInquiryStatus, {
      inquiryId: args.inquiryId,
      status: args.eventName,
    });

    if (!positiveEvents.has(args.eventName)) {
      return { ok: true, skippedOnchain: true };
    }

    if (!isAddress(inquiry.walletAddress)) {
      throw new Error(`Invalid wallet address stored: ${inquiry.walletAddress}`);
    }

    const walletAddress = getAddress(inquiry.walletAddress);
    const existingVerification = await ctx.runQuery(
      anyApi.internal_kyc.getWalletVerification,
      { walletAddress },
    );

    if (existingVerification?.verified) {
      return { ok: true, alreadyVerified: true };
    }

    const kycRegistry =
      getEnv("KYC_REGISTRY_ADDRESS") ??
      getEnv("NEXT_PUBLIC_KYC_REGISTRY_ADDRESS");

    if (!kycRegistry || !isAddress(kycRegistry)) {
      throw new Error("Missing or invalid KYC registry address.");
    }

    const privateKey = requireEnv("KYC_MANAGER_PRIVATE_KEY");
    const { publicClient, walletClient } = createMantleClients(privateKey);

    const txHash = await walletClient.writeContract({
      address: getAddress(kycRegistry),
      abi: kycRegistryAbi,
      functionName: "setVerified",
      args: [walletAddress, true],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    await ctx.runMutation(anyApi.internal_kyc.setWalletVerified, {
      walletAddress,
      verified: true,
      txHash,
    });

    let vaultAddress: string | null = null;
    let vaultError: string | null = null;

    try {
      const result = await ctx.runAction(
        anyApi.creatorVaults.provisionCreatorVault,
        { creatorWallet: walletAddress },
      );
      vaultAddress = result?.vault ?? null;
    } catch (error) {
      vaultError = error instanceof Error ? error.message : "Vault provisioning failed.";
      console.error("Vault provisioning failed:", error);
    }

    return { ok: true, txHash, vaultAddress, vaultError };
  },
});
