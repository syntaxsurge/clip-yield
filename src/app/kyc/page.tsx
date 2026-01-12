"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import WalletGateSkeleton from "@/components/feedback/WalletGateSkeleton";
import { formatShortHash } from "@/lib/utils";
import { explorerTxUrl } from "@/lib/web3/mantleConfig";
import MainLayout from "@/app/layouts/MainLayout";

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

const FINAL_INQUIRY_STATUSES = new Set([
  "approved",
  "completed",
  "declined",
  "rejected",
  "failed",
]);

export default function KycStartPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/yield";

  const [statusInfo, setStatusInfo] = useState<KycStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<
    "idle" | "starting" | "syncing" | "error"
  >("idle");
  const [actionError, setActionError] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<
    "idle" | "resetting" | "success" | "error"
  >("idle");
  const [resetError, setResetError] = useState<string | null>(null);

  const redirectToHostedFlow = useCallback(
    async (payload: {
      walletAddress: string;
      returnTo: string;
      inquiryId?: string;
      resume?: boolean;
    }) => {
      setActionStatus("starting");
      setActionError(null);

      try {
        const res = await fetch("/api/kyc/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await res.json().catch(() => ({}))) as {
          hostedFlowUrl?: string;
          error?: string;
        };

        if (!res.ok || !data.hostedFlowUrl) {
          setActionError(data.error ?? "Unable to open the verification flow.");
          setActionStatus("error");
          return;
        }

        window.location.assign(data.hostedFlowUrl);
      } catch (err) {
        setActionError(
          err instanceof Error
            ? err.message
            : "Unable to open the verification flow.",
        );
        setActionStatus("error");
      }
    },
    [],
  );

  const loadStatus = useCallback(async () => {
    if (!address) return;
    setStatusLoading(true);
    setStatusError(null);
    try {
      const res = await fetch(
        `/api/kyc/status?wallet=${encodeURIComponent(address)}`,
      );
      const body = (await res.json()) as KycStatusResponse;
      if (!res.ok || !body.ok) {
        setStatusError(body.error ?? "Unable to load KYC status.");
        return;
      }
      setStatusInfo(body);
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Unable to load KYC status.",
      );
    } finally {
      setStatusLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!isConnected || !address) return;
    void loadStatus();
  }, [address, isConnected, loadStatus]);

  const handleStart = useCallback(async () => {
    if (!address) return;
    await redirectToHostedFlow({ walletAddress: address, returnTo });
  }, [address, redirectToHostedFlow, returnTo]);

  const handleResume = useCallback(async () => {
    if (!address || !statusInfo?.inquiry?.inquiryId) return;
    await redirectToHostedFlow({
      walletAddress: address,
      returnTo,
      inquiryId: statusInfo.inquiry.inquiryId,
      resume: true,
    });
  }, [address, redirectToHostedFlow, returnTo, statusInfo?.inquiry?.inquiryId]);

  const handleSync = useCallback(async () => {
    if (!statusInfo?.inquiry?.inquiryId || !address) return;
    setActionStatus("syncing");
    setActionError(null);

    try {
      const res = await fetch("/api/kyc/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: statusInfo.inquiry.inquiryId,
          referenceId: address,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setActionError(body?.error ?? "Unable to sync KYC status.");
        setActionStatus("error");
        return;
      }
      await loadStatus();
      setActionStatus("idle");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to sync KYC status.",
      );
      setActionStatus("error");
    }
  }, [address, loadStatus, statusInfo?.inquiry?.inquiryId]);

  const handleReset = useCallback(async () => {
    if (!address || !signMessageAsync) return;
    setResetStatus("resetting");
    setResetError(null);
    setStatusInfo(null);
    setStatusError(null);
    setActionStatus("idle");
    setActionError(null);

    const message = `ClipYield demo KYC reset for ${address} at ${new Date().toISOString()}`;

    try {
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/kyc/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          message,
          signature,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        setResetError(body?.error ?? "Reset failed.");
        setResetStatus("error");
        return;
      }

      await loadStatus();
      setResetStatus("success");
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Reset failed.");
      setResetStatus("error");
    }
  }, [address, loadStatus, signMessageAsync]);

  const verification = statusInfo?.verification ?? null;
  const inquiry = statusInfo?.inquiry ?? null;
  const inquiryStatus = inquiry?.status ?? "not started";
  const isVerified = Boolean(verification?.verified);
  const hasPendingTx = Boolean(verification?.txHash) && !isVerified;
  const canRestart =
    !statusLoading &&
    (!inquiry ||
      inquiryStatus === "declined" ||
      inquiryStatus === "rejected" ||
      inquiryStatus === "failed");
  const canContinue =
    !statusLoading &&
    Boolean(inquiry?.inquiryId) &&
    !FINAL_INQUIRY_STATUSES.has(inquiryStatus) &&
    !isVerified;
  const canSync =
    Boolean(inquiry?.inquiryId) &&
    FINAL_INQUIRY_STATUSES.has(inquiryStatus) &&
    !isVerified;
  const walletLabel = address ? formatShortHash(address) : "Unavailable";
  const lastSyncedLabel = verification?.updatedAt
    ? new Date(verification.updatedAt).toLocaleString()
    : "Not synced";
  const showRedactionHint = isVerified && !inquiry?.inquiryId;
  const canReset = Boolean(statusInfo && address);

  if (!isConnected) {
    return (
      <MainLayout>
        <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
          <div className="mx-auto max-w-xl">
            <WalletGateSkeleton cards={2} />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto max-w-xl space-y-4">
          <h1 className="text-2xl font-semibold">Verify your identity</h1>
          <p className="text-sm text-muted-foreground">
            {isVerified
              ? "Your wallet is already verified. KYC details are shown below."
              : "Start verification to unlock vault actions and invoice sponsorships."}
          </p>

          {statusLoading && (
            <Alert variant="info">
              <AlertTitle>Checking status...</AlertTitle>
              <AlertDescription>
                Fetching the latest KYC record for {walletLabel}.
              </AlertDescription>
            </Alert>
          )}

          {statusError && (
            <Alert variant="destructive">
              <AlertTitle>Unable to load KYC status</AlertTitle>
              <AlertDescription>{statusError}</AlertDescription>
            </Alert>
          )}

          {statusInfo && (
            <Alert variant={isVerified ? "success" : "info"}>
              <AlertTitle>
                {isVerified ? "KYC verified" : "KYC status"}
              </AlertTitle>
              <AlertDescription>
                Inquiry:{" "}
                <span className="font-mono">
                  {inquiry?.inquiryId ?? "Unavailable"}
                </span>
                <br />
                Wallet: <span className="font-mono">{walletLabel}</span>
                <br />
                Inquiry status:{" "}
                <span className="font-mono">{inquiryStatus}</span>
                <br />
                Last synced:{" "}
                <span className="font-mono">{lastSyncedLabel}</span>
                {verification?.txHash && (
                  <>
                    <br />
                    On-chain tx{hasPendingTx ? " (pending)" : ""}:{" "}
                    <a
                      className="font-mono underline underline-offset-2"
                      href={explorerTxUrl(verification.txHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {formatShortHash(verification.txHash)}
                    </a>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {canSync && (
            <Alert variant="warning">
              <AlertTitle>On-chain verification pending</AlertTitle>
              <AlertDescription>
                Persona verification is complete, but the wallet has not been
                verified on-chain yet. Sync status rechecks the registry and
                submits verification if needed.
                {verification?.txHash && (
                  <>
                    <br />
                    Pending tx:{" "}
                    <a
                      className="font-mono underline underline-offset-2"
                      href={explorerTxUrl(verification.txHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {formatShortHash(verification.txHash)}
                    </a>
                  </>
                )}
              </AlertDescription>
              <div className="mt-3">
                <Button
                  onClick={() => void handleSync()}
                  disabled={actionStatus === "syncing"}
                >
                  {actionStatus === "syncing" ? "Syncing..." : "Sync status"}
                </Button>
              </div>
            </Alert>
          )}

          {showRedactionHint && (
            <Alert variant="warning">
              <AlertTitle>Persona redaction doesn&apos;t revoke access</AlertTitle>
              <AlertDescription>
                Your Persona inquiry is unavailable, but your on-chain verification is
                still active. Use the demo reset to revoke verification and restart KYC.
              </AlertDescription>
            </Alert>
          )}

          {actionStatus === "starting" && (
            <Alert variant="info">
              <AlertTitle>Redirecting...</AlertTitle>
              <AlertDescription>
                Preparing your inquiry for {walletLabel}. This usually takes a
                few seconds.
              </AlertDescription>
            </Alert>
          )}

          {actionStatus === "syncing" && (
            <Alert variant="info">
              <AlertTitle>Syncing...</AlertTitle>
              <AlertDescription>
                Checking Persona status and updating on-chain verification.
              </AlertDescription>
            </Alert>
          )}

          {actionStatus === "error" && actionError && (
            <Alert variant="destructive">
              <AlertTitle>Action failed</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          {resetStatus === "resetting" && (
            <Alert variant="info">
              <AlertTitle>Resetting KYC...</AlertTitle>
              <AlertDescription>
                Revoking on-chain verification and clearing local inquiry records.
              </AlertDescription>
            </Alert>
          )}

          {resetStatus === "success" && (
            <Alert variant="success">
              <AlertTitle>KYC reset</AlertTitle>
              <AlertDescription>
                Verification revoked. You can start a fresh inquiry now.
              </AlertDescription>
            </Alert>
          )}

          {resetStatus === "error" && resetError && (
            <Alert variant="destructive">
              <AlertTitle>Reset failed</AlertTitle>
              <AlertDescription>{resetError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            {isVerified ? (
              <>
                <Button asChild>
                  <a href={returnTo}>Continue</a>
                </Button>
                {canReset && (
                  <Button
                    variant="outline"
                    onClick={() => void handleReset()}
                    disabled={resetStatus === "resetting"}
                  >
                    {resetStatus === "resetting"
                      ? "Resetting..."
                      : "Reset KYC (demo)"}
                  </Button>
                )}
              </>
            ) : (
              <>
                {canContinue && (
                  <Button
                    onClick={() => void handleResume()}
                    disabled={actionStatus === "starting"}
                  >
                    {actionStatus === "starting"
                      ? "Redirecting..."
                      : "Continue verification"}
                  </Button>
                )}
                {canRestart && (
                  <Button
                    onClick={() => void handleStart()}
                    disabled={actionStatus === "starting" || statusLoading}
                  >
                    {actionStatus === "starting"
                      ? "Redirecting..."
                      : "Start verification"}
                  </Button>
                )}
                {canReset && (
                  <Button
                    variant="outline"
                    onClick={() => void handleReset()}
                    disabled={resetStatus === "resetting"}
                  >
                    {resetStatus === "resetting"
                      ? "Resetting..."
                      : "Reset KYC (demo)"}
                  </Button>
                )}
              </>
            )}
            <Button variant="secondary" asChild>
              <a href={returnTo}>Return to ClipYield</a>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
