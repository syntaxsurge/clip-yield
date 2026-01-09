import "server-only";

import { LRUCache } from "lru-cache";
import { getServerEnv } from "@/lib/env/server";
import { mantle } from "@/lib/web3/mantleConstants";

type JsonRpcOk<T> = { jsonrpc: "2.0"; id: number; result: T };
type JsonRpcErr = {
  jsonrpc: "2.0";
  id: number;
  error: { code: number; message: string };
};

type MantleRpcOptions = {
  cacheTtlMs?: number;
  cacheKey?: string;
};

const rpcCache = new LRUCache<string, unknown>({ max: 128 });

export async function mantleRpc<T>(
  method: string,
  params: unknown[] = [],
  options: MantleRpcOptions = {},
): Promise<T> {
  const rpcUrl =
    getServerEnv("MANTLE_SEPOLIA_RPC_URL") ??
    process.env.NEXT_PUBLIC_MANTLE_RPC_URL ??
    mantle.sepolia.rpcUrl;

  if (!rpcUrl) {
    throw new Error("Missing Mantle RPC URL.");
  }

  const shouldCache = Boolean(options.cacheTtlMs && options.cacheTtlMs > 0);
  const cacheKey = shouldCache
    ? options.cacheKey ?? `${method}:${JSON.stringify(params)}`
    : null;

  if (shouldCache && cacheKey) {
    const cached = rpcCache.get(cacheKey);
    if (cached !== undefined) {
      return cached as T;
    }
  }

  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Mantle RPC HTTP ${res.status}`);
  }

  const payload = (await res.json()) as JsonRpcOk<T> | JsonRpcErr;

  if ("error" in payload) {
    throw new Error(`Mantle RPC error: ${payload.error.message}`);
  }

  if (shouldCache && cacheKey) {
    rpcCache.set(cacheKey, payload.result, { ttl: options.cacheTtlMs });
  }

  return payload.result;
}
