import MainLayout from "@/app/layouts/MainLayout";
import MovementClient from "@/app/movement/MovementClient";

export default function MovementPage() {
  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Movement Wallet Demo
          </h1>
          <p className="text-sm text-gray-600 dark:text-white/70">
            Sign and submit a Movement testnet transaction with your Privy
            embedded wallet.
          </p>
        </div>
        <MovementClient />
      </div>
    </MainLayout>
  );
}
