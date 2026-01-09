import YieldPanel from "@/features/yield/components/YieldPanel";

export default function YieldPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <YieldPanel
        receiptTitle="Yield receipt"
        receiptDescription="Latest deposit into the ClipYield vault."
      />
    </div>
  );
}
