"use client";

import Link from "next/link";
import { PrivyConnectButton } from "@/components/ui/PrivyConnectButton";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-zinc-950/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link className="text-sm font-semibold text-zinc-900 dark:text-white" href="/feed">
            ClipYield
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-zinc-600 dark:text-white/70 sm:flex">
            <Link className="hover:text-zinc-900 dark:hover:text-white" href="/feed">
              Feed
            </Link>
            <Link className="hover:text-zinc-900 dark:hover:text-white" href="/studio">
              Studio
            </Link>
          </nav>
        </div>
        <PrivyConnectButton showDisconnect />
      </div>
    </header>
  );
}
