import type { Metadata } from "next";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Sample Condition Review Service Report",
  description:
    "A customer-facing hood service report sample with a recorded condition and follow-up quote action.",
  path: "/p/sample-condition-review",
});

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
