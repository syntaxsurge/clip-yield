"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function KycCompletePage() {
  const searchParams = useSearchParams();
  const inquiryId = searchParams.get("inquiry-id");
  const status = searchParams.get("status");
  const returnTo = searchParams.get("returnTo") ?? "/yield";

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">KYC submitted</h1>
      <p className="text-sm text-muted-foreground">
        We have received your verification request. Your wallet unlocks boost
        and yield actions as soon as the Persona webhook confirms completion.
      </p>

      <Alert variant="info">
        <AlertTitle>Submission details</AlertTitle>
        <AlertDescription>
          Inquiry: <span className="font-mono">{inquiryId ?? "pending"}</span>
          <br />
          Status: <span className="font-mono">{status ?? "processing"}</span>
        </AlertDescription>
      </Alert>

      <Button asChild>
        <Link href={returnTo}>Return to ClipYield</Link>
      </Button>
    </div>
  );
}
