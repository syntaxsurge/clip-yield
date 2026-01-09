"use client";

import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { explorerTxUrl } from "@/lib/web3/mantleConfig";
import { useMantleRollupInfo } from "@/hooks/useMantleRollupInfo";

type MantleFinalityPanelProps = {
  txHash: `0x${string}`;
  l2BlockNumber?: number | null;
  l2TimestampIso?: string | null;
};

function formatL2Timestamp(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

export function MantleFinalityPanel({
  txHash,
  l2BlockNumber,
  l2TimestampIso,
}: MantleFinalityPanelProps) {
  const { data, error, isLoading } = useMantleRollupInfo();
  const l2Included = Number.isFinite(l2BlockNumber ?? NaN);
  const l2TimestampLabel = formatL2Timestamp(l2TimestampIso);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof & finality (Mantle)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Mantle executes this transaction on L2, batches it for data availability,
          and posts the batch to Ethereum for settlement. Finality is reached once
          the batch is verified on Ethereum.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>1) Executed on Mantle (L2)</span>
            <Badge variant={l2Included ? "success" : "warning"}>
              {l2Included ? `Block ${l2BlockNumber}` : "Pending"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>2) Batched + submitted for L1 settlement</span>
            <Badge variant="outline">Protocol step</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>3) Verified on Ethereum -> finalized</span>
            <Badge variant="outline">Protocol step</Badge>
          </div>
        </div>

        {data ? (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">L1 context block</span>
              <span>{String(data.ethContext.blockNumber)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">L1 context timestamp</span>
              <span>{String(data.ethContext.timestamp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Queue index</span>
              <span>{String(data.rollupContext.queueIndex)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rollup index</span>
              <span>{String(data.rollupContext.index)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Verified index</span>
              <span>{String(data.rollupContext.verifiedIndex)}</span>
            </div>
          </div>
        ) : null}

        <Accordion type="single" collapsible>
          <AccordionItem value="finality">
            <AccordionTrigger>What does finalized mean?</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Mantle finality means the L2 batch containing this transaction
                has been verified on Ethereum. Until then, the transaction is
                confirmed on L2 but not finalized on L1.
              </p>
              <p className="text-xs">
                Evidence: open this transaction in the explorer and look for the
                L1 State Data batch index and L1 submission hash.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="verify">
            <AccordionTrigger>How to verify this on MantleScan</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Open the transaction and confirm the{" "}
                  <span className="font-medium">Status</span>,{" "}
                  <span className="font-medium">Block</span>, and{" "}
                  <span className="font-medium">Timestamp</span>.
                </li>
                <li>
                  Locate the{" "}
                  <span className="font-medium">L1 State Data</span> section to
                  see the batch index and L1 submission hash that anchors this
                  L2 batch to Ethereum.
                </li>
                <li>
                  Click the L1 submission hash to view it on Ethereum. Once the
                  batch is verified on L1, the L2 range is finalized.
                </li>
              </ol>
              <div>
                <Link
                  className="underline underline-offset-2"
                  href={explorerTxUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on MantleScan
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {error
              ? "Network: unavailable"
              : data
                ? `Node mode: ${data.mode} - syncing: ${String(data.syncing)}`
                : isLoading
                  ? "Network: loading..."
                  : "Network: idle"}
          </span>
          <Link
            className="underline underline-offset-2"
            href={explorerTxUrl(txHash)}
            target="_blank"
            rel="noreferrer"
          >
            View on MantleScan
          </Link>
        </div>

        {l2TimestampLabel ? (
          <div className="text-xs text-muted-foreground">
            L2 inclusion time: {l2TimestampLabel}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
