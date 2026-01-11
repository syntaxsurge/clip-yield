"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Address, formatUnits, getAddress, parseUnits } from "viem";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VaultTxReceiptCard } from "@/components/data-display/VaultTxReceiptCard";
import useCreateVaultTx from "@/app/hooks/useCreateVaultTx";
import useGetLatestVaultTx from "@/app/hooks/useGetLatestVaultTx";
import useGetVaultTxByHash from "@/app/hooks/useGetVaultTxByHash";
import type { VaultTxKind } from "@/app/types";
import { cn, formatShortHash } from "@/lib/utils";
import { mantleSepoliaContracts } from "@/lib/contracts/addresses";
import vaultAbi from "@/lib/contracts/abi/ClipYieldVault.json";
import kycRegistryAbi from "@/lib/contracts/abi/KycRegistry.json";
import { wmntAbi } from "@/lib/web3/wmnt";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/web3/mantleConfig";
import Link from "next/link";

type ActionId = "wrap" | "approve" | "deposit" | "withdraw" | "unwrap";

type YieldPanelProps = {
  vaultAddress?: Address;
  title?: string;
  description?: string;
  returnTo?: string;
  receiptKind?: VaultTxKind;
  receiptCreatorId?: string;
  receiptTitle?: string;
  receiptDescription?: string;
  recordDeposit?: boolean;
  onDeposit?: (payload: {
    txHash: string;
    assetsWei: string;
    wallet: string;
    vault: Address;
  }) => void | Promise<void>;
};

