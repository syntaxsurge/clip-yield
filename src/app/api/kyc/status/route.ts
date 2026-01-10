import { NextResponse } from "next/server";
import { z } from "zod";
import { getAddress, isAddress } from "viem";
import { anyApi } from "convex/server";
import { convexHttpClient } from "@/lib/convex/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  wallet: z.string().min(1),
});

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

  return NextResponse.json({
    ok: true,
    walletAddress,
    verification: verification
      ? {
          verified: verification.verified,
          txHash: verification.txHash ?? null,
          createdAt: verification.createdAt,
          updatedAt: verification.updatedAt,
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
