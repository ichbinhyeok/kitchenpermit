import { Suspense } from "react";
import { FreeAxis1ProofPageContent } from "@/components/axis1/free-axis1-proof-page-content";

export default function FreeAxis1ProofPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8">
          <div className="mx-auto w-[min(1080px,100%)] rounded-[24px] border border-black/10 bg-white px-5 py-5 text-sm text-muted-foreground">
          Loading service report link.
          </div>
        </main>
      }
    >
      <FreeAxis1ProofPageContent />
    </Suspense>
  );
}
