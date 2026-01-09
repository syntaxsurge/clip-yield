import { getMantleRollupInfo } from "@/lib/web3/mantleRollupInfo.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const info = await getMantleRollupInfo();
    return Response.json({ ok: true, info });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load rollup info.";
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
