"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MainLayout from "@/app/layouts/MainLayout";
import useGetPostById from "@/app/hooks/useGetPostById";
import useGetCreatorVaultByWallet from "@/app/hooks/useGetCreatorVaultByWallet";
import useGetSponsorCampaignByPostId from "@/app/hooks/useGetSponsorCampaignByPostId";
import useCreateBucketUrl from "@/app/hooks/useCreateBucketUrl";
import type { CreatorVaultRecord, PostWithProfile, SponsorCampaign } from "@/app/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatShortHash } from "@/lib/utils";
import SponsorPanel from "@/features/sponsor/components/SponsorPanel";
import { isSponsorCampaignActive } from "@/features/sponsor/utils";
import { formatUnits } from "viem";

type SponsorPageProps = {
  params: { postId: string };
};

export default function SponsorPage({ params }: SponsorPageProps) {
  const { postId } = params;
  const [post, setPost] = useState<PostWithProfile | null>(null);
  const [vaultRecord, setVaultRecord] = useState<CreatorVaultRecord | null>(null);
  const [campaign, setCampaign] = useState<SponsorCampaign | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");
    setError(null);

    (async () => {
      try {
        if (!postId) {
          throw new Error("Missing post id.");
        }

        const postResult = await useGetPostById(postId);
        if (!postResult) {
          throw new Error("Post not found.");
        }

        const [vaultResult, campaignResult] = await Promise.all([
          useGetCreatorVaultByWallet(postResult.user_id),
          useGetSponsorCampaignByPostId(postId),
        ]);

        if (!isMounted) return;

        setPost(postResult);
        setVaultRecord(vaultResult);
        setCampaign(campaignResult);
        setStatus("ready");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load sponsor flow.");
        setStatus("error");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const sponsorActive = useMemo(() => isSponsorCampaignActive(campaign), [campaign]);

  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Sponsor this clip</h1>
            <p className="text-sm text-muted-foreground">
              Deposit WMNT into the creator&apos;s boost vault. Yield pays the creator
              immediately while your principal stays withdrawable.
            </p>
          </div>

          {status === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Unable to load sponsor flow</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status === "loading" && (
            <Alert variant="info">
              <AlertTitle>Loading clip</AlertTitle>
              <AlertDescription>Fetching clip metadata and vault status.</AlertDescription>
            </Alert>
          )}

          {status === "ready" && post && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>{post.profile.name}</CardTitle>
                  <CardDescription>
                    {post.text || "Sponsor this creator's latest clip."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-hidden rounded-xl bg-black">
                    <video
                      className="aspect-[9/16] w-full object-cover"
                      controls
                      playsInline
                      src={useCreateBucketUrl(post.video_url)}
                    />
                  </div>

                  {campaign ? (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                      <div className="font-semibold text-emerald-700">
                        Active sponsor on-chain
                      </div>
                      <div className="mt-2 space-y-1 text-emerald-900">
                        <div>
                          Sponsor wallet:{" "}
                          <span className="font-mono text-xs">
                            {formatShortHash(campaign.sponsorAddress)}
                          </span>
                        </div>
                        <div>Amount: {formatUnits(BigInt(campaign.assets), 18)} WMNT</div>
                        <div>
                          Status: {sponsorActive ? "Active" : "Expired"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                      No sponsor has backed this clip yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                {!vaultRecord && (
                  <Alert variant="warning">
                    <AlertTitle>Creator vault not ready</AlertTitle>
                    <AlertDescription>
                      This creator needs to complete KYC before they can receive sponsored
                      yield.
                    </AlertDescription>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href={`/kyc?returnTo=${encodeURIComponent(`/sponsor/${postId}`)}`}
                        className="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700"
                      >
                        Start KYC
                      </Link>
                      <Link
                        href={`/profile/${post.profile.user_id}`}
                        className="rounded-md px-3 py-1 text-sm font-semibold text-slate-500"
                      >
                        Back to profile
                      </Link>
                    </div>
                  </Alert>
                )}

                {vaultRecord && (
                  <SponsorPanel
                    postId={post.id}
                    creatorId={post.profile.user_id}
                    vaultAddress={vaultRecord.vault as `0x${string}`}
                    currentCampaign={campaign}
                    onCampaignCreated={(nextCampaign) => setCampaign(nextCampaign)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
