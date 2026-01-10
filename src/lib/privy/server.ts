import { PrivyClient } from "@privy-io/node";
import { requireServerEnv } from "@/lib/env/server";

let privyClient: PrivyClient | null = null;

export function getPrivyServerClient() {
  if (!privyClient) {
    const appId = requireServerEnv("PRIVY_APP_ID");
    const appSecret = requireServerEnv("PRIVY_APP_SECRET");
    privyClient = new PrivyClient({ appId, appSecret });
  }

  return privyClient;
}
