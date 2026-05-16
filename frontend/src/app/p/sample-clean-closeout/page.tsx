import type { Metadata } from "next";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { buildAxis1SampleProofData } from "@/lib/axis1-sample-packets";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata({
  title: "Sample Clean Closeout Service Report",
  description:
    "A customer-facing clean hood service report sample.",
  path: "/p/sample-clean-closeout",
});

const reportData = buildAxis1SampleProofData("clean");

export default function SampleCleanCloseoutProofPage() {
  return (
    <main className="min-h-screen bg-[#e4dbcf] text-[#151515] print:bg-white print:px-0 print:py-0">
      <div className="relative mx-auto w-[min(1180px,100%)]">
        <Axis1PacketDocument data={reportData} variant="customer-report" />
      </div>
    </main>
  );
}
