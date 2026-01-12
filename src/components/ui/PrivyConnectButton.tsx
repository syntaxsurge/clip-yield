"use client";

import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatShortHash } from "@/lib/utils";

type PrivyConnectButtonProps = {
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  showDisconnect?: boolean;
  showWallet?: boolean;
};

export function PrivyConnectButton({
  className,
  variant = "default",
  size = "sm",
  showDisconnect = false,
  showWallet = false,
}: PrivyConnectButtonProps) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { address, isConnected: wagmiConnected } = useAccount();
  const { connectors, connectAsync, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null);

  const walletAddress = address ?? user?.wallet?.address ?? null;
  const isConnected = wagmiConnected || authenticated;
  const connectorOptions = useMemo(
    () =>
      connectors.filter(
        (connector) => !connector.id.startsWith("io.privy.wallet"),
      ),
    [connectors],
  );

  const handleDisconnect = async () => {
    if (authenticated) {
      await logout();
    }
    if (wagmiConnected) {
      disconnect();
    }
  };

  const handlePrivyLogin = async () => {
    if (!ready) return;
    setOpen(false);
    await login();
  };

  const handleExternalConnect = async (connectorId: string) => {
    const connector = connectorOptions.find(
      (option) => option.id === connectorId,
    );
    if (!connector) return;
    setPendingConnectorId(connectorId);
    try {
      await connectAsync({ connector });
      setOpen(false);
    } catch {
      // Surface the error via wagmi's connectError state.
    } finally {
      setPendingConnectorId(null);
    }
  };

  if (!ready && !isConnected) {
    return (
      <Button className={className} size={size} variant="outline" disabled>
        Checking…
      </Button>
    );
  }

  if (isConnected && showDisconnect) {
    return (
      <Button
        className={className}
        size={size}
        variant="outline"
        onClick={() => void handleDisconnect()}
      >
        Disconnect
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className} size={size} variant={variant}>
          {isConnected
            ? showWallet && walletAddress
              ? formatShortHash(walletAddress)
              : "Connected"
            : "Connect"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect wallet</DialogTitle>
          <DialogDescription>
            Use an embedded wallet for quick onboarding or connect an external wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-border p-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Embedded wallet</div>
              <div className="text-xs text-muted-foreground">
                Sign in with email to auto-create a wallet.
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {authenticated ? (
                <>
                  <span className="text-xs text-muted-foreground">
                    {walletAddress ? formatShortHash(walletAddress) : "Signed in"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleDisconnect()}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handlePrivyLogin()}
                  disabled={!ready}
                >
                  Continue with email
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">External wallet</div>
              <div className="text-xs text-muted-foreground">
                Connect MetaMask or another injected wallet.
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {connectorOptions.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No injected wallets detected.
                </div>
              ) : (
                connectorOptions.map((connector) => (
                  <Button
                    key={connector.id}
                    size="sm"
                    variant="outline"
                    className="w-full justify-between"
                    disabled={!connector.ready || isPending}
                    onClick={() => void handleExternalConnect(connector.id)}
                  >
                    <span>
                      {connector.name}
                      {!connector.ready ? " (unavailable)" : ""}
                    </span>
                    {pendingConnectorId === connector.id && isPending
                      ? "Connecting…"
                      : null}
                  </Button>
                ))
              )}

              {wagmiConnected ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => void handleDisconnect()}
                >
                  Disconnect {walletAddress ? formatShortHash(walletAddress) : "wallet"}
                </Button>
              ) : null}
            </div>
          </div>

          {connectError ? (
            <Alert variant="destructive">
              <AlertTitle>Connection error</AlertTitle>
              <AlertDescription>{connectError.message}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
