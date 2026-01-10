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

export const syncInquiryStatus = action({
  args: {
    inquiryId: v.string(),
    walletAddress: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isAddress(args.walletAddress)) {
      throw new Error("Invalid wallet address for KYC sync.");
    }

    const normalizedWallet = getAddress(args.walletAddress);
    const existingInquiry = await ctx.runQuery(anyApi.internal_kyc.getInquiryById, {
      inquiryId: args.inquiryId,
    });

    if (existingInquiry?.walletAddress) {
      const existingWallet = getAddress(existingInquiry.walletAddress);
      if (existingWallet !== normalizedWallet) {
        throw new Error("KYC inquiry wallet mismatch.");
      }
    }

    await ctx.runMutation(anyApi.kyc.upsertInquiry, {
      inquiryId: args.inquiryId,
      walletAddress: normalizedWallet,
      status: args.status,
    });

    const approvedStatuses = new Set(["approved", "completed"]);

    if (!approvedStatuses.has(args.status)) {
      return { ok: true, status: args.status, skippedOnchain: true };
    }

    const existingVerification = await ctx.runQuery(
      anyApi.internal_kyc.getWalletVerification,
      { walletAddress: normalizedWallet },
    );

    if (existingVerification?.verified) {
      return { ok: true, status: args.status, alreadyVerified: true };
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
      args: [normalizedWallet, true],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    await ctx.runMutation(anyApi.internal_kyc.setWalletVerified, {
      walletAddress: normalizedWallet,
      verified: true,
      txHash,
    });

    let vaultAddress: string | null = null;
    let vaultError: string | null = null;

    try {
      const result = await ctx.runAction(
        anyApi.creatorVaults.provisionCreatorVault,
        { creatorWallet: normalizedWallet },
      );
      vaultAddress = result?.vault ?? null;
    } catch (error) {
      vaultError = error instanceof Error ? error.message : "Vault provisioning failed.";
      console.error("Vault provisioning failed:", error);
    }

    return { ok: true, status: args.status, txHash, vaultAddress, vaultError };
  },
});
