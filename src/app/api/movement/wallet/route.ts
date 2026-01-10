import { NextRequest, NextResponse } from "next/server";
import type { Wallet } from "@privy-io/node";
import { getPrivyServerClient } from "@/lib/privy/server";
import { movementAddressUrl } from "@/lib/web3/movementConfig";

export const dynamic = "force-dynamic";

function getAccessToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
}

async function resolveMovementWallet(
  privy: ReturnType<typeof getPrivyServerClient>,
  userId: string,
): Promise<Wallet> {
  const wallets = privy.wallets().list({
    user_id: userId,
    chain_type: "movement",
  });

  for await (const wallet of wallets) {
    return wallet;
  }

  return privy.wallets().create({
    chain_type: "movement",
    owner: { user_id: userId },
  });
}

export async function GET(req: NextRequest) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "Missing Privy access token." },
        { status: 401 },
      );
    }

    const privy = getPrivyServerClient();
    const { user_id: userId } = await privy
      .utils()
      .auth()
      .verifyAccessToken(accessToken);

    const wallet = await resolveMovementWallet(privy, userId);

    return NextResponse.json({
      ok: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        publicKey: wallet.public_key ?? null,
        chainType: wallet.chain_type,
        explorerUrl: movementAddressUrl(wallet.address),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
