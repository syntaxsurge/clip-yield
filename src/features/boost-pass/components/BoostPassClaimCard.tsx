"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, useChainId, useReadContract, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { getAddress, isAddress, type Address } from "viem";
import { usePrivy } from "@privy-io/react-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WalletGateSkeleton from "@/components/feedback/WalletGateSkeleton";
import { mantleSepoliaContracts } from "@/lib/contracts/addresses";
import kycRegistryAbi from "@/lib/contracts/abi/KycRegistry.json";
import { formatShortHash } from "@/lib/utils";
import { explorerTxUrl } from "@/lib/web3/mantleConfig";
import type { LeaderboardSnapshot } from "@/app/types";
import { useBoostPass } from "@/features/boost-pass/hooks/useBoostPass";
import useLogBoostPassClaim from "@/app/hooks/useLogBoostPassClaim";

type BoostPassClaimCardProps = {
  snapshot: LeaderboardSnapshot | null;
};

export default function BoostPassClaimCard({ snapshot }: BoostPassClaimCardProps) {
  const { address } = useAccount();
  const { authenticated } = usePrivy();
  const isConnected = authenticated && Boolean(address);
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const {
    currentEpoch,
    eligible,
    claimed,
    hasPass,
    claim,
    isClaimPending,
    isOnMantle,
  } = useBoostPass();

  const [actionError, setActionError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [claimEpoch, setClaimEpoch] = useState<number | null>(null);
  const [loggedTx, setLoggedTx] = useState<string | null>(null);

  const kycRegistry = mantleSepoliaContracts.kycRegistry as Address;
  const isOnNetwork = chainId === mantleSepoliaContracts.chainId;

  const { data: kycStatus } = useReadContract({
    address: kycRegistry,
    abi: kycRegistryAbi,
    functionName: "isVerified",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && isOnNetwork) },
  });

  const isVerified = Boolean(kycStatus);

  const inSnapshot = useMemo(() => {
    if (!snapshot?.topBoosters?.length || !address || !isAddress(address)) return false;
    const normalized = getAddress(address);
    return snapshot.topBoosters.some(
      (entry) => isAddress(entry.wallet) && getAddress(entry.wallet) === normalized,
    );
  }, [snapshot, address]);

  const receipt = useWaitForTransactionReceipt({
    chainId: mantleSepoliaContracts.chainId,
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) },
  });

  useEffect(() => {
    if (!receipt.isSuccess || !txHash || !address || !claimEpoch) return;
    if (loggedTx === txHash) return;
    setLoggedTx(txHash);

    void useLogBoostPassClaim({
      epoch: claimEpoch,
      wallet: address,
      txHash,
    }).catch((err) => {
      console.error("Failed to log boost pass claim", err);
    });
  }, [receipt.isSuccess, txHash, address, claimEpoch, loggedTx]);

  const handleSwitchChain = async () => {
    if (!switchChainAsync) return;
    setActionError(null);
    await switchChainAsync({ chainId: mantleSepoliaContracts.chainId });
  };

  const handleClaim = async () => {
    if (!currentEpoch) {
      setActionError("No active epoch has been published yet.");
      return;
    }
    if (!isVerified) {
      setActionError("Complete KYC before claiming your Boost Pass.");
      return;
    }
    setActionError(null);
    try {
      const hash = await claim(currentEpoch);
      setTxHash(hash);
      setClaimEpoch(Number(currentEpoch));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Claim failed.");
    }
  };

  if (!isConnected) {
    return <WalletGateSkeleton cards={1} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Boost Pass claim</CardTitle>
        <CardDescription>
          Top boosters can claim a soulbound Boost Pass to unlock exclusive remix packs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current epoch</span>
          <span>{currentEpoch !== null ? Number(currentEpoch) : "Loading..."}</span>
        </div>

        {isConnected && !isOnMantle && (
          <Alert variant="warning">
            <AlertTitle>Wrong network</AlertTitle>
            <AlertDescription>Switch to Mantle Sepolia to claim.</AlertDescription>
            <div className="mt-3">
              <Button variant="outline" onClick={handleSwitchChain}>
                Switch network
              </Button>
            </div>
          </Alert>
        )}

        {isConnected && isOnMantle && !isVerified && (
          <Alert variant="warning">
            <AlertTitle>KYC required</AlertTitle>
            <AlertDescription>
              Complete verification to claim Boost Pass perks.
            </AlertDescription>
            <div className="mt-3">
              <Link
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                href={`/kyc?returnTo=${encodeURIComponent("/leaderboard")}`}
              >
                Start KYC
              </Link>
            </div>
          </Alert>
        )}

        {isConnected && isOnMantle && !eligible && inSnapshot && (
          <Alert variant="info">
            <AlertTitle>Epoch not published</AlertTitle>
            <AlertDescription>
              You&apos;re on the latest top boosters list. Wait for admin publish.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && isOnMantle && eligible && hasPass && (
          <Alert variant="success">
            <AlertTitle>Boost Pass active</AlertTitle>
            <AlertDescription>
              You hold the current Boost Pass. Unlock perks in{" "}
              <Link className="underline underline-offset-2" href="/perks/boost-pass">
                Boost Pass perks
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        {actionError && (
          <Alert variant="destructive">
            <AlertTitle>Claim blocked</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {isConnected && isOnMantle && isVerified && eligible && !claimed && !hasPass && (
          <Button onClick={handleClaim} disabled={isClaimPending}>
            {isClaimPending ? "Claiming..." : "Claim Boost Pass"}
          </Button>
        )}

        {txHash && (
          <Alert variant="success">
            <AlertTitle>Transaction submitted</AlertTitle>
            <AlertDescription>
              {formatShortHash(txHash)}{" "}
              <a
                className="underline underline-offset-2"
                href={explorerTxUrl(txHash)}
                target="_blank"
                rel="noreferrer"
              >
                View on MantleScan
              </a>
            </AlertDescription>
          </Alert>
        )}

        {receipt.isLoading && (
          <Alert variant="info">
            <AlertTitle>Waiting for confirmation</AlertTitle>
            <AlertDescription>Claim will finalize after confirmation.</AlertDescription>
          </Alert>
        )}

        {receipt.isSuccess && (
          <Alert variant="success">
            <AlertTitle>Boost Pass claimed</AlertTitle>
            <AlertDescription>
              Head to{" "}
              <Link className="underline underline-offset-2" href="/perks/boost-pass">
                Boost Pass perks
              </Link>{" "}
              to download the remix pack.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
