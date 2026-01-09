"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { User, UserContextTypes } from "@/app/types";
import { convexClient } from "@/lib/convex/client";
import { ensureProfile, getProfile } from "@/lib/convex/functions";

const UserContext = createContext<UserContextTypes | null>(null);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const [user, setUser] = useState<User | null>(null);

  const refreshProfile = async () => {
    if (!address) {
      setUser(null);
      return;
    }

    await convexClient.mutation(ensureProfile, { wallet: address });
    const profile = await convexClient.query(getProfile, { wallet: address });

    if (!profile) {
      setUser(null);
      return;
    }

    setUser({
      id: profile.wallet,
      name: profile.name,
      bio: profile.bio,
      image: profile.image,
    });
  };

  useEffect(() => {
    if (isConnected && address) {
      void refreshProfile();
      return;
    }
    setUser(null);
  }, [address, isConnected]);

  const openConnect = async () => {
    openConnectModal?.();
  };

  const logout = async () => {
    if (disconnectAsync) {
      await disconnectAsync();
    }
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        openConnect,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

export const useUser = () => useContext(UserContext);
