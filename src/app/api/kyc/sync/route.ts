import { NextResponse } from "next/server";
import { z } from "zod";
import { anyApi } from "convex/server";
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  isAddress,
  zeroAddress,
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
  inquiryId: z.string().min(1),
  referenceId: z.string().optional(),
});

type PersonaInquiryResponse = {
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      "reference-id"?: string;
    };
  };
};

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

const boostVaultAbi = [
  {
    type: "function",
    name: "kyc",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;


async function fetchPersonaInquiry(inquiryId: string) {
  const personaApiKey = requireServerEnv("PERSONA_API_KEY");
  const personaVersion = getServerEnv("PERSONA_VERSION") ?? "2023-01-05";

  const res = await fetch(`https://api.withpersona.com/api/v1/inquiries/${inquiryId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${personaApiKey}`,
        "Persona-Version": personaVersion,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Persona API error: ${errorBody}`);
  }

  return (await res.json()) as PersonaInquiryResponse;
}

function resolveRpcUrl() {
  return (
    getServerEnv("MANTLE_SEPOLIA_RPC_URL") ??
    mantleSepolia.rpcUrls.default.http[0]
  );
}

function resolveAddress(name: string, fallbackName?: string): Address {
  const value =
    getServerEnv(name) ?? (fallbackName ? getServerEnv(fallbackName) : undefined);

  if (!value || !isAddress(value)) {
    throw new Error(`Missing or invalid ${name.replace(/_/g, " ").toLowerCase()}.`);
  }

  return getAddress(value);
}

function createMantleClients() {
  const rpcUrl = resolveRpcUrl();
  const privateKey = requireServerEnv("KYC_MANAGER_PRIVATE_KEY");
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const transport = http(rpcUrl);

  return {
    publicClient: createPublicClient({
      chain: mantleSepolia,
      transport,
    }),
    walletClient: createWalletClient({
      chain: mantleSepolia,
      transport,
      account,
    }),
  };
}

async function provisionCreatorVault({
  publicClient,
  walletClient,
  creatorWallet,
  syncSecret,
}: {
  publicClient: ReturnType<typeof createMantleClients>["publicClient"];
  walletClient: ReturnType<typeof createMantleClients>["walletClient"];
  creatorWallet: Address;
  syncSecret?: string;
}) {
  const existing = await convexHttpClient.query(
    anyApi.creatorVaults.getByWallet,
    { wallet: creatorWallet },
  );

  const registryAddress = resolveAddress(
    "KYC_REGISTRY_ADDRESS",
    "NEXT_PUBLIC_KYC_REGISTRY_ADDRESS",
  );
  let existingVault: Address | null = null;
  let existingVaultMismatch = false;

  if (existing?.vault && isAddress(existing.vault)) {
    existingVault = getAddress(existing.vault);
    try {
      const vaultRegistry = (await publicClient.readContract({
        address: existingVault,
        abi: boostVaultAbi,
        functionName: "kyc",
      })) as Address;
      existingVaultMismatch = getAddress(vaultRegistry) !== registryAddress;
    } catch {
      existingVaultMismatch = false;
    }
  }

  if (existingVault && !existingVaultMismatch) {
    return { vault: existingVault, txHash: existing.txHash ?? null };
  }

  const factoryAddress = resolveAddress(
    "BOOST_FACTORY_ADDRESS",
    "NEXT_PUBLIC_BOOST_FACTORY_ADDRESS",
  );

  const onchainVault = (await publicClient.readContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: "vaultOf",
    args: [creatorWallet],
  })) as Address;

  if (onchainVault && onchainVault !== zeroAddress) {
    await convexHttpClient.mutation(anyApi.creatorVaults.upsertVaultFromServer, {
      wallet: creatorWallet,
      vault: onchainVault,
      secret: syncSecret,
    });

    return { vault: onchainVault, txHash: null };
  }

  const txHash = await walletClient.writeContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: "createVault",
    args: [creatorWallet],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  const vault = (await publicClient.readContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: "vaultOf",
    args: [creatorWallet],
  })) as Address;

  if (!vault || vault === zeroAddress) {
    throw new Error("Vault creation did not return a valid address.");
  }

  await convexHttpClient.mutation(anyApi.creatorVaults.upsertVaultFromServer, {
    wallet: creatorWallet,
    vault,
    txHash,
    secret: syncSecret,
  });

  return { vault, txHash };
}

export async function POST(req: Request) {
  let payload: unknown = null;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const { inquiryId, referenceId } = parsed.data;

  let inquiryResponse: PersonaInquiryResponse;
  try {
    inquiryResponse = await fetchPersonaInquiry(inquiryId);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Persona API error." },
      { status: 502 },
    );
  }

  const status = inquiryResponse?.data?.attributes?.status?.toLowerCase();
  const personaReference = inquiryResponse?.data?.attributes?.["reference-id"];

  if (!status) {
    return NextResponse.json(
      { ok: false, error: "Persona inquiry status missing." },
      { status: 502 },
    );
  }

  let walletAddress: string | null = null;

  if (personaReference && isAddress(personaReference)) {
    walletAddress = getAddress(personaReference);
  } else if (referenceId && isAddress(referenceId)) {
    walletAddress = getAddress(referenceId);
  } else {
    const existing = await convexHttpClient.query(anyApi.kyc.getInquiryById, {
      inquiryId,
    });
    if (existing?.walletAddress && isAddress(existing.walletAddress)) {
      walletAddress = getAddress(existing.walletAddress);
    }
  }

  if (!walletAddress) {
    return NextResponse.json(
      { ok: false, error: "Wallet address missing for inquiry." },
      { status: 400 },
    );
  }

  await convexHttpClient.mutation(anyApi.kyc.upsertInquiry, {
    inquiryId,
    walletAddress,
    status,
  });

  const approvedStatuses = new Set(["approved", "completed"]);

  if (!approvedStatuses.has(status)) {
    return NextResponse.json({
      ok: true,
      inquiryId,
      status,
      walletAddress,
      verified: false,
    });
  }

  const existingVerification = await convexHttpClient.query(
    anyApi.kyc.getWalletVerification,
    { walletAddress },
  );

  if (existingVerification?.verified) {
    return NextResponse.json({
      ok: true,
      inquiryId,
      status,
      walletAddress,
      verified: true,
      alreadyVerified: true,
      txHash: existingVerification.txHash ?? null,
    });
  }

  let txHash: `0x${string}` | null = null;
  let vaultAddress: Address | null = null;
  let vaultError: string | null = null;

  try {
    const registryAddress = resolveAddress(
      "KYC_REGISTRY_ADDRESS",
      "NEXT_PUBLIC_KYC_REGISTRY_ADDRESS",
    );

    const { publicClient, walletClient } = createMantleClients();
    const syncSecret = getServerEnv("KYC_SYNC_SECRET");

    const onchainVerified = (await publicClient.readContract({
      address: registryAddress,
      abi: kycRegistryAbi,
      functionName: "isVerified",
      args: [getAddress(walletAddress)],
    })) as boolean;

    if (onchainVerified) {
      await convexHttpClient.mutation(anyApi.kyc.setWalletVerified, {
        walletAddress,
        verified: true,
        txHash: existingVerification?.txHash ?? undefined,
        secret: syncSecret,
      });

      try {
        const result = await provisionCreatorVault({
          publicClient,
          walletClient,
          creatorWallet: getAddress(walletAddress),
          syncSecret,
        });
        vaultAddress = result.vault;
      } catch (error) {
        vaultError =
          error instanceof Error ? error.message : "Vault provisioning failed.";
      }

      return NextResponse.json({
        ok: true,
        inquiryId,
        status,
        walletAddress,
        verified: true,
        txHash: existingVerification?.txHash ?? null,
        vaultAddress,
        vaultError,
      });
    }

    if (existingVerification?.txHash && existingVerification.updatedAt) {
      const pendingWindowMs = 60_000;
      if (Date.now() - existingVerification.updatedAt < pendingWindowMs) {
        return NextResponse.json({
          ok: true,
          inquiryId,
          status,
          walletAddress,
          verified: false,
          txHash: existingVerification.txHash ?? null,
          pending: true,
        });
      }
    }

    txHash = await walletClient.writeContract({
      address: registryAddress,
      abi: kycRegistryAbi,
      functionName: "setVerified",
      args: [getAddress(walletAddress), true],
    });

    await convexHttpClient.mutation(anyApi.kyc.setWalletVerified, {
      walletAddress,
      verified: false,
      txHash,
      secret: syncSecret,
    });

    try {
      await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 15_000,
      });
    } catch {
      return NextResponse.json({
        ok: true,
        inquiryId,
        status,
        walletAddress,
        verified: false,
        txHash,
        pending: true,
      });
    }

    await convexHttpClient.mutation(anyApi.kyc.setWalletVerified, {
      walletAddress,
      verified: true,
      txHash,
      secret: syncSecret,
    });

    try {
      const result = await provisionCreatorVault({
        publicClient,
        walletClient,
        creatorWallet: getAddress(walletAddress),
        syncSecret,
      });
      vaultAddress = result.vault;
    } catch (error) {
      vaultError =
        error instanceof Error ? error.message : "Vault provisioning failed.";
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        inquiryId,
        status,
        walletAddress,
        error:
          error instanceof Error ? error.message : "KYC on-chain update failed.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    inquiryId,
    status,
    walletAddress,
    verified: true,
    txHash,
    vaultAddress,
    vaultError,
  });
}
