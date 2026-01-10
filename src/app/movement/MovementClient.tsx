"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
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

type MovementWallet = {
  id: string;
  address: string;
  publicKey: string | null;
  chainType: string;
  explorerUrl: string;
};

type TransferState =
  | { status: "idle" }
  | { status: "signing" }
  | { status: "submitted"; hash: string; explorerUrl: string }
  | { status: "error"; message: string };

export default function MovementClient() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [walletState, setWalletState] = useState<{
    isLoading: boolean;
    error: string | null;
    wallet: MovementWallet | null;
  }>({ isLoading: false, error: null, wallet: null });
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1000");
  const [transferState, setTransferState] = useState<TransferState>({
    status: "idle",
  });

  const embeddedWallet = useMemo(
    () => wallets.find((wallet) => wallet.walletClientType?.startsWith("privy")),
    [wallets],
  );

  const fetchMovementWallet = useCallback(async () => {
    if (!authenticated) return;
    setWalletState((prev) => ({ ...prev, isLoading: true, error: null }));
    const accessToken = await getAccessToken();
    if (!accessToken) {
      setWalletState({
        isLoading: false,
        error: "Privy access token unavailable.",
        wallet: null,
      });
      return;
    }

    const res = await fetch("/api/movement/wallet", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      setWalletState({
        isLoading: false,
        error: data?.error ?? "Unable to load Movement wallet.",
        wallet: null,
      });
      return;
    }

    const wallet = data.wallet as MovementWallet;
    setWalletState({ isLoading: false, error: null, wallet });
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (authenticated) {
      void fetchMovementWallet();
    } else {
      setWalletState({ isLoading: false, error: null, wallet: null });
    }
  }, [authenticated, fetchMovementWallet]);

  useEffect(() => {
    if (walletState.wallet?.address) {
      setRecipient(walletState.wallet.address);
    }
  }, [walletState.wallet?.address]);

  const handleTransfer = async () => {
    if (!authenticated) {
      await login();
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setTransferState({
        status: "error",
        message: "Privy access token unavailable.",
      });
      return;
    }

    setTransferState({ status: "signing" });

    const res = await fetch("/api/movement/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientAddress: recipient.trim(),
        amount: amount.trim(),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setTransferState({
        status: "error",
        message: data?.error ?? "Transfer failed.",
      });
      return;
    }

    setTransferState({
      status: "submitted",
      hash: data.hash,
      explorerUrl: data.explorerUrl,
    });
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Wallet status</CardTitle>
            <Badge variant={authenticated ? "success" : "outline"}>
              {authenticated ? "Connected" : "Not connected"}
            </Badge>
          </div>
          <CardDescription>
            Privy embedded wallets are created on login and used for Movement
            signing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4 text-sm dark:border-white/10">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-white/60">
              Embedded wallet
            </div>
            <div className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
              {embeddedWallet?.address ?? "Connect to create your embedded wallet"}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-white/60">
              {embeddedWallet?.walletClientType
                ? `Client: ${embeddedWallet.walletClientType}`
                : "Client: Privy embedded"}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 text-sm dark:border-white/10">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-white/60">
              Movement wallet
            </div>
            {walletState.isLoading ? (
              <div className="mt-2 text-sm text-gray-600 dark:text-white/70">
                Loading Movement wallet...
              </div>
            ) : walletState.error ? (
              <div className="mt-2 text-sm text-red-500">{walletState.error}</div>
            ) : walletState.wallet ? (
              <div className="mt-2 space-y-1">
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {walletState.wallet.address}
                </div>
                <a
                  href={walletState.wallet.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[color:var(--brand-accent-text)] hover:underline"
                >
                  View on Movement explorer
                </a>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-600 dark:text-white/70">
                Connect to provision your Movement wallet.
              </div>
            )}
          </div>

          {!authenticated ? (
            <Button
              type="button"
              className="w-full"
              onClick={() => login()}
              disabled={!ready}
            >
              {ready ? "Log in with Privy" : "Checking Privy session"}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement transfer</CardTitle>
          <CardDescription>
            Submit a Movement testnet transfer signed by your embedded wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movement-recipient">Recipient</Label>
            <Input
              id="movement-recipient"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="movement-amount">Amount (smallest unit)</Label>
            <Input
              id="movement-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <Button
            type="button"
            onClick={handleTransfer}
            disabled={!authenticated || walletState.isLoading}
            className="w-full"
          >
            {transferState.status === "signing"
              ? "Signing with Privy..."
              : "Send Movement transfer"}
          </Button>

          {transferState.status === "submitted" ? (
            <div className="rounded-xl border border-gray-200 p-4 text-sm dark:border-white/10">
              <div className="font-semibold text-gray-900 dark:text-white">
                Transaction submitted
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-white/60">
                {transferState.hash}
              </div>
              <a
                href={transferState.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-xs font-semibold text-[color:var(--brand-accent-text)] hover:underline"
              >
                View on Movement explorer
              </a>
            </div>
          ) : null}

          {transferState.status === "error" ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
              {transferState.message}
            </div>
          ) : null}
        </CardContent>
      </Card>

    </div>
  );
}
