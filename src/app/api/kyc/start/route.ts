import { NextResponse } from "next/server";
import { anyApi } from "convex/server";
import { getAddress, isAddress } from "viem";
import { convexHttpClient } from "@/lib/convex/http";
import { getServerEnv, requireServerEnv } from "@/lib/env/server";

export const runtime = "nodejs";

const PERSONA_INQUIRY_URL = "https://api.withpersona.com/api/v1/inquiries";

function normalizeReturnTo(value?: string | null) {
  if (!value) return "/yield";
  if (!value.startsWith("/") || value.startsWith("//")) return "/yield";
  return value;
}

export async function POST(req: Request) {
  let payload: { walletAddress?: string; returnTo?: string } | null = null;

  try {
    payload = (await req.json()) as { walletAddress?: string; returnTo?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload?.walletAddress || !isAddress(payload.walletAddress)) {
    return NextResponse.json({ error: "Invalid walletAddress." }, { status: 400 });
  }

  const walletAddress = getAddress(payload.walletAddress);
  const returnTo = normalizeReturnTo(payload.returnTo);

  const personaApiKey = requireServerEnv("PERSONA_API_KEY");
  const personaTemplateId = requireServerEnv("PERSONA_INQUIRY_TEMPLATE_ID");
  const personaEnvironmentId = requireServerEnv("PERSONA_ENVIRONMENT_ID");
  const personaVersion = getServerEnv("PERSONA_VERSION") ?? "2023-01-05";
  const appUrl = requireServerEnv("APP_URL");

  const personaResponse = await fetch(PERSONA_INQUIRY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${personaApiKey}`,
      "Persona-Version": personaVersion,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          "inquiry-template-id": personaTemplateId,
          "reference-id": walletAddress,
        },
      },
    }),
  });

  if (!personaResponse.ok) {
    const errorBody = await personaResponse.text();
    return NextResponse.json(
      { error: "Persona inquiry creation failed.", details: errorBody },
      { status: 502 },
    );
  }

  const personaPayload = (await personaResponse.json()) as {
    data?: { id?: string };
  };
  const inquiryId = personaPayload?.data?.id;

  if (!inquiryId) {
    return NextResponse.json(
      { error: "Persona inquiry ID missing from response." },
      { status: 502 },
    );
  }

  await convexHttpClient.mutation(anyApi.kyc.upsertInquiry, {
    inquiryId,
    walletAddress,
    status: "created",
  });

  const redirectUri = new URL("/kyc/complete", appUrl);
  redirectUri.searchParams.set("returnTo", returnTo);

  const hostedFlowUrl = new URL("https://inquiry.withpersona.com/verify");
  hostedFlowUrl.searchParams.set("inquiry-id", inquiryId);
  hostedFlowUrl.searchParams.set("environment-id", personaEnvironmentId);
  hostedFlowUrl.searchParams.set("redirect-uri", redirectUri.toString());

  return NextResponse.json({
    inquiryId,
    hostedFlowUrl: hostedFlowUrl.toString(),
  });
}