export default function YieldPanel({
  vaultAddress,
  title,
  description,
  returnTo,
  receiptKind = "yieldDeposit",
  receiptCreatorId,
  receiptTitle,
  receiptDescription,
  recordDeposit = true,
  onDeposit,
}: YieldPanelProps) {
  const { address } = useAccount();
  const { ready, authenticated, login } = usePrivy();
  const isConnected = authenticated && Boolean(address);
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: mantleSepoliaContracts.chainId });
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState("0.05");
  const [pendingAction, setPendingAction] = useState<ActionId | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<{ action: ActionId; hash: string } | null>(null);
  const [lastDepositTxHash, setLastDepositTxHash] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [wrapTargetMismatch, setWrapTargetMismatch] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastConfirmedHash, setLastConfirmedHash] = useState<string | null>(null);

  const user = address as Address | undefined;
  const isOnMantle = chainId === mantleSepoliaContracts.chainId;

  const wmnt = getAddress(mantleSepoliaContracts.wmnt as Address);
  const vault = getAddress(
    (vaultAddress ?? mantleSepoliaContracts.clipYieldVault) as Address,
  );
  const kycRegistry = getAddress(mantleSepoliaContracts.kycRegistry as Address);
  const kycReturnTo = returnTo ?? "/yield";

  useEffect(() => {
    setLastDepositTxHash(null);
    setReceiptError(null);
  }, [user, vault, receiptKind, receiptCreatorId]);

  const { data: kycStatus, refetch: refetchKycStatus } = useReadContract({
    address: kycRegistry,
    abi: kycRegistryAbi,
    functionName: "isVerified",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const { data: vaultSymbol } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "symbol",
    query: { enabled: isOnMantle },
  });

  const { data: vaultName } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "name",
    query: { enabled: isOnMantle },
  });

  const { data: vaultDecimals } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "decimals",
    query: { enabled: isOnMantle },
  });

  const { data: wmntDecimals } = useReadContract({
    address: wmnt,
    abi: wmntAbi,
    functionName: "decimals",
    query: { enabled: isOnMantle },
  });

  const { data: totalAssets, refetch: refetchTotalAssets } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "totalAssets",
    query: { enabled: isOnMantle },
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "totalSupply",
    query: { enabled: isOnMantle },
  });

  const { data: shareBalance, refetch: refetchShareBalance } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "balanceOf",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: wmnt,
    abi: wmntAbi,
    functionName: "allowance",
    args: user ? [user, vault] : undefined,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const parsedAmount = useMemo(() => {
    const decimals = typeof wmntDecimals === "number" ? wmntDecimals : 18;
    if (!amount) return 0n;
    try {
      return parseUnits(amount, decimals);
    } catch {
      return 0n;
    }
  }, [amount, wmntDecimals]);

  const { data: previewShares, refetch: refetchPreviewShares } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "convertToShares",
    args: parsedAmount > 0n ? [parsedAmount] : undefined,
    query: { enabled: parsedAmount > 0n && isOnMantle },
  });

  const {
    data: previewAssetsFromShares,
    refetch: refetchPreviewAssetsFromShares,
  } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "convertToAssets",
    args: shareBalance ? [shareBalance] : undefined,
    query: { enabled: Boolean(shareBalance) && isOnMantle },
  });

  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address: user,
    chainId: mantleSepoliaContracts.chainId,
    query: { enabled: Boolean(user) && isOnMantle, refetchInterval: 10_000 },
  });

  const {
    data: wmntBalanceRaw,
    isLoading: isWmntBalanceLoading,
    isError: isWmntBalanceError,
    refetch: refetchWmntBalance,
  } = useReadContract({
    address: wmnt,
    abi: wmntAbi,
    functionName: "balanceOf",
    args: user ? [user] : undefined,
    chainId: mantleSepoliaContracts.chainId,
    query: { enabled: Boolean(user), refetchInterval: 10_000 },
  });

  const isVerified = Boolean(kycStatus);
  const wmntDecimalsValue = typeof wmntDecimals === "number" ? wmntDecimals : 18;
  const shareDecimalsValue = typeof vaultDecimals === "number" ? vaultDecimals : 18;
  const allowanceValue = typeof allowance === "bigint" ? allowance : 0n;
  const nativeBalanceValue = nativeBalance?.value ?? 0n;
  const wmntBalanceValue =
    typeof wmntBalanceRaw === "bigint" ? wmntBalanceRaw : 0n;
  const shareBalanceValue = typeof shareBalance === "bigint" ? shareBalance : 0n;
  const maxWithdrawValue =
    typeof previewAssetsFromShares === "bigint" ? previewAssetsFromShares : 0n;

  const canTransact = isConnected && isOnMantle && parsedAmount > 0n;
  const needsApproval = allowanceValue < parsedAmount;
  const hasMntForWrap = nativeBalanceValue >= parsedAmount;
  const hasWmntForActions = wmntBalanceValue >= parsedAmount;
  const canWrap = canTransact && hasMntForWrap;
  const canApprove = canTransact && hasWmntForActions && needsApproval;
  const canDeposit =
    canTransact && isVerified && hasWmntForActions && !needsApproval;
  const canWithdraw =
    canTransact &&
    isVerified &&
    shareBalanceValue > 0n &&
    maxWithdrawValue >= parsedAmount;
  const canUnwrap = canTransact && hasWmntForActions;

  const walletReady = isConnected && isOnMantle;
  const formattedTotalAssets = totalAssets
    ? formatUnits(totalAssets, wmntDecimalsValue)
    : "0";
  const formattedTotalSupply = totalSupply
    ? formatUnits(totalSupply, shareDecimalsValue)
    : "0";
  const formattedShareBalance = walletReady
    ? formatUnits(shareBalanceValue, shareDecimalsValue)
    : "—";
  const formattedPreviewShares = previewShares
    ? formatUnits(previewShares, shareDecimalsValue)
    : "0";
  const formattedNativeBalance = walletReady ? nativeBalance?.formatted ?? "0" : "—";
  const formattedWmntBalance = !walletReady
    ? "—"
    : isWmntBalanceLoading
      ? "Loading..."
      : isWmntBalanceError
        ? "Unavailable"
        : formatUnits(wmntBalanceValue, wmntDecimalsValue);

  const {
    data: vaultReceipt,
    isLoading: receiptLoading,
    error: receiptLoadError,
    refetch: refetchVaultReceipt,
  } = useQuery({
    queryKey: [
      "vault-receipt",
      user,
      receiptKind,
      receiptCreatorId ?? null,
      lastDepositTxHash ?? null,
    ],
    queryFn: async () => {
      if (!user) return null;
      if (lastDepositTxHash) {
        const receipt = await useGetVaultTxByHash(lastDepositTxHash);
        if (receipt) return receipt;
      }
      return await useGetLatestVaultTx({
        wallet: user,
        kind: receiptKind,
        creatorId: receiptCreatorId,
      });
    },
    enabled: Boolean(user && isOnMantle),
    staleTime: 10_000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && status !== "confirmed" ? 8_000 : false;
    },
    retry: 1,
  });

  const {
    isSuccess: isTxConfirmed,
    isLoading: isTxConfirming,
  } = useWaitForTransactionReceipt({
    chainId: mantleSepoliaContracts.chainId,
    hash: lastTx?.hash as `0x${string}` | undefined,
    query: { enabled: Boolean(lastTx?.hash) },
  });

  const handleRefresh = useCallback(async () => {
    if (!walletReady) return;
    setIsRefreshing(true);
    const tasks: Promise<unknown>[] = [
      refetchNativeBalance(),
      refetchWmntBalance(),
      refetchAllowance(),
      refetchShareBalance(),
      refetchTotalAssets(),
      refetchTotalSupply(),
      refetchKycStatus(),
      refetchVaultReceipt(),
    ];
    if (parsedAmount > 0n) {
      tasks.push(refetchPreviewShares());
    }
    if (shareBalanceValue > 0n) {
      tasks.push(refetchPreviewAssetsFromShares());
    }
    await Promise.allSettled(tasks);
    setIsRefreshing(false);
  }, [
    parsedAmount,
    refetchAllowance,
    refetchKycStatus,
    refetchNativeBalance,
    refetchPreviewAssetsFromShares,
    refetchPreviewShares,
    refetchShareBalance,
    refetchTotalAssets,
    refetchTotalSupply,
    refetchVaultReceipt,
    refetchWmntBalance,
    shareBalanceValue,
    walletReady,
  ]);

  useEffect(() => {
    if (!lastTx?.hash || !isTxConfirmed) return;
    if (lastConfirmedHash === lastTx.hash) return;
    setLastConfirmedHash(lastTx.hash);
    void handleRefresh();
  }, [handleRefresh, isTxConfirmed, lastConfirmedHash, lastTx?.hash]);

  const runTx = async (
    action: ActionId,
    request: Parameters<typeof writeContractAsync>[0],
  ) => {
    setPendingAction(action);
    setActionError(null);
    try {
      const hash = await writeContractAsync(request);
      setLastTx({ action, hash });
      return hash;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Transaction failed.");
      return null;
    } finally {
      setPendingAction(null);
    }
  };

  useEffect(() => {
    let isActive = true;

    if (!publicClient || !lastTx || lastTx.action !== "wrap") {
      setWrapTargetMismatch(null);
      return;
    }

    (async () => {
      try {
        const tx = await publicClient.getTransaction({
          hash: lastTx.hash as `0x${string}`,
        });
        if (!isActive) return;
        const toAddress = tx.to;
        if (toAddress && toAddress.toLowerCase() !== wmnt.toLowerCase()) {
          setWrapTargetMismatch(toAddress);
        } else {
          setWrapTargetMismatch(null);
        }
      } catch {
        if (isActive) {
          setWrapTargetMismatch(null);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [lastTx, publicClient, wmnt]);

  const handleSwitchChain = async () => {
    if (!switchChainAsync) return;
    await switchChainAsync({ chainId: mantleSepoliaContracts.chainId });
  };

  const handleDeposit = async () => {
    if (!user) return;
    const txHash = await runTx("deposit", {
      address: vault,
      abi: vaultAbi,
      functionName: "deposit",
      args: [parsedAmount, user as Address],
    });

    if (!txHash) return;

    setLastDepositTxHash(txHash);
    setReceiptError(null);

    if (recordDeposit) {
      try {
        await useCreateVaultTx({
          kind: receiptKind,
          wallet: user,
          creatorId: receiptCreatorId,
          assetsWei: parsedAmount.toString(),
          txHash,
          chainId: mantleSepoliaContracts.chainId,
        });
      } catch (error) {
        console.error("Failed to record vault deposit", error);
        setReceiptError(
          error instanceof Error
            ? error.message
            : "Failed to record vault receipt.",
        );
      }
    }

    if (onDeposit) {
      await onDeposit({
        txHash,
        assetsWei: parsedAmount.toString(),
        wallet: user,
        vault,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{title ?? "ClipYield Vault"}</h1>
        <p className="text-sm text-muted-foreground">
          {description ?? "KYC-gated ERC-4626 vault holding WMNT on Mantle Sepolia."}
        </p>
      </div>

      {!isConnected && (
        <Alert variant="info">
          <AlertTitle>Connect a wallet</AlertTitle>
          <AlertDescription>
            Connect to view balances and interact with the vault.
          </AlertDescription>
          <div className="mt-3">
            <Button onClick={() => void login()} disabled={!ready}>
              {ready ? "Connect wallet" : "Checking..."}
            </Button>
          </div>
        </Alert>
      )}

      {isConnected && !isOnMantle && (
        <Alert variant="warning">
          <AlertTitle>Wrong network</AlertTitle>
          <AlertDescription>
            Switch to Mantle Sepolia to continue.
          </AlertDescription>
          <div className="mt-3">
            <Button onClick={handleSwitchChain}>Switch network</Button>
          </div>
        </Alert>
      )}

      {isConnected && isOnMantle && !isVerified && (
        <Alert variant="warning">
          <AlertTitle>KYC required</AlertTitle>
          <AlertDescription>
            This vault only allows verified wallets to deposit or withdraw.
            <div className="mt-3">
              <Button asChild variant="outline">
                <Link href={`/kyc?returnTo=${encodeURIComponent(kycReturnTo)}`}>
                  Start KYC
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vault overview</CardTitle>
            <CardDescription>{vaultName || "ClipYield Vault"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">TVL (WMNT)</span>
              <span>{formattedTotalAssets}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Share supply (cySHARE)</span>
              <span>
                {formattedTotalSupply} {vaultSymbol || "cySHARE"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">KYC registry</span>
              <span className="font-mono text-xs">
                {formatShortHash(kycRegistry)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Wallet status</CardTitle>
              <CardDescription>
                {user ? formatShortHash(user) : "Not connected"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={!walletReady || isRefreshing}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  isRefreshing || isTxConfirming ? "animate-spin" : "",
                )}
              />
              {isRefreshing ? "Refreshing" : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">KYC</span>
              <span>{isVerified ? "Verified" : "Not verified"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">MNT balance</span>
              <span>{formattedNativeBalance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">WMNT balance</span>
              <span>{formattedWmntBalance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">WMNT contract</span>
              <Link
                className="font-mono text-xs underline underline-offset-2"
                href={explorerAddressUrl(wmnt)}
                target="_blank"
                rel="noreferrer"
              >
                {formatShortHash(wmnt)}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vault shares (cySHARE)</span>
              <span>
                {formattedShareBalance} {vaultSymbol || "cySHARE"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How the vault works</CardTitle>
          <CardDescription>
            A quick guide to the terms and mechanics on this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="font-semibold">TVL (WMNT)</p>
              <p className="text-xs text-muted-foreground">
                Total WMNT locked in the vault. Deposits increase TVL and yield grows it over time.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="font-semibold">cySHARE</p>
              <p className="text-xs text-muted-foreground">
                Vault share tokens minted to depositors. Your cySHARE balance tracks your claim on WMNT + yield.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="font-semibold">Share supply</p>
              <p className="text-xs text-muted-foreground">
                The total cySHARE outstanding across all depositors in the vault.
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p className="font-semibold">KYC registry</p>
              <p className="text-xs text-muted-foreground">
                On-chain registry that marks verified wallets allowed to deposit or withdraw.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <p className="font-semibold">Why wrap MNT to WMNT?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vaults accept ERC-20 tokens, so MNT must be wrapped into WMNT before deposits. You can unwrap WMNT back to native MNT anytime.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Action center</CardTitle>
            <CardDescription>
              Wrap MNT, approve WMNT, and move funds in or out of the vault.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={!walletReady || isRefreshing}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                isRefreshing || isTxConfirming ? "animate-spin" : "",
              )}
            />
            {isRefreshing ? "Refreshing" : "Refresh data"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="amount">
                  Amount used across actions (WMNT)
                </label>
                <p className="text-xs text-muted-foreground">
                  This amount powers wrap, unwrap, approve, deposit, and withdraw.
                </p>
              </div>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.05"
                className="mt-3"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                Estimated shares: {formattedPreviewShares} {vaultSymbol || "cySHARE"}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">KYC status</span>
                <span>{walletReady ? (isVerified ? "Verified" : "Not verified") : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">WMNT available</span>
                <span>{formattedWmntBalance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Approval</span>
                <span>{walletReady ? (needsApproval ? "Required" : "Ready") : "—"}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Approve the vault when you increase the amount you want to deposit.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Use refresh after a transaction to sync balances and approvals.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Wrap & unwrap WMNT</h3>
                <p className="text-xs text-muted-foreground">
                  Convert between native MNT and WMNT for vault interactions.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    runTx("wrap", {
                      address: wmnt,
                      abi: wmntAbi,
                      functionName: "deposit",
                      value: parsedAmount,
                    })
                  }
                  disabled={!canWrap || pendingAction === "wrap"}
                >
                  {pendingAction === "wrap" ? "Wrapping..." : "Wrap MNT to WMNT"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    runTx("unwrap", {
                      address: wmnt,
                      abi: wmntAbi,
                      functionName: "withdraw",
                      args: [parsedAmount],
                    })
                  }
                  disabled={!canUnwrap || pendingAction === "unwrap"}
                >
                  {pendingAction === "unwrap" ? "Unwrapping..." : "Unwrap WMNT"}
                </Button>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Approve + vault actions</h3>
                <p className="text-xs text-muted-foreground">
                  Approve WMNT once, then deposit into or withdraw from the vault.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    runTx("approve", {
                      address: wmnt,
                      abi: wmntAbi,
                      functionName: "approve",
                      args: [vault, parsedAmount],
                    })
                  }
                  disabled={!canApprove || pendingAction === "approve"}
                >
                  {pendingAction === "approve" ? "Approving..." : "Approve vault"}
                </Button>
                <Button
                  onClick={handleDeposit}
                  disabled={!canDeposit || pendingAction === "deposit"}
                >
                  {pendingAction === "deposit" ? "Depositing..." : "Deposit"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    runTx("withdraw", {
                      address: vault,
                      abi: vaultAbi,
                      functionName: "withdraw",
                      args: [parsedAmount, user as Address, user as Address],
                    })
                  }
                  disabled={!canWithdraw || pendingAction === "withdraw"}
                >
                  {pendingAction === "withdraw" ? "Withdrawing..." : "Withdraw WMNT"}
                </Button>
              </div>
            </div>
          </div>

          {actionError && (
            <Alert variant="warning">
              <AlertTitle>Transaction failed</AlertTitle>
              <AlertDescription className="break-all whitespace-pre-wrap">
                {actionError}
              </AlertDescription>
            </Alert>
          )}

          {lastTx && (
            <Alert variant="success">
              <AlertTitle>Transaction submitted</AlertTitle>
              <AlertDescription>
                {lastTx.action.toUpperCase()} TX: {formatShortHash(lastTx.hash)}{" "}
                <a
                  className="underline underline-offset-2"
                  href={explorerTxUrl(lastTx.hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on MantleScan
                </a>
              </AlertDescription>
            </Alert>
          )}

          {wrapTargetMismatch && (
            <Alert variant="warning">
              <AlertTitle>Wrap sent to the wrong address</AlertTitle>
              <AlertDescription className="space-y-1">
                <p>
                  The last wrap transaction targeted{" "}
                  <a
                    className="underline underline-offset-2"
                    href={explorerAddressUrl(wrapTargetMismatch)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {formatShortHash(wrapTargetMismatch)}
                  </a>
                  , which does not mint WMNT.
                </p>
                <p>
                  Wrap MNT using the official WMNT contract{" "}
                  <a
                    className="underline underline-offset-2"
                    href={explorerAddressUrl(wmnt)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {formatShortHash(wmnt)}
                  </a>
                  .
                </p>
              </AlertDescription>
            </Alert>
          )}

          {receiptError && (
            <Alert variant="warning">
              <AlertTitle>Receipt logging failed</AlertTitle>
              <AlertDescription className="break-words whitespace-pre-wrap">
                {receiptError}
              </AlertDescription>
            </Alert>
          )}

          {isConnected && isOnMantle && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Latest receipt</h3>
                <p className="text-xs text-muted-foreground">
                  Every vault transaction is recorded in Convex and confirmed on-chain.
                </p>
              </div>

              {receiptLoadError && (
                <Alert variant="warning">
                  <AlertTitle>Unable to load receipts</AlertTitle>
                  <AlertDescription>
                    {receiptLoadError instanceof Error
                      ? receiptLoadError.message
                      : "Failed to load vault receipts."}
                  </AlertDescription>
                </Alert>
              )}

              {!receiptLoadError && receiptLoading && (
                <Alert variant="info">
                  <AlertTitle>Loading receipts</AlertTitle>
                  <AlertDescription>
                    Checking the latest vault transaction status.
                  </AlertDescription>
                </Alert>
              )}

              {!receiptLoadError && !receiptLoading && !vaultReceipt && (
                <Alert variant="info">
                  <AlertTitle>No receipts yet</AlertTitle>
                  <AlertDescription>
                    Once you deposit, we&apos;ll surface the on-chain receipt here.
                  </AlertDescription>
                </Alert>
              )}

              {vaultReceipt && (
                <VaultTxReceiptCard
                  receipt={vaultReceipt}
                  title={receiptTitle}
                  description={receiptDescription}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
