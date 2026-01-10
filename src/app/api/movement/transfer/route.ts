import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AccountAddress,
  AccountAuthenticatorEd25519,
  Aptos,
  AptosConfig,
  Ed25519PublicKey,
  Ed25519Signature,
  Network,
} from "@aptos-labs/ts-sdk";
import type { Wallet } from "@privy-io/node";
import { getPrivyServerClient } from "@/lib/privy/server";
import { movementConfig, movementTxUrl } from "@/lib/web3/movementConfig";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  recipientAddress: z.string().min(1),
  amount: z.string().regex(/^\d+$/),
});

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

function normalizeHex(value: string) {
  return value.startsWith("0x") ? value : `0x${value}`;
}

function normalizePublicKey(publicKey: string) {
  if (/^(0x)?[0-9a-fA-F]+$/.test(publicKey)) {
    return normalizeHex(publicKey);
  }
  const bytes = Buffer.from(publicKey, "base64");
  return `0x${Buffer.from(bytes).toString("hex")}`;
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessToken(req);
    if (!accessToken) {
      return NextResponse.json(
        { ok: false, error: "Missing Privy access token." },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid transfer request." },
        { status: 400 },
      );
    }

    const privy = getPrivyServerClient();
    const { user_id: userId } = await privy
      .utils()
      .auth()
      .verifyAccessToken(accessToken);

    const wallet = await resolveMovementWallet(privy, userId);
    if (!wallet.public_key) {
      return NextResponse.json(
        { ok: false, error: "Movement wallet missing public key." },
        { status: 400 },
      );
    }

    const sender = AccountAddress.fromString(wallet.address);
    const recipient = AccountAddress.fromString(parsed.data.recipientAddress);
    const amount = BigInt(parsed.data.amount);

    if (amount <= 0n) {
      return NextResponse.json(
        { ok: false, error: "Amount must be greater than zero." },
        { status: 400 },
      );
    }

    const aptos = new Aptos(
      new AptosConfig({
        network: Network.CUSTOM,
        fullnode: movementConfig.fullnodeUrl,
      }),
    );

    const transaction = await aptos.transaction.build.simple({
      sender,
      data: {
        function: "0x1::coin::transfer",
        typeArguments: [movementConfig.coinType],
        functionArguments: [recipient, amount],
      },
    });

    const signingMessage = aptos.transaction.getSigningMessage({ transaction });
    const signingMessageHex = `0x${Buffer.from(signingMessage).toString("hex")}`;

    const signatureResponse = await privy.wallets().rawSign(wallet.id, {
      params: { hash: signingMessageHex },
    });

    const publicKey = new Ed25519PublicKey(
      normalizePublicKey(wallet.public_key),
    );
    const signature = new Ed25519Signature(
      normalizeHex(signatureResponse.signature),
    );

    const senderAuthenticator = new AccountAuthenticatorEd25519(
      publicKey,
      signature,
    );

    const pending = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });

    const committed = await aptos.waitForTransaction({
      transactionHash: pending.hash,
    });

    return NextResponse.json({
      ok: true,
      hash: committed.hash,
      explorerUrl: movementTxUrl(committed.hash),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
