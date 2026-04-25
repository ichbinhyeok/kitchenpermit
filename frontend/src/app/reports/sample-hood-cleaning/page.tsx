import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import { PrintButton } from "@/components/print-button";
import { getAxis1PacketPreviewData } from "@/lib/axis1-packet-preview";

export const metadata: Metadata = {
  title: "Sample Customer Service Report",
  description:
    "A customer-facing kitchen exhaust cleaning report sample for restaurant operators after service.",
};

const reportData = getAxis1PacketPreviewData({
  branding: "applied",
  scenario: "exception",
});

export default function SampleHoodCleaningReportPage() {
  return (
    <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto w-[min(1080px,100%)]">
        <div className="pdf-print-hide mb-3 flex flex-col gap-3 rounded-[22px] border border-black/10 bg-white/70 px-4 py-3 shadow-[0_18px_60px_rgba(17,17,17,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8178]">
              Customer-facing sample link
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#151515]">
              This is the document-only surface a restaurant operator would open
              after service.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/samples/axis-1"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-[#151515] transition hover:bg-[#f7f2ec]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.1} />
              Vendor sample
            </Link>
            <PrintButton />
          </div>
        </div>

        <Axis1PacketDocument data={reportData} variant="customer-report" />
      </div>
    </main>
  );
}
