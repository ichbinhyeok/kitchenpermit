import type { Metadata } from "next";
import { Axis1PacketDocument } from "@/components/axis1/packet-document";
import {
  buildAxis1FreeSharedPacketData,
  parseAxis1FreeReportSearchParams,
} from "@/lib/axis1-packet-builder";

export const metadata: Metadata = {
  title: "Customer Service Report",
  description: "A free unbranded kitchen exhaust service report link.",
  robots: {
    index: false,
    follow: false,
  },
};

type FreeAxis1ReportPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FreeAxis1ReportPage({
  searchParams,
}: FreeAxis1ReportPageProps) {
  const values = parseAxis1FreeReportSearchParams(await searchParams);
  const reportData = buildAxis1FreeSharedPacketData(values);

  return (
    <main className="min-h-screen bg-[#e9e1d7] px-3 py-4 text-[#151515] sm:px-5 sm:py-6 lg:py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto w-[min(1080px,100%)]">
        <Axis1PacketDocument data={reportData} variant="customer-report" />
      </div>
    </main>
  );
}
