"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
  verified?: boolean;
  alreadyVerified?: boolean;
  txHash?: string | null;
  vaultAddress?: string | null;
  vaultError?: string | null;
  error?: string;
};

type KycStatusResponse = {
  ok: boolean;
  walletAddress?: string;
  verification?: {
    verified: boolean;
    txHash: string | null;
    createdAt: number;
    updatedAt: number;
  } | null;
  inquiry?: {
    inquiryId: string;
    status: string;
    createdAt: number;
    updatedAt: number;
  } | null;
  error?: string;
};

export default function KycCompletePage() {
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get("inquiry-id");
  const referenceId =
    searchParams.get("reference-id") ??
    searchParams.get("referenceId") ??
    searchParams.get("subject");
  const status = searchParams.get("status");
  const returnTo = searchParams.get("returnTo") ?? "/yield";
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(
    referenceId ?? null,
  );
  const [isVerified, setIsVerified] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false);
  const [hasLoadedStatus, setHasLoadedStatus] = useState(false);
  const [autoSyncDisabled, setAutoSyncDisabled] = useState(false);

  const statusLabel = syncStatus ?? status ?? "processing";
  const isDeclined =
    statusLabel === "declined" ||
    statusLabel === "rejected" ||
    statusLabel === "failed";
  const isSettled = Boolean(txHash) || isVerified || isDeclined;
  const hasOnchainVerification = Boolean(txHash) || isVerified;

  const loadStatus = useCallback(async () => {
    if (!referenceId) return;
    let verifiedFromStatus = false;
    let txHashFromStatus: string | null = null;
    try {
      const res = await fetch(
        `/api/kyc/status?wallet=${encodeURIComponent(referenceId)}`,
      );
      const payload = (await res.json()) as KycStatusResponse;
      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Unable to load KYC status.");
        return;
      }
      if (payload.inquiry?.status) setSyncStatus(payload.inquiry.status);
      if (payload.walletAddress) setWalletAddress(payload.walletAddress);
      verifiedFromStatus = Boolean(payload.verification?.verified);
      txHashFromStatus = payload.verification?.txHash ?? null;
      if (verifiedFromStatus) {
        setIsVerified(true);
      }
      if (txHashFromStatus) setTxHash(txHashFromStatus);
      if (payload.verification?.updatedAt) {
        setLastSyncedAt(payload.verification.updatedAt);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load KYC status.");
    } finally {
      if (verifiedFromStatus || txHashFromStatus) {
        setAutoSyncDisabled(true);
        setAutoSyncAttempted(true);
        setIsSyncing(false);
      }
      setHasLoadedStatus(true);
    }
  }, [referenceId]);

  const runSync = useCallback(async () => {
    if (!inquiryId || isSyncing || isSettled || autoSyncDisabled) return;
    setIsSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/kyc/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId,
          referenceId: referenceId ?? undefined,
        }),
      });

      const payload = (await res.json()) as SyncResponse;
      if (!res.ok || !payload.ok) {
        setError(payload.error ?? "Unable to sync KYC status.");
        return;
      }

      if (payload.status) setSyncStatus(payload.status);
      if (payload.walletAddress) setWalletAddress(payload.walletAddress);
      if (payload.verified || payload.alreadyVerified) {
        setIsVerified(true);
      }
      if (payload.txHash) setTxHash(payload.txHash);
      setLastSyncedAt(Date.now());
      if (payload.verified || payload.alreadyVerified || payload.txHash) {
        setAutoSyncDisabled(true);
        setAutoSyncAttempted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sync KYC status.");
    } finally {
      setIsSyncing(false);
    }
  }, [autoSyncDisabled, inquiryId, isSettled, isSyncing, referenceId]);

  useEffect(() => {
    if (referenceId) {
      void loadStatus();
      return;
    }
    if (inquiryId && !referenceId) {
      setError("Missing wallet reference for this inquiry.");
    }
  }, [inquiryId, loadStatus, referenceId]);

  useEffect(() => {
    setAutoSyncAttempted(false);
  }, [inquiryId]);

  useEffect(() => {
    if (referenceId && !walletAddress) {
      setWalletAddress(referenceId);
    }
  }, [referenceId, walletAddress]);

  useEffect(() => {
    if (!inquiryId || isSettled || autoSyncAttempted || autoSyncDisabled) return;
    if (!hasLoadedStatus) return;
    setAutoSyncAttempted(true);
    void runSync();
  }, [
    autoSyncAttempted,
    autoSyncDisabled,
    hasLoadedStatus,
    inquiryId,
    isSettled,
    runSync,
  ]);

  useEffect(() => {
    if ((isSettled || hasOnchainVerification) && isSyncing) {
      setIsSyncing(false);
    }
  }, [hasOnchainVerification, isSettled, isSyncing]);

  useEffect(() => {
    if (!hasLoadedStatus) return;
    if (hasOnchainVerification) {
      setAutoSyncDisabled(true);
      setAutoSyncAttempted(true);
      if (isSyncing) setIsSyncing(false);
    }
  }, [hasLoadedStatus, hasOnchainVerification, isSyncing]);

  const formattedWallet = walletAddress ? formatShortHash(walletAddress) : "Unavailable";
  const syncedAtLabel = lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : "Not synced";
  const isApproved =
    isVerified || statusLabel === "approved" || statusLabel === "completed";

  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto max-w-xl space-y-4">
          <h1 className="text-2xl font-semibold">KYC status</h1>
          <p className="text-sm text-muted-foreground">
            {isSettled
              ? "Your inquiry is synced. You can proceed to yield, boost, and invoice sponsorship actions."
              : "We are syncing your Persona inquiry so your wallet can unlock yield, boost, and invoice sponsorship actions as soon as verification is approved."}
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
            <Button
              onClick={() => void runSync()}
              disabled={!inquiryId || isSyncing || isSettled}
            >
              {isSettled ? "Synced" : isSyncing ? "Syncing..." : "Refresh status"}
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
