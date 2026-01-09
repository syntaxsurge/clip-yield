import Link from "next/link";
import AdminKycPanel from "@/features/admin-kyc/components/AdminKycPanel";

export default function AdminKycPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin KYC Console</h1>
          <p className="text-sm text-muted-foreground">
            Manage on-chain verification for the ClipYield vault.
          </p>
        </div>
        <Link
          href="/yield"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to Vault
        </Link>
      </div>
      <AdminKycPanel />
    </div>
  );
}
