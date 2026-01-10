import { NextResponse } from "next/server";
import { z } from "zod";
import { anyApi } from "convex/server";
import { getAddress, isAddress } from "viem";
import { convexHttpClient } from "@/lib/convex/http";
import { getServerEnv, requireServerEnv } from "@/lib/env/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  inquiryId: z.string().min(1),
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

async function fetchPersonaInquiry(inquiryId: string) {
  const personaApiKey = requireServerEnv("PERSONA_API_KEY");
  const personaVersion = getServerEnv("PERSONA_VERSION") ?? "2023-01-05";

  const res = await fetch(`https://api.withpersona.com/api/v1/inquiries/${inquiryId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${personaApiKey}`,
      "Persona-Version": personaVersion,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Persona API error: ${errorBody}`);
  }

  return (await res.json()) as PersonaInquiryResponse;
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

  const { inquiryId } = parsed.data;

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
  const referenceId = inquiryResponse?.data?.attributes?.["reference-id"];

  if (!status) {
    return NextResponse.json(
      { ok: false, error: "Persona inquiry status missing." },
      { status: 502 },
    );
  }

  let walletAddress: string | null = null;

  if (referenceId && isAddress(referenceId)) {
    walletAddress = getAddress(referenceId);
  } else {
    const existing = await convexHttpClient.query(anyApi.internal_kyc.getInquiryById, {
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

  let result: unknown;
  try {
    result = await convexHttpClient.action(anyApi.kyc.syncInquiryStatus, {
      inquiryId,
      walletAddress,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        inquiryId,
        status,
        walletAddress,
        error: error instanceof Error ? error.message : "KYC sync failed.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    inquiryId,
    status,
    walletAddress,
    result,
  });
}
