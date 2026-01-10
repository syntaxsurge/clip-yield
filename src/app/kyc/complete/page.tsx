"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { formatShortHash } from "@/lib/utils";
import { explorerTxUrl } from "@/lib/web3/mantleConfig";
import MainLayout from "@/app/layouts/MainLayout";

type SyncResponse = {
  ok: boolean;
  status?: string;
  walletAddress?: string;
  result?: {
    txHash?: string;
    alreadyVerified?: boolean;
    skippedOnchain?: boolean;
  };
  error?: string;
};

const FINAL_STATUSES = new Set(["approved", "declined", "rejected", "failed"]);

export default function KycCompletePage() {
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get("inquiry-id");
  const status = searchParams.get("status");
  const returnTo = searchParams.get("returnTo") ?? "/yield";
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const shouldPoll = useMemo(() => {
    if (!syncStatus) return true;
    return !FINAL_STATUSES.has(syncStatus);
  }, [syncStatus]);

  const runSync = useCallback(async () => {
    if (!inquiryId || isSyncing) return;
    setIsSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/kyc/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId }),
      });

      const payload = (await res.json()) as SyncResponse;
      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Unable to sync KYC status.");
        return;
      }

      if (payload.status) setSyncStatus(payload.status);
      if (payload.walletAddress) setWalletAddress(payload.walletAddress);
      if (payload.result?.txHash) setTxHash(payload.result.txHash);
      setLastSyncedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sync KYC status.");
    } finally {
      setIsSyncing(false);
    }
  }, [inquiryId, isSyncing]);

  useEffect(() => {
    if (!inquiryId) return;
    void runSync();
  }, [inquiryId, runSync]);

  useEffect(() => {
    if (!inquiryId || !shouldPoll) return;
    const interval = setInterval(() => {
      void runSync();
    }, 4000);
    return () => clearInterval(interval);
  }, [inquiryId, shouldPoll, runSync]);

  const statusLabel = syncStatus ?? status ?? "processing";
  const formattedWallet = walletAddress ? formatShortHash(walletAddress) : "Unavailable";
  const syncedAtLabel = lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : "Not synced";
  const isApproved = statusLabel === "approved";
  const isDeclined = statusLabel === "declined" || statusLabel === "rejected" || statusLabel === "failed";

  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto max-w-xl space-y-4">
          <h1 className="text-2xl font-semibold">KYC status</h1>
          <p className="text-sm text-muted-foreground">
            We are syncing your Persona inquiry so your wallet can unlock boost
            and yield actions as soon as verification is approved.
          </p>

          <Alert variant="info">
            <AlertTitle>Submission details</AlertTitle>
            <AlertDescription>
              Inquiry: <span className="font-mono">{inquiryId ?? "Unavailable"}</span>
              <br />
              Status: <span className="font-mono">{statusLabel}</span>
              <br />
              Wallet: <span className="font-mono">{formattedWallet}</span>
              <br />
              Last synced: <span className="font-mono">{syncedAtLabel}</span>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Sync failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isApproved && txHash && (
            <Alert variant="success">
              <AlertTitle>On-chain verification submitted</AlertTitle>
              <AlertDescription>
                <a
                  className="underline underline-offset-2"
                  href={explorerTxUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View transaction on MantleScan
                </a>
              </AlertDescription>
            </Alert>
          )}

          {isDeclined && (
            <Alert variant="warning">
              <AlertTitle>Verification not approved</AlertTitle>
              <AlertDescription>
                Your inquiry needs attention. Please retry or contact support.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void runSync()} disabled={!inquiryId || isSyncing}>
              {isSyncing ? "Syncing..." : "Refresh status"}
            </Button>
            <Button asChild variant="secondary">
              <Link href={returnTo}>Return to ClipYield</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
