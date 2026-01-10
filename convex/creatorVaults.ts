import {
  action,
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { getAddress, isAddress, zeroAddress } from "viem";
import { createMantleClients } from "./mantle";
import { getEnv, requireEnv } from "./env";
import { anyApi } from "convex/server";

const factoryAbi = [
  {
    type: "function",
    name: "vaultOf",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "createVault",
    stateMutability: "nonpayable",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "vaultAddr", type: "address" }],
  },
] as const;

const boostVaultRoleAbi = [
  {
    type: "function",
    name: "YIELD_DONOR_ROLE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "hasRole",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "grantRole",
    stateMutability: "nonpayable",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [],
  },
] as const;

function resolveSponsorHubAddress() {
  const sponsorHub =
    getEnv("SPONSOR_HUB_ADDRESS") ?? getEnv("NEXT_PUBLIC_SPONSOR_HUB_ADDRESS");

  if (!sponsorHub || !isAddress(sponsorHub)) {
    throw new Error("Missing or invalid sponsor hub address.");
  }

  return getAddress(sponsorHub);
}

async function ensureSponsorHubRole({
  publicClient,
  walletClient,
  vault,
}: {
  publicClient: ReturnType<typeof createMantleClients>["publicClient"];
  walletClient: ReturnType<typeof createMantleClients>["walletClient"];
  vault: `0x${string}`;
}) {
  const sponsorHub = resolveSponsorHubAddress();

  const yieldDonorRole = (await publicClient.readContract({
    address: vault,
    abi: boostVaultRoleAbi,
    functionName: "YIELD_DONOR_ROLE",
  })) as `0x${string}`;

  const alreadyGranted = (await publicClient.readContract({
    address: vault,
    abi: boostVaultRoleAbi,
    functionName: "hasRole",
    args: [yieldDonorRole, sponsorHub],
  })) as boolean;

  if (alreadyGranted) return;

  const txHash = await walletClient.writeContract({
    address: vault,
    abi: boostVaultRoleAbi,
    functionName: "grantRole",
    args: [yieldDonorRole, sponsorHub],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
}

export const getByWallet = query({
  args: { wallet: v.string() },
  handler: async (ctx, args) => {
    if (!isAddress(args.wallet)) {
      throw new Error("Invalid wallet address.");
    }

    const wallet = getAddress(args.wallet);
    return await ctx.db
      .query("creatorVaults")
      .withIndex("by_wallet", (q) => q.eq("wallet", wallet))
      .unique();
  },
});

export const getByWalletInternal = internalQuery({
  args: { wallet: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creatorVaults")
      .withIndex("by_wallet", (q) => q.eq("wallet", args.wallet))
      .unique();
  },
});

export const insertVaultInternal = internalMutation({
  args: {
    wallet: v.string(),
    vault: v.string(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("creatorVaults", {
      wallet: args.wallet,
      vault: args.vault,
      txHash: args.txHash,
      createdAt: Date.now(),
    });
  },
});

export const upsertVaultFromServer = mutation({
  args: {
    secret: v.optional(v.string()),
    wallet: v.string(),
    vault: v.string(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expected = getEnv("KYC_SYNC_SECRET");
    if (expected && args.secret !== expected) {
      throw new Error("Invalid KYC sync secret.");
    }

    if (!isAddress(args.wallet) || !isAddress(args.vault)) {
      throw new Error("Invalid wallet or vault address.");
    }

    const wallet = getAddress(args.wallet);
    const vault = getAddress(args.vault);

    const existing = await ctx.db
      .query("creatorVaults")
      .withIndex("by_wallet", (q) => q.eq("wallet", wallet))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        vault,
        txHash: args.txHash ?? existing.txHash,
      });
      return {
        vault,
        txHash: args.txHash ?? existing.txHash ?? null,
      };
    }

    await ctx.db.insert("creatorVaults", {
      wallet,
      vault,
      txHash: args.txHash,
      createdAt: Date.now(),
    });

    return { vault, txHash: args.txHash ?? null };
  },
});

export const provisionCreatorVault = action({
  args: { creatorWallet: v.string() },
  handler: async (ctx, args) => {
    if (!isAddress(args.creatorWallet)) {
      throw new Error("Invalid creator wallet address.");
    }

    const creatorWallet = getAddress(args.creatorWallet);

    const existing = await ctx.runQuery(
      anyApi.creatorVaults.getByWalletInternal,
      { wallet: creatorWallet },
    );

    if (existing) {
      return { vault: existing.vault, txHash: existing.txHash ?? null };
    }

    const factoryAddress =
      getEnv("BOOST_FACTORY_ADDRESS") ??
      getEnv("NEXT_PUBLIC_BOOST_FACTORY_ADDRESS");

    if (!factoryAddress || !isAddress(factoryAddress)) {
      throw new Error("Missing or invalid boost factory address.");
    }

    const privateKey = requireEnv("KYC_MANAGER_PRIVATE_KEY");
    const { publicClient, walletClient } = createMantleClients(privateKey);

    const onchainVault = (await publicClient.readContract({
      address: getAddress(factoryAddress),
      abi: factoryAbi,
      functionName: "vaultOf",
      args: [creatorWallet],
    })) as `0x${string}`;

    if (onchainVault && onchainVault !== zeroAddress) {
      await ensureSponsorHubRole({
        publicClient,
        walletClient,
        vault: onchainVault,
      });
      await ctx.runMutation(anyApi.creatorVaults.insertVaultInternal, {
        wallet: creatorWallet,
        vault: onchainVault,
      });
      return { vault: onchainVault, txHash: null };
    }

    const txHash = await walletClient.writeContract({
      address: getAddress(factoryAddress),
      abi: factoryAbi,
      functionName: "createVault",
      args: [creatorWallet],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const vault = (await publicClient.readContract({
      address: getAddress(factoryAddress),
      abi: factoryAbi,
      functionName: "vaultOf",
      args: [creatorWallet],
    })) as `0x${string}`;

    if (!vault || vault === zeroAddress) {
      throw new Error("Vault creation did not return a valid address.");
    }

    await ensureSponsorHubRole({
      publicClient,
      walletClient,
      vault,
    });

    await ctx.runMutation(anyApi.creatorVaults.insertVaultInternal, {
      wallet: creatorWallet,
      vault,
      txHash,
    });

    return { vault, txHash };
  },
});
