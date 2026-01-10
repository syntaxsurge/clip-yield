"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button, type ButtonProps } from "@/components/ui/button";
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
  const walletAddress = user?.wallet?.address;

  if (!ready) {
    return (
      <Button className={className} size={size} variant="outline" disabled>
        Checking…
      </Button>
    );
  }

  if (!authenticated) {
    return (
      <Button
        className={className}
        size={size}
        variant={variant}
        onClick={() => void login()}
      >
        Connect
      </Button>
    );
  }

  if (showDisconnect) {
    return (
      <Button
        className={className}
        size={size}
        variant="outline"
        onClick={() => void logout()}
      >
        Disconnect
      </Button>
    );
  }

  return (
    <Button className={className} size={size} variant="secondary" disabled>
      {showWallet && walletAddress ? formatShortHash(walletAddress) : "Connected"}
    </Button>
  );
}
