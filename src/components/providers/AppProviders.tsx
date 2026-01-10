"use client";

if (typeof window === "undefined") {
  void import("fake-indexeddb/auto");
}

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { store } from "@/app/store";
import UserProvider from "@/app/context/user";
import NextTopLoader from "nextjs-toploader";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ConvexClientProvider>
        <Web3Provider>
          <UserProvider>
            <NextTopLoader color="#F02C56" height={3} showSpinner={false} />
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </UserProvider>
        </Web3Provider>
      </ConvexClientProvider>
    </Provider>
  );
}
