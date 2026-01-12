"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useReadContract,
  useSignMessage,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  Address,
  decodeEventLog,
  erc20Abi,
  formatUnits,
  getAddress,
  isAddress,
  keccak256,
  parseUnits,
  toHex,
} from "viem";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatShortHash } from "@/lib/utils";
import WalletGateSkeleton from "@/components/feedback/WalletGateSkeleton";
import { mantleSepoliaContracts } from "@/lib/contracts/addresses";
import sponsorHubAbi from "@/lib/contracts/abi/ClipYieldSponsorHub.json";
import kycRegistryAbi from "@/lib/contracts/abi/KycRegistry.json";
import { wmntAbi } from "@/lib/web3/wmnt";
import { explorerTxUrl } from "@/lib/web3/mantleConfig";
import useCreateSponsorCampaign from "@/app/hooks/useCreateSponsorCampaign";
import useCreateCampaignReceipt from "@/app/hooks/useCreateCampaignReceipt";
import useCreateVaultTx from "@/app/hooks/useCreateVaultTx";
import type { SponsorCampaign } from "@/app/types";
import { buildSponsorPackMessage } from "@/features/sponsor/message";
import { isSponsorCampaignActive } from "@/features/sponsor/utils";
import { hashCampaignTerms, type CampaignTerms } from "@/features/sponsor/services/campaignTerms";

type ActionId = "approve" | "sponsor" | "perks";
type TxStatus = "idle" | "pending" | "confirmed" | "failed";
type TxState = {
  status: TxStatus;
  hash?: `0x${string}`;
  error?: string;
};

type SponsorPanelProps = {
  postId: string;
  creatorId: string;
  vaultAddress: Address;
  currentCampaign: SponsorCampaign | null;
  onCampaignCreated?: (campaign: SponsorCampaign) => void;
};

const toIsoDate = (value: string) => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

