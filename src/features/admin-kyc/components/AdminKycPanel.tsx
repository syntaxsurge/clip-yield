"use client";

import { useState } from "react";
import { isAddress, type Address } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PrivyConnectButton } from "@/components/ui/PrivyConnectButton";
import WalletGateSkeleton from "@/components/feedback/WalletGateSkeleton";
import { mantleSepoliaContracts } from "@/lib/contracts/addresses";
import kycRegistryAbi from "@/lib/contracts/abi/KycRegistry.json";
import { formatShortHash } from "@/lib/utils";
import { explorerTxUrl } from "@/lib/web3/mantleConfig";

const kycRegistryAddress = mantleSepoliaContracts.kycRegistry as Address;

export default function AdminKycPanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, isPending } = useWriteContract();

  const [target, setTarget] = useState("");
  const [desiredVerified, setDesiredVerified] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const isOnMantle = chainId === mantleSepoliaContracts.chainId;
  const targetAddress = isAddress(target) ? (target as Address) : undefined;

  const roleId = useReadContract({
    address: kycRegistryAddress,
    abi: kycRegistryAbi,
    functionName: "KYC_MANAGER_ROLE",
    query: { enabled: isConnected && isOnMantle },
  });

  const isManager = useReadContract({
    address: kycRegistryAddress,
    abi: kycRegistryAbi,
    functionName: "hasRole",
    args:
      roleId.data && address ? [roleId.data as `0x${string}`, address] : undefined,
    query: { enabled: Boolean(roleId.data && address && isOnMantle) },
  });

  const targetStatus = useReadContract({
    address: kycRegistryAddress,
    abi: kycRegistryAbi,
    functionName: "isVerified",
    args: targetAddress ? [targetAddress] : undefined,
    query: { enabled: Boolean(targetAddress && isOnMantle) },
  });

  const receipt = useWaitForTransactionReceipt({
    chainId: mantleSepoliaContracts.chainId,
    hash: txHash ?? undefined,
    query: { enabled: Boolean(txHash) },
  });

  const canSubmit =
    isConnected && isOnMantle && Boolean(isManager.data) && targetAddress && !isPending;

  if (!isConnected) {
    return <WalletGateSkeleton cards={2} />;
  }

  const handleSwitchChain = async () => {
    if (!switchChainAsync) return;
    setSubmitError(null);
    await switchChainAsync({ chainId: mantleSepoliaContracts.chainId });
  };

  const handleSubmit = async () => {
    if (!targetAddress) {
      setSubmitError("Enter a valid wallet address.");
      return;
    }
    if (!isConnected) {
      setSubmitError("Connect a wallet to continue.");
      return;
    }
    if (!isOnMantle) {
      setSubmitError("Switch to Mantle Sepolia to continue.");
      return;
    }
    if (!isManager.data) {
      setSubmitError("Connected wallet is not authorized to manage KYC.");
      return;
    }

    setSubmitError(null);
    try {
      const hash = await writeContractAsync({
        address: kycRegistryAddress,
        abi: kycRegistryAbi,
        functionName: "setVerified",
        args: [targetAddress, desiredVerified],
      });
      setTxHash(hash);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Transaction failed.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">KYC Registry Admin</CardTitle>
            <CardDescription>
              Update on-chain verification status for Mantle Sepolia wallets.
            </CardDescription>
          </div>
          <PrivyConnectButton showDisconnect />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Registry</span>
              <span className="font-mono text-xs">{formatShortHash(kycRegistryAddress)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Connected wallet</span>
              <span>{address ? formatShortHash(address) : "Not connected"}</span>
            </div>
          </div>
          <Separator />
          {isConnected && !isOnMantle && (
            <Alert variant="warning">
              <AlertTitle>Wrong network</AlertTitle>
              <AlertDescription>
                Switch to Mantle Sepolia to manage KYC.
              </AlertDescription>
              <div className="mt-3">
                <Button variant="outline" onClick={handleSwitchChain}>
                  Switch network
                </Button>
              </div>
            </Alert>
          )}
          {isConnected && isOnMantle && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role status</span>
              <Badge variant={isManager.data ? "success" : "warning"}>
                {isManager.data ? "KYC manager" : "Not authorized"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Update wallet status</CardTitle>
          <CardDescription>
            Only KYC managers can submit on-chain updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertTitle>Action blocked</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="kyc-target">Target wallet address</Label>
            <Input
              id="kyc-target"
              value={target}
              onChange={(event) => setTarget(event.target.value.trim())}
              placeholder="0x..."
              autoComplete="off"
              spellCheck={false}
            />
            <div className="text-xs text-muted-foreground">
              Current status:{" "}
              {targetAddress
                ? targetStatus.data
                  ? "Verified"
                  : "Not verified"
                : "Enter a valid address"}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Set verified</div>
              <div className="text-xs text-muted-foreground">
                Checked means the wallet is marked verified.
              </div>
            </div>
            <Checkbox
              checked={desiredVerified}
              onCheckedChange={(checked) =>
                setDesiredVerified(checked === true)
              }
            />
          </div>

          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isPending ? "Submitting..." : "Submit on-chain update"}
          </Button>

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
              <AlertDescription>
                The update will be available once the transaction is confirmed.
              </AlertDescription>
            </Alert>
          )}

          {receipt.isSuccess && (
            <Alert variant="success">
              <AlertTitle>Update confirmed</AlertTitle>
              <AlertDescription>
                The KYC registry has been updated on-chain.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
