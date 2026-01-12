import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, getAddress, http, isAddress } from "viem";
import { anyApi } from "convex/server";
import { convexHttpClient } from "@/lib/convex/http";
import { getServerEnv } from "@/lib/env/server";
import { mantleSepolia } from "@/lib/web3/mantle";
import kycRegistryAbi from "@/lib/contracts/abi/KycRegistry.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  wallet: z.string().min(1),
});

function resolveRpcUrl() {
  return (
    getServerEnv("MANTLE_SEPOLIA_RPC_URL") ??
    mantleSepolia.rpcUrls.default.http[0]
  );
}

function resolveRegistryAddress() {
  const value =
    getServerEnv("KYC_REGISTRY_ADDRESS") ??
    getServerEnv("NEXT_PUBLIC_KYC_REGISTRY_ADDRESS");

  if (!value || !isAddress(value)) {
    throw new Error("Missing or invalid KYC registry address.");
  }

  return getAddress(value);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({ wallet: searchParams.get("wallet") });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Missing wallet query parameter." },
      { status: 400 },
    );
  }

  const wallet = parsed.data.wallet;
  if (!isAddress(wallet)) {
    return NextResponse.json(
      { ok: false, error: "Invalid wallet address." },
      { status: 400 },
    );
  }

  const walletAddress = getAddress(wallet);

  const [verification, inquiry] = await Promise.all([
    convexHttpClient.query(anyApi.kyc.getWalletVerification, { walletAddress }),
    convexHttpClient.query(anyApi.kyc.getLatestInquiryByWallet, {
      walletAddress,
    }),
  ]);

  let onchainVerified: boolean | null = null;
  try {
    const publicClient = createPublicClient({
      chain: mantleSepolia,
      transport: http(resolveRpcUrl()),
    });
    onchainVerified = (await publicClient.readContract({
      address: resolveRegistryAddress(),
      abi: kycRegistryAbi,
      functionName: "isVerified",
      args: [walletAddress],
    })) as boolean;
  } catch {
    onchainVerified = null;
  }

  if (onchainVerified && !verification?.verified) {
    const syncSecret = getServerEnv("KYC_SYNC_SECRET");
    await convexHttpClient.mutation(anyApi.kyc.setWalletVerified, {
      walletAddress,
      verified: true,
      txHash: verification?.txHash ?? undefined,
      secret: syncSecret,
    });
  }

  const effectiveVerification =
    onchainVerified === null
      ? verification
      : onchainVerified
        ? {
            verified: true,
            txHash: verification?.txHash ?? null,
            createdAt: verification?.createdAt ?? Date.now(),
            updatedAt: verification?.updatedAt ?? Date.now(),
          }
        : verification
          ? {
              ...verification,
              verified: false,
            }
          : null;

  return NextResponse.json({
    ok: true,
    walletAddress,
    verification: effectiveVerification
      ? {
          verified: effectiveVerification.verified,
          txHash: effectiveVerification.txHash ?? null,
          createdAt: effectiveVerification.createdAt,
          updatedAt: effectiveVerification.updatedAt,
        }
      : null,
    inquiry: inquiry
      ? {
          inquiryId: inquiry.inquiryId,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.updatedAt,
        }
      : null,
  });
}
