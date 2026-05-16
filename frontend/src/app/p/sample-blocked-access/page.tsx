import type { Metadata } from "next";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Sample Blocked Access Service Report",
  description:
    "A customer-facing hood service report sample with blocked access separated from completed work.",
  path: "/p/sample-blocked-access",
});

const reportData = buildAxis1SampleProofData("blocked_access");

export default function SampleBlockedAccessProofPage() {
  return (
    <main className="min-h-screen bg-[#e4dbcf] text-[#151515] print:bg-white print:px-0 print:py-0">
      <div className="relative mx-auto w-[min(1180px,100%)]">
        <Axis1PacketDocument data={reportData} variant="customer-report" />
      </div>
    </main>
  );
}
