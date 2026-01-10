import Link from "next/link";
import AdminKycPanel from "@/features/admin-kyc/components/AdminKycPanel";
import MainLayout from "@/app/layouts/MainLayout";

export default function AdminKycPage() {
  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto w-full max-w-4xl sm:px-2">
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
      </div>
    </MainLayout>
  );
}
