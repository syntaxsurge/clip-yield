"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Address, getAddress } from "viem";
import MainLayout from "@/app/layouts/MainLayout";
import { useGeneralStore } from "@/app/stores/general";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ui/theme-toggle";
import { mantleSepoliaContracts } from "@/lib/contracts/addresses";
import kycRegistryAbi from "@/lib/contracts/abi/KycRegistry.json";
import { formatShortHash } from "@/lib/utils";
import { OpenAIKeyCard } from "./OpenAIKeyCard";

export default function SettingsPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { ready, authenticated, login } = usePrivy();
  const { isFeedMuted, setIsFeedMuted, isAutoScrollEnabled, setIsAutoScrollEnabled } =
    useGeneralStore();

  const isConnected = authenticated && Boolean(address);
  const isOnMantle = chainId === mantleSepoliaContracts.chainId;
  const walletLabel = useMemo(
    () => (address ? formatShortHash(address) : "Not connected"),
    [address],
  );

  const kycRegistry = getAddress(
    mantleSepoliaContracts.kycRegistry as Address,
  );
  const { data: kycStatus } = useReadContract({
    address: kycRegistry,
    abi: kycRegistryAbi,
    functionName: "isVerified",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address) && isOnMantle },
  });

  const isVerified = Boolean(kycStatus);
  const networkLabel = isConnected ? (isOnMantle ? "Mantle Sepolia" : "Wrong network") : "-";
  const kycLabel = isConnected && isOnMantle ? (isVerified ? "Verified" : "Not verified") : "-";

  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your ClipYield preferences and AI video generation access.
            </p>
          </header>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList
              aria-label="Settings sections"
              className="w-full justify-start gap-2 overflow-x-auto"
            >
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="ai">AI Studio</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base">Wallet & verification</CardTitle>
                      <Badge variant={isConnected ? "success" : "warning"}>
                        {isConnected ? "Connected" : "Not connected"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Your wallet powers KYC, yield vaults, and sponsorship signatures.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wallet</span>
                      <span className="font-mono text-xs">{walletLabel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <span>{networkLabel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">KYC status</span>
                      <span>{kycLabel}</span>
                    </div>
                    {!isConnected ? (
                      <Button onClick={() => void login()} disabled={!ready}>
                        {ready ? "Connect wallet" : "Checking..."}
                      </Button>
                    ) : !isVerified ? (
                      <Button asChild variant="outline">
                        <Link href="/kyc?returnTo=/settings">Start KYC</Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline">
                        <Link href="/yield">Open yield vault</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Preferences</CardTitle>
                    <CardDescription>
                      Personalize playback and appearance across the app.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-medium">Mute clips by default</div>
                        <p className="text-xs text-muted-foreground">
                          Start For You and Following feeds muted.
                        </p>
                      </div>
                    <Switch
                      checked={isFeedMuted}
                      onCheckedChange={setIsFeedMuted}
                      ariaLabel="Mute clips by default"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-medium">Auto-advance clips</div>
                      <p className="text-xs text-muted-foreground">
                        Scroll to the next clip after the current one finishes.
                      </p>
                    </div>
                    <Switch
                      checked={isAutoScrollEnabled}
                      onCheckedChange={setIsAutoScrollEnabled}
                      ariaLabel="Auto-advance clips"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-medium">Theme</div>
                      <p className="text-xs text-muted-foreground">
                          Toggle between light and dark mode.
                        </p>
                      </div>
                      <ThemeToggle className="h-9 w-9" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai">
              <div className="grid gap-6 lg:grid-cols-2">
                <OpenAIKeyCard />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI workflow tips</CardTitle>
                    <CardDescription>
                      Keep your Sora generations organized and ready for remixing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Generate clips from the editor&apos;s AI Studio, then drag them from
                      History into your timeline. Generations stay synced to the current
                      project in local storage.
                    </p>
                    <p>
                      Use short prompts for rapid iteration, then increase duration and
                      size once you land on a final look.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
