"use client";

import { use, useEffect, useMemo, useState } from "react";
import MainLayout from "@/app/layouts/MainLayout";
import getCampaignReceiptById from "@/app/hooks/useGetCampaignReceiptById";
import type { CampaignReceipt } from "@/app/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatShortHash } from "@/lib/utils";
import {
  explorerAddressUrl,
  explorerTokenUrl,
  explorerTxUrl,
} from "@/lib/web3/mantleConfig";
import { formatUnits } from "viem";

type CampaignPageProps = {
  params: Promise<{ campaignId: string }>;
};

const statusStyles: Record<CampaignReceipt["status"], string> = {
  pending:
    "bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-ink)] dark:text-[color:var(--brand-accent-strong)]",
  confirmed:
    "bg-[color:var(--brand-success-soft)] text-[color:var(--brand-success-dark)] dark:text-[color:var(--brand-success)]",
  failed: "bg-[color:var(--brand-accent)] text-[color:var(--brand-ink)]",
};

export default function CampaignReceiptPage({ params }: CampaignPageProps) {
  const { campaignId } = use(params);
  const [receipt, setReceipt] = useState<CampaignReceipt | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setStatus("loading");
    setError(null);

    (async () => {
      try {
        if (!campaignId) throw new Error("Missing campaign receipt.");
        const result = await getCampaignReceiptById(campaignId);
        if (!result) throw new Error("Campaign receipt not found.");
        if (!isMounted) return;
        setReceipt(result);
        setStatus("ready");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load receipt.");
        setStatus("error");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  const formattedAssets = useMemo(() => {
    if (!receipt) return "0";
    try {
      return formatUnits(BigInt(receipt.assetsWei), 18);
    } catch {
      return receipt.assetsWei;
    }
  }, [receipt]);

  const formattedProtocolFee = useMemo(() => {
    if (!receipt || !receipt.protocolFeeWei) return "0";
    try {
      return formatUnits(BigInt(receipt.protocolFeeWei), 18);
    } catch {
      return receipt.protocolFeeWei;
    }
  }, [receipt]);

  const formattedNetAmount = useMemo(() => {
    if (!receipt || !receipt.protocolFeeWei) return "0";
    try {
      const net = BigInt(receipt.assetsWei) - BigInt(receipt.protocolFeeWei);
      return formatUnits(net, 18);
    } catch {
      return receipt.assetsWei;
    }
  }, [receipt]);

  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Campaign receipt</h1>
            <p className="text-sm text-muted-foreground">
              Immutable sponsorship terms + on-chain proof for Mantle RealFi.
            </p>
          </div>

          {status === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Unable to load receipt</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status === "loading" && (
            <Alert variant="info">
              <AlertTitle>Loading receipt</AlertTitle>
              <AlertDescription>Fetching on-chain campaign details.</AlertDescription>
            </Alert>
          )}

          {status === "ready" && receipt && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Receipt details</CardTitle>
                    <CardDescription>Receipt ID: {campaignId}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[receipt.status]}`}
                      >
                        {receipt.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sponsor</span>
                      <span className="font-mono text-xs">
                        {formatShortHash(receipt.sponsorAddress)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Creator</span>
                      <span className="font-mono text-xs">
                        {formatShortHash(receipt.creatorId)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Boost vault</span>
                      <span className="font-mono text-xs">
                        {formatShortHash(receipt.boostVault)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{formattedAssets} WMNT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Protocol fee</span>
                      <span>{formattedProtocolFee} WMNT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Net to creator vault</span>
                      <span>{formattedNetAmount} WMNT</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Campaign ID</div>
                      <div className="break-all font-mono text-xs">
                        {receipt.campaignId}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Terms hash</div>
                      <div className="break-all font-mono text-xs">
                        {receipt.termsHash}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Transaction</div>
                      <a
                        className="break-all font-mono text-xs underline underline-offset-2"
                        href={explorerTxUrl(receipt.txHash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {receipt.txHash}
                      </a>
                    </div>
                    {receipt.confirmedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Confirmed</span>
                        <span>
                          {new Date(receipt.confirmedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Campaign terms</CardTitle>
                    <CardDescription>
                      Signed off-chain and hashed on-chain.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Sponsor name</div>
                      <div>{receipt.sponsorName}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Objective</div>
                      <div>{receipt.objective}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Deliverables</div>
                      <ul className="list-disc space-y-1 pl-5">
                        {receipt.deliverables.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-muted-foreground">Start date</div>
                        <div>{new Date(receipt.startDateIso).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">End date</div>
                        <div>{new Date(receipt.endDateIso).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Disclosure</div>
                      <div>{receipt.disclosure}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice receipt (RWA)</CardTitle>
                  <CardDescription>
                    Tokenized sponsorship invoice minted to the sponsor wallet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contract</span>
                    {receipt.invoiceReceiptAddress ? (
                      <a
                        className="font-mono text-xs underline underline-offset-2"
                        href={explorerAddressUrl(receipt.invoiceReceiptAddress)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {formatShortHash(receipt.invoiceReceiptAddress)}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Token ID</span>
                    {receipt.invoiceReceiptAddress && receipt.receiptTokenId ? (
                      <a
                        className="font-mono text-xs underline underline-offset-2"
                        href={explorerTokenUrl(
                          receipt.invoiceReceiptAddress,
                          receipt.receiptTokenId,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        #{receipt.receiptTokenId}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
