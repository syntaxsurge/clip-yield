import { createPublicClient, erc20Abi, getAddress, http, isAddress, verifyMessage } from "viem";
import { mantleSepolia } from "@/lib/web3/mantle";
import { convexHttpClient } from "@/lib/convex/http";
import { getSponsorCampaignByPostId } from "@/lib/convex/functions";
import { buildSponsorPackMessage } from "@/features/sponsor/message";
import { isSponsorCampaignActive } from "@/features/sponsor/utils";

export const dynamic = "force-dynamic";

const SPONSOR_PACK = {
  id: "clipyield-sponsor-pack-v1",
  name: "ClipYield Sponsor Pack",
  version: "1.0.0",
  assets: [
    {
      type: "title-card",
      label: "Sponsored intro",
      text: "Sponsored by the ClipYield community",
      durationSeconds: 2.5,
    },
    {
      type: "lower-third",
      label: "Boost badge",
      text: "Boosted on Mantle",
      durationSeconds: 4,
    },
  ],
  notes: [
    "Drag the lower-third into the timeline after the hook.",
    "Use the sponsored intro for brand-backed clips.",
  ],
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      postId?: string;
      address?: string;
      signature?: string;
    };

    const postId = body?.postId?.trim();
    const address = body?.address?.trim();
    const signature = body?.signature;

    if (!postId || !address || !signature) {
      return new Response("Missing postId, address, or signature.", { status: 400 });
    }

    if (!isAddress(address)) {
      return new Response("Invalid wallet address.", { status: 400 });
    }

    const campaign = (await convexHttpClient.query(getSponsorCampaignByPostId, {
      postId,
    })) as {
      vaultAddress: string;
      createdAt: number;
    } | null;

    if (!campaign) {
      return new Response("No sponsor campaign found.", { status: 404 });
    }

    if (!isSponsorCampaignActive(campaign)) {
      return new Response("Sponsor campaign has expired.", { status: 410 });
    }

    if (!isAddress(campaign.vaultAddress)) {
      return new Response("Invalid vault address.", { status: 500 });
    }

    const message = buildSponsorPackMessage(postId);
    const verified = await verifyMessage({
      address: getAddress(address),
      message,
      signature,
    });

    if (!verified) {
      return new Response("Invalid signature.", { status: 401 });
    }

    const publicClient = createPublicClient({
      chain: mantleSepolia,
      transport: http(mantleSepolia.rpcUrls.default.http[0]),
    });

    const balance = (await publicClient.readContract({
      address: getAddress(campaign.vaultAddress),
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [getAddress(address)],
    })) as bigint;

    if (balance <= 0n) {
      return new Response("Sponsor perks are limited to active boosters.", {
        status: 403,
      });
    }

    return Response.json({ pack: SPONSOR_PACK });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return new Response(message, { status: 500 });
  }
}
