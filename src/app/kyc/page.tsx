"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import MainLayout from "@/app/layouts/MainLayout";

export default function KycStartPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/yield";

  const [status, setStatus] = useState<"idle" | "starting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastAddress, setLastAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!address || address === lastAddress) return;

    setLastAddress(address);
    setStatus("starting");
    setError(null);

    (async () => {
      try {
        const res = await fetch("/api/kyc/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address, returnTo }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body?.error ?? "Failed to start KYC.");
          setStatus("error");
          return;
        }

        const data = (await res.json()) as { hostedFlowUrl?: string };
        if (!data.hostedFlowUrl) {
          setError("Missing hosted flow URL from server.");
          setStatus("error");
          return;
        }

        window.location.assign(data.hostedFlowUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start KYC.");
        setStatus("error");
      }
    })();
  }, [address, lastAddress, returnTo]);

  if (!isConnected) {
    return (
      <MainLayout>
        <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
          <div className="mx-auto max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">Verify your identity</h1>
            <p className="text-sm text-muted-foreground">
              Connect a wallet to begin the KYC flow.
            </p>
            <Button onClick={() => openConnectModal?.()}>Connect wallet</Button>
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
            You will be redirected to Persona to complete verification.
          </p>

          {status === "starting" && (
            <Alert variant="info">
              <AlertTitle>Redirecting...</AlertTitle>
              <AlertDescription>
                Preparing your inquiry for {address}. This usually takes a few
                seconds.
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Unable to start KYC</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-3">
                <Button onClick={() => setLastAddress(null)}>Try again</Button>
              </div>
            </Alert>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
