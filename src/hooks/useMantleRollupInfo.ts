"use client";

import { useQuery } from "@tanstack/react-query";

type MantleRollupInfo = {
  mode: string;
  syncing: boolean;
  ethContext: { blockNumber: number | string; timestamp: number | string };
  rollupContext: {
    queueIndex: number | string;
    index: number | string;
    verifiedIndex: number | string;
  };
};

type MantleRollupInfoResponse =
  | { ok: true; info: MantleRollupInfo }
  | { ok: false; error: string };

async function fetchRollupInfo(): Promise<MantleRollupInfo> {
  const res = await fetch("/api/mantle/rollup-info");
  const payload = (await res.json().catch(() => ({}))) as MantleRollupInfoResponse;
  if (!res.ok || !("ok" in payload) || !payload.ok) {
    const message =
      "error" in payload && typeof payload.error === "string"
        ? payload.error
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return payload.info;
}

export function useMantleRollupInfo() {
  return useQuery({
    queryKey: ["mantle-rollup-info"],
    queryFn: fetchRollupInfo,
    refetchInterval: 15_000,
    staleTime: 15_000,
    retry: 1,
  });
}
