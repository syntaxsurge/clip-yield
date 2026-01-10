"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { Address, erc20Abi, formatUnits, parseUnits } from "viem";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
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
import { MantleFinalityPanel } from "@/components/data-display/MantleFinalityPanel";
import { VaultTxReceiptCard } from "@/components/data-display/VaultTxReceiptCard";
import useCreateVaultTx from "@/app/hooks/useCreateVaultTx";
import useGetLatestVaultTx from "@/app/hooks/useGetLatestVaultTx";
import useGetVaultTxByHash from "@/app/hooks/useGetVaultTxByHash";
import type { VaultTxKind } from "@/app/types";
import { formatShortHash } from "@/lib/utils";
import { mantleSepoliaContracts } from "@/lib/contracts/addresses";
import vaultAbi from "@/lib/contracts/abi/ClipYieldVault.json";
import kycRegistryAbi from "@/lib/contracts/abi/KycRegistry.json";
import { wmntWrapAbi } from "@/lib/web3/wmnt";
import { explorerTxUrl } from "@/lib/web3/mantleConfig";
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
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);

  const user = address as Address | undefined;
  const isOnMantle = chainId === mantleSepoliaContracts.chainId;

  const wmnt = mantleSepoliaContracts.wmnt as Address;
  const vault = (vaultAddress ?? mantleSepoliaContracts.clipYieldVault) as Address;
  const kycRegistry = mantleSepoliaContracts.kycRegistry as Address;
  const kycReturnTo = returnTo ?? "/yield";

  useEffect(() => {
    setLastDepositTxHash(null);
    setReceiptError(null);
  }, [user, vault, receiptKind, receiptCreatorId]);

  const { data: kycStatus } = useReadContract({
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
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: isOnMantle },
  });

  const { data: totalAssets } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "totalAssets",
    query: { enabled: isOnMantle },
  });

  const { data: totalSupply } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "totalSupply",
    query: { enabled: isOnMantle },
  });

  const { data: shareBalance } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "balanceOf",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const { data: allowance } = useReadContract({
    address: wmnt,
    abi: erc20Abi,
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

  const { data: previewShares } = useReadContract({
    address: vault,
    abi: vaultAbi,
    functionName: "convertToShares",
    args: parsedAmount > 0n ? [parsedAmount] : undefined,
    query: { enabled: parsedAmount > 0n && isOnMantle },
  });

  const { data: nativeBalance } = useBalance({
    address: user,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const { data: wmntBalance } = useBalance({
    address: user,
    token: wmnt,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const isVerified = Boolean(kycStatus);
  const wmntDecimalsValue = typeof wmntDecimals === "number" ? wmntDecimals : 18;
  const shareDecimalsValue = typeof vaultDecimals === "number" ? vaultDecimals : 18;
  const allowanceValue = typeof allowance === "bigint" ? allowance : 0n;

  const canTransact = isConnected && isOnMantle && parsedAmount > 0n;
  const needsApproval = allowanceValue < parsedAmount;
  const canEstimateFee =
    Boolean(publicClient && user && isOnMantle && parsedAmount > 0n) &&
    isVerified &&
    !needsApproval;

  const formattedTotalAssets = totalAssets
    ? formatUnits(totalAssets, wmntDecimalsValue)
    : "0";
  const formattedTotalSupply = totalSupply
    ? formatUnits(totalSupply, shareDecimalsValue)
    : "0";
  const formattedShareBalance = shareBalance
    ? formatUnits(shareBalance, shareDecimalsValue)
    : "0";
  const formattedPreviewShares = previewShares
    ? formatUnits(previewShares, shareDecimalsValue)
    : "0";

  const {
    data: vaultReceipt,
    isLoading: receiptLoading,
    error: receiptLoadError,
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
    staleTime: 15_000,
    refetchInterval: 15_000,
    retry: 1,
  });

  useEffect(() => {
    let isActive = true;

    if (!canEstimateFee || !publicClient || !user) {
      setEstimatedFee(null);
      return;
    }

    (async () => {
      try {
        const gas = await publicClient.estimateContractGas({
          address: vault,
          abi: vaultAbi,
          functionName: "deposit",
          args: [parsedAmount, user],
          account: user,
        });
        const gasPrice = await publicClient.getGasPrice();
        const fee = gas * gasPrice;
        if (isActive) {
          setEstimatedFee(formatUnits(fee, 18));
        }
      } catch {
        if (isActive) {
          setEstimatedFee(null);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [canEstimateFee, parsedAmount, publicClient, user, vault]);

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

      {actionError && (
        <Alert variant="destructive">
          <AlertTitle>Transaction failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
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

      {receiptError && (
        <Alert variant="warning">
          <AlertTitle>Receipt logging failed</AlertTitle>
          <AlertDescription>{receiptError}</AlertDescription>
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
              <span className="text-muted-foreground">Share supply</span>
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
          <CardHeader>
            <CardTitle>Wallet status</CardTitle>
            <CardDescription>
              {user ? formatShortHash(user) : "Not connected"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">KYC</span>
              <span>{isVerified ? "Verified" : "Not verified"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">MNT balance</span>
              <span>{nativeBalance?.formatted ?? "0"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">WMNT balance</span>
              <span>{wmntBalance?.formatted ?? "0"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Vault shares</span>
              <span>
                {formattedShareBalance} {vaultSymbol || "cySHARE"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit or withdraw</CardTitle>
          <CardDescription>
            Amounts are in WMNT. Wrap MNT first if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="amount">
              Amount
            </label>
            <Input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.05"
            />
            <div className="text-xs text-muted-foreground">
              Estimated shares: {formattedPreviewShares} {vaultSymbol || "cySHARE"}
            </div>
            <div className="text-xs text-muted-foreground">
              Estimated network fee: {estimatedFee ? `${estimatedFee} MNT` : "—"}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={() =>
                runTx("wrap", {
                  address: wmnt,
                  abi: wmntWrapAbi,
                  functionName: "deposit",
                  value: parsedAmount,
                })
              }
              disabled={!canTransact || pendingAction === "wrap"}
            >
              {pendingAction === "wrap" ? "Wrapping..." : "Wrap MNT to WMNT"}
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                runTx("approve", {
                  address: wmnt,
                  abi: erc20Abi,
                  functionName: "approve",
                  args: [vault, parsedAmount],
                })
              }
              disabled={!canTransact || pendingAction === "approve" || !needsApproval}
            >
              {pendingAction === "approve" ? "Approving..." : "Approve vault"}
            </Button>

            <Button
              onClick={handleDeposit}
              disabled={!canTransact || !isVerified || pendingAction === "deposit" || needsApproval}
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
              disabled={!canTransact || !isVerified || pendingAction === "withdraw"}
            >
              {pendingAction === "withdraw" ? "Withdrawing..." : "Withdraw WMNT"}
            </Button>

            <Button
              variant="ghost"
              onClick={() =>
                runTx("unwrap", {
                  address: wmnt,
                  abi: wmntWrapAbi,
                  functionName: "withdraw",
                  args: [parsedAmount],
                })
              }
              disabled={!canTransact || pendingAction === "unwrap"}
            >
              {pendingAction === "unwrap" ? "Unwrapping..." : "Unwrap WMNT"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isConnected && isOnMantle && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Receipt & finality</h2>
            <p className="text-sm text-muted-foreground">
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
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <VaultTxReceiptCard
                receipt={vaultReceipt}
                title={receiptTitle}
                description={receiptDescription}
              />
              <MantleFinalityPanel
                txHash={vaultReceipt.txHash as `0x${string}`}
                l2BlockNumber={vaultReceipt.l2BlockNumber ?? null}
                l2TimestampIso={vaultReceipt.l2TimestampIso ?? null}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