export default function SponsorPanel({
  postId,
  creatorId,
  vaultAddress,
  currentCampaign,
  onCampaignCreated,
}: SponsorPanelProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: mantleSepoliaContracts.chainId });
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();

  const [amount, setAmount] = useState("0.25");
  const [sponsorName, setSponsorName] = useState("");
  const [objective, setObjective] = useState("");
  const [deliverablesText, setDeliverablesText] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toISOString().slice(0, 10);
  });
  const [pendingAction, setPendingAction] = useState<ActionId | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [approveTx, setApproveTx] = useState<TxState>({ status: "idle" });
  const [sponsorTx, setSponsorTx] = useState<TxState>({ status: "idle" });
  const [perkMessage, setPerkMessage] = useState<string | null>(null);
  const [perkError, setPerkError] = useState<string | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [receiptDetails, setReceiptDetails] = useState<{
    campaignId: string;
    receiptTokenId: string;
    protocolFeeWei: string;
  } | null>(null);

  const user = address as Address | undefined;
  const isOnMantle = chainId === mantleSepoliaContracts.chainId;

  const wmnt = getAddress(mantleSepoliaContracts.wmnt as Address);
  const sponsorHub = getAddress(mantleSepoliaContracts.sponsorHub as Address);
  const kycRegistry = getAddress(mantleSepoliaContracts.kycRegistry as Address);
  const invoiceReceipts = getAddress(
    mantleSepoliaContracts.invoiceReceipts as Address,
  );
  const yieldVault = getAddress(
    mantleSepoliaContracts.clipYieldVault as Address,
  );
  const vault = useMemo(() => getAddress(vaultAddress), [vaultAddress]);

  const postIdHash = useMemo(() => {
    return keccak256(toHex(`post:${postId}`));
  }, [postId]);

  const deliverables = useMemo(
    () =>
      deliverablesText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    [deliverablesText],
  );

  const previewTerms = useMemo(() => {
    const sponsorTrimmed = sponsorName.trim();
    const objectiveTrimmed = objective.trim();
    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);

    if (
      !sponsorTrimmed ||
      !objectiveTrimmed ||
      deliverables.length === 0 ||
      !startIso ||
      !endIso
    ) {
      return null;
    }

    return {
      sponsorName: sponsorTrimmed,
      objective: objectiveTrimmed,
      deliverables,
      startDateIso: startIso,
      endDateIso: endIso,
      disclosure: "Sponsored",
    } satisfies CampaignTerms;
  }, [deliverables, endDate, objective, sponsorName, startDate]);

  const previewTermsHash = useMemo(
    () => (previewTerms ? hashCampaignTerms(previewTerms) : null),
    [previewTerms],
  );

  const { data: kycStatus } = useReadContract({
    address: kycRegistry,
    abi: kycRegistryAbi,
    functionName: "isVerified",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const { data: wmntDecimals } = useReadContract({
    address: wmnt,
    abi: wmntAbi,
    functionName: "decimals",
    query: { enabled: isOnMantle },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: wmnt,
    abi: wmntAbi,
    functionName: "allowance",
    args: user ? [user, sponsorHub] : undefined,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const { data: protocolFeeBps } = useReadContract({
    address: sponsorHub,
    abi: sponsorHubAbi,
    functionName: "protocolFeeBps",
    query: { enabled: isOnMantle },
  });

  const { data: vaultSymbol } = useReadContract({
    address: vault,
    abi: erc20Abi,
    functionName: "symbol",
    query: { enabled: isOnMantle },
  });

  const { data: vaultDecimals } = useReadContract({
    address: vault,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: isOnMantle },
  });

  const { data: shareBalance, refetch: refetchShareBalance } = useReadContract({
    address: vault,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: user ? [user] : undefined,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address: user,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const { data: wmntBalance, refetch: refetchWmntBalance } = useBalance({
    address: user,
    token: wmnt,
    query: { enabled: Boolean(user) && isOnMantle },
  });

  const wmntDecimalsValue = typeof wmntDecimals === "number" ? wmntDecimals : 18;
  const vaultDecimalsValue = typeof vaultDecimals === "number" ? vaultDecimals : 18;
  const parsedAmount = useMemo(() => {
    if (!amount) return 0n;
    try {
      return parseUnits(amount, wmntDecimalsValue);
    } catch {
      return 0n;
    }
  }, [amount, wmntDecimalsValue]);

  const allowanceValue = typeof allowance === "bigint" ? allowance : 0n;
  const shareBalanceValue = typeof shareBalance === "bigint" ? shareBalance : 0n;
  const protocolFeeBpsValue =
    typeof protocolFeeBps === "bigint" ? Number(protocolFeeBps) : null;
  const protocolFeeWei =
    parsedAmount > 0n && protocolFeeBpsValue !== null
      ? (parsedAmount * BigInt(protocolFeeBpsValue)) / 10_000n
      : null;
  const netAmountWei = protocolFeeWei !== null ? parsedAmount - protocolFeeWei : null;
  const formattedAmount =
    parsedAmount > 0n ? formatUnits(parsedAmount, wmntDecimalsValue) : "—";
  const formattedProtocolFee =
    protocolFeeWei !== null ? formatUnits(protocolFeeWei, wmntDecimalsValue) : "—";
  const formattedNetAmount =
    netAmountWei !== null ? formatUnits(netAmountWei, wmntDecimalsValue) : "—";
  const protocolFeeLabel =
    protocolFeeBpsValue === null
      ? "—"
      : `${(protocolFeeBpsValue / 100).toFixed(
          protocolFeeBpsValue % 100 === 0 ? 0 : 2,
        )}%`;

  const isVerified = Boolean(kycStatus);
  const needsApproval = allowanceValue < parsedAmount;
  const canTransact = isConnected && isOnMantle && parsedAmount > 0n;

  const sponsorActive = isSponsorCampaignActive(currentCampaign);
  const hasBoosterShares = shareBalanceValue > 0n;
  const perksEligible = sponsorActive && hasBoosterShares;
  const termsReady = Boolean(previewTerms);

  useEffect(() => {
    setApproveTx({ status: "idle" });
    setSponsorTx({ status: "idle" });
    setActionError(null);
    setPerkMessage(null);
    setPerkError(null);
    setReceiptDetails(null);
  }, [postId, user]);

  useEffect(() => {
    let isActive = true;

    if (
      !publicClient ||
      !user ||
      !isOnMantle ||
      parsedAmount <= 0n ||
      needsApproval ||
      !termsReady ||
      !previewTermsHash ||
      !isAddress(creatorId)
    ) {
      setEstimatedFee(null);
      return;
    }

    (async () => {
      try {
        const gas = await publicClient.estimateContractGas({
          address: sponsorHub,
          abi: sponsorHubAbi,
          functionName: "sponsorClip",
          args: [
            getAddress(creatorId),
            vault,
            postIdHash,
            previewTermsHash,
            parsedAmount,
          ],
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
  }, [
    creatorId,
    isOnMantle,
    needsApproval,
    parsedAmount,
    postIdHash,
    previewTermsHash,
    publicClient,
    sponsorHub,
    termsReady,
    user,
    vault,
  ]);

  const formattedShares = shareBalanceValue
    ? formatUnits(shareBalanceValue, vaultDecimalsValue)
    : "0";

  if (!isConnected) {
    return <WalletGateSkeleton cards={2} />;
  }

  type WriteRequest = Omit<Parameters<typeof writeContractAsync>[0], "value"> & {
    value?: bigint;
  };

  const runTx = async (
    action: ActionId,
    request: WriteRequest,
    setTxState?: (next: TxState) => void,
  ) => {
    setPendingAction(action);
    setActionError(null);
    setTxState?.({ status: "pending" });
    try {
      const hash = await writeContractAsync(
        request as Parameters<typeof writeContractAsync>[0],
      );
      setTxState?.({ status: "pending", hash });
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setTxState?.({ status: "confirmed", hash });
      return hash;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed.";
      setActionError(message);
      setTxState?.({ status: "failed", error: message });
      return null;
    } finally {
      setPendingAction(null);
    }
  };

  const handleSwitchChain = async () => {
    if (!switchChainAsync) return;
    await switchChainAsync({ chainId: mantleSepoliaContracts.chainId });
  };

  const buildTerms = (): CampaignTerms | null => {
    const sponsorTrimmed = sponsorName.trim();
    if (!sponsorTrimmed) {
      setActionError("Sponsor name is required.");
      return null;
    }

    const objectiveTrimmed = objective.trim();
    if (!objectiveTrimmed) {
      setActionError("Campaign objective is required.");
      return null;
    }

    if (deliverables.length === 0) {
      setActionError("Add at least one deliverable.");
      return null;
    }

    const startIso = toIsoDate(startDate);
    const endIso = toIsoDate(endDate);

    if (!startIso || !endIso) {
      setActionError("Provide a valid start and end date.");
      return null;
    }

    if (new Date(startIso).getTime() > new Date(endIso).getTime()) {
      setActionError("End date must be on or after the start date.");
      return null;
    }

    return {
      sponsorName: sponsorTrimmed,
      objective: objectiveTrimmed,
      deliverables,
      startDateIso: startIso,
      endDateIso: endIso,
      disclosure: "Sponsored",
    };
  };

  const handleSponsor = async () => {
    if (!user) {
      setActionError("Wallet not connected.");
      return;
    }

    setActionError(null);
    setReceiptDetails(null);
    setSponsorTx({ status: "idle" });

    if (parsedAmount <= 0n) {
      setActionError("Enter a sponsor amount.");
      return;
    }

    if (!isAddress(creatorId)) {
      setActionError("Creator wallet is invalid.");
      return;
    }

    const terms = buildTerms();
    if (!terms) return;

    const termsHash = hashCampaignTerms(terms);

    const txHash = await runTx(
      "sponsor",
      {
        address: sponsorHub,
        abi: sponsorHubAbi,
        functionName: "sponsorClip",
        args: [getAddress(creatorId), vault, postIdHash, termsHash, parsedAmount],
      },
      setSponsorTx,
    );

    if (!txHash) return;

    if (!publicClient) {
      setActionError("Missing chain client for receipt parsing.");
      setSponsorTx({ status: "failed", hash: txHash });
      return;
    }

    let onchainReceipt: {
      campaignId: string;
      receiptTokenId: string;
      protocolFeeWei: string;
    } | null = null;

    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== sponsorHub.toLowerCase()) continue;
        try {
          const decoded = decodeEventLog({
            abi: sponsorHubAbi,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName !== "ClipSponsored") continue;
          const args = decoded.args as unknown as {
            campaignId: `0x${string}`;
            receiptTokenId: bigint;
            protocolFee: bigint;
          };
          onchainReceipt = {
            campaignId: args.campaignId,
            receiptTokenId: args.receiptTokenId.toString(),
            protocolFeeWei: args.protocolFee.toString(),
          };
          break;
        } catch {
          continue;
        }
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to read on-chain receipt logs.",
      );
      setSponsorTx({ status: "failed", hash: txHash });
      return;
    }

    if (!onchainReceipt) {
      setActionError("Unable to locate the invoice receipt event on-chain.");
      setSponsorTx({ status: "failed", hash: txHash });
      return;
    }

    setReceiptDetails(onchainReceipt);

    const campaignInput = {
      postId,
      clipHash: postIdHash,
      creatorId,
      vaultAddress: vault,
      sponsorAddress: user as string,
      assets: parsedAmount.toString(),
      protocolFeeWei: onchainReceipt.protocolFeeWei,
      campaignId: onchainReceipt.campaignId,
      receiptTokenId: onchainReceipt.receiptTokenId,
      invoiceReceiptAddress: invoiceReceipts,
      txHash,
    };

    let receiptId: string | null = null;

    try {
      await useCreateSponsorCampaign(campaignInput);

      receiptId = (await useCreateCampaignReceipt({
        postId,
        clipHash: postIdHash,
        creatorId: getAddress(creatorId),
        sponsorAddress: user,
        boostVault: vault,
        assetsWei: parsedAmount.toString(),
        protocolFeeWei: onchainReceipt.protocolFeeWei,
        campaignId: onchainReceipt.campaignId,
        receiptTokenId: onchainReceipt.receiptTokenId,
        invoiceReceiptAddress: invoiceReceipts,
        termsHash,
        txHash,
        sponsorName: terms.sponsorName,
        objective: terms.objective,
        deliverables: terms.deliverables,
        startDateIso: terms.startDateIso,
        endDateIso: terms.endDateIso,
        disclosure: terms.disclosure,
      })) as string | null;
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to record sponsor campaign.",
      );
      return;
    }

    try {
      await useCreateVaultTx({
        kind: "sponsorDeposit",
        wallet: user,
        creatorId: getAddress(creatorId),
        postId,
        assetsWei: parsedAmount.toString(),
        txHash,
        chainId: mantleSepoliaContracts.chainId,
      });
    } catch (error) {
      console.error("Failed to record sponsor vault tx", error);
    }

    const nextCampaign: SponsorCampaign = {
      ...campaignInput,
      createdAt: Date.now(),
    };
    onCampaignCreated?.(nextCampaign);

    await Promise.all([
      refetchShareBalance?.(),
      refetchAllowance?.(),
      refetchWmntBalance?.(),
      refetchNativeBalance?.(),
    ]);

    if (receiptId) {
      router.push(`/campaign/${receiptId}`);
    }
  };

  const handleApprove = async () => {
    if (!canTransact || !needsApproval) return;
    setActionError(null);
    const txHash = await runTx(
      "approve",
      {
        address: wmnt,
        abi: wmntAbi,
        functionName: "approve",
        args: [sponsorHub, parsedAmount],
      },
      setApproveTx,
    );

    if (txHash) {
      await Promise.all([refetchAllowance?.(), refetchWmntBalance?.()]);
    }
  };

  const handleDownloadPack = async () => {
    if (!user) {
      setPerkError("Wallet not connected.");
      return;
    }

    setPendingAction("perks");
    setPerkMessage(null);
    setPerkError(null);

    try {
      const message = buildSponsorPackMessage(postId);
      const signature = await signMessageAsync({ message });

      const res = await fetch("/api/sponsor/remix-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, address: user, signature }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to unlock sponsor pack.");
      }

      const payload = (await res.json()) as { pack: unknown };
      const blob = new Blob([JSON.stringify(payload.pack, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "clipyield-sponsor-pack.json";
      anchor.click();
      URL.revokeObjectURL(url);

      setPerkMessage("Sponsor pack downloaded.");
    } catch (error) {
      setPerkError(error instanceof Error ? error.message : "Perk unlock failed.");
    } finally {
      setPendingAction(null);
    }
  };

  const approvalStatus: TxStatus = needsApproval ? approveTx.status : "confirmed";
  const approvalLabel =
    approvalStatus === "pending"
      ? "Pending"
      : approvalStatus === "failed"
        ? "Failed"
        : needsApproval
          ? "Not approved"
          : "Approved";
  const sponsorLabel =
    sponsorTx.status === "pending"
      ? "Pending"
      : sponsorTx.status === "failed"
        ? "Failed"
        : sponsorTx.status === "confirmed"
          ? "Confirmed"
          : "Not started";

  return (
    <div className="space-y-6">
      {isConnected && !isOnMantle && (
        <Alert variant="warning">
          <AlertTitle>Wrong network</AlertTitle>
          <AlertDescription>Switch to Mantle Sepolia to continue.</AlertDescription>
          <div className="mt-3">
            <Button onClick={handleSwitchChain}>Switch network</Button>
          </div>
        </Alert>
      )}

      {isConnected && isOnMantle && !isVerified && (
        <Alert variant="warning">
          <AlertTitle>KYC required</AlertTitle>
          <AlertDescription>
            Only verified sponsors can mint compliant invoice receipts and fund creator vaults.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sponsor details</CardTitle>
          <CardDescription>
            Protocol fees fund the yield vault while net WMNT mints creator boost shares.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Vault</span>
            <span className="font-mono text-xs">{formatShortHash(vault)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Yield vault</span>
            <span className="font-mono text-xs">{formatShortHash(yieldVault)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sponsor hub</span>
            <span className="font-mono text-xs">{formatShortHash(sponsorHub)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Invoice receipts</span>
            <span className="font-mono text-xs">
              {formatShortHash(invoiceReceipts)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Wallet</span>
            <span className="font-mono text-xs">
              {user ? formatShortHash(user) : "Not connected"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wallet balances</CardTitle>
          <CardDescription>Check your balances before sponsoring.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">MNT balance</span>
            <span>{nativeBalance?.formatted ?? "0"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">WMNT balance</span>
            <span>{wmntBalance?.formatted ?? "0"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Boost shares</span>
            <span>
              {formattedShares} {vaultSymbol || "cBOOST"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign terms</CardTitle>
          <CardDescription>
            These terms are hashed on-chain to create an auditable sponsorship receipt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sponsorName">Sponsor name</Label>
            <Input
              id="sponsorName"
              value={sponsorName}
              onChange={(event) => setSponsorName(event.target.value)}
              placeholder="Mantle Creators Fund"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective">Objective</Label>
            <Input
              id="objective"
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder="Launch week push for the remix challenge"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverables">Deliverables (one per line)</Label>
            <Textarea
              id="deliverables"
              value={deliverablesText}
              onChange={(event) => setDeliverablesText(event.target.value)}
              placeholder={"1x 15s clip featuring the campaign\n1x caption + link in bio\n1x behind-the-scenes remix"}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
            <div className="font-semibold text-slate-600">Disclosure</div>
            <div>Sponsored</div>
          </div>

          <div className="space-y-1 text-xs text-slate-500">
            <div className="font-semibold text-slate-600">Terms hash</div>
            <div className="break-all font-mono">
              {previewTermsHash ?? "Complete the fields to generate the hash."}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>Sponsor with invoice receipts</CardTitle>
              <CardDescription>
                Approve WMNT once, then sponsor the clip to mint an on-chain receipt.
              </CardDescription>
            </div>
            <Badge variant={isVerified ? "success" : "warning"}>
              {isVerified ? "KYC verified" : "KYC required"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <label className="text-sm font-medium" htmlFor="amount">
                Amount (WMNT)
              </label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.25"
              />
              <div className="text-xs text-muted-foreground">
                Estimated network fee: {estimatedFee ? `${estimatedFee} MNT` : "—"}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sponsorship breakdown
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sponsorship amount</span>
                  <span>{formattedAmount} WMNT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Protocol fee ({protocolFeeLabel})
                  </span>
                  <span>{formattedProtocolFee} WMNT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Net to creator vault</span>
                  <span>{formattedNetAmount} WMNT</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Invoice Receipt NFT mints to your wallet after confirmation.
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => void handleApprove()}
              disabled={!canTransact || pendingAction === "approve" || !needsApproval}
            >
              {pendingAction === "approve" ? "Approving..." : "Approve sponsor hub"}
            </Button>

            <Button
              onClick={handleSponsor}
              disabled={
                !canTransact ||
                !isVerified ||
                pendingAction === "sponsor" ||
                needsApproval ||
                !termsReady
              }
            >
              {pendingAction === "sponsor" ? "Sponsoring..." : "Sponsor clip"}
            </Button>
          </div>

          {actionError && (
            <Alert variant="destructive">
              <AlertTitle>Action failed</AlertTitle>
              <AlertDescription className="break-all whitespace-pre-wrap">
                {actionError}
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Transaction status
            </div>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Approval</span>
                <Badge
                  variant={
                    approvalStatus === "confirmed"
                      ? "success"
                      : approvalStatus === "pending"
                        ? "warning"
                        : "outline"
                  }
                  className={
                    approvalStatus === "failed"
                      ? "border-destructive text-destructive"
                      : undefined
                  }
                >
                  {approvalLabel}
                </Badge>
              </div>
              {approveTx.hash && (
                <a
                  className="block text-xs text-muted-foreground underline underline-offset-2"
                  href={explorerTxUrl(approveTx.hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View approval tx: {formatShortHash(approveTx.hash)}
                </a>
              )}

              <div className="flex items-center justify-between">
                <span>Sponsorship</span>
                <Badge
                  variant={
                    sponsorTx.status === "confirmed"
                      ? "success"
                      : sponsorTx.status === "pending"
                        ? "warning"
                        : "outline"
                  }
                  className={
                    sponsorTx.status === "failed"
                      ? "border-destructive text-destructive"
                      : undefined
                  }
                >
                  {sponsorLabel}
                </Badge>
              </div>
              {sponsorTx.hash && (
                <a
                  className="block text-xs text-muted-foreground underline underline-offset-2"
                  href={explorerTxUrl(sponsorTx.hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View sponsor tx: {formatShortHash(sponsorTx.hash)}
                </a>
              )}
            </div>
          </div>

          {receiptDetails && (
            <div className="rounded-xl border border-[color:var(--brand-success)] bg-[color:var(--brand-success-soft)] p-4 text-sm">
              <div className="font-semibold text-[color:var(--brand-success-dark)] dark:text-[color:var(--brand-success)]">
                Invoice receipt minted
              </div>
              <div className="mt-2 space-y-1 text-[color:var(--brand-success-dark)] dark:text-[color:var(--brand-success)]">
                <div>
                  Token ID:{" "}
                  <span className="font-mono">{receiptDetails.receiptTokenId}</span>
                </div>
                <div className="break-all">
                  Campaign ID:{" "}
                  <span className="font-mono">{receiptDetails.campaignId}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sponsor perks</CardTitle>
          <CardDescription>
            Boosters during an active sponsorship unlock exclusive remix assets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {perkMessage && (
            <Alert variant="success">
              <AlertTitle>Perk unlocked</AlertTitle>
              <AlertDescription>{perkMessage}</AlertDescription>
            </Alert>
          )}
          {perkError && (
            <Alert variant="destructive">
              <AlertTitle>Perk unlock failed</AlertTitle>
              <AlertDescription>{perkError}</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Campaign status</span>
            <span>{sponsorActive ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Booster shares</span>
            <span>{hasBoosterShares ? "Eligible" : "Not yet"}</span>
          </div>
          <Button
            variant="secondary"
            onClick={handleDownloadPack}
            disabled={!perksEligible || pendingAction === "perks"}
          >
            {pendingAction === "perks" ? "Unlocking..." : "Download sponsor pack"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
