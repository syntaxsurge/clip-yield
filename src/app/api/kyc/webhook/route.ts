import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { anyApi } from "convex/server";
import { convexHttpClient } from "@/lib/convex/http";
import { requireServerEnv } from "@/lib/env/server";

export const runtime = "nodejs";

const MAX_TIMESTAMP_DRIFT_MS = 5 * 60 * 1000;

type PersonaSignature = {
  timestamp: string;
  signature: string;
};

function parseSignatureHeader(header: string): PersonaSignature[] {
  return header
    .split(" ")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const parts = segment.split(",").map((pair) => pair.trim());
      const entries = Object.fromEntries(
        parts
          .map((pair) => pair.split("="))
          .filter((pair) => pair.length === 2),
      );

      return {
        timestamp: entries.t ?? "",
        signature: entries.v1 ?? "",
      };
    })
    .filter((entry) => entry.timestamp && entry.signature);
}

function computeSignature(secret: string, timestamp: string, body: string) {
  const payload = `${timestamp}.${body}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeEquals(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function isTimestampFresh(timestamp: string) {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return false;
  const diff = Math.abs(Date.now() - seconds * 1000);
  return diff <= MAX_TIMESTAMP_DRIFT_MS;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("persona-signature");

  if (!signatureHeader) {
    return NextResponse.json(
      { error: "Missing persona-signature header." },
      { status: 400 },
    );
  }

  const secret = requireServerEnv("PERSONA_WEBHOOK_SECRET");
  const signatures = parseSignatureHeader(signatureHeader);

  const isValid = signatures.some(({ timestamp, signature }) => {
    if (!isTimestampFresh(timestamp)) return false;
    const expected = computeSignature(secret, timestamp, rawBody);
    return timingSafeEquals(expected, signature);
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const eventId = event?.data?.id as string | undefined;
  const eventName = event?.data?.attributes?.name as string | undefined;
  const inquiryId = event?.data?.attributes?.payload?.data?.id as
    | string
    | undefined;
  const createdAtIso = event?.data?.attributes?.["created-at"] as
    | string
    | undefined;

  if (!eventId || !eventName || !inquiryId) {
    return NextResponse.json(
      { error: "Missing event metadata." },
      { status: 400 },
    );
  }

  await convexHttpClient.mutation(anyApi.kyc.ingestWebhookEvent, {
    eventId,
    eventName,
    inquiryId,
    createdAtIso,
  });

  return NextResponse.json({ ok: true });
}
