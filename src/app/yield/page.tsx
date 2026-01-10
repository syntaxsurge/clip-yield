import MainLayout from "@/app/layouts/MainLayout";
import YieldPanel from "@/features/yield/components/YieldPanel";

export default function YieldPage() {
  return (
    <MainLayout>
      <div className="w-full px-4 pb-24 pt-[100px] lg:pr-0">
        <div className="mx-auto w-full max-w-5xl">
          <YieldPanel
            receiptTitle="Yield receipt"
            receiptDescription="Latest deposit into the ClipYield vault."
          />
        </div>
      </div>
    </MainLayout>
  );
}
