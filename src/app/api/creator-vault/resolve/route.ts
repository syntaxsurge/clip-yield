import { NextResponse } from "next/server";
import { z } from "zod";
import { getAddress, isAddress } from "viem";
import { anyApi } from "convex/server";
import { convexHttpClient } from "@/lib/convex/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  wallet: z.string().min(1),
});

type ResolveResponse = {
  ok: boolean;
  walletAddress?: string;
  verified?: boolean;
  vault?: string | null;
  txHash?: string | null;
  reason?: string;
};

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: "Missing wallet address." } satisfies ResolveResponse,
      { status: 400 },
    );
  }

  const wallet = parsed.data.wallet;
  if (!isAddress(wallet)) {
    return NextResponse.json(
      { ok: false, reason: "Invalid wallet address." } satisfies ResolveResponse,
      { status: 400 },
    );
  }

  const walletAddress = getAddress(wallet);

  const verification = await convexHttpClient.query(
    anyApi.kyc.getWalletVerification,
    { walletAddress },
  );

  if (!verification?.verified) {
    return NextResponse.json({
      ok: false,
      walletAddress,
      verified: false,
      reason: "kyc_required",
    } satisfies ResolveResponse);
  }

  const existing = await convexHttpClient.query(
    anyApi.creatorVaults.getByWallet,
    { wallet: walletAddress },
  );

  if (existing?.vault) {
    return NextResponse.json({
      ok: true,
      walletAddress,
      verified: true,
      vault: existing.vault,
      txHash: existing.txHash ?? null,
    } satisfies ResolveResponse);
  }

  try {
    const provisioned = await convexHttpClient.action(
      anyApi.creatorVaults.provisionCreatorVault,
      { creatorWallet: walletAddress },
    );

    return NextResponse.json({
      ok: true,
      walletAddress,
      verified: true,
      vault: provisioned?.vault ?? null,
      txHash: provisioned?.txHash ?? null,
    } satisfies ResolveResponse);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        walletAddress,
        verified: true,
        reason:
          error instanceof Error ? error.message : "Unable to provision vault.",
      } satisfies ResolveResponse,
      { status: 500 },
    );
  }
}
