"use client";

import MainLayout from "@/app/layouts/MainLayout";
import StartWizard from "@/features/onboarding/components/StartWizard";

export default function StartPage() {
  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto w-full max-w-5xl">
          <StartWizard />
        </div>
      </div>
    </MainLayout>
  );
}
