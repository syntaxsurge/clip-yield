"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useBalance,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseUnits } from "viem";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatShortHash } from "@/lib/utils";
import { explorerAddressUrl, explorerTxUrl, mantleConfig } from "@/lib/web3/mantleConfig";
import { wmntWrapAbi } from "@/lib/web3/wmnt";

const DEFAULT_WRAP_AMOUNT = "0.1";

export default function StartWizard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();

  const [isMounted, setIsMounted] = useState(false);
  const [wrapAmount, setWrapAmount] = useState(DEFAULT_WRAP_AMOUNT);
  const [wrapError, setWrapError] = useState<string | null>(null);
  const [wrapTxHash, setWrapTxHash] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isConnectedReady = isMounted && isConnected;
  const isOnMantle = isMounted && chainId === mantleConfig.chainId;

  const parsedWrapAmount = useMemo(() => {
    if (!wrapAmount) return 0n;
    try {
      return parseUnits(wrapAmount, 18);
    } catch {
      return 0n;
    }
  }, [wrapAmount]);

  const nativeBalance = useBalance({
    address,
    query: { enabled: Boolean(address && isOnMantle && isMounted) },
  });

  const wmntBalance = useBalance({
    address,
    token: mantleConfig.wmntAddress,
    query: { enabled: Boolean(address && isOnMantle && isMounted) },
  });

  const mntBalanceLabel =
    isConnectedReady && isOnMantle ? nativeBalance.data?.formatted ?? "0" : "—";
  const wmntBalanceLabel =
    isConnectedReady && isOnMantle ? wmntBalance.data?.formatted ?? "0" : "—";

  const hasEnoughMnt =
    parsedWrapAmount === 0n ||
    !nativeBalance.data?.value ||
    nativeBalance.data.value >= parsedWrapAmount;

  const receipt = useWaitForTransactionReceipt({
    chainId: mantleConfig.chainId,
    hash: wrapTxHash ?? undefined,
    query: { enabled: Boolean(wrapTxHash) },
  });

  const networkStatus = !isMounted
    ? "Checking..."
    : !isConnected
      ? "Connect wallet"
      : isOnMantle
        ? "Ready"
        : "Wrong network";

  const canWrap =
    isConnectedReady &&
    isOnMantle &&
    parsedWrapAmount > 0n &&
    hasEnoughMnt &&
    !isPending &&
    !receipt.isLoading;

  const handleSwitchChain = async () => {
    if (!switchChainAsync) return;
    await switchChainAsync({ chainId: mantleConfig.chainId });
  };

  const handleWrap = async () => {
    if (!canWrap) return;
    if (!address) {
      setWrapError("Connect a wallet to continue.");
      return;
    }

    setWrapError(null);
    try {
      const hash = await writeContractAsync({
        address: mantleConfig.wmntAddress,
        abi: wmntWrapAbi,
        functionName: "deposit",
        value: parsedWrapAmount,
      });
      setWrapTxHash(hash);
    } catch (error) {
      setWrapError(error instanceof Error ? error.message : "Wrap failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Start on Mantle Sepolia</h1>
        <p className="text-sm text-muted-foreground">
          Follow these steps to fund your wallet, wrap WMNT, and enter the ClipYield vault
          flows on Mantle Sepolia.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>1. Connect a wallet</CardTitle>
              <CardDescription>Connect the wallet you will use for vault deposits.</CardDescription>
            </div>
            <Badge variant={isConnectedReady ? "success" : "warning"}>
              {isMounted ? (isConnected ? "Connected" : "Not connected") : "Checking..."}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wallet</span>
              <span>{isConnectedReady && address ? formatShortHash(address) : "—"}</span>
            </div>
            {(!isMounted || !isConnected) && (
              <Button onClick={() => openConnectModal?.()} disabled={!isMounted}>
                {isMounted ? "Connect wallet" : "Checking..."}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>2. Switch to Mantle Sepolia</CardTitle>
              <CardDescription>All hackathon flows run on Mantle Sepolia (chain {mantleConfig.chainId}).</CardDescription>
            </div>
            <Badge variant={isConnectedReady && isOnMantle ? "success" : "warning"}>
              {networkStatus}
            </Badge>
          </CardHeader>
          <CardContent>
            {isConnectedReady && !isOnMantle && (
              <Button variant="outline" onClick={handleSwitchChain}>
                Switch network
              </Button>
            )}
            {!isConnectedReady && (
              <div className="text-sm text-muted-foreground">
                {isMounted
                  ? "Connect a wallet to switch networks."
                  : "Checking wallet connection..."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Fund your wallet</CardTitle>
            <CardDescription>
              Get testnet MNT for gas or bridge assets onto Mantle Sepolia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">MNT balance</span>
              <span>{mntBalanceLabel}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={mantleConfig.faucetUrl} target="_blank" rel="noreferrer">
                  Open faucet
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={mantleConfig.bridgeUrl} target="_blank" rel="noreferrer">
                  Open bridge
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Wrap MNT to WMNT</CardTitle>
            <CardDescription>
              WMNT is required for vault deposits. Contract{" "}
              <a
                className="underline underline-offset-2"
                href={explorerAddressUrl(mantleConfig.wmntAddress)}
                target="_blank"
                rel="noreferrer"
              >
                {formatShortHash(mantleConfig.wmntAddress)}
              </a>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {wrapError && (
              <Alert variant="destructive">
                <AlertTitle>Wrap failed</AlertTitle>
                <AlertDescription>{wrapError}</AlertDescription>
              </Alert>
            )}

            {!hasEnoughMnt && (
              <Alert variant="warning">
                <AlertTitle>Insufficient MNT</AlertTitle>
                <AlertDescription>
                  Fund your wallet with more MNT before wrapping.
                </AlertDescription>
              </Alert>
            )}

            {wrapTxHash && (
              <Alert variant="success">
                <AlertTitle>Transaction submitted</AlertTitle>
                <AlertDescription>
                  {formatShortHash(wrapTxHash)}{" "}
                  <a
                    className="underline underline-offset-2"
                    href={explorerTxUrl(wrapTxHash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on MantleScan
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="wrap-amount">
                  Amount (MNT)
                </label>
                <Input
                  id="wrap-amount"
                  inputMode="decimal"
                  value={wrapAmount}
                  onChange={(event) => setWrapAmount(event.target.value)}
                  placeholder="0.1"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">WMNT balance</div>
                <div className="rounded-md border border-dashed p-3 text-sm">
                  {wmntBalanceLabel}
                </div>
              </div>
            </div>

            <Button onClick={handleWrap} disabled={!canWrap}>
              {isPending ? "Wrapping..." : "Wrap to WMNT"}
            </Button>

            {receipt.isLoading && (
              <div className="text-xs text-muted-foreground">
                Waiting for confirmation...
              </div>
            )}
            {receipt.isSuccess && (
              <div className="text-xs text-[color:var(--brand-success)]">
                WMNT wrapped successfully.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Continue into ClipYield</CardTitle>
            <CardDescription>
              Head to the yield vault or pick a clip to sponsor from the feed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/yield">Go to yield vault</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/feed">Browse feed</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
