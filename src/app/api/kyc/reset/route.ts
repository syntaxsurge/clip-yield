import { NextResponse } from "next/server";
import { z } from "zod";
import { anyApi } from "convex/server";
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  isAddress,
  verifyMessage,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { convexHttpClient } from "@/lib/convex/http";
import { getServerEnv, requireServerEnv } from "@/lib/env/server";
import { mantleSepolia } from "@/lib/web3/mantle";
import kycRegistryAbi from "@/lib/contracts/abi/KycRegistry.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  walletAddress: z.string().min(1),
  message: z.string().min(1),
  signature: z.string().min(1),
});

function resolveRpcUrl() {
  return (
    getServerEnv("MANTLE_SEPOLIA_RPC_URL") ??
    mantleSepolia.rpcUrls.default.http[0]
  );
}

function resolveRegistryAddress(): Address {
  const value =
    getServerEnv("KYC_REGISTRY_ADDRESS") ??
    getServerEnv("NEXT_PUBLIC_KYC_REGISTRY_ADDRESS");

  if (!value || !isAddress(value)) {
    throw new Error("Missing or invalid KYC registry address.");
  }

  return getAddress(value);
}

function createMantleClients() {
  const rpcUrl = resolveRpcUrl();
  const privateKey = requireServerEnv("KYC_MANAGER_PRIVATE_KEY");
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const transport = http(rpcUrl);

  return {
    publicClient: createPublicClient({ chain: mantleSepolia, transport }),
    walletClient: createWalletClient({ chain: mantleSepolia, transport, account }),
  };
}

export async function POST(req: Request) {
  let payload: unknown = null;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const walletAddress = getAddress(parsed.data.walletAddress);
  const message = parsed.data.message;
  const signature = parsed.data.signature as `0x${string}`;

  const signatureOk = await verifyMessage({
    address: walletAddress,
    message,
    signature,
  });

  if (!signatureOk) {
    return NextResponse.json(
      { ok: false, error: "Invalid signature." },
      { status: 401 },
    );
  }

  if (!message.toLowerCase().includes(walletAddress.toLowerCase())) {
    return NextResponse.json(
      { ok: false, error: "Message must include the wallet address." },
      { status: 400 },
    );
  }

  const registryAddress = resolveRegistryAddress();
  const { publicClient, walletClient } = createMantleClients();

  let txHash: `0x${string}`;
  try {
    txHash = await walletClient.writeContract({
      address: registryAddress,
      abi: kycRegistryAbi,
      functionName: "setVerified",
      args: [walletAddress, false],
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "On-chain revoke failed.",
      },
      { status: 500 },
    );
  }

  const syncSecret = getServerEnv("KYC_SYNC_SECRET");

  try {
    await convexHttpClient.mutation(anyApi.kyc.setWalletVerified, {
      walletAddress,
      verified: false,
      txHash,
      secret: syncSecret,
    });

    await convexHttpClient.mutation(anyApi.kyc.deleteInquiriesForWallet, {
      walletAddress,
      secret: syncSecret,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Convex reset failed.",
        txHash,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, walletAddress, txHash });
}
