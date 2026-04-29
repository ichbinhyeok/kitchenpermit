import type { Metadata } from "next";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { getAxis1PacketPreviewData } from "@/lib/axis1-packet-preview";

export const metadata: Metadata = {
  title: "Sample Customer Proof Link",
  description:
    "A customer-facing kitchen exhaust proof link sample for restaurant operators after service.",
};

const reportData = getAxis1PacketPreviewData({
  branding: "applied",
  scenario: "exception",
});

export default function SampleHoodCleaningProofPage() {
  return (
    <main className="min-h-screen bg-[#e4dbcf] text-[#151515] print:bg-white print:px-0 print:py-0">
      <div className="relative mx-auto w-[min(1180px,100%)]">
        <Axis1PacketDocument data={reportData} variant="customer-report" />
      </div>
    </main>
  );
}
