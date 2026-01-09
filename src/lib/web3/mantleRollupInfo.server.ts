import "server-only";

import { z } from "zod";
import { mantleRpc } from "@/lib/web3/mantleRpc.server";

const RollupInfoSchema = z.object({
  mode: z.string(),
  syncing: z.boolean(),
  ethContext: z.object({
    blockNumber: z.union([z.number(), z.string()]),
    timestamp: z.union([z.number(), z.string()]),
  }),
  rollupContext: z.object({
    queueIndex: z.union([z.number(), z.string()]),
    index: z.union([z.number(), z.string()]),
    verifiedIndex: z.union([z.number(), z.string()]),
  }),
});

export type MantleRollupInfo = z.infer<typeof RollupInfoSchema>;

async function fetchRollupInfo(): Promise<MantleRollupInfo> {
  const raw = await mantleRpc<unknown>("rollup_getInfo", []);
  return RollupInfoSchema.parse(raw);
}

export async function getMantleRollupInfo() {
  return fetchRollupInfo();
}
