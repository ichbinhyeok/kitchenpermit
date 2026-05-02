import type { Metadata } from "next";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";

export const metadata: Metadata = {
  title: "Sample Condition Review Customer Link",
  description:
    "A customer-facing hood service customer link sample with a recorded condition and follow-up quote action.",
};

const reportData = buildAxis1SampleProofData("condition_review");

export default function SampleConditionReviewProofPage() {
  return (
    <main className="min-h-screen bg-[#e4dbcf] text-[#151515] print:bg-white print:px-0 print:py-0">
      <div className="relative mx-auto w-[min(1180px,100%)]">
        <Axis1PacketDocument data={reportData} variant="customer-report" />
      </div>
    </main>
  );
}
