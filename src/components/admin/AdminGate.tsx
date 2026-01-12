"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import WalletGateSkeleton from "@/components/feedback/WalletGateSkeleton";
import { isAdminAddress } from "@/lib/admin/adminAllowlist";
import { formatShortHash } from "@/lib/utils";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { ready, authenticated, login, logout } = usePrivy();

  const hasWallet = Boolean(isConnected && address);
  const isAdmin = hasWallet && isAdminAddress(address);

  const handleSwitchAccount = async () => {
    if (!ready) return;
    if (authenticated) {
      await logout();
    }
    await login();
    router.refresh();
  };

  if (!ready && !isConnected) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-6">
        <WalletGateSkeleton cards={1} className="w-full" />
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-6">
        <WalletGateSkeleton cards={1} className="w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center px-6">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0f0f12]">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Access denied
            </h1>
            <p className="text-sm text-gray-600 dark:text-white/70">
              Wallet{" "}
              <span
                className="font-mono text-gray-900 dark:text-white"
                title={address}
              >
                {formatShortHash(address ?? "")}
              </span>{" "}
              is not authorized to access{" "}
              <span className="font-mono text-gray-900 dark:text-white">
                {pathname}
              </span>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/">Go back home</Link>
            </Button>
            <Button onClick={() => void handleSwitchAccount()}>
              Switch account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
